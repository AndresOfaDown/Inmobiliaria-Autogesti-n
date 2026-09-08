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
      const response = await api.post('/auth/login/', { email, password });
      const { access, refresh, usuario } = response.data;

      localStorage.setItem('saipi_access_token', access);
      localStorage.setItem('saipi_refresh_token', refresh);
      localStorage.setItem('saipi_user', JSON.stringify(usuario));

      set({
        user: usuario,
        accessToken: access,
        refreshToken: refresh,
        isAuthenticated: true,
        role: usuario.role,
        loading: false,
        error: null,
      });

      return { success: true, user: usuario };
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (err.response?.data?.non_field_errors && err.response.data.non_field_errors[0]) ||
        'Error al iniciar sesión. Verifica tus credenciales.';

      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/registro/', userData);
      const { access, refresh, usuario, mensaje } = response.data;

      // Si el registro retorna tokens directos, autenticamos inmediatamente
      if (access && refresh && usuario) {
        localStorage.setItem('saipi_access_token', access);
        localStorage.setItem('saipi_refresh_token', refresh);
        localStorage.setItem('saipi_user', JSON.stringify(usuario));

        set({
          user: usuario,
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
          role: usuario.role,
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
      const response = await api.post('/auth/verify-email/', { token });
      set({ loading: false });
      return { success: true, mensaje: response.data?.mensaje || 'Correo verificado correctamente.' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'El enlace de verificación es inválido o ha expirado.';
      set({ error: errorMsg, loading: false });
      return { success: false, error: errorMsg };
    }
  },

  fetchProfile: async () => {
    try {
      const response = await api.get('/auth/me/');
      const user = response.data;
      localStorage.setItem('saipi_user', JSON.stringify(user));
      set({ user, role: user.role });
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
