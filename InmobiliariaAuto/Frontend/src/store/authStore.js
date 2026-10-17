import { create } from 'zustand';
import api from '../api/axios';

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al iniciar sesión';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      const { user, accessToken } = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', accessToken);
      set({ user, token: accessToken, isAuthenticated: true, loading: false });
      return user;
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrarse';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (updatedData) => {
    const updated = { ...get().user, ...updatedData };
    localStorage.setItem('user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
