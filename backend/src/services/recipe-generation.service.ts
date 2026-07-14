import { createHash } from "node:crypto";

import { generateJson } from "../lib/gemini.js";
import { withMatchInfo } from "../lib/ingredient-matching.js";
import { prisma } from "../lib/prisma.js";
import { getRecipeImageUrl } from "../lib/unsplash.js";
import { HttpError } from "../middleware/error-handler.js";
import {
  aiRecipesResponseSchema,
  type AiRecipe,
  type GenerateRecipesInput,
} from "../validators/recipe.validators.js";

// Identical pantries within this window reuse the same generated recipes instead of
// re-hitting Gemini and writing duplicate Recipe rows every time "Generate meals" is clicked.
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

// Filters are folded into the cache key alongside the pantry — otherwise a cached batch
// generated without filters would incorrectly be served back for a filtered request.
function hashRequest(
  pantryItems: { name: string; quantity: number; unit: string }[],
  filters: GenerateRecipesInput,
): string {
  const normalizedPantry = pantryItems
    .map((item) => `${item.name.trim().toLowerCase()}|${item.quantity}|${item.unit.trim().toLowerCase()}`)
    .sort()
    .join("\n");
  const normalizedFilters = JSON.stringify({
    maxCookTimeMinutes: filters.maxCookTimeMinutes ?? null,
    dietaryTag: filters.dietaryTag ?? null,
  });
  return createHash("sha256").update(`${normalizedPantry}\n${normalizedFilters}`).digest("hex");
}

function buildPrompt(
  pantryItems: { name: string; quantity: number; unit: string; expirationDate: Date | null }[],
  filters: GenerateRecipesInput,
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

  const filterInstructions: string[] = [];
  if (filters.maxCookTimeMinutes) {
    filterInstructions.push(
      `Keep total cook time under ${filters.maxCookTimeMinutes} minutes — this is a hard limit, not a suggestion.`,
    );
  }
  if (filters.dietaryTag) {
    filterInstructions.push(`Every recipe must be strictly ${filters.dietaryTag} — no exceptions.`);
  }

  return `You are a practical home cooking assistant. A user has the following ingredients in their kitchen:

${pantryDescription || "(no ingredients logged yet)"}

Suggest 3 to 5 realistic, cookable meals that primarily use these ingredients. Prioritize recipes that:
1. Use ingredients marked "(expiring soon)" first, to help reduce food waste.
2. Minimize the number of additional ingredients not already listed above.
3. Are realistic for a home cook to actually make tonight.
${filterInstructions.map((instruction) => `${instruction}`).join("\n")}

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
}
Every ingredient "quantity" must be a positive number, even for a "to taste" seasoning — use a
placeholder like 1 with unit "to taste" rather than 0 or a non-numeric value.`;
}

// Looked up for every recipe in parallel (not one-by-one) so the added latency is bounded by
// the slowest single lookup rather than N × lookup time — getRecipeImageUrl itself has a
// request timeout and always resolves to a real URL (search result or local fallback), so
// this can safely be awaited before responding instead of attaching images in the background
// after the fact. (An earlier version of this function persisted recipes with `imageUrl:
// null` and attached images via a fire-and-forget call after the response was already sent —
// that meant the response the "Generate meals" page actually renders never had images, only a
// later live re-fetch of the same recipe from the DB would. Resolving them up front fixes
// that at the cost of the once-per-batch lookup latency, which the timeout above bounds.)
async function resolveRecipeImages(recipes: AiRecipe[]): Promise<string[]> {
  return Promise.all(recipes.map((recipe) => getRecipeImageUrl(recipe.title)));
}

async function persistRecipe(recipe: AiRecipe, imageUrl: string) {
  return prisma.recipe.create({
    data: {
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      cookTimeMinutes: recipe.cookTimeMinutes,
      difficulty: recipe.difficulty,
      source: "AI",
      imageUrl,
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

// Bounded at 2 total attempts (1 retry): each attempt is a real, quota-consuming Gemini call
// on this project's tight free-tier daily cap, so this trades a little extra cost for turning
// a transient shape mistake (LLM output is inherently non-deterministic) into a success instead
// of a hard failure — without retrying forever against a persistently broken prompt.
const MAX_GENERATION_ATTEMPTS = 2;

async function requestAiRecipes(prompt: string): Promise<AiRecipe[]> {
  let lastErrorDescription = "";

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const attemptPrompt =
      attempt === 1
        ? prompt
        : `${prompt}\n\nYour previous response was rejected for this reason: ${lastErrorDescription}\nReturn ONLY corrected JSON matching the exact shape above.`;

    const rawText = await generateJson(attemptPrompt);

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error(
        `[recipe-generation] attempt ${attempt}/${MAX_GENERATION_ATTEMPTS}: Gemini returned malformed JSON:`,
        rawText.slice(0, 2000),
      );
      if (attempt === MAX_GENERATION_ATTEMPTS) {
        throw new HttpError(502, "AI service returned malformed JSON", "AI_INVALID_JSON");
      }
      lastErrorDescription = "The response was not valid JSON.";
      continue;
    }

    const result = aiRecipesResponseSchema.safeParse(parsed);
    if (!result.success) {
      const issueSummary = result.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ");
      console.error(
        `[recipe-generation] attempt ${attempt}/${MAX_GENERATION_ATTEMPTS}: Gemini response failed schema validation — ${issueSummary}`,
        `rawText: ${rawText.slice(0, 2000)}`,
      );
      if (attempt === MAX_GENERATION_ATTEMPTS) {
        throw new HttpError(502, "AI service response didn't match the expected format", "AI_INVALID_SHAPE");
      }
      lastErrorDescription = issueSummary;
      continue;
    }

    return result.data.recipes;
  }

  // Unreachable — the loop above always returns or throws — but keeps TypeScript satisfied.
  throw new HttpError(502, "AI service request failed", "AI_REQUEST_FAILED");
}

// maxCookTimeMinutes is the one filter we can mechanically verify (unlike dietaryTag, which
// would need unreliable ingredient-keyword matching to check). The AI is instructed to respect
// it, but instructions aren't guarantees, so this is a real backstop rather than blind trust.
// If every recipe in the batch ignores it, fall back to the unfiltered set — an imperfect
// match beats an empty result, and the actual cook time is always visible on the recipe card.
function enforceMaxCookTime(recipes: AiRecipe[], maxCookTimeMinutes: number | undefined): AiRecipe[] {
  if (!maxCookTimeMinutes) return recipes;

  const compliant = recipes.filter((recipe) => recipe.cookTimeMinutes <= maxCookTimeMinutes);
  if (compliant.length === 0) {
    console.warn(
      `[recipe-generation] AI ignored maxCookTimeMinutes=${maxCookTimeMinutes} for every recipe in the batch (got: ${recipes.map((r) => r.cookTimeMinutes).join(", ")}); returning the unfiltered batch instead of an empty result.`,
    );
    return recipes;
  }
  if (compliant.length < recipes.length) {
    console.warn(
      `[recipe-generation] Dropped ${recipes.length - compliant.length}/${recipes.length} recipe(s) exceeding maxCookTimeMinutes=${maxCookTimeMinutes}.`,
    );
  }
  return compliant;
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

export async function generateRecipes(userId: string, filters: GenerateRecipesInput = {}) {
  const pantryItems = await prisma.pantryItem.findMany({ where: { userId } });

  if (pantryItems.length === 0) {
    throw new HttpError(400, "Add some pantry items before generating recipes", "EMPTY_PANTRY");
  }

  const pantryNames = pantryItems.map((item) => item.name);
  const requestHash = hashRequest(pantryItems, filters);

  const cached = await getCachedBatch(userId, requestHash);
  if (cached) {
    return cached.map((recipe) => withMatchInfo(recipe, pantryNames));
  }

  const prompt = buildPrompt(pantryItems, filters);
  const aiRecipes = enforceMaxCookTime(await requestAiRecipes(prompt), filters.maxCookTimeMinutes);

  const imageUrls = await resolveRecipeImages(aiRecipes);
  const persisted = await Promise.all(aiRecipes.map((recipe, i) => persistRecipe(recipe, imageUrls[i])));

  await prisma.recipeGenerationBatch.create({
    data: { userId, pantryHash: requestHash, recipeIds: persisted.map((recipe) => recipe.id) },
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
