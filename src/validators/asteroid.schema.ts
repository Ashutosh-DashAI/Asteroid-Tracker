import { z } from "zod";

export const getAsteroidsSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid start date").optional(),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid end date").optional(),
  neoId: z.string().optional(),
  hazardousOnly: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().int().positive().max(1000).optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export const watchAsteroidSchema = z.object({
  asteroidId: z.string().min(1, "Asteroid ID is required"),
  alertLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
});

export const unwatchAsteroidSchema = z.object({
  asteroidId: z.string().min(1, "Asteroid ID is required"),
});

export const updateWatchAsteroidSchema = z.object({
  asteroidId: z.string().min(1, "Asteroid ID is required"),
  alertLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  isActive: z.boolean().optional(),
});

export const getAsteroidDetailsSchema = z.object({
  neoId: z.string().min(1, "NEO ID is required"),
});

export const createAlertSchema = z.object({
  asteroidId: z.string().min(1, "Asteroid ID is required"),
  alertLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional().default("MEDIUM"),
});

export const getRiskAnalysisSchema = z.object({
  neoId: z.string().min(1, "NEO ID is required"),
});

export type GetAsteroidsInput = z.infer<typeof getAsteroidsSchema>;
export type WatchAsteroidInput = z.infer<typeof watchAsteroidSchema>;
export type UnwatchAsteroidInput = z.infer<typeof unwatchAsteroidSchema>;
export type UpdateWatchAsteroidInput = z.infer<typeof updateWatchAsteroidSchema>;
export type GetAsteroidDetailsInput = z.infer<typeof getAsteroidDetailsSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type GetRiskAnalysisInput = z.infer<typeof getRiskAnalysisSchema>;
