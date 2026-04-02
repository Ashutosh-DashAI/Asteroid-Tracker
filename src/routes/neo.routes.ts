import { Router } from "express";
import prisma from "../db";
import { validate } from "../middleware/validate";
import { neoFeedQuerySchema, neoBrowseQuerySchema, nasaIdParamSchema } from "../validators/neo.schema";
import { error, success } from "../utils/apiResponse";
import { fetchAsteroidById, fetchNEOFeed } from "../services/nasaService";
import { syncNEOFeedToDB } from "../services/syncService";
import { neoLimiter } from "../middleware/rateLimit.middleware";
import { computeRiskScore } from "../services/riskEngine";

const router = Router();
router.use(neoLimiter);

/**
 * @route GET /api/neo/feed
 * @description Returns NEO feed from DB, syncs NASA data if missing.
 */
router.get("/feed", validate(neoFeedQuerySchema, "query"), async (req, res, next) => {
  try {
    const { startDate, endDate, page, limit } = req.query as any;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 86400000);

    const where = {
      closeApproachDate: {
        gte: start,
        lte: end,
      },
    };

    let count = await prisma.closeApproach.count({ where });
    if (count === 0) {
      await syncNEOFeedToDB(7);
      count = await prisma.closeApproach.count({ where });
      if (count === 0) {
        const nasa = await fetchNEOFeed(
          start.toISOString().split("T")[0]!,
          end.toISOString().split("T")[0]!
        );
        return success(res, { items: nasa, pagination: { page, limit, total: nasa.length } });
      }
    }

    const items = await prisma.closeApproach.findMany({
      where,
      include: { asteroid: true },
      orderBy: { closeApproachDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return success(res, { items, pagination: { page, limit, total: count } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/neo/browse
 * @description Browses NEOs with filtering and sorting.
 */
router.get("/browse", validate(neoBrowseQuerySchema, "query"), async (req, res, next) => {
  try {
    const { page, limit, hazardous, minRisk, sortBy } = req.query as any;
    const approaches = await prisma.closeApproach.findMany({
      where: {
        ...(minRisk != null ? { riskScore: { gte: minRisk } } : {}),
        asteroid: hazardous == null ? undefined : { isPotentiallyHazardous: hazardous },
      },
      include: { asteroid: true },
      orderBy: { [sortBy]: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });
    const total = await prisma.closeApproach.count({
      where: {
        ...(minRisk != null ? { riskScore: { gte: minRisk } } : {}),
        asteroid: hazardous == null ? undefined : { isPotentiallyHazardous: hazardous },
      },
    });
    return success(res, { items: approaches, pagination: { page, limit, total } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/neo/stats/summary
 * @description Returns summary statistics for tracked NEOs.
 */
router.get("/stats/summary", async (_req, res, next) => {
  try {
    const total = await prisma.asteroid.count();
    const hazardous = await prisma.asteroid.count({ where: { isPotentiallyHazardous: true } });
    const closeApproaches = await prisma.closeApproach.findMany({
      where: {
        closeApproachDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 86400000),
        },
      },
      include: { asteroid: true },
      orderBy: { closeApproachDate: "asc" },
    });

    const buckets = { SAFE: 0, WATCH: 0, WARNING: 0, CRITICAL: 0 };
    for (const ca of closeApproaches) {
      const label = computeRiskScore(ca, ca.asteroid).label;
      buckets[label] += 1;
    }

    const closest = [...closeApproaches].sort((a, b) => a.missDistanceKm - b.missDistanceKm)[0] ?? null;
    const fastest = [...closeApproaches].sort((a, b) => b.relativeVelocityKmS - a.relativeVelocityKmS)[0] ?? null;
    return success(res, {
      totalTracked: total,
      potentiallyHazardous: hazardous,
      riskBuckets: buckets,
      closestApproachNext7Days: closest,
      fastestNeoThisWeek: fastest,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/neo/:nasaId
 * @description Returns one asteroid and all close approaches.
 */
router.get("/:nasaId", validate(nasaIdParamSchema, "params"), async (req, res, next) => {
  try {
    const nasaId = String(req.params.nasaId);
    let asteroid = await prisma.asteroid.findUnique({
      where: { nasaId },
      include: { closeApproaches: { orderBy: { closeApproachDate: "asc" } } },
    });

    if (!asteroid) {
      await fetchAsteroidById(nasaId);
      await syncNEOFeedToDB(7);
      asteroid = await prisma.asteroid.findUnique({
        where: { nasaId },
        include: { closeApproaches: { orderBy: { closeApproachDate: "asc" } } },
      });
    }

    if (!asteroid) return error(res, "Asteroid not found", 404);
    return success(res, asteroid);
  } catch (err) {
    next(err);
  }
});

export default router;
