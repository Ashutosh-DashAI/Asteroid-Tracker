import { z } from "zod";

/**
 * Lenient query validation schemas - accept any parameters
 * Controllers handle type coercion and defaults
 */

export const asteroidFeedQuerySchema = z.object({}).passthrough();
export const asteroidIdSchema = z.object({
  id: z.string().uuid("Invalid asteroid ID format"),
});

export const nasaIdSchema = z.object({
  nasaId: z.string().min(1, "NASA ID is required"),
});

export const asteroidSearchSchema = z.object({}).passthrough();
export const hazardousAsteroidsSchema = z.object({}).passthrough();
export const saveddAsteroidCreateSchema = z.object({}).passthrough();
export const savedAsteroidsQuerySchema = z.object({}).passthrough();
export const savedSearchCreateSchema = z.object({}).passthrough();
export const savedSearchesQuerySchema = z.object({}).passthrough();
export const bookmarkCreateSchema = z.object({}).passthrough();
export const bookmarksQuerySchema = z.object({}).passthrough();
export const alertPreferenceSchema = z.object({}).passthrough();
export const watchlistCreateSchema = z.object({}).passthrough();
export const watchlistUpdateSchema = z.object({}).passthrough();
export const watchlistQuerySchema = z.object({}).passthrough();
