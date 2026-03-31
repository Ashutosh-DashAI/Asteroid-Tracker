import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendResponse";

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, "Forbidden: Insufficient permissions");
    }

    next();
  };
};
