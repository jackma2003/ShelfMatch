import { prisma } from "../lib/prisma.js";
import { HttpError } from "../middleware/error-handler.js";
import type {
  CreatePantryItemInput,
  PantryListQuery,
  UpdatePantryItemInput,
} from "../validators/pantry.validators.js";

export async function listPantryItems(userId: string, query: PantryListQuery) {
  if (query.sort === "expiring") {
    return prisma.pantryItem.findMany({
      where: { userId },
      orderBy: [{ expirationDate: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    });
  }

  return prisma.pantryItem.findMany({
    where: { userId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}

export async function createPantryItem(userId: string, input: CreatePantryItemInput) {
  return prisma.pantryItem.create({
    data: {
      userId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      category: input.category,
      expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
    },
  });
}

async function getOwnedPantryItem(userId: string, itemId: string) {
  const item = await prisma.pantryItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== userId) {
    throw new HttpError(404, "Pantry item not found");
  }
  return item;
}

export async function updatePantryItem(userId: string, itemId: string, input: UpdatePantryItemInput) {
  await getOwnedPantryItem(userId, itemId);

  return prisma.pantryItem.update({
    where: { id: itemId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.quantity !== undefined && { quantity: input.quantity }),
      ...(input.unit !== undefined && { unit: input.unit }),
      ...(input.category !== undefined && { category: input.category }),
      ...(input.expirationDate !== undefined && {
        expirationDate: input.expirationDate ? new Date(input.expirationDate) : null,
      }),
    },
  });
}

export async function deletePantryItem(userId: string, itemId: string) {
  await getOwnedPantryItem(userId, itemId);
  await prisma.pantryItem.delete({ where: { id: itemId } });
}
