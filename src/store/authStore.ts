import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '@/api/api';
import { tokenManager } from '@/utils/tokenManager';
import type { User, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  initializingAuth: boolean; // NEW: Track auth initialization
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string, user?: User) => void;
  setLoading: (loading: boolean) => void;
  setInitializingAuth: (initializing: boolean) => void;
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
      accessToken: null,
      refreshToken: null,
      loading: false,
      initializingAuth: false,
      error: null,
      isAuthenticated: false,

      setUser: (user) => {
        console.log('[AuthStore] Setting user:', user?.id);
        set({ user, isAuthenticated: !!user });
        if (user) {
          tokenManager.setUser(user);
        }
      },

      setTokens: (accessToken, refreshToken, user) => {
        console.log('[AuthStore] Setting tokens', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          userId: user?.id,
        });
        // Store in localStorage first via tokenManager
        tokenManager.setTokens(accessToken, refreshToken);
        if (user) {
          tokenManager.setUser(user);
        }
        // Then update state
        set({ 
          accessToken, 
          refreshToken,
          user: user || null,
          isAuthenticated: true,
          error: null,
        });
      },

      setLoading: (loading) => set({ loading }),

      setInitializingAuth: (initializing) => {
        console.log('[AuthStore] Auth initialization:', initializing ? 'started' : 'completed');
        set({ initializingAuth: initializing });
      },

      setError: (error) => set({ error }),

      clearAuth: () => {
        console.log('[AuthStore] Clearing auth state');
        tokenManager.clearTokens();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
          initializingAuth: false,
        });
      },

      login: async (email, password) => {
        console.log('[AuthStore] Attempting login for:', email);
        set({ loading: true, error: null });
        try {
          const response = await apiService.auth.login(email, password);
          console.log('[AuthStore] Login successful, response:', {
            hasAccessToken: !!response.data.data?.accessToken,
            hasRefreshToken: !!response.data.data?.refreshToken,
            userId: response.data.data?.user?.id,
          });

          const { accessToken, refreshToken, user } = response.data.data as AuthResponse;

          // Save tokens and user
          tokenManager.setTokens(accessToken, refreshToken);
          tokenManager.setUser(user);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('[AuthStore] Login state updated, ready to navigate');
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Login failed';
          console.error('[AuthStore] Login failed:', errorMessage, err);
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      signup: async (email: string, password: string, name: string, username: string) => {
        console.log('[AuthStore] Attempting signup for:', email);
        set({ loading: true, error: null });
        try {
          const response = await apiService.auth.signup(email, password, name, username);
          console.log('[AuthStore] Signup successful, response:', {
            hasAccessToken: !!response.data.data?.accessToken,
            hasRefreshToken: !!response.data.data?.refreshToken,
            userId: response.data.data?.user?.id,
          });

          const { accessToken, refreshToken, user } = response.data.data as AuthResponse;

          // Save tokens and user
          tokenManager.setTokens(accessToken, refreshToken);
          tokenManager.setUser(user);

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          console.log('[AuthStore] Signup state updated, ready to navigate');
        } catch (err: any) {
          const errorMessage = err.response?.data?.message || 'Signup failed';
          console.error('[AuthStore] Signup failed:', errorMessage, err);
          set({ error: errorMessage, loading: false });
          throw err;
        }
      },

      logout: async () => {
        console.log('[AuthStore] Logging out');
        set({ loading: true });
        try {
          await apiService.auth.logout();
          console.log('[AuthStore] Logout API call successful');
        } catch (err) {
          console.error('[AuthStore] Logout API error (continuing with local logout):', err);
        } finally {
          get().clearAuth();
        }
      },

      hydrateUser: async () => {
        console.log('[AuthStore] Starting auth hydration');
        set({ initializingAuth: true });

        // Check if we have stored tokens
        const accessToken = tokenManager.getAccessToken();
        const user = tokenManager.getStoredUser();

        if (!accessToken) {
          console.log('[AuthStore] No stored access token found');
          set({ isAuthenticated: false, initializingAuth: false });
          return;
        }

        console.log('[AuthStore] Found stored credentials, validating...');
        set({ loading: true, accessToken });

        try {
          const response = await apiService.auth.me();
          const validatedUser = response.data.data as User;
          console.log('[AuthStore] User validation successful:', validatedUser.id);

          set({
            user: validatedUser,
            isAuthenticated: true,
            loading: false,
            initializingAuth: false,
          });

          tokenManager.setUser(validatedUser);
        } catch (err) {
          console.error('[AuthStore] User validation failed:', err);
          console.log('[AuthStore] Clearing invalid auth state');
          tokenManager.clearTokens();
          set({
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            loading: false,
            initializingAuth: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
