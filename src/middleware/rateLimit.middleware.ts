import rateLimit from "express-rate-limit";
import env from "../config/env";

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

export const neoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: "Too many NEO requests, please try again in a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs (increased for development)
  message: "Too many login attempts, please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Create limiter
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 requests per windowMs
  message: "Too many create requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
