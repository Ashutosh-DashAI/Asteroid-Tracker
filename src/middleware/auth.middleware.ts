import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { sendError } from "../utils/sendResponse";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return sendError(res, 401, "Access token is missing");
  }

  const payload = verifyToken(token);

  if (!payload) {
    return sendError(res, 401, "Invalid or expired access token");
  }

  req.user = {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  next();
};
