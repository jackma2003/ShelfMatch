import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api-client";
import type { Recipe } from "@/hooks/use-recipes";

export type SavedRecipeStatus = "FAVORITE" | "COOKED" | "PLANNED";

export interface SavedRecipe {
  id: string;
  userId: string;
  recipeId: string;
  status: SavedRecipeStatus;
  savedAt: string;
  recipe: Recipe;
}

const SAVED_QUERY_KEY = ["saved"];

export function useSavedRecipes(status?: SavedRecipeStatus) {
  return useQuery<SavedRecipe[]>({
    queryKey: [...SAVED_QUERY_KEY, status ?? "all"],
    queryFn: async () => {
      const search = status ? `?status=${status}` : "";
      const { savedRecipes } = await apiFetch<{ savedRecipes: SavedRecipe[] }>(`/api/saved${search}`);
      return savedRecipes;
    },
  });
}

export function useSaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId, status }: { recipeId: string; status?: SavedRecipeStatus }) =>
      apiFetch<{ savedRecipe: SavedRecipe }>("/api/saved", {
        method: "POST",
        body: JSON.stringify({ recipeId, status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
    },
  });
}

export function useUpdateSavedRecipeStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SavedRecipeStatus }) =>
      apiFetch<{ savedRecipe: SavedRecipe }>(`/api/saved/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
    },
  });
}

export function useUnsaveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<{ success: true }>(`/api/saved/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SAVED_QUERY_KEY });
    },
  });
}
