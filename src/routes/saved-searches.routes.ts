import { Router } from "express";
import { savedSearchController } from "../controllers/saved-searches.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  savedSearchCreateSchema,
  savedSearchesQuerySchema,
} from "../validators/asteroids.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/saved-searches
 * Save a search for the user
 */
router.post(
  "/",
  validate("body", savedSearchCreateSchema),
  savedSearchController.create
);

/**
 * GET /api/saved-searches
 * Get user's saved searches with pagination
 */
router.get(
  "/",
  validate("query", savedSearchesQuerySchema),
  savedSearchController.list
);

/**
 * DELETE /api/saved-searches/:id
 * Delete a saved search
 */
router.delete("/:id", savedSearchController.delete);

export default router;
