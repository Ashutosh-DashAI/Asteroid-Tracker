import { Router } from "express";
import { alertController } from "../controllers/alerts.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { alertPreferenceSchema } from "../validators/asteroids.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/alerts/preferences
 * Get user's alert preferences
 */
router.get("/preferences", alertController.getPreferences);

/**
 * POST /api/alerts/preferences
 * Update user's alert preferences
 */
router.post(
  "/preferences",
  validate("body", alertPreferenceSchema),
  alertController.updatePreferences
);

/**
 * GET /api/alerts/count
 * Get count of pending alerts for user
 */
router.get("/count", alertController.getCount);

export default router;
