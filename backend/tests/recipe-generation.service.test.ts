import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  pantryItem: {
    findMany: vi.fn(),
  },
  recipe: {
    create: vi.fn(),
    findMany: vi.fn(),
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
  // Default to "no image found" unless a test explicitly configures one.
  mockGetRecipeImageUrl.mockResolvedValue(null);
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
    expect(prompt).toContain("Keep total cook time under 20 minutes.");
    expect(prompt).toContain("Every recipe must be vegetarian.");
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

  it("attaches an image URL to the persisted recipe when one is found", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockGetRecipeImageUrl.mockResolvedValue("https://images.unsplash.com/photo-123");
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    await generateRecipes(USER_ID);

    expect(mockGetRecipeImageUrl).toHaveBeenCalledWith("Garlic Chicken");
    const createCall = mockPrisma.recipe.create.mock.calls[0][0];
    expect(createCall.data.imageUrl).toBe("https://images.unsplash.com/photo-123");
  });

  it("still generates successfully with no image when the lookup finds nothing", async () => {
    mockPrisma.pantryItem.findMany.mockResolvedValue(pantryItems);
    mockGenerateJson.mockResolvedValue(JSON.stringify(validAiResponse));
    mockGetRecipeImageUrl.mockResolvedValue(null);
    mockPrisma.recipe.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "recipe-1",
      ...data,
      ingredients: (data.ingredients as { create: Record<string, unknown>[] }).create,
    }));

    const [recipe] = await generateRecipes(USER_ID);

    expect(recipe.imageUrl).toBeNull();
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
