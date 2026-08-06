import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '@/utils/tokenManager';

/**
 * Axios API instance with JWT token handling and auto-refresh logic
 * Features:
 * - Uses VITE_API_URL environment variable
 * - Automatically attaches Bearer token from localStorage using tokenManager
 * - Handles 401 errors with token refresh at /api/auth/refresh
 * - Retry mechanism for failed requests
 * - Redirect to login on refresh failure
 * - Comprehensive logging for debugging
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  retry?: number;
  _retry?: boolean;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables to track refresh token requests
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });

  failedQueue = [];
};

/**
 * Request Interceptor - Add JWT token to headers
 */
axiosInstance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log('[API Interceptor] Request interceptor: token attached');
    } else {
      console.log('[API Interceptor] Request interceptor: no token available');
    }
    return config;
  },
  (error) => {
    console.error('[API Interceptor] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle token refresh and retries
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && config && !config._retry) {
      console.log('[API Interceptor] 401 Unauthorized - attempting token refresh');

      if (isRefreshing) {
        console.log('[API Interceptor] Refresh already in progress, queuing request');
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({ onSuccess, onFailed });
        })
          .then((token) => {
            console.log('[API Interceptor] Retrying queued request with new token');
            config.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(config);
          })
          .catch((err) => {
            console.error('[API Interceptor] Queued request failed:', err);
            return Promise.reject(err);
          });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[API Interceptor] Calling refresh endpoint');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        console.log('[API Interceptor] Token refresh successful');

        // Update tokens using tokenManager
        tokenManager.setTokens(newAccessToken, newRefreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        config.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        console.log('[API Interceptor] Retrying original request with new token');
        return axiosInstance(config);
      } catch (err) {
        console.error('[API Interceptor] Token refresh failed:', err);
        processQueue(err as AxiosError, null);
        // Clear auth and redirect to login
        console.log('[API Interceptor] Clearing auth and redirecting to login');
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Service Methods
 */
export const apiService = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) => {
      console.log('[API Service] Calling login endpoint');
      return axiosInstance.post('/auth/login', { email, password });
    },
    signup: (email: string, password: string, name: string, username: string) => {
      console.log('[API Service] Calling signup endpoint');
      return axiosInstance.post('/auth/signup', { email, password, name, username });
    },
    refresh: (refreshToken: string) => {
      console.log('[API Service] Calling refresh endpoint');
      return axiosInstance.post('/auth/refresh', { refreshToken });
    },
    logout: () => {
      console.log('[API Service] Calling logout endpoint');
      return axiosInstance.post('/auth/logout');
    },
    me: () => {
      console.log('[API Service] Calling me endpoint');
      return axiosInstance.get('/auth/me');
    },
  },

  // User endpoints
  users: {
    getProfile: (userId: string) => axiosInstance.get(`/users/${userId}`),
    search: (query: string) => axiosInstance.get(`/users/search`, { params: { q: query } }),
    getAll: () => axiosInstance.get('/users'),
  },

  // Chat endpoints
  chats: {
    getAll: () => axiosInstance.get('/chats'),
    getChat: (chatId: string) => axiosInstance.get(`/chats/${chatId}`),
    getMessages: (chatId: string, limit: number = 50, offset: number = 0) =>
      axiosInstance.get(`/chats/${chatId}/messages`, { params: { limit, offset } }),
    sendMessage: (chatId: string, content: string) =>
      axiosInstance.post(`/chats/${chatId}/messages`, { content }),
    markAsRead: (chatId: string) => axiosInstance.put(`/chats/${chatId}/read`),
  },

  // Notifications endpoints
  notifications: {
    getAll: () => axiosInstance.get('/notifications'),
    markAsRead: (notificationId: string) =>
      axiosInstance.put(`/notifications/${notificationId}/read`),
    markAllAsRead: () => axiosInstance.put('/notifications/read-all'),
    delete: (notificationId: string) => axiosInstance.delete(`/notifications/${notificationId}`),
  },
};

export default axiosInstance;
