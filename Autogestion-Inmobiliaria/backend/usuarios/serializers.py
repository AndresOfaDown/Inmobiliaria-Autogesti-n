import re
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para datos completos y seguros del usuario."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Usuario
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'telefono',
            'documento_identidad',
            'avatar',
            'is_active',
            'email_verificado',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'email', 'role', 'is_active', 'email_verificado', 'created_at', 'updated_at']


class RegistroSerializer(serializers.ModelSerializer):
    """
    Serializer estricto para el registro de nuevos usuarios en SAIPI.
    Aplica validaciones de complejidad de contraseña, coincidencia y asignación de roles.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text='Mínimo 8 caracteres, al menos un número y una mayúscula.'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Debe coincidir con la contraseña ingresada.'
    )
    role = serializers.ChoiceField(
        choices=[Usuario.Role.PROPIETARIO, Usuario.Role.INQUILINO],
        required=True,
        help_text='Rol del usuario: PROPIETARIO o INQUILINO'
    )
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)

    class Meta:
        model = Usuario
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'role',
            'telefono',
            'documento_identidad',
            'avatar',
            'password',
            'password_confirm',
        ]

    def validate_email(self, value):
        email_normalized = value.strip().lower()
        if Usuario.objects.filter(email=email_normalized).exists():
            raise serializers.ValidationError('Ya existe una cuenta registrada con este correo electrónico.')
        return email_normalized

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError('La contraseña debe tener al menos 8 caracteres.')
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos una letra mayúscula.')
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError('La contraseña debe contener al menos un número.')
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Las contraseñas no coinciden.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        return Usuario.objects.create_user(password=password, **validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer de inicio de sesión con JWT extendido para incluir información completa del usuario.
    """

    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email', attrs.get(self.username_field, '')).strip().lower()
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError('Debe proporcionar el correo electrónico y la contraseña.')

        user = authenticate(
            request=self.context.get('request'),
            email=email,
            password=password
        )

        if not user:
            # Comprobar si el correo existe para dar un feedback más claro
            if Usuario.objects.filter(email=email).exists():
                raise serializers.ValidationError('Contraseña incorrecta.')
            raise serializers.ValidationError('No se encontró ninguna cuenta activa con este correo electrónico.')

        if not user.is_active:
            raise serializers.ValidationError('Esta cuenta ha sido suspendida o desactivada.')

        self.user = user
        data = super().validate(attrs)

        # Agregar claims personalizados al payload del token
        refresh = self.get_token(user)
        refresh['role'] = user.role
        refresh['email'] = user.email
        refresh['full_name'] = user.full_name

        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['usuario'] = UsuarioSerializer(user, context=self.context).data

        return data

from django.core.signing import BadSignature, SignatureExpired, TimestampSigner

signer = TimestampSigner(salt='saipi.email.verification')


class VerifyEmailSerializer(serializers.Serializer):
    """
    Serializer para procesar tokens de verificación de correo criptográficamente firmados con expiración.
    """

    token = serializers.CharField(required=True)

    def validate(self, attrs):
        token_str = attrs.get('token')
        try:
            user_id = signer.unsign(token_str, max_age=60 * 60 * 24 * 3)  # Válido por 3 días
            user = Usuario.objects.get(pk=user_id)
            attrs['user'] = user
            return attrs
        except SignatureExpired:
            raise serializers.ValidationError('El token de verificación ha expirado.')
        except (BadSignature, Usuario.DoesNotExist, ValueError):
            raise serializers.ValidationError('El token de verificación no es válido.')


def generate_verification_token_for_user(user):
    """Genera un token seguro firmado para verificación de correo con sellado de tiempo."""
    return signer.sign(str(user.pk))
