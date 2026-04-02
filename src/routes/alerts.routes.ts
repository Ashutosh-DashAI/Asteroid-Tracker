import { Router } from "express";
import prisma from "../db";
import { authenticateToken } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import { alertIdParamSchema, alertsQuerySchema } from "../validators/alerts.schema";
import { error, success } from "../utils/apiResponse";

const router = Router();
router.use(authenticateToken);

/**
 * @route GET /api/alerts
 * @description Returns paginated alerts for current user.
 */
router.get("/", validate(alertsQuerySchema, "query"), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const { unreadOnly, page, limit } = req.query as any;
    const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
    const [items, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: { asteroid: true, closeApproach: true },
        orderBy: { triggeredAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);
    return success(res, { items, pagination: { page, limit, total } });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /api/alerts/:id/read
 * @description Marks a single alert as read.
 */
router.patch("/:id/read", validate(alertIdParamSchema, "params"), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const id = String(req.params.id);
    const updated = await prisma.alert.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @route PATCH /api/alerts/read-all
 * @description Marks all current user alerts as read.
 */
router.patch("/read-all", async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const updated = await prisma.alert.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return success(res, updated);
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/alerts/:id
 * @description Deletes one alert.
 */
router.delete("/:id", validate(alertIdParamSchema, "params"), async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const id = String(req.params.id);
    const removed = await prisma.alert.deleteMany({ where: { id, userId } });
    return success(res, { removed: removed.count > 0 });
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/alerts/count
 * @description Returns unread count for badge.
 */
router.get("/count", async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return error(res, "Unauthorized", 401);
    const unread = await prisma.alert.count({ where: { userId, isRead: false } });
    return success(res, { unread });
  } catch (err) {
    next(err);
  }
});

export default router;
