import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Axios API instance with JWT token handling and auto-refresh logic
 * Features:
 * - Automatically attaches JWT from localStorage
 * - Handles 401 errors with token refresh
 * - Retry mechanism for failed requests
 */

const API_BASE_URL = '/api';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
      if (isRefreshing) {
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({ onSuccess, onFailed });
        })
          .then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(config);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { token: newToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        config.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return axiosInstance(config);
      } catch (err) {
        processQueue(err as AxiosError, null);
        // Do not hard-redirect here; let route/store logic decide.
        // A transient 401 from non-auth endpoints should not force logout.
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
    login: (email: string, password: string) =>
      axiosInstance.post('/auth/login', { email, password }),
    signup: (email: string, password: string, name: string, username: string) =>
      axiosInstance.post('/auth/signup', { email, password, name, username }),
    refresh: (refreshToken: string) =>
      axiosInstance.post('/auth/refresh', { refreshToken }),
    logout: () => axiosInstance.post('/auth/logout'),
    me: () => axiosInstance.get('/auth/me'),
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
