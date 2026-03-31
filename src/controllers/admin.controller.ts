import type { Request, Response } from "express";
import { adminService } from "../services/admin.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const adminController = {
  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const { limit = 20, offset = 0 } = req.query;
    const result = await adminService.getAllUsers(Number(limit), Number(offset));
    return sendSuccess(res, 200, "Users fetched", result);
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const { id } = req.params as { id: string };
    const result = await adminService.deleteUser(id);
    return sendSuccess(res, 200, "User deleted", result);
  }),

  banUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const { id } = req.params as { id: string };
    const result = await adminService.banUser(id);
    return sendSuccess(res, 200, "User banned", result);
  }),

  unbanUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const { id } = req.params as { id: string };
    const result = await adminService.unbanUser(id);
    return sendSuccess(res, 200, "User unbanned", result);
  }),

  getSystemStats: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const stats = await adminService.getSystemStats();
    return sendSuccess(res, 200, "System stats fetched", stats);
  }),

  getLatestRegisteredUsers: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== "ADMIN") {
      return sendError(res, 403, "Forbidden: Only admins can access this");
    }

    const { limit = 10 } = req.query;
    const users = await adminService.getLatestRegisteredUsers(Number(limit));
    return sendSuccess(res, 200, "Latest users fetched", users);
  }),
};
