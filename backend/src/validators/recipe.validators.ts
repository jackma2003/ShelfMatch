import { z } from "zod";

// Shape we ask Gemini to return, and validate its response against before trusting it.
export const aiRecipeSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().min(1).max(500),
  instructions: z.array(z.string().min(1)).min(1).max(20),
  cookTimeMinutes: z.number().int().positive().max(600),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().positive(),
        unit: z.string().min(1).max(20),
        isOptional: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(20),
});

export const aiRecipesResponseSchema = z.object({
  recipes: z.array(aiRecipeSchema).min(1).max(5),
});

export type AiRecipe = z.infer<typeof aiRecipeSchema>;
