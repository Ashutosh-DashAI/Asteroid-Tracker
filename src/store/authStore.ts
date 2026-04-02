import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/api/api';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;

  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrateUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setTokens: (token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({ token, refreshToken });
      },

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.auth.login(email, password);
          const { token, refreshToken, user } = response.data as AuthResponse;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          });

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Login failed';
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      signup: async (email: string, password: string, name: string, username: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiService.auth.signup(email, password, name, username);
          const { token, refreshToken, user } = response.data as AuthResponse;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            loading: false,
          });

          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Signup failed';
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await apiService.auth.logout();
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          get().clearAuth();
        }
      },

      hydrateUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ loading: true, token });

        try {
          const response = await apiService.auth.me();
          const user = response.data as User;
          set({ user, isAuthenticated: true, loading: false });
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          set({ isAuthenticated: false, token: null, loading: false });
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
