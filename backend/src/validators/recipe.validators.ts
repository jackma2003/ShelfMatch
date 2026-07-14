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
        // nonnegative rather than positive — the AI is asked to always send a positive
        // placeholder (see the prompt), but a "to taste" seasoning legitimately has no
        // meaningful quantity, and models occasionally send 0 for those despite the prompt.
        // Rejecting the whole batch over that one harmless field isn't worth it.
        quantity: z.number().nonnegative(),
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

// Optional filters for POST /api/recipes/generate. Kept deliberately small — two knobs,
// not a full cuisine/diet matrix — since the goal is "feels tailored," not a filter form.
// Preprocessed so a truly bodyless POST (req.body undefined, e.g. no Content-Type sent)
// is treated the same as an empty filter set rather than a validation error.
export const generateRecipesRequestSchema = z.preprocess(
  (val) => val ?? {},
  z.object({
    maxCookTimeMinutes: z.number().int().positive().max(180).optional(),
    dietaryTag: z.enum(["vegetarian", "vegan", "gluten-free"]).optional(),
  }),
);

export type GenerateRecipesInput = z.infer<typeof generateRecipesRequestSchema>;
