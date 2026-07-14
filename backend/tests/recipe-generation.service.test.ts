import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  pantryItem: {
    findMany: vi.fn(),
  },
  recipe: {
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  recipeGenerationBatch: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}));

const mockGenerateJson = vi.hoisted(() => vi.fn());
const mockGetRecipeImageUrl = vi.hoisted(() => vi.fn());

vi.mock("../src/lib/prisma.js", () => ({ prisma: mockPrisma }));
vi.mock("../src/lib/gemini.js", () => ({ generateJson: mockGenerateJson }));
vi.mock("../src/lib/unsplash.js", () => ({ getRecipeImageUrl: mockGetRecipeImageUrl }));

const { generateRecipes } = await import("../src/services/recipe-generation.service.js");

const USER_ID = "user-1";

const pantryItems = [
  { id: "p1", userId: USER_ID, name: "Chicken breast", quantity: 2, unit: "pieces", expirationDate: null },
  { id: "p2", userId: USER_ID, name: "Garlic", quantity: 4, unit: "cloves", expirationDate: null },
];

const validAiResponse = {
  recipes: [
    {
      title: "Garlic Chicken",
      description: "A simple weeknight dinner.",
      instructions: ["Season chicken", "Sear until golden", "Add garlic and finish cooking"],
      cookTimeMinutes: 25,
      difficulty: "EASY",
      ingredients: [
        { name: "Chicken breast", quantity: 2, unit: "pieces", isOptional: false },
        { name: "Garlic", quantity: 4, unit: "cloves", isOptional: false },
        { name: "Olive oil", quantity: 1, unit: "tbsp", isOptional: true },
      ],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  // Default to a cache miss unless a test explicitly sets up a cached batch.
  mockPrisma.recipeGenerationBatch.findFirst.mockResolvedValue(null);
  // getRecipeImageUrl never actually resolves to null (it falls back internally) — default
  // to a found image unless a test explicitly configures something else.
  mockGetRecipeImageUrl.mockResolvedValue("https://images.unsplash.com/photo-123");
});

describe("generateRecipes", () => {
  it("throws EMPTY_PANTRY and never calls Gemini when the user has no pantry items", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue([]);

    await expect(generateRecipes(USER_ID)).rejects.toMatchObject({
      statusCode: 400,
      code: "EMPTY_PANTRY",
    });
    expect(mockGenerateJson).not.toHaveBeenCalled();
  });

  it("persists validated recipes, annotates ingredient matches, and records a cache batch", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const [recipe] = await generateRecipes(USER_ID);

    expect(mockPrisma.recipe.create).toHaveBeenCalledTimes(1);
    expect(recipe.title).toBe("Garlic Chicken");
    expect(recipe.matchedCount).toBe(2);
    expect(recipe.totalCount).toBe(3);
    expect(recipe.ingredients.find((i) => i.name === "Olive oil")?.inPantry).toBe(false);
    expect(recipe.ingredients.find((i) => i.name === "Garlic")?.inPantry).toBe(true);
    expect(mockPrisma.recipeGenerationBatch.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: USER_ID, recipeIds: ["recipe-1"] }),
      }),
    );
  });

  it("rejects malformed JSON from the AI service", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue("not valid json{{{");

    await expect(generateRecipes(USER_ID)).rejects.toMatchObject({
      statusCode: 502,
      code: "AI_INVALID_JSON",
    });
    expect(mockPrisma.recipe.create).not.toHaveBeenCalled();
  });

  it("rejects JSON that doesn't match the expected recipe shape", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify({ recipes: [{ title: "Missing everything else" }] }));

    await expect(generateRecipes(USER_ID)).rejects.toMatchObject({
      statusCode: 502,
      code: "AI_INVALID_SHAPE",
    });
    expect(mockPrisma.recipe.create).not.toHaveBeenCalled();
  });

  it("includes filter instructions in the prompt sent to Gemini", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    await generateRecipes(USER_ID, { maxCookTimeMinutes: 20, dietaryTag: "vegetarian" });

    const prompt = mockGenerateJson.mock.calls[0][0] as string;
    expect(prompt).toContain("Keep total cook time under 20 minutes");
    expect(prompt).toContain("Every recipe must be strictly vegetarian");
  });

  it("treats different filters as a cache miss even with an unchanged pantry", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    await generateRecipes(USER_ID, {});
    await generateRecipes(USER_ID, { dietaryTag: "vegan" });

    expect(mockGenerateJson).toHaveBeenCalledTimes(2);
    const [unfilteredHash] = mockPrisma.recipeGenerationBatch.findFirst.mock.calls[0];
    const [filteredHash] = mockPrisma.recipeGenerationBatch.findFirst.mock.calls[1];
    expect(unfilteredHash.where.pantryHash).not.toBe(filteredHash.where.pantryHash);
  });

  it("resolves each recipe's image before persisting, so the response already includes it", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockGetRecipeImageUrl.mockResolvedValue("https://images.unsplash.com/photo-123");
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const [recipe] = await generateRecipes(USER_ID);

    // The response must already carry the image — this is the actual bug: an earlier version
    // persisted with `imageUrl: null` and attached it in the background *after* responding, so
    // the "Generate meals" page (which renders straight from this response) never showed it.
    expect(mockGetRecipeImageUrl).toHaveBeenCalledWith("Garlic Chicken");
    expect(recipe.imageUrl).toBe("https://images.unsplash.com/photo-123");
    const createCall = mockPrisma.recipe.create.mock.calls[0][0];
    expect(createCall.data.imageUrl).toBe("https://images.unsplash.com/photo-123");
    expect(mockPrisma.recipe.update).not.toHaveBeenCalled();
  });

  it("still resolves an image per recipe when generating multiple recipes at once", async () => {
    const twoRecipeResponse = {
      recipes: [
        validAiResponse.recipes[0],
        { ...validAiResponse.recipes[0], title: "Chicken Soup" },
      ],
    };
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(twoRecipeResponse));
    mockGetRecipeImageUrl.mockImplementation(async (title: string) => `https://img/${title}`);
    let nextId = 0;
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: `recipe-${nextId++}`,
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const recipes = await generateRecipes(USER_ID);

    expect(recipes).toHaveLength(2);
    expect(recipes[0].imageUrl).toBe("https://img/Garlic Chicken");
    expect(recipes[1].imageUrl).toBe("https://img/Chicken Soup");
  });

  it("retries once with feedback when Gemini's first response fails schema validation, then succeeds", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson
      .mockResolvedValueOnce(JSON.stringify({ recipes: [{ title: "Missing everything else" }] }))
      .mockResolvedValueOnce(JSON.stringify(validAiResponse));
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const [recipe] = await generateRecipes(USER_ID);

    expect(mockGenerateJson).toHaveBeenCalledTimes(2);
    // The retry prompt must carry concrete feedback about what was wrong, not just repeat
    // the original prompt verbatim — otherwise a deterministic mistake just repeats itself.
    const retryPrompt = mockGenerateJson.mock.calls[1][0] as string;
    expect(retryPrompt).toContain("previous response was rejected");
    expect(recipe.title).toBe("Garlic Chicken");
  });

  it("gives up after exhausting retry attempts on persistent schema violations", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify({ recipes: [{ title: "Still missing everything" }] }));

    await expect(generateRecipes(USER_ID, { dietaryTag: "vegan" })).rejects.toMatchObject({
      statusCode: 502,
      code: "AI_INVALID_SHAPE",
    });
    expect(mockGenerateJson).toHaveBeenCalledTimes(2);
    expect(mockPrisma.recipe.create).not.toHaveBeenCalled();
  });

  it("drops recipes that exceed maxCookTimeMinutes while keeping ones that comply", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(
      JSON.stringify({
        recipes: [
          { ...validAiResponse.recipes[0], title: "Quick one", cookTimeMinutes: 15 },
          { ...validAiResponse.recipes[0], title: "Slow one", cookTimeMinutes: 45 },
        ],
      }),
    );
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: (data.title as string) === "Quick one" ? "recipe-quick" : "recipe-slow",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const recipes = await generateRecipes(USER_ID, { maxCookTimeMinutes: 20 });

    expect(recipes).toHaveLength(1);
    expect(recipes[0].title).toBe("Quick one");
    expect(mockPrisma.recipe.create).toHaveBeenCalledTimes(1);
  });

  it("falls back to the full unfiltered batch when the AI ignores maxCookTimeMinutes for every recipe", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(
      JSON.stringify({ recipes: [{ ...validAiResponse.recipes[0], cookTimeMinutes: 45 }] }),
    );
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const recipes = await generateRecipes(USER_ID, { maxCookTimeMinutes: 20 });

    // Showing the (imperfect) recipe beats showing nothing — the real cook time is still
    // visible on the card, so the user isn't misled, just not perfectly filtered.
    expect(recipes).toHaveLength(1);
    expect(recipes[0].cookTimeMinutes).toBe(45);
  });

  it("returns a cached batch and never calls Gemini when the pantry is unchanged", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockPrisma.recipeGenerationBatch.findFirst.mockResolvedValue({
      id: "batch-1",
      userId: USER_ID,
      pantryHash: "irrelevant-in-this-test",
      recipeIds: ["recipe-1"],
      createdAt: new Date(),
    });
    mockPrisma.recipe.findMany.mockResolvedValue([
      {
        id: "recipe-1",
        title: "Garlic Chicken",
        ingredients: [{ name: "Garlic", quantity: 4, unit: "cloves", isOptional: false }],
      },
    ]);

    const [recipe] = await generateRecipes(USER_ID);

    expect(recipe.title).toBe("Garlic Chicken");
    expect(mockGenerateJson).not.toHaveBeenCalled();
    expect(mockPrisma.recipe.create).not.toHaveBeenCalled();
    expect(mockPrisma.recipeGenerationBatch.create).not.toHaveBeenCalled();
  });
});
