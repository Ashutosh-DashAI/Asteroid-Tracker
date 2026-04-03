import type { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/sendResponse";
import logger from "../utils/logger";

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

  logger.error({
    statusCode,
    message,
    path: req.originalUrl,
    method: req.method,
    error: err.stack,
  });

  return sendError(res, statusCode, message);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: ApiError = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};
