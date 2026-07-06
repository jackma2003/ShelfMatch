import { createHash } from "node:crypto";

import { generateJson } from "../lib/gemini.js";
import { withMatchInfo } from "../lib/ingredient-matching.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error-handler.js";
import { aiRecipesResponseSchema, type AiRecipe } from "../validators/recipe.validators.js";

// Identical pantries within this window reuse the same generated recipes instead of
// re-hitting Gemini and writing duplicate Recipe rows every time "Generate meals" is clicked.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function hashPantry(
  pantryItems: { name: string; quantity: number; unit: string }[],
): string {
  const normalized = pantryItems
    .map((item) => `${item.name.trim().toLowerCase()}|${item.quantity}|${item.unit.trim().toLowerCase()}`)
    .sort()
    .join("\n");
  return createHash("sha256").update(normalized).digest("hex");
}

function buildPrompt(
  pantryItems: { name: string; quantity: number; unit: string; expirationDate: Date | null }[],
): string {
  const now = Date.now();
  const pantryDescription = pantryItems
    .map((item) => {
      const expiring =
        item.expirationDate && item.expirationDate.getTime() - now < 3 * 24 * 60 * 60 * 1000
          ? " (expiring soon)"
          : "";
      return `- ${item.name}: ${item.quantity} ${item.unit}${expiring}`;
    })
    .join("\n");

  return `You are a practical home cooking assistant. A user has the following ingredients in their kitchen:

${pantryDescription || "(no ingredients logged yet)"}

Suggest 3 to 5 realistic, cookable meals that primarily use these ingredients. Prioritize recipes that:
1. Use ingredients marked "(expiring soon)" first, to help reduce food waste.
2. Minimize the number of additional ingredients not already listed above.
3. Are realistic for a home cook to actually make tonight.

Respond with ONLY valid JSON (no markdown code fences, no commentary) matching exactly this shape:
{
  "recipes": [
    {
      "title": string,
      "description": string (one sentence),
      "instructions": string[] (numbered steps, no leading numbers in the text),
      "cookTimeMinutes": number,
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "ingredients": [
        { "name": string, "quantity": number, "unit": string, "isOptional": boolean }
      ]
    }
  ]
}`;
}

async function persistRecipe(recipe: AiRecipe) {
  return prisma.recipe.create({
    data: {
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      source: "AI",
      ingredients: {
        create: recipe.ingredients.map((ingredient) => ({
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          isOptional: ingredient.isOptional,
        })),
      },
    },
    include: { ingredients: true },
  });
}

async function getCachedBatch(userId: string, pantryHash: string) {
  const batch = await prisma.recipeGenerationBatch.findFirst({
    where: { userId, pantryHash, createdAt: { gte: new Date(Date.now() - CACHE_TTL_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (!batch) return null;

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: batch.recipeIds } },
    include: { ingredients: true },
  });
  // findMany doesn't preserve `in` order, so re-sort to match the batch's original order.
  const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
  const ordered = batch.recipeIds.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => r != null);

  return ordered.length > 0 ? ordered : null;
}

export async function generateRecipes(userId: string) {
  const pantryItems = await prisma.pantryItem.findMany({ where: { userId } });

  if (pantryItems.length === 0) {
    throw new HttpError(400, "Add some pantry items before generating recipes", "EMPTY_PANTRY");
  }

  const pantryNames = pantryItems.map((item) => item.name);
  const pantryHash = hashPantry(pantryItems);

  const cached = await getCachedBatch(userId, pantryHash);
  if (cached) {
    return cached.map((recipe) => withMatchInfo(recipe, pantryNames));
  }

  const prompt = buildPrompt(pantryItems);
  const rawText = await generateJson(prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new HttpError(502, "AI service returned malformed JSON", "AI_INVALID_JSON");
  }

  const result = aiRecipesResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new HttpError(502, "AI service response didn't match the expected format", "AI_INVALID_SHAPE");
  }

  const persisted = await Promise.all(result.data.recipes.map(persistRecipe));

  await prisma.recipeGenerationBatch.create({
    data: { userId, pantryHash, recipeIds: persisted.map((recipe) => recipe.id) },
  });

  return persisted.map((recipe) => withMatchInfo(recipe, pantryNames));
}

export async function getRecipeById(userId: string, recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });
  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  const pantryItems = await prisma.pantryItem.findMany({ where: { userId }, select: { name: true } });
  const pantryNames = pantryItems.map((item) => item.name);

  return withMatchInfo(recipe, pantryNames);
}
