import { Router } from "express";
import { asteroidController } from "../controllers/asteroid.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  asteroidFeedQuerySchema,
  asteroidSearchSchema,
  hazardousAsteroidsSchema,
  savedAsteroidsQuerySchema,
} from "../validators/asteroids.schema";

const router = Router();

/**
 * Public Routes
 */

// GET /api/asteroids/feed - Fetch asteroids for date range
router.get(
  "/feed",
  asteroidController.fetchFeed
);

/**
 * Protected Routes
 */

// GET /api/asteroids/favorites - Get user's saved/favorite asteroids
router.get(
  "/favorites",
  authenticate,
  asteroidController.getFavorites
);

// GET /api/asteroids/search - Search asteroids
router.get(
  "/search",
  validate("query", asteroidSearchSchema),
  asteroidController.search
);

// GET /api/asteroids/stats - Get dashboard statistics
router.get("/stats", asteroidController.getStats);

// GET /api/asteroids/hazardous - Get hazardous asteroids
router.get(
  "/hazardous",
  validate("query", hazardousAsteroidsSchema),
  asteroidController.getHazardous
);

// GET /api/asteroids/:nasaId - Get asteroid detail
router.get("/:nasaId", asteroidController.getDetail);

export default router;
