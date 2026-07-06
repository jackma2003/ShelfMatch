import bcrypt from "bcryptjs";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface FakeUser {
  id: string;
  email: string;
  passwordHash: string | null;
  googleId: string | null;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const { users } = vi.hoisted(() => ({ users: [] as FakeUser[] }));

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

const { createApp } = await import("../src/app.js");

beforeEach(() => {
  users.length = 0;
  vi.clearAllMocks();
  // Re-install the stateful implementations vi.clearAllMocks() just wiped.
  mockPrisma.user.findUnique.mockImplementation(async ({ where }: { where: Partial<FakeUser> }) => {
    if (where.id) return users.find((u) => u.id === where.id) ?? null;
    if (where.email) return users.find((u) => u.email === where.email) ?? null;
    return null;
  });
  mockPrisma.user.create.mockImplementation(async ({ data }: { data: Partial<FakeUser> }) => {
    const user: FakeUser = {
      id: `user-${users.length + 1}`,
      email: data.email!,
      passwordHash: data.passwordHash ?? null,
      googleId: data.googleId ?? null,
      emailVerified: data.emailVerified ?? false,
      name: data.name!,
      avatarUrl: data.avatarUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  });
});

describe("auth routes", () => {
  it("signs up, then rejects login until the account is verified", async () => {
    const app = createApp();

    const signupRes = await request(app)
      .post("/api/auth/signup")
      .send({ email: "cook@example.com", password: "password123", name: "Cook" });
    expect(signupRes.status).toBe(201);
    expect(signupRes.body.user.email).toBe("cook@example.com");

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "cook@example.com", password: "password123" });
    expect(loginRes.status).toBe(403);
    expect(loginRes.body.code).toBe("EMAIL_NOT_VERIFIED");
  });

  it("logs in a verified user, sets an httpOnly cookie, and allows /me with it", async () => {
    const app = createApp();
    const passwordHash = await bcrypt.hash("password123", 10);
    users.push({
      id: "user-1",
      email: "cook@example.com",
      passwordHash,
      googleId: null,
      emailVerified: true,
      name: "Cook",
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const agent = request.agent(app);

    const loginRes = await agent
      .post("/api/auth/login")
      .send({ email: "cook@example.com", password: "password123" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.headers["set-cookie"]?.[0]).toMatch(/shelfmatch_token=.+HttpOnly/i);

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("cook@example.com");
  });

  it("rejects /me without a session cookie", async () => {
    const app = createApp();

    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
  });
});
