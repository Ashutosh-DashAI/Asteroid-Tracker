import type { Request, Response } from "express";
import { userService } from "../services/user.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const userController = {
  getProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const profile = await userService.getProfile(req.user.userId);
    return sendSuccess(res, 200, "Profile fetched", profile);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const updatedProfile = await userService.updateProfile(req.user.userId, req.body);
    return sendSuccess(res, 200, "Profile updated", updatedProfile);
  }),
};
