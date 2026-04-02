import { z } from "zod";

export const neoFeedQuerySchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const neoBrowseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  hazardous: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v == null ? undefined : v === "true")),
  minRisk: z.coerce.number().min(0).max(100).optional(),
  sortBy: z
    .enum(["riskScore", "missDistanceKm", "closeApproachDate"])
    .default("closeApproachDate"),
});

export const nasaIdParamSchema = z.object({
  nasaId: z.string().min(1),
});

export const summaryQuerySchema = z.object({});
