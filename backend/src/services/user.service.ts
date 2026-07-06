import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error-handler.js";
import type { ChangePasswordInput, UpdateProfileInput } from "../validators/user.validators.js";
import { toPublicUser } from "./auth.service.js";

const SALT_ROUNDS = 10;

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.update({ where: { id: userId }, data: { name: input.name } });
  return toPublicUser(user);
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  if (!user.passwordHash) {
    throw new HttpError(
      400,
      "This account uses Google sign-in and has no password to change",
      "GOOGLE_ACCOUNT",
    );
  }

  const currentMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!currentMatches) {
    throw new HttpError(401, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deleteAccount(userId: string) {
  await prisma.user.delete({ where: { id: userId } });
}
