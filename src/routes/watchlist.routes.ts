import { Router } from "express";
import prisma from "../db";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { createWatchSchema, updateWatchSchema, watchParamSchema } from "../validators/watchlist.schema";
import { error, success } from "../utils/apiResponse";
import { fetchAsteroidById } from "../services/nasaService";
import { syncNEOFeedToDB } from "../services/syncService";

const router = Router();
router.use(authenticateToken);

/**
 * @route GET /api/watchlist
 * @description Returns user's watchlist with latest close approach.
 */
router.get("/", async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);

    const rows = await prisma.watchedAsteroid.findMany({
      where: { userId },
      include: {
        asteroid: {
          include: { closeApproaches: { orderBy: { closeApproachDate: "desc" }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(res, rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/watchlist
 * @description Adds asteroid to user's watchlist.
 */
router.post("/", validate(createWatchSchema), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const { nasaId, alertThresholdKm } = req.body;

    let asteroid = await prisma.asteroid.findUnique({ where: { nasaId } });
    if (!asteroid) {
      await fetchAsteroidById(nasaId);
      await syncNEOFeedToDB(7);
      asteroid = await prisma.asteroid.findUnique({ where: { nasaId } });
    }
    if (!asteroid) return error(res, "Asteroid not found", 404);

    const watch = await prisma.watchedAsteroid.upsert({
      where: { userId_asteroidId: { userId, asteroidId: asteroid.id } },
      update: { alertThresholdKm },
      create: { userId, asteroidId: asteroid.id, alertThresholdKm },
    });
    return success(res, watch, "Added to watchlist", 201);
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/watchlist/:nasaId
 * @description Removes asteroid from watchlist.
 */
router.delete("/:nasaId", validate(watchParamSchema, "params"), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const nasaId = String(req.params.nasaId);
    const asteroid = await prisma.asteroid.findUnique({ where: { nasaId } });
    if (!asteroid) return error(res, "Asteroid not found", 404);

    await prisma.watchedAsteroid.delete({
      where: { userId_asteroidId: { userId, asteroidId: asteroid.id } },
    });
    return success(res, { removed: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /api/watchlist/:nasaId
 * @description Updates alert threshold for watched asteroid.
 */
router.patch(
  "/:nasaId",
  validate(watchParamSchema, "params"),
  validate(updateWatchSchema),
  async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return error(res, "Unauthorized", 401);
      const nasaId = String(req.params.nasaId);
      const asteroid = await prisma.asteroid.findUnique({ where: { nasaId } });
      if (!asteroid) return error(res, "Asteroid not found", 404);

      const updated = await prisma.watchedAsteroid.update({
        where: { userId_asteroidId: { userId, asteroidId: asteroid.id } },
        data: { alertThresholdKm: req.body.alertThresholdKm },
      });
      return success(res, updated);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
