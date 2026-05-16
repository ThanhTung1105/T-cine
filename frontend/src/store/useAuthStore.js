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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock logic: nếu username/email là 'admin' thì role là admin, ngược lại là customer
      const isAdmin = credentials.email === 'admin' || credentials.email === 'admin@gmail.com';
      
      const mockUser = {
        id: isAdmin ? 1 : 2,
        name: isAdmin ? 'Administrator' : 'Customer',
        email: credentials.email,
        role: isAdmin ? 'admin' : 'customer',
        avatar: 'https://ui-avatars.com/api/?name=' + (isAdmin ? 'Admin' : 'Customer')
      };
      const mockToken = 'mock-jwt-token-' + Date.now();

      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      set({
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      return { data: { user: mockUser, token: mockToken } };
    } catch (error) {
      set({
        isLoading: false,
        error: 'Đăng nhập thất bại (Mock Error)',
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ isLoading: false });
      return { data: { message: 'Đăng ký thành công (Mock)' } };
    } catch (error) {
      set({
        isLoading: false,
        error: 'Đăng ký thất bại (Mock Error)',
      });
      throw error;
    }
  },

  logout: () => {
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
