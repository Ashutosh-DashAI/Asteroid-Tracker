import { Router } from "express";
import prisma from "../db";
import { authenticateToken } from "../middleware/auth.middleware";
import { error, success } from "../utils/apiResponse";
import { fetchAsteroidById } from "../services/nasaService";
import { syncNEOFeedToDB } from "../services/syncService";
import { computeRiskScore } from "../services/riskEngine";

const router = Router();

const dateOnly = (d: Date) => d.toISOString().split("T")[0]!;

router.get("/feed", async (req, res, next) => {
  try {
    const start = req.query.startDate
      ? new Date(String(req.query.startDate))
      : new Date();
    const end = req.query.endDate
      ? new Date(String(req.query.endDate))
      : new Date(Date.now() + 7 * 86400000);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const where = { closeApproachDate: { gte: start, lte: end } };
    let total = await prisma.closeApproach.count({ where });
    if (total === 0) {
      await syncNEOFeedToDB(7);
      total = await prisma.closeApproach.count({ where });
    }

    const items = await prisma.closeApproach.findMany({
      where,
      include: { asteroid: true },
      orderBy: { closeApproachDate: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return success(res, { items, pagination: { page, limit, total } });
  } catch (err) {
    next(err);
  }
});

router.get("/nearby", async (req, res, next) => {
  try {
    const days = Number(req.query.days ?? 30);
    const until = new Date(Date.now() + days * 86400000);
    const items = await prisma.closeApproach.findMany({
      where: { closeApproachDate: { gte: new Date(), lte: until } },
      include: { asteroid: true },
      orderBy: { closeApproachDate: "asc" },
    });
    return success(res, { items, count: items.length });
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const query = String(req.query.query ?? "").trim();
    const hazardousOnly = String(req.query.hazardousOnly ?? "false") === "true";
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);
    const rows = await prisma.asteroid.findMany({
      where: {
        ...(query
          ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { nasaId: { contains: query } }] }
          : {}),
        ...(hazardousOnly ? { isPotentiallyHazardous: true } : {}),
      },
      include: {
        closeApproaches: { orderBy: { closeApproachDate: "asc" }, take: 3 },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return success(res, { items: rows, count: rows.length });
  } catch (err) {
    next(err);
  }
});

router.get("/hazardous/ranking", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const rows = await prisma.closeApproach.findMany({
      where: { asteroid: { isPotentiallyHazardous: true } },
      include: { asteroid: true },
      orderBy: { riskScore: "desc" },
      take: limit,
    });
    return success(res, { items: rows });
  } catch (err) {
    next(err);
  }
});

router.get("/watchlist", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const items = await prisma.watchedAsteroid.findMany({
      where: { userId },
      include: {
        asteroid: {
          include: { closeApproaches: { orderBy: { closeApproachDate: "desc" }, take: 1 } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return success(res, { items });
  } catch (err) {
    next(err);
  }
});

router.post("/:asteroidId/watch", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const asteroidId = String(req.params.asteroidId);
    const threshold = Number(req.body?.alertThresholdKm ?? 1_000_000);
    const watch = await prisma.watchedAsteroid.upsert({
      where: { userId_asteroidId: { userId, asteroidId } },
      update: { alertThresholdKm: threshold },
      create: { userId, asteroidId, alertThresholdKm: threshold },
    });
    return success(res, { watch }, "Asteroid added to watchlist", 201);
  } catch (err) {
    next(err);
  }
});

router.delete("/:asteroidId/watch", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const asteroidId = String(req.params.asteroidId);
    await prisma.watchedAsteroid.deleteMany({ where: { userId, asteroidId } });
    return success(res, { removed: true });
  } catch (err) {
    next(err);
  }
});

router.get("/alerts", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const includeRead = String(req.query.includeRead ?? "false") === "true";
    const items = await prisma.alert.findMany({
      where: { userId, ...(includeRead ? {} : { isRead: false }) },
      include: { asteroid: true, closeApproach: true },
      orderBy: { triggeredAt: "desc" },
    });
    return success(res, { items });
  } catch (err) {
    next(err);
  }
});

router.patch("/alerts/:alertId/read", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const alertId = String(req.params.alertId);
    const updated = await prisma.alert.updateMany({
      where: { id: alertId, userId },
      data: { isRead: true },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

router.post("/:asteroidId/create-alert", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const asteroidId = String(req.params.asteroidId);
    const latest = await prisma.closeApproach.findFirst({
      where: { asteroidId },
      orderBy: { closeApproachDate: "asc" },
    });
    if (!latest) return error(res, "No close approach found for asteroid", 404);
    const message = String(req.body?.message ?? "Manual alert");
    const created = await prisma.alert.create({
      data: { userId, asteroidId, closeApproachId: latest.id, message },
    });
    return success(res, created, "Alert created", 201);
  } catch (err) {
    next(err);
  }
});

router.get("/:neoId/risk-analysis", async (req, res, next) => {
  try {
    const nasaId = String(req.params.neoId);
    const asteroid = await prisma.asteroid.findUnique({
      where: { nasaId },
      include: { closeApproaches: { orderBy: { closeApproachDate: "asc" }, take: 1 } },
    });
    if (!asteroid || asteroid.closeApproaches.length === 0) return error(res, "Asteroid not found", 404);
    const firstApproach = asteroid.closeApproaches[0];
    if (!firstApproach) return error(res, "Asteroid not found", 404);
    const analysis = computeRiskScore(firstApproach, asteroid);
    return success(res, { nasaId, asteroidName: asteroid.name, ...analysis });
  } catch (err) {
    next(err);
  }
});

router.get("/:neoId", async (req, res, next) => {
  try {
    const nasaId = String(req.params.neoId);
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
