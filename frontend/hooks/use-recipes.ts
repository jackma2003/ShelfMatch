import { useMutation, useQuery } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  name: string;
  quantity: number;
  unit: string;
  isOptional: boolean;
  inPantry: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  imageUrl: string | null;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  source: "AI" | "EXTERNAL" | "SEED";
  createdAt: string;
  ingredients: RecipeIngredient[];
  matchedCount: number;
  totalCount: number;
}

export type DietaryTag = "vegetarian" | "vegan" | "gluten-free";

export interface GenerateRecipesFilters {
  maxCookTimeMinutes?: number;
  dietaryTag?: DietaryTag;
}

export function useGenerateRecipes() {
  return useMutation({
    mutationFn: (filters: GenerateRecipesFilters = {}) =>
      apiFetch<{ recipes: Recipe[] }>("/api/recipes/generate", {
        method: "POST",
        body: JSON.stringify(filters),
      }),
  });
}

export function useRecipe(id: string) {
  return useQuery<Recipe>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      const { recipe } = await apiFetch<{ recipe: Recipe }>(`/api/recipes/${id}`);
      return recipe;
    },
  });
}
