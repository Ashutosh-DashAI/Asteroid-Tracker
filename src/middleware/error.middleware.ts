import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendResponse";

export interface ApiError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", err);

  return sendError(res, statusCode, message, err);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: ApiError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};
