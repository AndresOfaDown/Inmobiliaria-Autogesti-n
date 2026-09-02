from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Usuario


class RegistroSerializer(serializers.ModelSerializer):
    """Serializer para crear nuevas cuentas de usuario."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['email', 'nombre', 'apellido', 'telefono', 'password', 'password_confirm']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden.'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return Usuario.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    """Serializer para iniciar sesión con email y contraseña."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales incorrectas.')
        if not user.is_active:
            raise serializers.ValidationError('Esta cuenta está desactivada.')
        data['user'] = user
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer para datos públicos del usuario."""

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'nombre', 'apellido', 'telefono', 'creado_en']
        read_only_fields = fields
