import type { NextFunction, Request, Response } from "express";

import { AUTH_COOKIE_NAME, verifyAuthToken } from "../lib/jwt.js";
import { HttpError } from "./error-handler.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  try {
    const payload = verifyAuthToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired session"));
  }
}
