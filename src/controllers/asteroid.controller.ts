import type { Request, Response } from "express";
import { asteroidService } from "../services/asteroid.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";

/**
 * Asteroid Controller - Handles asteroid-related requests
 */
export const asteroidController = {
  /**
   * GET /api/asteroids/feed
   * Fetch asteroids for a date range with optional filters
   */
  fetchFeed: asyncHandler(async (req: Request, res: Response) => {
    let { startDate, endDate, page = 1, limit = 20, hazardousOnly, minDiameter, maxMissDistance } = req.query;

    // Default to last 7 days if dates not provided
    if (!startDate || !endDate) {
      const today = new Date();
      endDate = today.toISOString().split("T")[0];
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      startDate = sevenDaysAgo.toISOString().split("T")[0];
    }

    try {
      const result = await asteroidService.fetchAsteroidsForDateRange(
        startDate as string,
        endDate as string,
        {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 20,
          hazardousOnly: hazardousOnly === "true",
          minDiameter: minDiameter ? parseFloat(minDiameter as string) : undefined,
          maxMissDistance: maxMissDistance ? parseFloat(maxMissDistance as string) : undefined,
        }
      );

      return sendSuccess(res, 200, "Asteroids fetched successfully", {
        data: result.data,
        pagination: result.meta,
        statistics: result.stats,
      });
    } catch (err) {
      logger.error("Error in fetchFeed");
      return sendError(res, 500, "Failed to fetch asteroids");
    }
  }),

  /**
   * GET /api/asteroids/favorites
   * Get user's favorite/saved asteroids
   */
  getFavorites: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { page = 1, limit = 20, sortBy = "createdAt", order = "desc", hazardousOnly } = req.query;

    try {
      const result = await asteroidService.getUserSavedAsteroids(userId, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        sortBy: (sortBy as string) as "createdAt" | "asteroidName" | "hazardous",
        order: (order as string) as "asc" | "desc",
        hazardousOnly: hazardousOnly === "true",
      });

      return sendSuccess(res, 200, "Favorite asteroids fetched successfully", {
        data: result.data,
        pagination: result.meta,
      });
    } catch (err) {
      logger.error("Error in getFavorites");
      return sendError(res, 500, "Failed to fetch favorites");
    }
  }),

  /**
   * GET /api/asteroids/:nasaId
   * Get detailed information about a specific asteroid
   */
  getDetail: asyncHandler(async (req: Request, res: Response) => {
    const { nasaId } = req.params;

    if (!nasaId) {
      return sendError(res, 400, "NASA ID is required");
    }

    try {
      const { id } = req.params;
      const nasaId = (Array.isArray(id) ? id[0] : id) || "";
      if (!nasaId) {
        return sendError(res, 400, "Invalid asteroid ID");
      }
      const asteroid = await asteroidService.getAsteroidDetail(nasaId);
      return sendSuccess(res, 200, "Asteroid details fetched successfully", asteroid);
    } catch (err) {
      logger.error("Error in getDetail");
      return sendError(res, 404, "Asteroid not found");
    }
  }),

  /**
   * GET /api/asteroids/search
   * Search asteroids by name or ID
   */
  search: asyncHandler(async (req: Request, res: Response) => {
    const { q, limit = 20, hazardousOnly } = req.query;

    if (!q) {
      return sendError(res, 400, "Search query is required");
    }

    try {
      const results = await asteroidService.searchAsteroids(
        q as string,
        parseInt(limit as string) || 20,
        hazardousOnly === "true"
      );

      return sendSuccess(res, 200, "Search completed successfully", {
        results,
        count: results.length,
      });
    } catch (err) {
      logger.error("Error in search");
      return sendError(res, 500, "Search failed");
    }
  }),

  /**
   * GET /api/asteroids/hazardous
   * Get only hazardous asteroids
   */
  getHazardous: asyncHandler(async (req: Request, res: Response) => {
    const { startDate = null, endDate = null, page = 1, limit = 20, minDiameter, maxMissDistance } = req.query;

    // Default to last 7 days if no dates provided
    let start = startDate as string;
    let end = endDate as string;

    if (!start || !end) {
      const today = new Date();
      end = today.toISOString().split("T")[0] || "";
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      start = sevenDaysAgo.toISOString().split("T")[0] || "";
    }

    try {
      const result = await asteroidService.getHazardousAsteroids(start, end, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        minDiameter: minDiameter ? parseFloat(minDiameter as string) : undefined,
        maxMissDistance: maxMissDistance ? parseFloat(maxMissDistance as string) : undefined,
      });

      return sendSuccess(res, 200, "Hazardous asteroids fetched successfully", {
        data: result.data,
        pagination: result.meta,
      });
    } catch (err) {
      logger.error("Error in getHazardous");
      return sendError(res, 500, "Failed to fetch hazardous asteroids");
    }
  }),

  /**
   * GET /api/asteroids/stats
   * Get dashboard statistics
   */
  getStats: asyncHandler(async (req: Request, res: Response) => {
    const { days = 7 } = req.query;

    try {
      const stats = await asteroidService.getDashboardStats(parseInt(days as string) || 7);
      return sendSuccess(res, 200, "Statistics fetched successfully", stats);
    } catch (err) {
      logger.error("Error in getStats");
      return sendError(res, 500, "Failed to fetch statistics");
    }
  }),
};

export default asteroidController;
