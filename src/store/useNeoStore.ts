import { create } from 'zustand';
import * as neoApi from '@/api/neo.api';

interface NeoState {
  asteroids: any[];
  isLoading: boolean;
  filters: Record<string, unknown>;
  pagination: { page: number; limit: number; hasMore: boolean };
  selectedAsteroid: any | null;
  fetchFeed: (params?: Record<string, unknown>) => Promise<void>;
  fetchBrowse: (params?: Record<string, unknown>) => Promise<void>;
  fetchById: (nasaId: string) => Promise<void>;
  setFilters: (filters: Record<string, unknown>) => void;
}

export const useNeoStore = create<NeoState>((set, get) => ({
  asteroids: [],
  isLoading: false,
  filters: {},
  pagination: { page: 1, limit: 10, hasMore: true },
  selectedAsteroid: null,
  fetchFeed: async (params) => {
    set({ isLoading: true });
    const data = await neoApi.getFeed(params);
    set({ asteroids: data?.items || data || [], isLoading: false });
  },
  fetchBrowse: async (params) => {
    set({ isLoading: true });
    const data = await neoApi.getBrowse({ ...get().filters, ...params });
    set({ asteroids: data?.items || data || [], isLoading: false });
  },
  fetchById: async (nasaId) => {
    set({ isLoading: true });
    const data = await neoApi.getById(nasaId);
    set({ selectedAsteroid: data, isLoading: false });
  },
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),
}));
