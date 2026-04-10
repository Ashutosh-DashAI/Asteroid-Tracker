import { useQuery } from '@tanstack/react-query';
import asteroidsAPI from '@/api/asteroids.api';
import { Asteroid } from '@/types';

interface CloseApproachEvent {
  id: string;
  asteroidName: string;
  nasaId: string;
  date: string;
  missDistanceKm: number;
  velocityKmS: number;
  hazardous: boolean;
  estimatedDiameterMax: number;
}

function normalizeAsteroid(a: any): Asteroid {
  return {
    ...a,
    nasaId: a.nasaId || a.neo_reference_id,
    closeApproaches: a.closeApproaches || a.close_approach_data || [],
    estimatedDiameterMin: a.estimatedDiameterMin || a.estimated_diameter?.kilometers?.estimated_diameter_min || 0,
    estimatedDiameterMax: a.estimatedDiameterMax || a.estimated_diameter?.kilometers?.estimated_diameter_max || 0,
    isPotentiallyHazardous: a.isPotentiallyHazardous || a.is_potentially_hazardous_asteroid || false,
  };
}

export function useCloseApproaches(days = 7) {
  const { data: events = [], isLoading, error } = useQuery<CloseApproachEvent[]>({
    queryKey: ['closeApproaches', days],
    queryFn: async () => {
      const endDate = new Date();
      const startDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const response = await asteroidsAPI.getFeed({
        startDate: new Date().toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        limit: 50,
      });

      const asteroids: Asteroid[] = (response.asteroids || []).map(normalizeAsteroid);

      // Flatten close approaches into timeline events
      const events: CloseApproachEvent[] = [];
      for (const asteroid of asteroids) {
        const approaches = asteroid.closeApproaches || [];
        for (const approach of approaches) {
          const date = approach.date || approach.close_approach_date;
          const missDist = approach.missDistanceKm || parseFloat(approach.miss_distance?.kilometers || '0');
          const velocity = approach.velocityKmS || parseFloat(approach.relative_velocity?.kilometers_per_second || '0');

          if (date) {
            events.push({
              id: `${asteroid.nasaId || asteroid.id}-${date}`,
              asteroidName: asteroid.name,
              nasaId: asteroid.nasaId || asteroid.id,
              date,
              missDistanceKm: missDist,
              velocityKmS: velocity,
              hazardous: asteroid.isPotentiallyHazardous || false,
              estimatedDiameterMax: asteroid.estimatedDiameterMax || 0,
            });
          }
        }
      }

      // Sort by date ascending, then by miss distance
      events.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.missDistanceKm - b.missDistanceKm;
      });

      return events;
    },
    staleTime: 5 * 60 * 1000,
  });

  return { events, isLoading, error };
}