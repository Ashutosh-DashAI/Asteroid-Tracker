import type { Request, Response } from "express";
import { authService } from "../services/auth.services";
import { sendSuccess, sendError } from "../utils/sendResponse";
import { asyncHandler } from "../utils/asyncHandler";
import logger from "../utils/logger";

export const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.signup(req.body);
    return sendSuccess(res, 201, "User registered successfully", result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    return sendSuccess(res, 200, "Login successful", result);
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return sendError(res, 400, "Refresh token is required");
    }

    await authService.logout(req.user.userId, refreshToken);
    return sendSuccess(res, 200, "Logged out successfully");
  }),

  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      logger.warn("Refresh token endpoint called without token");
      return sendError(res, 400, "Refresh token is required");
    }

    logger.debug("Attempting to refresh access token");
    const result = await authService.refreshAccessToken(refreshToken);
    return sendSuccess(res, 200, "Token refreshed successfully", result);
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    return sendSuccess(res, 200, "If email exists, reset link has been sent", result);
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.resetPassword(req.body);
    return sendSuccess(res, 200, "Password reset successfully", result);
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(
      req.user.userId,
      oldPassword,
      newPassword
    );
    return sendSuccess(res, 200, "Password changed successfully", result);
  }),

  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    const user = await authService.getCurrentUser(req.user.userId);
    return sendSuccess(res, 200, "Current user fetched successfully", user);
  }),
};
