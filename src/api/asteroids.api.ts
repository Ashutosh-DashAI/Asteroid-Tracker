import axiosInstance from './api';
import { Asteroid, AsteroidFeedResponse, AsteroidStats, SavedAsteroid, AlertPreference } from '@/types';

const parseError = (error: any) => {
  const message = error?.response?.data?.message || error?.message || 'Request failed';
  throw new Error(message);
};

/**
 * Asteroids API Service
 * Handles all API calls related to asteroids, favorites, and alerts
 */
export const asteroidsAPI = {
  // Asteroids Feed
  getFeed: async (params?: {
    startDate?: string;
    endDate?: string;
    hazardousOnly?: boolean;
    diameterMin?: number;
    diameterMax?: number;
    missDistanceMin?: number;
    missDistanceMax?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<AsteroidFeedResponse> => {
    try {
      const response = await axiosInstance.get('/asteroids/feed', { params });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Get single asteroid by ID
  getById: async (id: string): Promise<Asteroid> => {
    try {
      const response = await axiosInstance.get(`/asteroids/${id}`);
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Search asteroids
  search: async (query: string, params?: { page?: number; limit?: number }): Promise<AsteroidFeedResponse> => {
    try {
      const response = await axiosInstance.get('/asteroids/search', {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Get asteroid statistics
  getStats: async (): Promise<AsteroidStats> => {
    try {
      const response = await axiosInstance.get('/asteroids/stats');
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Get recommended asteroids
  getRecommended: async (limit: number = 10): Promise<Asteroid[]> => {
    try {
      const response = await axiosInstance.get('/asteroids/recommended', {
        params: { limit },
      });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Favorite endpoints
  getFavorites: async (params?: { page?: number; limit?: number }): Promise<SavedAsteroid[]> => {
    try {
      const response = await axiosInstance.get('/asteroids/favorites', { params });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  addFavorite: async (asteroidId: string, notes?: string): Promise<SavedAsteroid> => {
    try {
      const response = await axiosInstance.post('/asteroids/favorites', {
        asteroidId,
        notes,
      });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  removeFavorite: async (asteroidId: string): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.delete(`/asteroids/favorites/${asteroidId}`);
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  isFavorite: async (asteroidId: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.get(`/asteroids/favorites/${asteroidId}/check`);
      return response.data.isFavorite;
    } catch (e) {
      return false;
    }
  },

  // Alert preferences
  getAlertPreferences: async (): Promise<AlertPreference> => {
    try {
      const response = await axiosInstance.get('/asteroids/alerts/preferences');
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  updateAlertPreferences: async (preferences: Partial<AlertPreference>): Promise<AlertPreference> => {
    try {
      const response = await axiosInstance.put('/asteroids/alerts/preferences', preferences);
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  // Saved searches
  getSavedSearches: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get('/asteroids/saved-searches');
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  saveSearch: async (name: string, filters: any): Promise<any> => {
    try {
      const response = await axiosInstance.post('/asteroids/saved-searches', {
        name,
        filters,
      });
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },

  deleteSavedSearch: async (searchId: string): Promise<{ success: boolean }> => {
    try {
      const response = await axiosInstance.delete(`/asteroids/saved-searches/${searchId}`);
      return response.data;
    } catch (e) {
      return parseError(e);
    }
  },
};

export default asteroidsAPI;
