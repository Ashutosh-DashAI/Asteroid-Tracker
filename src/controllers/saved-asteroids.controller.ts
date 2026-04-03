import type { Request, Response } from "express";
import { asteroidService } from "../services/asteroid.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";

/**
 * Saved Asteroid Controller
 */
export const savedAsteroidController = {
  /**
   * POST /api/saved-asteroids
   * Save an asteroid for user
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { asteroidId, asteroidName, hazardous, closeApproachDate, missDistanceKm, estimatedDiameterMin, estimatedDiameterMax } = req.body;

    if (!asteroidId || !asteroidName) {
      return sendError(res, 400, "asteroidId and asteroidName are required");
    }

    try {
      const saved = await asteroidService.saveAsteroid(userId, asteroidId, {
        asteroidName,
        hazardous,
        closeApproachDate: closeApproachDate ? new Date(closeApproachDate) : undefined,
        missDistanceKm,
        estimatedDiameterMin,
        estimatedDiameterMax,
      });

      return sendSuccess(res, 201, "Asteroid saved successfully", saved);
    } catch (err) {
      logger.error("Error in savedAsteroid.create");
      return sendError(res, 500, "Failed to save asteroid");
    }
  }),

  /**
   * GET /api/saved-asteroids
   * Get user's saved asteroids
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { page = 1, limit = 20, sortBy = "createdAt", order = "desc", hazardousOnly } = req.query;

    try {
      const result = await asteroidService.getUserSavedAsteroids(userId, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        sortBy: (sortBy as any) || "createdAt",
        order: (order as any) || "desc",
        hazardousOnly: hazardousOnly === "true",
      });

      return sendSuccess(res, 200, "Saved asteroids fetched successfully", {
        data: result.data,
        pagination: result.meta,
      });
    } catch (err) {
      logger.error("Error in savedAsteroid.list");
      return sendError(res, 500, "Failed to fetch saved asteroids");
    }
  }),

  /**
   * DELETE /api/saved-asteroids/:id
   * Delete a saved asteroid
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params;

    if (!id) {
      return sendError(res, 400, "ID is required");
    }

    try {
      const { id } = req.params;
      const asteroidId = (Array.isArray(id) ? id[0] : id) || "";
      if (!asteroidId) {
        return sendError(res, 400, "Invalid asteroid ID");
      }
      await asteroidService.deleteSavedAsteroid(userId, asteroidId);
      return sendSuccess(res, 200, "Asteroid removed from saved list", { success: true });
    } catch (err) {
      logger.error("Error in savedAsteroid.delete");
      return sendError(res, 500, "Failed to delete saved asteroid");
    }
  }),
};

export default savedAsteroidController;
