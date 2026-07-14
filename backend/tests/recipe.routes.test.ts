import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Exercises the full HTTP pipeline (routing → requireAuth → validateBody → controller →
// service) for POST /api/recipes/generate. The service-level tests in
// recipe-generation.service.test.ts call generateRecipes() directly and never touch Zod
// validation or Express routing — this file covers the layer those tests skip, which is where
// a filter sent by the real frontend could silently get dropped or rejected before ever
// reaching the service.
const mockPrisma = vi.hoisted(() => ({
  pantryItem: { findMany: vi.fn() },
  recipe: { create: vi.fn(), findMany: vi.fn() },
  recipeGenerationBatch: { findFirst: vi.fn(), create: vi.fn() },
}));

const mockGenerateJson = vi.hoisted(() => vi.fn());
const mockGetRecipeImageUrl = vi.hoisted(() => vi.fn());

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
vi.mock("../src/lib/gemini.js", () => ({ generateJson: mockGenerateJson }));
vi.mock("../src/lib/unsplash.js", () => ({ getRecipeImageUrl: mockGetRecipeImageUrl }));

const { createApp } = await import("../src/app.js");
const { signAuthToken, AUTH_COOKIE_NAME } = await import("../src/lib/jwt.js");

const pantryItems = [
  { id: "p1", userId: "irrelevant", name: "Chicken breast", quantity: 2, unit: "pieces", expirationDate: null },
];
const validAiResponse = {
  recipes: [
    {
      title: "Garlic Chicken",
      description: "A simple weeknight dinner.",
      instructions: ["Season", "Sear", "Finish"],
      cookTimeMinutes: 20,
      difficulty: "EASY",
      ingredients: [{ name: "Chicken breast", quantity: 2, unit: "pieces", isOptional: false }],
    },
  ],
};

// generateRateLimiter is a module-level singleton (its in-memory store isn't recreated by
// createApp()), so it persists across every test in this file. A shared userId would mean
// tests 11+ get silently 429'd by our own limiter regardless of what they're actually
// testing — the same failure mode rate-limit.test.ts works around. A fresh userId per test
// gives each one its own independent bucket; the mocked pantryItem.findMany ignores the
// query's `where` clause entirely, so this doesn't affect the pantry data any test sees.
let testUserId: string;
let userIdCounter = 0;

function authCookie() {
  return `${AUTH_COOKIE_NAME}=${signAuthToken({ userId: testUserId })}`;
}

beforeEach(() => {
  testUserId = `route-test-user-${++userIdCounter}`;
  vi.clearAllMocks();
  mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
  mockPrisma.recipeGenerationBatch.findFirst.mockResolvedValue(null);
  mockGetRecipeImageUrl.mockResolvedValue("https://images.unsplash.com/photo-123");
  mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
  mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    id: `recipe-${Math.random()}`,
    ...data,
    ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
  }));
});

describe("POST /api/recipes/generate", () => {
  it("accepts a bodyless request (no Content-Type at all) as the default, unfiltered case", async () => {
    const app = createApp();
    const res = await request(app).post("/api/recipes/generate").set("Cookie", authCookie());

    expect(res.status).toBe(201);
    expect(res.body.recipes).toHaveLength(1);
  });

  it("accepts an empty JSON object — exactly what the frontend sends when no filter is active", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/recipes/generate")
      .set("Cookie", authCookie())
      .send({});

    expect(res.status).toBe(201);
  });

  it.each([
    { maxCookTimeMinutes: 20 },
    { dietaryTag: "vegetarian" },
    { dietaryTag: "vegan" },
    { dietaryTag: "gluten-free" },
    { maxCookTimeMinutes: 20, dietaryTag: "vegan" },
  ])("accepts filters %o, validates them, and forwards them into the AI prompt", async (filters) => {
    const app = createApp();
    const res = await request(app).post("/api/recipes/generate").set("Cookie", authCookie()).send(filters);

    expect(res.status).toBe(201);

    const prompt = mockGenerateJson.mock.calls[0][0] as string;
    if ("maxCookTimeMinutes" in filters) {
      expect(prompt).toContain(`Keep total cook time under ${filters.maxCookTimeMinutes} minutes`);
    }
    if ("dietaryTag" in filters) {
      expect(prompt).toContain(`strictly ${filters.dietaryTag}`);
    }
  });

  it("rejects an out-of-range maxCookTimeMinutes with 400 rather than silently clamping or ignoring it", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/recipes/generate")
      .set("Cookie", authCookie())
      .send({ maxCookTimeMinutes: 999 });

    expect(res.status).toBe(400);
    expect(mockGenerateJson).not.toHaveBeenCalled();
  });

  it("rejects an unsupported dietaryTag with 400 rather than silently dropping it", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/recipes/generate")
      .set("Cookie", authCookie())
      .send({ dietaryTag: "keto" });

    expect(res.status).toBe(400);
    expect(mockGenerateJson).not.toHaveBeenCalled();
  });

  it("rejects requests with no auth cookie regardless of filters", async () => {
    const app = createApp();
    const res = await request(app).post("/api/recipes/generate").send({ dietaryTag: "vegan" });

    expect(res.status).toBe(401);
    expect(mockGenerateJson).not.toHaveBeenCalled();
  });

  it("treats each distinct filter combination as its own cache key, not a shared one", async () => {
    const app = createApp();

    await request(app).post("/api/recipes/generate").set("Cookie", authCookie()).send({});
    await request(app)
      .post("/api/recipes/generate")
      .set("Cookie", authCookie())
      .send({ dietaryTag: "vegan" });

    const hashes = mockPrisma.recipeGenerationBatch.findFirst.mock.calls.map(
      ([args]: [{ where: { pantryHash: string } }]) => args.where.pantryHash,
    );
    expect(new Set(hashes).size).toBe(2);
  });

  it("surfaces a classified AI_RATE_LIMITED error (not a generic 500) when Gemini's quota is exhausted", async () => {
    // generateJson itself is mocked in this file (gemini.test.ts covers its real 429
    // classification) — this asserts the controller/error-handler layer correctly turns an
    // HttpError thrown deep in the service into the matching HTTP status and code, end to end.
    const { HttpError } = await import("../src/middleware/error-handler.js");
    mockGenerateJson.mockRejectedValue(
      new HttpError(429, "AI service is temporarily rate-limited.", "AI_RATE_LIMITED"),
    );

    const app = createApp();
    const res = await request(app).post("/api/recipes/generate").set("Cookie", authCookie()).send({});

    expect(res.status).toBe(429);
    expect(res.body.code).toBe("AI_RATE_LIMITED");
  });
});
