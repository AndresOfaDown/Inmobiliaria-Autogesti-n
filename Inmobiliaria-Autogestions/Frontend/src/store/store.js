import { create } from 'zustand';
import authService from '../services/authService';

/**
 * Store global con Zustand
 */
const useStore = create((set) => ({
  // ─── Estado de autenticación ──────────────────────────────
  user: null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,

  // ─── Acciones de autenticación ────────────────────────────
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (username, password) => {
    set({ isLoading: true });
    try {
      await authService.login(username, password);
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    if (!authService.isAuthenticated()) return;
    try {
      set({ isLoading: true });
      const user = await authService.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: async (userData) => {
    set({ isLoading: true });
    try {
      const updatedUser = await authService.updateProfile(userData);
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ─── UI Global ────────────────────────────────────────────
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // ─── Tema Global ──────────────────────────────────────────
  theme: localStorage.getItem('theme') || 'system',
  setTheme: (newTheme) => {
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
    const root = document.documentElement;
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.setAttribute('data-theme', 'dark');
      root.style.backgroundColor = '#0f172a';
    } else {
      root.setAttribute('data-theme', 'light');
      root.style.backgroundColor = '#f8fafc';
    }
  },
}));

export default useStore;
