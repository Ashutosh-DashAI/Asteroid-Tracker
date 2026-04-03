import logger from "../utils/logger";
import type { NormalizedAsteroid } from "./nasa.service";
import { nasaService } from "./nasa.service";
import prisma from "../db";

/**
 * Asteroid Service - Handles asteroid data operations
 */
export const asteroidService = {
  /**
   * Fetch and process asteroids for date range
   */
  async fetchAsteroidsForDateRange(
    startDate: string,
    endDate: string,
    options?: {
      page?: number;
      limit?: number;
      hazardousOnly?: boolean;
      minDiameter?: number;
      maxMissDistance?: number;
    }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    try {
      // Fetch from NASA API (with caching)
      const asteroids = await nasaService.fetchNearEarthObjectsFeed(startDate, endDate);

      // Filter if needed
      let filtered = asteroids;
      if (options?.hazardousOnly) {
        filtered = filtered.filter((a) => a.hazardous);
      }
      if (options?.minDiameter) {
        filtered = filtered.filter((a) => a.estimatedDiameterMin >= options.minDiameter!);
      }
      if (options?.maxMissDistance) {
        filtered = filtered.filter(
          (a) =>
            a.closeApproaches.length > 0 &&
            a.closeApproaches.some((ca) => ca.missDistanceKm <= options.maxMissDistance!)
        );
      }

      // Calculate statistics
      const stats = {
        total: filtered.length,
        hazardousCount: filtered.filter((a) => a.hazardous).length,
        averageDiameter:
          filtered.length > 0
            ? filtered.reduce((sum, a) => sum + (a.estimatedDiameterMin + a.estimatedDiameterMax) / 2, 0) /
              filtered.length
            : 0,
        largestAsteroid: filtered.length > 0 ?
          filtered.reduce(
            (max, a) => (a.estimatedDiameterMax > max.estimatedDiameterMax ? a : max)
          ) : null,
        nearestMissDistance:
          filtered.length > 0
            ? Math.min(
                ...filtered.flatMap((a) => a.closeApproaches.map((ca) => ca.missDistanceKm))
              )
            : null,
        fastestAsteroid: filtered.length > 0 ?
          filtered.reduce(
            (max, a) => {
              const aVel = a.closeApproaches?.[0]?.velocityKmS ?? 0;
              const maxVel = (max as any).closeApproaches?.[0]?.velocityKmS ?? 0;
              return aVel > maxVel ? a : max;
            }
          ) : null,
      };

      // Paginate
      const paginatedAsteroids = filtered.slice(offset, offset + limit);

      return {
        data: paginatedAsteroids,
        meta: {
          page,
          limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / limit),
          hasNextPage: page * limit < filtered.length,
          hasPreviousPage: page > 1,
        },
        stats,
      };
    } catch (error) {
      logger.error("Error fetching asteroids for date range");
      throw error;
    }
  },

  /**
   * Get detailed asteroid information
   */
  async getAsteroidDetail(nasaId: string) {
    try {
      const asteroid = await nasaService.lookupAsteroid(nasaId);
      if (!asteroid) {
        throw new Error("Asteroid not found");
      }
      return asteroid;
    } catch (error) {
      logger.error(`Error fetching asteroid details for ${nasaId}`);
      throw error;
    }
  },

  /**
   * Search asteroids by name or ID
   */
  async searchAsteroids(query: string, limit = 20, hazardousOnly = false) {
    try {
      const results = await nasaService.searchByName(query);

      let filtered = results;
      if (hazardousOnly) {
        filtered = filtered.filter((a) => a.hazardous);
      }

      return filtered.slice(0, limit);
    } catch (error) {
      logger.error("Error searching asteroids");
      return [];
    }
  },

  /**
   * Get hazardous asteroids
   */
  async getHazardousAsteroids(
    startDate: string,
    endDate: string,
    options?: {
      page?: number;
      limit?: number;
      minDiameter?: number;
      maxMissDistance?: number;
    }
  ) {
    return this.fetchAsteroidsForDateRange(startDate, endDate, {
      ...options,
      hazardousOnly: true,
    });
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(days: number = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const startDateStr = startDate.toISOString().split("T")[0] || "";
      const endDateStr = endDate.toISOString().split("T")[0] || "";

      const asteroids = await nasaService.fetchNearEarthObjectsFeed(startDateStr, endDateStr);

      const hazardous = asteroids.filter((a) => a.hazardous);
      const allCloseApproaches = asteroids.flatMap((a) => a.closeApproaches);

      const largestAsteroid = asteroids.reduce((max, a) =>
        a.estimatedDiameterMax > max.estimatedDiameterMax ? a : max
      );

      const nearestAsteroid = asteroids.reduce((min, a) => {
        const minMiss = Math.min(...a.closeApproaches.map((ca) => ca.missDistanceKm));
        const currentMinMiss = Math.min(...min.closeApproaches.map((ca) => ca.missDistanceKm));
        return minMiss < currentMinMiss ? a : min;
      });

      const fastestAsteroid = asteroids.reduce((max, a) => {
        const maxVel = Math.max(...a.closeApproaches.map((ca) => ca.velocityKmS));
        const currentMaxVel = Math.max(...max.closeApproaches.map((ca) => ca.velocityKmS));
        return maxVel > currentMaxVel ? a : max;
      });

      return {
        totalAsteroids: asteroids.length,
        hazardousCount: hazardous.length,
        hazardousPercentage: ((hazardous.length / asteroids.length) * 100).toFixed(2),
        averageDiameter:
          asteroids.reduce(
            (sum, a) => sum + (a.estimatedDiameterMin + a.estimatedDiameterMax) / 2,
            0
          ) / asteroids.length,
        largestAsteroid: {
          name: largestAsteroid.name,
          diameter: largestAsteroid.estimatedDiameterMax,
        },
        nearestAsteroid: {
          name: nearestAsteroid.name,
          missDistance: Math.min(...nearestAsteroid.closeApproaches.map((ca) => ca.missDistanceKm)),
        },
        fastestAsteroid: {
          name: fastestAsteroid.name,
          velocity: Math.max(...fastestAsteroid.closeApproaches.map((ca) => ca.velocityKmS)),
        },
        totalCloseApproaches: allCloseApproaches.length,
      };
    } catch (error) {
      logger.error("Error calculating dashboard stats");
      throw error;
    }
  },

  /**
   * Save asteroid for user
   */
  async saveAsteroid(
    userId: string,
    asteroidId: string,
    data: {
      asteroidName: string;
      hazardous: boolean;
      closeApproachDate?: Date;
      missDistanceKm?: number;
      estimatedDiameterMin?: number;
      estimatedDiameterMax?: number;
    }
  ) {
    try {
      // Verify asteroid exists first
      const asteroid = await prisma.asteroid.findUnique({
        where: { id: asteroidId },
      });

      if (!asteroid) {
        throw new Error("Asteroid not found in database");
      }

      const saved = await (prisma as any).SavedAsteroid.upsert({
        where: { userId_asteroidId: { userId, asteroidId } },
        create: {
          userId,
          asteroidId,
          ...data,
        },
        update: data,
      });

      return saved;
    } catch (error) {
      logger.error("Error saving asteroid");
      throw error;
    }
  },

  /**
   * Get user's saved asteroids
   */
  async getUserSavedAsteroids(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "asteroidName" | "hazardous";
      order?: "asc" | "desc";
      hazardousOnly?: boolean;
    }
  ) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;

      const where: any = { userId };
      if (options?.hazardousOnly) {
        where.hazardous = true;
      }

      const [saved, total] = await Promise.all([
        (prisma as any).SavedAsteroid.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: {
            [options?.sortBy || "createdAt"]: options?.order || "desc",
          },
        }),
        (prisma as any).SavedAsteroid.count({ where }),
      ]);

      return {
        data: saved,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error fetching user saved asteroids");
      throw error;
    }
  },

  /**
   * Delete saved asteroid
   */
  async deleteSavedAsteroid(userId: string, savedAsteroidId: string) {
    try {
      const saved = await (prisma as any).SavedAsteroid.findUnique({
        where: { id: savedAsteroidId },
      });

      if (!saved || saved.userId !== userId) {
        throw new Error("Saved asteroid not found");
      }

      await (prisma as any).SavedAsteroid.delete({
        where: { id: savedAsteroidId },
      });

      return { success: true };
    } catch (error) {
      logger.error("Error deleting saved asteroid");
      throw error;
    }
  },

  /**
   * Save search for user
   */
  async saveSearch(userId: string, search: any) {
    try {
      const saved = await (prisma as any).SavedSearch.create({
        data: {
          userId,
          ...search,
        },
      });

      return saved;
    } catch (error) {
      logger.error("Error saving search");
      throw error;
    }
  },

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      sortBy?: "createdAt" | "name";
      order?: "asc" | "desc";
    }
  ) {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const offset = (page - 1) * limit;

      const [searches, total] = await Promise.all([
        (prisma as any).SavedSearch.findMany({
          where: { userId },
          skip: offset,
          take: limit,
          orderBy: {
            [options?.sortBy || "createdAt"]: options?.order || "desc",
          },
        }),
        (prisma as any).SavedSearch.count({ where: { userId } }),
      ]);

      return {
        data: searches,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error fetching user saved searches");
      throw error;
    }
  },

  /**
   * Delete user's saved search
   */
  async deleteSavedSearch(userId: string, searchId: string) {
    try {
      const search = await (prisma as any).SavedSearch.findUnique({
        where: { id: searchId },
      });

      if (!search || search.userId !== userId) {
        throw new Error("Saved search not found");
      }

      await (prisma as any).SavedSearch.delete({
        where: { id: searchId },
      });

      return { success: true };
    } catch (error) {
      logger.error("Error deleting saved search");
      throw error;
    }
  },

  /**
   * Update alert preferences
   */
  async updateAlertPreferences(userId: string, preferences: any) {
    try {
      const updated = await (prisma as any).AlertPreference.upsert({
        where: { userId },
        create: {
          userId,
          ...preferences,
        },
        update: preferences,
      });

      return updated;
    } catch (error) {
      logger.error("Error updating alert preferences");
      throw error;
    }
  },

  /**
   * Get alert preferences
   */
  async getAlertPreferences(userId: string) {
    try {
      let prefs = await (prisma as any).AlertPreference.findUnique({
        where: { userId },
      });

      if (!prefs) {
        prefs = await (prisma as any).AlertPreference.create({
          data: {
            userId,
            hazardousOnly: true,
            emailEnabled: false,
          },
        });
      }

      return prefs;
    } catch (error) {
      logger.error("Error fetching alert preferences");
      throw error;
    }
  },
};

export default asteroidService;
