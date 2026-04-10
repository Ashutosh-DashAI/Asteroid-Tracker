import { useQuery } from '@tanstack/react-query';
import asteroidsAPI from '@/api/asteroids.api';

export interface AsteroidStatsData {
  totalAsteroids: number;
  hazardousCount: number;
  avgDiameter: number;
  maxSpeed: number;
  nearestMiss: number | null;
  fastestAsteroid: any | null;
  largestAsteroid: any | null;
}

const DEFAULT_STATS: AsteroidStatsData = {
  totalAsteroids: 0,
  hazardousCount: 0,
  avgDiameter: 0,
  maxSpeed: 0,
  nearestMiss: null,
  fastestAsteroid: null,
  largestAsteroid: null,
};

export function useAsteroidStats(days = 7) {
  const {
    data = DEFAULT_STATS,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['asteroidStats', days],
    queryFn: async () => {
      try {
        const raw = await asteroidsAPI.getStats();
        return {
          totalAsteroids: raw.totalAsteroids || 0,
          hazardousCount: raw.hazardousCount || 0,
          avgDiameter: raw.avgDiameter || 0,
          maxSpeed: raw.maxSpeed || 0,
          nearestMiss: (raw as any).nearestMissDistance ?? null,
          fastestAsteroid: (raw as any).fastestAsteroid ?? null,
          largestAsteroid: (raw as any).largestAsteroid ?? null,
        } as AsteroidStatsData;
      } catch {
        return DEFAULT_STATS;
      }
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  return { data, isLoading, error, refetch };
}