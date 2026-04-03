import { z } from "zod";

/**
 * Lenient validation schemas - accept any query parameters
 * These exist mainly for type safety, not strict validation
 */

export const neoFeedQuerySchema = z.object({}).passthrough();
export const neoBrowseQuerySchema = z.object({}).passthrough();

export const nasaIdParamSchema = z.object({
  nasaId: z.string().min(1),
});

export const summaryQuerySchema = z.object({}).passthrough();
