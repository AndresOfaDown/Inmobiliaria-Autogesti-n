import { create } from 'zustand';
import api from '../api/axios';

const getInitialUser = () => {
  try {
    const saved = localStorage.getItem('saipi_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create((set, get) => ({
  user: getInitialUser(),
  accessToken: localStorage.getItem('saipi_access_token') || null,
  refreshToken: localStorage.getItem('saipi_refresh_token') || null,
  isAuthenticated: !!localStorage.getItem('saipi_access_token'),
  role: getInitialUser()?.role || null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { accessToken, access, refresh, user, usuario } = response.data;
      const token = accessToken || access;
      const rawUser = user || usuario || {};
      const normalizedRole = (rawUser.rol || rawUser.role || 'USUARIO').toUpperCase();
      const userData = {
        ...rawUser,
        role: normalizedRole,
        rol: normalizedRole,
        full_name: `${rawUser.nombre || ''} ${rawUser.apellido || ''}`.trim() || rawUser.email,
      };

      localStorage.setItem('saipi_access_token', token);
      if (refresh) localStorage.setItem('saipi_refresh_token', refresh);
      localStorage.setItem('saipi_user', JSON.stringify(userData));

      set({
        user: userData,
        accessToken: token,
        refreshToken: refresh || null,
        isAuthenticated: true,
        role: normalizedRole,
        loading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (err) {
      console.error('Login error details:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (err.response?.data?.non_field_errors && err.response.data.non_field_errors[0]) ||
        (err.code === 'ERR_NETWORK' || !err.response
          ? 'Error de conexión con el backend. Verifica que el servidor esté activo en http://localhost:3001.'
          : 'Error al iniciar sesión. Verifica tus credenciales.');

      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        nombre: userData.nombre || userData.first_name || 'Usuario',
        apellido: userData.apellido || userData.last_name || '',
        telefono: userData.telefono || '',
        ci: userData.ci || userData.documento_identidad || '',
        direccion: userData.direccion || '',
        rol: (userData.rol || userData.role || 'usuario').toLowerCase(),
      };

      const response = await api.post('/auth/register', payload);
      const { accessToken, access, refresh, user, usuario, mensaje } = response.data;
      const token = accessToken || access;
      const rawUser = user || usuario;

      if (token && rawUser) {
        const normalizedRole = (rawUser.rol || rawUser.role || 'USUARIO').toUpperCase();
        const finalUser = {
          ...rawUser,
          role: normalizedRole,
          rol: normalizedRole,
          full_name: `${rawUser.nombre || ''} ${rawUser.apellido || ''}`.trim() || rawUser.email,
        };

        localStorage.setItem('saipi_access_token', token);
        if (refresh) localStorage.setItem('saipi_refresh_token', refresh);
        localStorage.setItem('saipi_user', JSON.stringify(finalUser));

        set({
          user: finalUser,
          accessToken: token,
          refreshToken: refresh || null,
          isAuthenticated: true,
          role: normalizedRole,
          loading: false,
          error: null,
        });
      } else {
        set({ loading: false, error: null });
      }

      return { success: true, data: response.data, mensaje };
    } catch (err) {
      let errorMsg = 'Error al registrar usuario.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data.message) {
          errorMsg = Array.isArray(data.message) ? data.message.join(' | ') : data.message;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (typeof data === 'object') {
          const messages = Object.entries(data).map(([key, val]) => {
            const text = Array.isArray(val) ? val.join(' ') : String(val);
            return `${key}: ${text}`;
          });
          errorMsg = messages.join(' | ');
        }
      }
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  verifyEmail: async (token) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/verify-email', { token });
      set({ loading: false });
      return { success: true, mensaje: response.data?.mensaje || 'Correo verificado correctamente.' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'El enlace de verificación es inválido o ha expirado.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/me');
      const rawUser = response.data;
      const normalizedRole = (rawUser.rol || rawUser.role || 'USUARIO').toUpperCase();
      const user = {
        ...rawUser,
        role: normalizedRole,
        rol: normalizedRole,
      };
      localStorage.setItem('saipi_user', JSON.stringify(user));
      set({ user, role: normalizedRole });
      return user;
    } catch (err) {
      console.error('Error obteniendo perfil:', err);
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('saipi_access_token');
    localStorage.removeItem('saipi_refresh_token');
    localStorage.removeItem('saipi_user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      role: null,
      error: null,
    });
  },
}));
