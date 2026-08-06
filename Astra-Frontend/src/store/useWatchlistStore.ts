import { create } from 'zustand';
import * as watchlistApi from '@/api/watchlist.api';

interface WatchlistState {
  watchedAsteroids: any[];
  isLoading: boolean;
  fetchWatchlist: () => Promise<void>;
  addToWatchlist: (nasaId: string) => Promise<void>;
  removeFromWatchlist: (nasaId: string) => Promise<void>;
  updateThreshold: (nasaId: string, thresholdKm: number) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchedAsteroids: [],
  isLoading: false,
  fetchWatchlist: async () => {
    set({ isLoading: true });
    const data = await watchlistApi.getWatchlist();
    set({ watchedAsteroids: data?.items || data || [], isLoading: false });
  },
  addToWatchlist: async (nasaId) => {
    await watchlistApi.addToWatchlist({ nasaId });
    await get().fetchWatchlist();
  },
  removeFromWatchlist: async (nasaId) => {
    await watchlistApi.removeFromWatchlist(nasaId);
    await get().fetchWatchlist();
  },
  updateThreshold: async (nasaId, thresholdKm) => {
    await watchlistApi.updateThreshold(nasaId, thresholdKm);
    await get().fetchWatchlist();
  },
}));
