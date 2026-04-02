import env from "../config/env";

export interface NASAAsteroidData {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url?: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
    meters: { estimated_diameter_min: number; estimated_diameter_max: number };
    miles: { estimated_diameter_min: number; estimated_diameter_max: number };
    feet: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  orbital_data?: {
    orbit_class?: { orbit_class_type?: string; orbit_class_description?: string };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach: number;
    relative_velocity: {
      kilometers_per_second: string;
      kilometers_per_hour: string;
      miles_per_hour: string;
    };
    miss_distance: {
      astronomical: string;
      kilometers: string;
      miles: string;
      lunar: string;
    };
    orbiting_body: string;
  }>;
}

interface NASAFeedResponse {
  links?: { next?: string; previous?: string; self?: string };
  element_count?: number;
  near_earth_objects?: {
    [key: string]: NASAAsteroidData[];
  };
}

interface NASALookupResponse {
  near_earth_objects?: { [key: string]: NASAAsteroidData[] };
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = env.NASA_API_CACHE_DURATION;

export const nasaService = {
  async fetchNearEarthObjectsFeed(startDate: string, endDate: string): Promise<NASAAsteroidData[]> {
    const cacheKey = `feed-${startDate}-${endDate}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/feed`);
      url.searchParams.append("start_date", startDate);
      url.searchParams.append("end_date", endDate);
      url.searchParams.append("api_key", env.NASA_API_KEY);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`NASA API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as NASAFeedResponse;
      const asteroids: NASAAsteroidData[] = [];

      if (data.near_earth_objects) {
        Object.values(data.near_earth_objects).forEach((dailyAsteroids) => {
          asteroids.push(...dailyAsteroids);
        });
      }

      cache.set(cacheKey, { data: asteroids, timestamp: Date.now() });
      return asteroids;
    } catch (error) {
      console.error("Error fetching NEO feed from NASA:", error);
      throw new Error("Failed to fetch asteroid data from NASA API");
    }
  },

  async lookupAsteroid(neoId: string): Promise<NASAAsteroidData | null> {
    const cacheKey = `lookup-${neoId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/neo/${neoId}`);
      url.searchParams.append("api_key", env.NASA_API_KEY);

      const response = await fetch(url.toString());
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`NASA API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as NASAAsteroidData;
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error(`Error fetching asteroid ${neoId} from NASA:`, error);
      throw new Error("Failed to fetch asteroid data from NASA API");
    }
  },

  async getBrowse(page?: number): Promise<NASAAsteroidData[]> {
    const pageNum = page || 0;
    const cacheKey = `browse-${pageNum}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/neo/browse`);
      url.searchParams.append("page", pageNum.toString());
      url.searchParams.append("api_key", env.NASA_API_KEY);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`NASA API Error: ${response.statusText}`);
      }

      const data = (await response.json()) as NASALookupResponse;
      const asteroids: NASAAsteroidData[] = [];

      if (data.near_earth_objects) {
        Object.values(data.near_earth_objects).forEach((dailyAsteroids) => {
          asteroids.push(...dailyAsteroids);
        });
      }

      cache.set(cacheKey, { data: asteroids, timestamp: Date.now() });
      return asteroids;
    } catch (error) {
      console.error("Error browsing NEOs from NASA:", error);
      throw new Error("Failed to browse asteroid data from NASA API");
    }
  },

  clearCache() {
    cache.clear();
  },
};
