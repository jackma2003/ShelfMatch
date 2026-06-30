import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";

function getJwtSecret(): string {
  const value = process.env.JWT_SECRET;
  if (!value) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return value;
}

const JWT_SECRET: string = getJwtSecret();

const TOKEN_EXPIRY = "7d";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const AUTH_COOKIE_NAME = "shelfmatch_token";

// Frontend (Vercel) and backend (Render) live on different domains in production,
// so the cookie must be SameSite=None + Secure to survive a cross-site fetch.
// Locally both run on http://localhost (different ports only), where SameSite=None
// would be rejected without HTTPS, so we fall back to Lax there.
const isProduction = process.env.NODE_ENV === "production";

export const AUTH_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: COOKIE_MAX_AGE_MS,
};

export interface AuthTokenPayload {
  userId: string;
}

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
