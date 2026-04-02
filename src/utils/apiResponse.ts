import type { Response } from "express";

export const success = (
  res: Response,
  data: unknown,
  message = "OK",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const error = (
  res: Response,
  message = "Something went wrong",
  statusCode = 500,
  errors?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
