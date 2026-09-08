from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario con email como identificador principal."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)

        # Asignar automáticamente nombre/apellido si se pasa first_name/last_name
        first_name = extra_fields.get('first_name', extra_fields.get('nombre', ''))
        last_name = extra_fields.get('last_name', extra_fields.get('apellido', ''))
        extra_fields['first_name'] = first_name
        extra_fields['last_name'] = last_name
        extra_fields['nombre'] = first_name
        extra_fields['apellido'] = last_name

        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', Usuario.Role.ADMIN)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('email_verificado', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


telefono_regex = RegexValidator(
    regex=r'^\+?[0-9\s\-()]{7,20}$',
    message='El número de teléfono debe tener un formato válido (ej. +591 77084747 o 77084747).'
)


class Usuario(AbstractUser):
    """
    Modelo de Usuario personalizado para SAIPI.
    Extiende AbstractUser usando email como USERNAME_FIELD con roles diferenciados.
    """

    class Role(models.TextChoices):
        PROPIETARIO = 'PROPIETARIO', 'Propietario'
        INQUILINO = 'INQUILINO', 'Inquilino'
        ADMIN = 'ADMIN', 'Administrador'

    username = None  # No requerido: se usa email para login
    email = models.EmailField('correo electrónico', unique=True)
    first_name = models.CharField('nombres', max_length=150)
    last_name = models.CharField('apellidos', max_length=150)

    # Campos de compatibilidad con versión previa
    nombre = models.CharField('nombre', max_length=150, blank=True)
    apellido = models.CharField('apellido', max_length=150, blank=True)

    role = models.CharField(
        'rol en la plataforma',
        max_length=20,
        choices=Role.choices,
        default=Role.INQUILINO,
        db_index=True
    )
    telefono = models.CharField(
        'teléfono',
        max_length=20,
        blank=True,
        null=True,
        validators=[telefono_regex]
    )
    documento_identidad = models.CharField(
        'documento de identidad',
        max_length=30,
        blank=True,
        null=True
    )
    avatar = models.ImageField(
        'foto de perfil',
        upload_to='avatars/',
        blank=True,
        null=True
    )

    is_active = models.BooleanField('cuenta activa', default=True)
    email_verificado = models.BooleanField('correo verificado', default=False)

    created_at = models.DateTimeField('fecha de registro', default=timezone.now)
    updated_at = models.DateTimeField('última actualización', auto_now=True)
    creado_en = models.DateTimeField('fecha de creación', default=timezone.now, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UsuarioManager()

    class Meta:
        verbose_name = 'usuario'
        verbose_name_plural = 'usuarios'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.first_name} {self.last_name} ({self.email}) - [{self.role}]'

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def save(self, *args, **kwargs):
        # Sincronización bidireccional entre first_name/last_name y nombre/apellido
        if self.first_name and not self.nombre:
            self.nombre = self.first_name
        elif self.nombre and not self.first_name:
            self.first_name = self.nombre

        if self.last_name and not self.apellido:
            self.apellido = self.last_name
        elif self.apellido and not self.last_name:
            self.last_name = self.apellido

        super().save(*args, **kwargs)


# Alias para imports estándar
User = Usuario
