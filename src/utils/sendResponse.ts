import type { Response } from "express";
import logger from "./logger";

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

/**
 * Send a unified API response
 */
export const sendResponse = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const response: ApiResponse<T> = {
    success: statusCode < 400,
    statusCode,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

/**
 * Send a success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  logger.debug(`Success response: ${statusCode} - ${message}`);
  return sendResponse(res, statusCode, message, data);
};

/**
 * Send an error response
 */
export const sendError = (
  res: Response,
  statusCode: number,
  message: string
): Response => {
  logger.debug(`Error response: ${statusCode} - ${message}`);
  return sendResponse(res, statusCode, message);
};
