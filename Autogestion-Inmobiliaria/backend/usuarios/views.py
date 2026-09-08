from rest_framework import generics, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegistroSerializer,
    UsuarioSerializer,
    VerifyEmailSerializer,
    generate_verification_token_for_user,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    POST /api/auth/login/
    Inicia sesión con email y contraseña, retornando tokens JWT (access y refresh)
    junto con la información de perfil y rol del usuario.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer


class RegistroView(APIView):
    """
    POST /api/auth/registro/
    Crea una nueva cuenta de usuario con rol PROPIETARIO o INQUILINO.
    Retorna la información del usuario creado junto con tokens JWT para sesión inmediata
    y token de verificación de correo.
    """
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()

            # Generar tokens JWT para permitir inicio de sesión automático
            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            refresh['email'] = user.email
            refresh['full_name'] = user.full_name

            # Generar token de verificación
            verification_token = generate_verification_token_for_user(user)

            return Response({
                'mensaje': 'Cuenta creada exitosamente en SAIPI.',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'usuario': UsuarioSerializer(user, context={'request': request}).data,
                'verification_token': verification_token,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    POST /api/auth/verify-email/
    Valida el token enviado por correo electrónico y activa la bandera email_verificado.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.email_verificado = True
            user.save(update_fields=['email_verificado', 'updated_at'])

            return Response({
                'mensaje': 'Correo electrónico verificado exitosamente.',
                'email': user.email,
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    GET /api/auth/me/
    PATCH /api/auth/me/
    Obtiene o actualiza el perfil del usuario actualmente autenticado.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UsuarioSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Cierra la sesión del usuario. Opcionalmente invalida el refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # Si blacklist no está activado o ya expiró, continúa con logout de cliente

        return Response({'mensaje': 'Sesión cerrada exitosamente.'}, status=status.HTTP_200_OK)
