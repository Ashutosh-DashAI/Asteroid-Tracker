import type { Request, Response } from "express";
import { notificationService } from "../services/notification.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const notificationController = {
  getNotifications: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { limit = 20, offset = 0 } = req.query;
    const result = await notificationService.getNotifications(
      req.user.userId,
      Number(limit),
      Number(offset)
    );
    return sendSuccess(res, 200, "Notifications fetched", result);
  }),

  markAsRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const notification = await notificationService.markAsRead(id, req.user.userId);
    return sendSuccess(res, 200, "Notification marked as read", notification);
  }),

  markAllAsRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await notificationService.markAllAsRead(req.user.userId);
    return sendSuccess(res, 200, "All notifications marked as read", result);
  }),

  deleteNotification: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const result = await notificationService.deleteNotification(id, req.user.userId);
    return sendSuccess(res, 200, "Notification deleted", result);
  }),
};
