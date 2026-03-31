import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// All notification routes are protected
router.use(authenticateToken);

router.get("/", notificationController.getNotifications);

router.put("/:id/read", notificationController.markAsRead);

router.put("/all/read", notificationController.markAllAsRead);

router.delete("/:id", notificationController.deleteNotification);

export default router;
