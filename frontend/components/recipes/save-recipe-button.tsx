"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveRecipe, useSavedRecipes, useUnsaveRecipe } from "@/hooks/use-saved-recipes";
import { cn } from "@/lib/utils";

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: savedRecipes } = useSavedRecipes();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();

  const existing = savedRecipes?.find((s) => s.recipeId === recipeId);
  const isPending = saveRecipe.isPending || unsaveRecipe.isPending;
  const saved = Boolean(existing);

  const handleClick = () => {
    if (existing) {
      unsaveRecipe.mutate(existing.id);
    } else {
      saveRecipe.mutate({ recipeId });
    }
  };

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn("gap-1.5", saved && "text-rose-600")}
    >
      <Heart className={cn("size-3.5", saved && "fill-rose-500 text-rose-500")} />
      {saved ? "Saved" : "Save recipe"}
    </Button>
  );
}
