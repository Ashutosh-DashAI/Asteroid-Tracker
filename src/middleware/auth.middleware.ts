import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/sendResponse";
import logger from "../utils/logger";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn("Missing authorization header from client");
      return sendError(res, 401, "Missing authorization header");
    }

    // Parse Bearer token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      logger.warn("Malformed authorization header format");
      return sendError(res, 401, "Invalid authorization header format. Expected: Bearer <token>");
    }

    const token = parts[1];

    if (!token) {
      logger.warn("Empty access token");
      return sendError(res, 401, "Access token is missing");
    }

    const payload = verifyToken(token);

    if (!payload) {
      logger.warn("Failed to verify access token");
      return sendError(res, 401, "Invalid or expired access token. Please login again.");
    }

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      id: payload.userId, // Add id alias for compatibility
    };

    logger.debug(`User ${payload.userId} authenticated successfully`);
    next();
  } catch (error) {
    logger.error("Authentication middleware error:", error);
    return sendError(res, 500, "Internal server error during authentication");
  }
};

// Alias for compatibility
export const authenticate = authenticateToken;
