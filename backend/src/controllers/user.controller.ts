import type { Request, Response } from "express";

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "../lib/jwt.js";
import * as userService from "../services/user.service.js";

export async function updateProfileHandler(req: Request, res: Response) {
  const user = await userService.updateProfile(req.userId!, req.body);
  res.status(200).json({ user });
}

export async function changePasswordHandler(req: Request, res: Response) {
  await userService.changePassword(req.userId!, req.body);
  res.status(200).json({ success: true });
}

export async function deleteAccountHandler(req: Request, res: Response) {
  await userService.deleteAccount(req.userId!);
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.status(200).json({ success: true });
}
