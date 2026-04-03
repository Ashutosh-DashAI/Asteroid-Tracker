import type { Request, Response } from "express";
import { asteroidService } from "../services/asteroid.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";

/**
 * Alert Preference Controller
 */
export const alertController = {
  /**
   * GET /api/alerts/preferences
   * Get user's alert preferences
   */
  getPreferences: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    try {
      const preferences = await asteroidService.getAlertPreferences(userId);
      return sendSuccess(res, 200, "Alert preferences fetched successfully", preferences);
    } catch (err) {
      logger.error("Error in alert.getPreferences");
      return sendError(res, 500, "Failed to fetch alert preferences");
    }
  }),

  /**
   * POST /api/alerts/preferences
   * Update alert preferences for user
   */
  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const { hazardousOnly, minDiameter, maxMissDistance, emailEnabled } = req.body;

    try {
      const updated = await asteroidService.updateAlertPreferences(userId, {
        hazardousOnly,
        minDiameter: minDiameter || null,
        maxMissDistance: maxMissDistance || null,
        emailEnabled,
      });

      return sendSuccess(res, 200, "Alert preferences updated successfully", updated);
    } catch (err) {
      logger.error("Error in alert.updatePreferences");
      return sendError(res, 500, "Failed to update alert preferences");
    }
  }),

  /**
   * GET /api/alerts/count
   * Get count of pending alerts
   */
  getCount: asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    try {
      // TODO: Implement alert count logic based on AlertPreference model
      // For now, return 0 as placeholder
      return sendSuccess(res, 200, "Alert count fetched successfully", { count: 0 });
    } catch (err) {
      logger.error("Error in alert.getCount");
      return sendError(res, 500, "Failed to fetch alert count");
    }
  }),
};

export default alertController;
