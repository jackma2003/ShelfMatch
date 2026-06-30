import { isInPantry } from "../lib/ingredient-matching.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error-handler.js";
import type {
  AddShoppingListItemInput,
  UpdateShoppingListItemInput,
} from "../validators/shopping-list.validators.js";

export async function listShoppingListItems(userId: string) {
  return prisma.shoppingListItem.findMany({
    where: { userId },
    include: { recipe: { select: { title: true } } },
    orderBy: [{ isChecked: "asc" }, { createdAt: "desc" }],
  });
}

async function addFromRecipe(userId: string, recipeId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: true },
  });
  if (!recipe) {
    throw new HttpError(404, "Recipe not found");
  }

  const [pantryItems, existingListItems] = await Promise.all([
    prisma.pantryItem.findMany({ where: { userId }, select: { name: true } }),
    prisma.shoppingListItem.findMany({ where: { userId }, select: { name: true } }),
  ]);
  const pantryNames = pantryItems.map((item) => item.name);
  const existingListNames = existingListItems.map((item) => item.name);

  const missingIngredients = recipe.ingredients.filter(
    (ingredient) =>
      !isInPantry(ingredient.name, pantryNames) && !isInPantry(ingredient.name, existingListNames),
  );

  if (missingIngredients.length === 0) {
    return [];
  }

  await prisma.shoppingListItem.createMany({
    data: missingIngredients.map((ingredient) => ({
      userId,
      recipeId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
  });

  return prisma.shoppingListItem.findMany({
    where: { userId, recipeId, name: { in: missingIngredients.map((i) => i.name) } },
    include: { recipe: { select: { title: true } } },
  });
}

export async function addShoppingListItem(userId: string, input: AddShoppingListItemInput) {
  if (input.recipeId) {
    return addFromRecipe(userId, input.recipeId);
  }

  const item = await prisma.shoppingListItem.create({
    data: {
      userId,
      name: input.name!,
      quantity: input.quantity!,
      unit: input.unit!,
    },
    include: { recipe: { select: { title: true } } },
  });
  return [item];
}

async function getOwnedShoppingListItem(userId: string, itemId: string) {
  const item = await prisma.shoppingListItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    throw new HttpError(404, "Shopping list item not found");
  }
  return item;
}

export async function updateShoppingListItem(
  userId: string,
  itemId: string,
  input: UpdateShoppingListItemInput,
) {
  await getOwnedShoppingListItem(userId, itemId);

  return prisma.shoppingListItem.update({
    where: { id: itemId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.unit !== undefined && { unit: input.unit }),
      ...(input.isChecked !== undefined && { isChecked: input.isChecked }),
    },
  });
}

export async function deleteShoppingListItem(userId: string, itemId: string) {
  await getOwnedShoppingListItem(userId, itemId);
  await prisma.shoppingListItem.delete({ where: { id: itemId } });
}
