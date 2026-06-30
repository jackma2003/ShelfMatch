import { randomBytes, createHash } from "node:crypto";

import { prisma } from "./prisma.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export async function issueVerificationToken(userId: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.emailVerificationToken.upsert({
    where: { userId },
    update: { tokenHash, expiresAt, createdAt: new Date() },
    create: { userId, tokenHash, expiresAt },
  });

  return rawToken;
}

// Returns null (and skips issuing) if a token was already issued within the cooldown window.
// Used by the resend endpoint so it can give a generic response either way without leaking state.
export async function issueVerificationTokenWithCooldown(userId: string): Promise<string | null> {
  const existing = await prisma.emailVerificationToken.findUnique({ where: { userId } });
  if (existing && Date.now() - existing.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return null;
  }
  return issueVerificationToken(userId);
}

export async function consumeVerificationToken(rawToken: string): Promise<string | null> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    return null;
  }

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });
  return record.userId;
}
