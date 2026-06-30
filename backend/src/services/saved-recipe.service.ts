import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error-handler.js";
import type { SavedListQuery, SaveRecipeInput, UpdateSavedRecipeInput } from "../validators/saved-recipe.validators.js";

export async function listSavedRecipes(userId: string, query: SavedListQuery) {
  return prisma.savedRecipe.findMany({
    where: { userId, ...(query.status && { status: query.status }) },
    include: { recipe: { include: { ingredients: true } } },
    orderBy: { savedAt: "desc" },
  });
}

// Upsert rather than create: re-saving an already-saved recipe (e.g. switching from
// FAVORITE to COOKED) should update the existing row, not violate the unique constraint.
export async function saveRecipe(userId: string, input: SaveRecipeInput) {
  const recipe = await prisma.recipe.findUnique({ where: { id: input.recipeId } });
  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  return prisma.savedRecipe.upsert({
    where: { userId_recipeId: { userId, recipeId: input.recipeId } },
    update: { status: input.status },
    create: { userId, recipeId: input.recipeId, status: input.status },
    include: { recipe: { include: { ingredients: true } } },
  });
}

async function getOwnedSavedRecipe(userId: string, savedRecipeId: string) {
  const saved = await prisma.savedRecipe.findUnique({ where: { id: savedRecipeId } });
  if (!saved || saved.userId !== userId) {
    throw new HttpError(404, "Saved recipe not found");
  }
  return saved;
}

export async function updateSavedRecipeStatus(
  userId: string,
  savedRecipeId: string,
  input: UpdateSavedRecipeInput,
) {
  await getOwnedSavedRecipe(userId, savedRecipeId);

  return prisma.savedRecipe.update({
    where: { id: savedRecipeId },
    data: { status: input.status },
    include: { recipe: { include: { ingredients: true } } },
  });
}

export async function unsaveRecipe(userId: string, savedRecipeId: string) {
  await getOwnedSavedRecipe(userId, savedRecipeId);
  await prisma.savedRecipe.delete({ where: { id: savedRecipeId } });
}
