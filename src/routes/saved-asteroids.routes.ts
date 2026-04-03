import { Router } from "express";
import { savedAsteroidController } from "../controllers/saved-asteroids.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  saveddAsteroidCreateSchema,
  savedAsteroidsQuerySchema,
} from "../validators/asteroids.schema";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/saved-asteroids
 * Save an asteroid for the user
 */
router.post(
  "/",
  validate("body", saveddAsteroidCreateSchema),
  savedAsteroidController.create
);

/**
 * GET /api/saved-asteroids
 * Get user's saved asteroids with pagination and filters
 */
router.get(
  "/",
  validate("query", savedAsteroidsQuerySchema),
  savedAsteroidController.list
);

/**
 * DELETE /api/saved-asteroids/:id
 * Delete a saved asteroid
 */
router.delete("/:id", savedAsteroidController.delete);

export default router;
