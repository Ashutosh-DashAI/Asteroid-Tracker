import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { neoFeedQuerySchema } from "../validators/neo.schema";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asteroidService } from "../services/asteroid.services";
import { neoLimiter } from "../middleware/rateLimit.middleware";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";
import type { Request, Response } from "express";

const router = Router();
router.use(neoLimiter);

/**
 * @route GET /api/neo/feed
 * @description Returns NEO feed with close approaches
 */
router.get(
  "/feed",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, page = 1, limit = 20, hazardousOnly } = req.query;

      // Default to next 7 days if dates not provided
      const start = startDate
        ? new Date(startDate as string)
        : new Date();
      const end = endDate
        ? new Date(endDate as string)
        : new Date(Date.now() + 7 * 86400000); // 7 days from now

      // Fetch asteroids for the date range
      const result = await asteroidService.fetchAsteroidsForDateRange(
        start.toISOString().split("T")[0]!,
        end.toISOString().split("T")[0]!,
        {
          page: parseInt(page as string) || 1,
          limit: parseInt(limit as string) || 20,
          hazardousOnly: hazardousOnly === "true",
        }
      );

      return sendSuccess(res, 200, "NEO feed fetched successfully", {
        data: result.data,
        pagination: result.meta,
        statistics: result.stats,
      });
    } catch (err) {
      logger.error("Error in neo/feed");
      return sendError(res, 500, "Failed to fetch NEO feed");
    }
  })
);

export default router;
