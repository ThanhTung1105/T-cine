import { create } from 'zustand';
import authApi from '../api/authApi';

const useAuthStore = create((set) => ({
  // State
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,

  // Actions
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(credentials);

      localStorage.setItem('access_token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));

      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { data: res };
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.email?.[0]
        || 'Đăng nhập thất bại. Vui lòng thử lại.';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(data);

      set({ isLoading: false });
      return { data: res };
    } catch (error) {
      const message = error.response?.data?.message
        || error.response?.data?.errors?.email?.[0]
        || 'Đăng ký thất bại. Vui lòng thử lại.';
      set({
        isLoading: false,
        error: message,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Token có thể đã hết hạn, bỏ qua lỗi
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
