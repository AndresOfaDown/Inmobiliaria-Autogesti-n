from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegistroSerializer, LoginSerializer, UsuarioSerializer


class RegistroView(APIView):
    """POST /api/auth/registro/ — Crear una nueva cuenta."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                'mensaje': 'Cuenta creada exitosamente.',
                'usuario': UsuarioSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login/ — Iniciar sesión."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'mensaje': 'Sesión iniciada correctamente.',
                'usuario': UsuarioSerializer(user).data,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """POST /api/auth/logout/ — Cerrar sesión."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({'mensaje': 'Sesión cerrada.'})
