import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "../lib/email.js";
import { signAuthToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import {
  consumeVerificationToken,
  issueVerificationToken,
  issueVerificationTokenWithCooldown,
} from "../lib/verification-token.js";
import { HttpError } from "../middleware/error-handler.js";
import type { LoginInput, ResendVerificationInput, SignupInput } from "../validators/auth.validators.js";

const SALT_ROUNDS = 10;
const API_URL = process.env.API_URL ?? "http://localhost:4000";

function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

async function dispatchVerificationEmail(rawToken: string, email: string, name: string) {
  const verifyUrl = `${API_URL}/api/auth/verify-email?token=${rawToken}`;
  await sendVerificationEmail(email, name, verifyUrl).catch((error: unknown) => {
    console.error(`Failed to send verification email to ${email}:`, error);
  });
}

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "An account with that email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash, name: input.name },
  });

  const rawToken = await issueVerificationToken(user.id);
  await dispatchVerificationEmail(rawToken, user.email, user.name);

  return { user: toPublicUser(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new HttpError(401, "This account uses Google sign-in. Log in with Google instead.", "GOOGLE_ACCOUNT");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Invalid email or password");
  }

  if (!user.emailVerified) {
    throw new HttpError(403, "Please verify your email before logging in", "EMAIL_NOT_VERIFIED");
  }

  return { user: toPublicUser(user), token: signAuthToken({ userId: user.id }) };
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

// Links by googleId first, then by email (so a user who originally signed up with a
// password can also use "Continue with Google" on the same address). Google has already
// verified the email by virtue of issuing the token, so emailVerified is set unconditionally.
export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  const existingByGoogleId = await prisma.user.findUnique({ where: { googleId: profile.googleId } });
  if (existingByGoogleId) {
    return { user: toPublicUser(existingByGoogleId), token: signAuthToken({ userId: existingByGoogleId.id }) };
  }

  const existingByEmail = await prisma.user.findUnique({ where: { email: profile.email } });
  if (existingByEmail) {
    const linked = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: { googleId: profile.googleId, emailVerified: true },
    });
    return { user: toPublicUser(linked), token: signAuthToken({ userId: linked.id }) };
  }

  const created = await prisma.user.create({
    data: {
      email: profile.email,
      googleId: profile.googleId,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      emailVerified: true,
    },
  });
  return { user: toPublicUser(created), token: signAuthToken({ userId: created.id }) };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return toPublicUser(user);
}

export async function verifyEmail(rawToken: string) {
  const userId = await consumeVerificationToken(rawToken);
  if (!userId) {
    throw new HttpError(400, "This verification link is invalid or has expired", "INVALID_TOKEN");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: true },
  });

  return { user: toPublicUser(user), token: signAuthToken({ userId: user.id }) };
}

// Always succeeds from the caller's perspective (no email-existence leak); only actually
// sends when a matching, unverified account exists and isn't within the resend cooldown.
export async function resendVerification(input: ResendVerificationInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || user.emailVerified) {
    return;
  }

  const rawToken = await issueVerificationTokenWithCooldown(user.id);
  if (!rawToken) {
    return;
  }

  await dispatchVerificationEmail(rawToken, user.email, user.name);
}
