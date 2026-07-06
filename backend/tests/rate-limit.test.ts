import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn().mockResolvedValue(null) },
}));

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));

const { createApp } = await import("../src/app.js");
const { generateRateLimiter } = await import("../src/middleware/rate-limit.js");

describe("loginRateLimiter", () => {
  it("blocks login attempts after the configured limit, regardless of credential validity", async () => {
    const app = createApp();
    const attempt = () =>
      request(app).post("/api/auth/login").send({ email: "nobody@example.com", password: "wrong" });

    const responses = [];
    for (let i = 0; i < 11; i++) {
      responses.push(await attempt());
    }

    const statuses = responses.map((r) => r.status);
    expect(statuses.slice(0, 10)).not.toContain(429);
    expect(statuses[10]).toBe(429);
  });
});

describe("generateRateLimiter", () => {
  // Exercised against a minimal standalone app (userId injected directly) rather than the full
  // recipe route, since the limiter is keyed by req.userId and doesn't care about anything else
  // on the request — this avoids re-deriving a real JWT cookie and pantry/Gemini mocks here.
  function buildTestApp(userId: string) {
    const app = express();
    app.use((req, _res, next) => {
      req.userId = userId;
      next();
    });
    app.post("/generate", generateRateLimiter, (_req, res) => res.status(201).json({ ok: true }));
    return app;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rate-limits per user rather than globally", async () => {
    const appA = buildTestApp("user-a");
    const appB = buildTestApp("user-b");

    for (let i = 0; i < 10; i++) {
      const res = await request(appA).post("/generate");
      expect(res.status).toBe(201);
    }
    const eleventhForA = await request(appA).post("/generate");
    expect(eleventhForA.status).toBe(429);

    // A different user's quota is untouched by user A's usage.
    const firstForB = await request(appB).post("/generate");
    expect(firstForB.status).toBe(201);
  });
});
