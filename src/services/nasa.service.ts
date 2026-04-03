import env from "../config/env";
import logger from "../utils/logger";

// ============================================
// NASA API RESPONSE TYPES
// ============================================
export interface NASAAsteroidData {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url?: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number };
  };
  is_potentially_hazardous_asteroid: boolean;
  orbital_data?: {
    orbit_class?: { orbit_class_type?: string };
  };
  close_approach_data?: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
    miss_distance: {
      kilometers: string;
    };
    orbiting_body: string;
  }>;
}

export interface NormalizedAsteroid {
  nasaId: string;
  name: string;
  hazardous: boolean;
  absoluteMagnitude: number;
  estimatedDiameterMin: number;
  estimatedDiameterMax: number;
  orbitalClass?: string;
  closeApproaches: Array<{
    date: string;
    velocityKmS: number;
    missDistanceKm: number;
    orbitingBody: string;
  }>;
}

interface NASAFeedResponse {
  element_count?: number;
  near_earth_objects?: {
    [key: string]: NASAAsteroidData[];
  };
}

interface RateLimitInfo {
  requestsRemaining: number;
  requestsReset: number;
}

// ============================================
// CACHE AND RATE LIMITING
// ============================================
const cache = new Map<string, { data: any; timestamp: number }>();
let rateLimitInfo: RateLimitInfo = { requestsRemaining: 0, requestsReset: 0 };

const CACHE_DURATION = env.NASA_API_CACHE_DURATION;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

// ============================================
// UTILITY FUNCTIONS
// ============================================
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<{ data: any; rateLimitInfo: RateLimitInfo }> {
  try {
    const response = await fetch(url);

    // Extract rate limit headers
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (remaining && reset) {
      rateLimitInfo = {
        requestsRemaining: parseInt(remaining),
        requestsReset: parseInt(reset),
      };
    }

    // 429 = Too Many Requests, 503 = Service Unavailable
    if (response.status === 429 || response.status === 503) {
      if (retries > 0) {
        const backoff = INITIAL_BACKOFF * Math.pow(2, MAX_RETRIES - retries);
        logger.warn(`Rate limited, retrying after ${backoff}ms`);
        await sleep(backoff);
        return fetchWithRetry(url, retries - 1);
      }
      throw new Error("NASA API rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`NASA API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { data, rateLimitInfo };
  } catch (error) {
    if (retries > 0) {
      const backoff = INITIAL_BACKOFF * Math.pow(2, MAX_RETRIES - retries);
        logger.warn(`Rate limited, retrying after ${backoff}ms`);
      await sleep(backoff);
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

// ============================================
// NORMALIZATION FUNCTIONS
// ============================================
function normalizeAsteroid(raw: NASAAsteroidData): NormalizedAsteroid {
  return {
    nasaId: raw.neo_reference_id,
    name: raw.name,
    hazardous: raw.is_potentially_hazardous_asteroid,
    absoluteMagnitude: raw.absolute_magnitude_h,
    estimatedDiameterMin: raw.estimated_diameter.kilometers.estimated_diameter_min,
    estimatedDiameterMax: raw.estimated_diameter.kilometers.estimated_diameter_max,
    orbitalClass: raw.orbital_data?.orbit_class?.orbit_class_type,
    closeApproaches: (raw.close_approach_data || []).map((ca) => ({
      date: ca.close_approach_date,
      velocityKmS: parseFloat(ca.relative_velocity.kilometers_per_second),
      missDistanceKm: parseFloat(ca.miss_distance.kilometers),
      orbitingBody: ca.orbiting_body,
    })),
  };
}

// ============================================
// NASA SERVICE
// ============================================
export const nasaService = {
  getRateLimitInfo(): RateLimitInfo {
    return rateLimitInfo;
  },

  getCacheStats() {
    return {
      size: cache.size,
      keys: Array.from(cache.keys()),
    };
  },

  async fetchNearEarthObjectsFeed(
    startDate: string,
    endDate: string
  ): Promise<NormalizedAsteroid[]> {
    const cacheKey = `feed-${startDate}-${endDate}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info(`Cache hit for feed ${startDate} to ${endDate}`);
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/feed`);
      url.searchParams.append("start_date", startDate);
      url.searchParams.append("end_date", endDate);
      url.searchParams.append("api_key", env.NASA_API_KEY);

      logger.info(`Fetching NEO feed from ${startDate} to ${endDate}`);
      const { data } = await fetchWithRetry(url.toString());

      const asteroids: NormalizedAsteroid[] = [];

      if (data.near_earth_objects) {
        Object.values(data.near_earth_objects).forEach((dailyAsteroids) => {
          const asteroidList = dailyAsteroids as NASAAsteroidData[];
          asteroids.push(...asteroidList.map(normalizeAsteroid));
        });
      }

      cache.set(cacheKey, { data: asteroids, timestamp: Date.now() });
      logger.info(`Fetched ${asteroids.length} asteroids from NASA API`);
      return asteroids;
    } catch (error) {
      logger.error("`Error fetching NEO feed from NASA");
      throw error;
    }
  },

  async lookupAsteroid(neoId: string): Promise<NormalizedAsteroid | null> {
    const cacheKey = `lookup-${neoId}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info(`Cache hit for asteroid ${neoId}`);
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/neo/${neoId}`);
      url.searchParams.append("api_key", env.NASA_API_KEY);

      logger.info(`Looking up asteroid ${neoId}`);
      const { data } = await fetchWithRetry(url.toString());

      const normalized = normalizeAsteroid(data);
      cache.set(cacheKey, { data: normalized, timestamp: Date.now() });
      return normalized;
    } catch (error) {
      logger.error(`Error fetching asteroid ${neoId}`);
      return null;
    }
  },

  async searchByName(query: string): Promise<NormalizedAsteroid[]> {
    const cacheKey = `search-${query}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.info(`Cache hit for search query: ${query}`);
      return cached.data;
    }

    try {
      const url = new URL(`${env.NASA_NEOWS_API_URL}/neo/sentry`);
      url.searchParams.append("api_key", env.NASA_API_KEY);

      logger.info(`Searching for asteroids matching: ${query}`);
      const { data } = await fetchWithRetry(url.toString());

      const asteroids = (data.features || []).map((feature: any) => 
        normalizeAsteroid(feature.properties)
      );

      cache.set(cacheKey, { data: asteroids, timestamp: Date.now() });
      return asteroids;
    } catch (error) {
      logger.error("`Error searching asteroids");
      return [];
    }
  },

  clearCache(): void {
    cache.clear();
    logger.info("NASA service cache cleared");
  },

  clearCacheEntry(key: string): void {
    cache.delete(key);
    logger.info(`Cache entry cleared: ${key}`);
  },
};
