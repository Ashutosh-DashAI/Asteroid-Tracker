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

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await userService.getUserById(id, req.user?.userId);
    return sendSuccess(res, 200, "User fetched", user);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const updatedProfile = await userService.updateProfile(req.user.userId, req.body);
    return sendSuccess(res, 200, "Profile updated", updatedProfile);
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await userService.deleteAccount(req.user.userId);
    return sendSuccess(res, 200, "Account deleted", result);
  }),

  searchUsers: asyncHandler(async (req: Request, res: Response) => {
    const { query, limit = 10, offset = 0 } = req.query;

    if (!query) {
      return sendError(res, 400, "Search query is required");
    }

    const result = await userService.searchUsers(
      query as string,
      Number(limit),
      Number(offset)
    );
    return sendSuccess(res, 200, "Users found", result);
  }),

  followUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const result = await userService.followUser(req.user.userId, id);
    return sendSuccess(res, 200, "User followed", result);
  }),

  unfollowUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { id } = req.params as { id: string };
    const result = await userService.unfollowUser(req.user.userId, id);
    return sendSuccess(res, 200, "User unfollowed", result);
  }),

  getFollowers: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { limit = 10, offset = 0 } = req.query;

    const result = await userService.getFollowers(id, Number(limit), Number(offset));
    return sendSuccess(res, 200, "Followers fetched", result);
  }),

  getFollowing: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { limit = 10, offset = 0 } = req.query;

    const result = await userService.getFollowing(id, Number(limit), Number(offset));
    return sendSuccess(res, 200, "Following fetched", result);
  }),
};
