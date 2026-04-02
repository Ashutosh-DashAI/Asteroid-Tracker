import { z } from "zod";

export const chatCreateSchema = z.object({
  content: z.string().trim().min(1).max(500),
  nasaId: z.string().min(1).optional(),
});

export const asteroidChatParamSchema = z.object({
  nasaId: z.string().min(1),
});
