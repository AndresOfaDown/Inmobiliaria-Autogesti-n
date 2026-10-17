import api from './api';

/**
 * Servicio para gestión de usuarios.
 * Consume desde la instancia global de api.
 */
const userService = {
  /** Listar todos los usuarios */
  getAll: async (params = {}) => {
    const { data } = await api.get('/usuarios/lista/', { params });
    return data;
  },

  /** Obtener un usuario por ID */
  getById: async (id) => {
    const { data } = await api.get(`/usuarios/lista/${id}/`);
    return data;
  },

  /** Crear un usuario */
  create: async (userData) => {
    const { data } = await api.post('/usuarios/lista/', userData);
    return data;
  },

  /** Actualizar un usuario */
  update: async (id, userData) => {
    const { data } = await api.put(`/usuarios/lista/${id}/`, userData);
    return data;
  },

  /** Eliminar un usuario */
  delete: async (id) => {
    await api.delete(`/usuarios/lista/${id}/`);
  },
};

export default userService;
