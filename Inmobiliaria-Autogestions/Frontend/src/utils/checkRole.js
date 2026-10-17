import { ROLES } from '../config/constants';

/**
 * Verifica si el usuario tiene el rol requerido.
 * @param {object} user - Objeto usuario con rol_nombre
 * @param {string|string[]} allowedRoles - Rol o lista de roles permitidos
 * @returns {boolean}
 */
export const checkRole = (user, allowedRoles) => {
  if (!user || !user.rol_nombre) return false;

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.rol_nombre);
};

/**
 * Verifica si el usuario es administrador.
 */
export const isAdmin = (user) => checkRole(user, ROLES.ADMIN);
