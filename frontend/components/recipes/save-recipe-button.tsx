"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveRecipe, useSavedRecipes, useUnsaveRecipe } from "@/hooks/use-saved-recipes";
import { cn } from "@/lib/utils";

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: savedRecipes } = useSavedRecipes();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();
  const [pop, setPop] = useState(false);

  const existing = savedRecipes?.find((s) => s.recipeId === recipeId);
  const isPending = saveRecipe.isPending || unsaveRecipe.isPending;
  const saved = Boolean(existing);

  const handleClick = () => {
    if (existing) {
      unsaveRecipe.mutate(existing);
    } else {
      setPop(true);
      saveRecipe.mutate({ recipeId });
    }
  };

  return (
    <Button
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn("gap-1.5", saved && "text-favorite")}
    >
      <Heart
        className={cn(
          "size-3.5",
          saved && "fill-favorite text-favorite",
          pop && "animate-heart-pop",
        )}
        onAnimationEnd={() => setPop(false)}
      />
      {saved ? "Saved" : "Save recipe"}
    </Button>
  );
}
