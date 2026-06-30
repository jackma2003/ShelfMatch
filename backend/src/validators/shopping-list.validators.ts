import { z } from "zod";

// Either add a single manual item (name + quantity + unit), or bulk-add a recipe's
// missing ingredients by passing recipeId alone.
export const addShoppingListItemSchema = z
  .object({
    recipeId: z.string().min(1).optional(),
    name: z.string().min(1).max(100).optional(),
    quantity: z.number().positive().optional(),
    unit: z.string().min(1).max(20).optional(),
  })
  .refine((data) => Boolean(data.recipeId) || Boolean(data.name && data.quantity && data.unit), {
    message: "Provide either recipeId, or name, quantity, and unit",
  });

export const updateShoppingListItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).max(20).optional(),
  isChecked: z.boolean().optional(),
});

export type AddShoppingListItemInput = z.infer<typeof addShoppingListItemSchema>;
export type UpdateShoppingListItemInput = z.infer<typeof updateShoppingListItemSchema>;
