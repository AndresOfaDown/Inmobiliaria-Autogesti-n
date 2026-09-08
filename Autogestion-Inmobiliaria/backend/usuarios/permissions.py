from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsPropietario(BasePermission):
    """
    Permite acceso únicamente a usuarios con rol PROPIETARIO o administradores.
    """
    message = 'Acceso denegado: esta acción está reservada para Propietarios.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['PROPIETARIO', 'ADMIN'] or request.user.is_staff


class IsInquilino(BasePermission):
    """
    Permite acceso únicamente a usuarios con rol INQUILINO o administradores.
    """
    message = 'Acceso denegado: esta acción está reservada para Inquilinos.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role in ['INQUILINO', 'ADMIN'] or request.user.is_staff


class IsAdminRole(BasePermission):
    """
    Permite acceso únicamente a administradores del sistema.
    """
    message = 'Acceso denegado: se requieren permisos de Administrador.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser


class IsOwnerOrReadOnly(BasePermission):
    """
    Permiso a nivel de objeto para permitir que solo el propietario del recurso pueda modificarlo.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        return obj == request.user
