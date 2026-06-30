import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import type { Request, Response } from "express";

import {
  GOOGLE_OAUTH_SCOPES,
  OAUTH_STATE_COOKIE,
  OAUTH_TEMP_COOKIE_OPTIONS,
  OAUTH_VERIFIER_COOKIE,
  getGoogleClient,
  type GoogleIdTokenClaims,
} from "../lib/google-oauth.js";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "../lib/jwt.js";
import * as authService from "../services/auth.service.js";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

export async function signupHandler(req: Request, res: Response) {
  const { user } = await authService.signup(req.body);
  res.status(201).json({ user });
}

export async function loginHandler(req: Request, res: Response) {
  const { user, token } = await authService.login(req.body);
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  res.status(200).json({ user });
}

export function logoutHandler(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.status(200).json({ success: true });
}

export async function meHandler(req: Request, res: Response) {
  const user = await authService.getUserById(req.userId!);
  res.status(200).json({ user });
}

export async function verifyEmailHandler(req: Request, res: Response) {
  const token = typeof req.query.token === "string" ? req.query.token : "";

  try {
    const { token: authToken } = await authService.verifyEmail(token);
    res.cookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_OPTIONS);
    res.redirect(`${FRONTEND_URL}/dashboard?verified=true`);
  } catch {
    res.redirect(`${FRONTEND_URL}/login?error=invalid_token`);
  }
}

export async function resendVerificationHandler(req: Request, res: Response) {
  await authService.resendVerification(req.body);
  res.status(200).json({ message: "If that account exists, a verification email has been sent." });
}

export function googleAuthHandler(_req: Request, res: Response) {
  try {
    const google = getGoogleClient();
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, GOOGLE_OAUTH_SCOPES);

    res.cookie(OAUTH_STATE_COOKIE, state, OAUTH_TEMP_COOKIE_OPTIONS);
    res.cookie(OAUTH_VERIFIER_COOKIE, codeVerifier, OAUTH_TEMP_COOKIE_OPTIONS);
    res.redirect(url.toString());
  } catch {
    res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }
}

export async function googleCallbackHandler(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code : null;
  const state = typeof req.query.state === "string" ? req.query.state : null;
  const storedState = req.cookies?.[OAUTH_STATE_COOKIE] as string | undefined;
  const storedVerifier = req.cookies?.[OAUTH_VERIFIER_COOKIE] as string | undefined;

  res.clearCookie(OAUTH_STATE_COOKIE, OAUTH_TEMP_COOKIE_OPTIONS);
  res.clearCookie(OAUTH_VERIFIER_COOKIE, OAUTH_TEMP_COOKIE_OPTIONS);

  if (!code || !state || !storedState || !storedVerifier || state !== storedState) {
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    return;
  }

  try {
    const google = getGoogleClient();
    const tokens = await google.validateAuthorizationCode(code, storedVerifier);
    const claims = decodeIdToken(tokens.idToken()) as GoogleIdTokenClaims;

    const { token: authToken } = await authService.findOrCreateGoogleUser({
      googleId: claims.sub,
      email: claims.email,
      name: claims.name,
      avatarUrl: claims.picture,
    });

    res.cookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_OPTIONS);
    res.redirect(`${FRONTEND_URL}/dashboard?verified=true`);
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
}
