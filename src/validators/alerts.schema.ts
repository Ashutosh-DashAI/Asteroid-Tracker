import { z } from "zod";

export const alertsQuerySchema = z.object({
  unreadOnly: z
    .union([z.literal("true"), z.literal("false")])
    .optional()
    .transform((v) => (v == null ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const alertIdParamSchema = z.object({
  id: z.string().min(1),
});
