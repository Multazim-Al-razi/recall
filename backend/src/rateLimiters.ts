import rateLimit from "express-rate-limit";

/**
 * Stricter write limiter (10.5): 30 req/min per IP for destructive writes.
 * Extracted from index.ts to break the circular import between
 * index.ts ↔ routes/*.ts (routes import writeLimiter, index.ts imports routes).
 */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many write requests, please slow down." },
});
