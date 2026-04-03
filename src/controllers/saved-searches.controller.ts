import type { Request, Response } from "express";
import { asteroidService } from "../services/asteroid.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";
import prisma from "../db";

/**
 * Saved Search Controller
 */
export const savedSearchController = {
  /**
   * POST /api/saved-searches
   * Save a search for user
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { name, startDate, endDate, hazardousOnly, minDiameter, maxMissDistance } = req.body;

    if (!startDate || !endDate) {
      return sendError(res, 400, "startDate and endDate are required");
    }

    try {
      const saved = await asteroidService.saveSearch(userId, {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        hazardousOnly,
        minDiameter,
        maxMissDistance,
      });

      return sendSuccess(res, 201, "Search saved successfully", saved);
    } catch (err) {
      logger.error("Error in savedSearch.create");
      return sendError(res, 500, "Failed to save search");
    }
  }),

  /**
   * GET /api/saved-searches
   * Get user's saved searches
   */
  list: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { page = 1, limit = 20, sortBy = "createdAt", order = "desc" } = req.query;

    try {
      const result = await asteroidService.getUserSavedSearches(userId, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 20,
        sortBy: (sortBy as any) || "createdAt",
        order: (order as any) || "desc",
      });

      return sendSuccess(res, 200, "Saved searches fetched successfully", {
        data: result.data,
        pagination: result.meta,
      });
    } catch (err) {
      logger.error("Error in savedSearch.list");
      return sendError(res, 500, "Failed to fetch saved searches");
    }
  }),

  /**
   * DELETE /api/saved-searches/:id
   * Delete a saved search
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params;

    try {
      const searchId = (Array.isArray(id) ? id[0] : id) || "";
      if (!searchId) {
        return sendError(res, 400, "Invalid search ID");
      }
      await asteroidService.deleteSavedSearch(userId, searchId);

      return sendSuccess(res, 200, "Saved search deleted", { success: true });
    } catch (err) {
      logger.error("Error in savedSearch.delete");
      return sendError(res, 500, "Failed to delete saved search");
    }
  }),
};

export default savedSearchController;
