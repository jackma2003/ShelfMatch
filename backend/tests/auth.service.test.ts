import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
vi.mock("../src/lib/verification-token.js", () => ({
  issueVerificationToken: vi.fn().mockResolvedValue("raw-token"),
}));

const { signup, login, findOrCreateGoogleUser } = await import("../src/services/auth.service.js");

const baseUser = {
  id: "user-1",
  email: "cook@example.com",
  name: "Cook",
  avatarUrl: null,
  emailVerified: true,
  createdAt: new Date("2026-01-01"),
  passwordHash: null as string | null,
  googleId: null as string | null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signup", () => {
  it("rejects an email that's already registered", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(baseUser);

    await expect(
      signup({ email: baseUser.email, password: "password123", name: "Cook" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it("hashes the password and creates the user when the email is free", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...baseUser,
      ...data,
      emailVerified: false,
    }));

    const { user } = await signup({ email: "new@example.com", password: "password123", name: "New" });

    expect(user.email).toBe("new@example.com");
    const createCall = mockPrisma.user.create.mock.calls[0][0];
    expect(createCall.data.passwordHash).not.toBe("password123");
    expect(await bcrypt.compare("password123", createCall.data.passwordHash)).toBe(true);
  });
});

describe("login", () => {
  it("rejects an unknown email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(login({ email: "nobody@example.com", password: "x" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects a Google-only account with a helpful error code", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: null, googleId: "g-1" });

    await expect(login({ email: baseUser.email, password: "anything" })).rejects.toMatchObject({
      statusCode: 401,
      code: "GOOGLE_ACCOUNT",
    });
  });

  it("rejects an incorrect password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

    await expect(login({ email: baseUser.email, password: "wrong-password" })).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it("rejects an unverified account even with the correct password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash, emailVerified: false });

    await expect(login({ email: baseUser.email, password: "correct-password" })).rejects.toMatchObject({
      statusCode: 403,
      code: "EMAIL_NOT_VERIFIED",
    });
  });

  it("succeeds and returns a signed token for correct, verified credentials", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

    const result = await login({ email: baseUser.email, password: "correct-password" });

    expect(result.user.email).toBe(baseUser.email);
    expect(typeof result.token).toBe("string");
  });
});

describe("findOrCreateGoogleUser", () => {
  it("links an existing password account by email rather than creating a duplicate", async () => {
    mockPrisma.user.findUnique.mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
      if (where.googleId) return null;
      if (where.email) return baseUser;
      return null;
    });
    mockPrisma.user.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      ...baseUser,
      ...data,
    }));

    const { user } = await findOrCreateGoogleUser({
      googleId: "g-123",
      email: baseUser.email,
      name: baseUser.name,
    });

    expect(user.email).toBe(baseUser.email);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ googleId: "g-123", emailVerified: true }) }),
    );
    expect(mockPrisma.user.create).not.toHaveBeenCalled();
  });
});
