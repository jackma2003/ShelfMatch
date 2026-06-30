import { Google } from "arctic";
import type { CookieOptions } from "express";

import { HttpError } from "../middleware/error-handler.js";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const REDIRECT_URI = `${API_URL}/api/auth/google/callback`;

let googleClient: Google | null = null;

// Lazily constructed (and only required) when a Google sign-in route is actually hit, so the
// rest of the app keeps working fine before GOOGLE_CLIENT_ID/SECRET are configured.
export function getGoogleClient(): Google {
  if (googleClient) return googleClient;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new HttpError(500, "Google sign-in is not configured on this server");
  }

  googleClient = new Google(clientId, clientSecret, REDIRECT_URI);
  return googleClient;
}

export const GOOGLE_OAUTH_SCOPES = ["openid", "email", "profile"];

export const OAUTH_STATE_COOKIE = "shelfmatch_oauth_state";
export const OAUTH_VERIFIER_COOKIE = "shelfmatch_oauth_verifier";

const isProduction = process.env.NODE_ENV === "production";

// Short-lived cookies that only need to survive the round trip to Google's consent
// screen and back — Lax is sufficient since that round trip is a top-level navigation.
export const OAUTH_TEMP_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 10 * 60 * 1000,
};

export interface GoogleIdTokenClaims {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}
