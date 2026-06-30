"use client";

import { Button } from "@/components/ui/button";
import { useSaveRecipe, useSavedRecipes, useUnsaveRecipe } from "@/hooks/use-saved-recipes";

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: savedRecipes } = useSavedRecipes();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  const existing = savedRecipes?.find((s) => s.recipeId === recipeId);
  const isPending = saveRecipe.isPending || unsaveRecipe.isPending;

  const handleClick = () => {
    if (existing) {
      unsaveRecipe.mutate(existing.id);
    } else {
      saveRecipe.mutate({ recipeId });
    }
  };

  return (
    <Button variant={existing ? "secondary" : "outline"} size="sm" onClick={handleClick} disabled={isPending}>
      {existing ? "Saved" : "Save recipe"}
    </Button>
  );
}
