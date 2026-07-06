import { rateLimit } from "express-rate-limit";

// Basic brute-force protection — keyed by IP since there's no authenticated user yet at login time.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in a few minutes." },
});

// Protects the free-tier Gemini quota from being exhausted by one user (or a bug in a loop).
// Keyed by userId (set by requireAuth, which always runs before this) rather than IP, so it
// doesn't unfairly throttle users behind a shared/corporate IP.
export const generateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId!,
  message: { error: "You've hit the recipe generation limit for this hour. Try again later." },
});
