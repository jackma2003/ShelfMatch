import { z } from "zod";

export const SAVED_RECIPE_STATUSES = ["FAVORITE", "COOKED", "PLANNED"] as const;

export const saveRecipeSchema = z.object({
  recipeId: z.string().min(1),
  status: z.enum(SAVED_RECIPE_STATUSES).default("FAVORITE"),
});

export const updateSavedRecipeSchema = z.object({
  status: z.enum(SAVED_RECIPE_STATUSES),
});

export const savedListQuerySchema = z.object({
  status: z.enum(SAVED_RECIPE_STATUSES).optional(),
});

export type SaveRecipeInput = z.infer<typeof saveRecipeSchema>;
export type UpdateSavedRecipeInput = z.infer<typeof updateSavedRecipeSchema>;
export type SavedListQuery = z.infer<typeof savedListQuerySchema>;
