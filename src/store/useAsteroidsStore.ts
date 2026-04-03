import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Asteroid, AsteroidFeedResponse, AsteroidFeedFilter, SavedAsteroid, AlertPreference } from '@/types';
import asteroidsAPI from '@/api/asteroids.api';

interface AsteroidsState {
  // Feed state
  asteroids: Asteroid[];
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;

  // Filters
  filters: AsteroidFeedFilter;
  sortBy: 'closest' | 'largest' | 'fastest' | 'most-dangerous';

  // Search state
  searchQuery: string;
  searchResults: Asteroid[];
  searchLoading: boolean;

  // Favorites
  favorites: SavedAsteroid[];
  favoriteIds: string[];
  favoritesLoading: boolean;

  // Selected asteroid
  selectedAsteroid: Asteroid | null;
  selectedLoading: boolean;

  // Recent viewed
  recentlyViewed: Asteroid[];

  // Alert preferences
  alertPrefs: AlertPreference | null;
  alertLoading: boolean;

  // Actions - Feed
  fetchAsteroids: (reset?: boolean) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<AsteroidFeedFilter>) => void;
  resetFilters: () => void;
  setSortBy: (sort: 'closest' | 'largest' | 'fastest' | 'most-dangerous') => void;

  // Actions - Search
  search: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Actions - Favorites
  fetchFavorites: () => Promise<void>;
  addFavorite: (asteroidId: string, notes?: string) => Promise<void>;
  removeFavorite: (asteroidId: string) => Promise<void>;
  isFavorite: (asteroidId: string) => boolean;

  // Actions - Detail
  fetchAsteroidDetail: (id: string) => Promise<void>;
  clearSelected: () => void;

  // Actions - Recent
  addToRecent: (asteroid: Asteroid) => void;
  clearRecent: () => void;

  // Actions - Alerts
  fetchAlertPreferences: () => Promise<void>;
  updateAlertPreferences: (prefs: Partial<AlertPreference>) => Promise<void>;
}

const initialFilters: AsteroidFeedFilter = {
  startDate: undefined,
  endDate: undefined,
  hazardousOnly: false,
  diameterMin: undefined,
  diameterMax: undefined,
  missDistanceMin: undefined,
  missDistanceMax: undefined,
};

export const useAsteroidsStore = create<AsteroidsState>()(
  persist(
    (set, get) => ({
      // Initial state
      asteroids: [],
      loading: false,
      error: null,
      page: 1,
      pageSize: 20,
      total: 0,
      hasMore: true,

      filters: initialFilters,
      sortBy: 'closest',

      searchQuery: '',
      searchResults: [],
      searchLoading: false,

      favorites: [],
      favoriteIds: [],
      favoritesLoading: false,

      selectedAsteroid: null,
      selectedLoading: false,

      recentlyViewed: [],

      alertPrefs: null,
      alertLoading: false,

      // Actions - Feed
      fetchAsteroids: async (reset = false) => {
        set({ loading: true, error: null });
        try {
          const state = get();
          const page = reset ? 1 : state.page;

          // Build params from filters
          const params = {
            ...state.filters,
            page,
            limit: state.pageSize,
            sortBy: state.sortBy,
          };

          const response = await asteroidsAPI.getFeed(params);
          
          // Extract data and pagination from response
          const asteroids = response.data || response.asteroids || [];
          const pagination = response.pagination || {};
          const total = pagination.total || 0;

          set((prev) => ({
            asteroids: reset ? asteroids : [...prev.asteroids, ...asteroids],
            total,
            hasMore: pagination.hasNextPage !== false,
            page: pagination.page || page,
            loading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch asteroids',
            loading: false,
          });
        }
      },

      setPage: (page: number) => {
        set({ page });
        get().fetchAsteroids();
      },

      setFilters: (filters: Partial<AsteroidFeedFilter>) => {
        set((prev) => ({
          filters: { ...prev.filters, ...filters },
          page: 1, // Reset to first page when filters change
        }));
        get().fetchAsteroids(true);
      },

      resetFilters: () => {
        set({
          filters: initialFilters,
          page: 1,
        });
        get().fetchAsteroids(true);
      },

      setSortBy: (sort: 'closest' | 'largest' | 'fastest' | 'most-dangerous') => {
        set({ sortBy: sort, page: 1 });
        get().fetchAsteroids(true);
      },

      // Actions - Search
      search: async (query: string) => {
        if (!query.trim()) {
          set({ searchResults: [], searchQuery: '' });
          return;
        }

        set({ searchLoading: true, error: null });
        try {
          const response = await asteroidsAPI.search(query);
          
          // Extract data from response
          const searchResults = response.data || response.asteroids || [];
          
          set({
            searchResults,
            searchQuery: query,
            searchLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Search failed',
            searchLoading: false,
          });
        }
      },

      clearSearch: () => {
        set({ searchResults: [], searchQuery: '' });
      },

      // Actions - Favorites
      fetchFavorites: async () => {
        set({ favoritesLoading: true, error: null });
        try {
          const favorites = await asteroidsAPI.getFavorites();
          const favoriteIds = favorites.map((f) => f.asteroidId);
          set({
            favorites,
            favoriteIds,
            favoritesLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch favorites',
            favoritesLoading: false,
          });
        }
      },

      addFavorite: async (asteroidId: string, notes?: string) => {
        try {
          const favorite = await asteroidsAPI.addFavorite(asteroidId, notes);
          set((prev) => {
            const newFavorites = [...prev.favorites, favorite];
            const newFavoriteIds = prev.favoriteIds.includes(asteroidId)
              ? prev.favoriteIds
              : [...prev.favoriteIds, asteroidId];
            return {
              favorites: newFavorites,
              favoriteIds: newFavoriteIds,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add favorite',
          });
        }
      },

      removeFavorite: async (asteroidId: string) => {
        try {
          await asteroidsAPI.removeFavorite(asteroidId);
          set((prev) => {
            const newFavorites = prev.favorites.filter((f) => f.asteroidId !== asteroidId);
            const newFavoriteIds = prev.favoriteIds.filter((id) => id !== asteroidId);
            return {
              favorites: newFavorites,
              favoriteIds: newFavoriteIds,
            };
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to remove favorite',
          });
        }
      },

      isFavorite: (asteroidId: string) => {
        return get().favoriteIds.includes(asteroidId);
      },

      // Actions - Detail
      fetchAsteroidDetail: async (id: string) => {
        set({ selectedLoading: true, error: null });
        try {
          const asteroid = await asteroidsAPI.getById(id);
          set({ selectedAsteroid: asteroid, selectedLoading: false });
          get().addToRecent(asteroid);
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch asteroid details',
            selectedLoading: false,
          });
        }
      },

      clearSelected: () => {
        set({ selectedAsteroid: null });
      },

      // Actions - Recent
      addToRecent: (asteroid: Asteroid) => {
        set((prev) => {
          const filtered = prev.recentlyViewed.filter((a) => a.id !== asteroid.id);
          return {
            recentlyViewed: [asteroid, ...filtered].slice(0, 10),
          };
        });
      },

      clearRecent: () => {
        set({ recentlyViewed: [] });
      },

      // Actions - Alerts
      fetchAlertPreferences: async () => {
        set({ alertLoading: true, error: null });
        try {
          const prefs = await asteroidsAPI.getAlertPreferences();
          set({ alertPrefs: prefs, alertLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch alert preferences',
            alertLoading: false,
          });
        }
      },

      updateAlertPreferences: async (prefs: Partial<AlertPreference>) => {
        set({ alertLoading: true, error: null });
        try {
          const updated = await asteroidsAPI.updateAlertPreferences(prefs);
          set({ alertPrefs: updated, alertLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update alert preferences',
            alertLoading: false,
          });
        }
      },
    }),
    {
      name: 'asteroids-store',
      partialize: (state) => ({
        favoritesLoading: false,
        favorites: state.favorites,
        favoriteIds: state.favoriteIds,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);
