import { z } from "zod";

export const createWatchSchema = z.object({
  nasaId: z.string().min(1),
  alertThresholdKm: z.coerce.number().positive().optional().default(1000000),
});

export const updateWatchSchema = z.object({
  alertThresholdKm: z.coerce.number().positive(),
});

export const watchParamSchema = z.object({
  nasaId: z.string().min(1),
});
