"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { useSaveRecipe, useSavedRecipes, useUnsaveRecipe } from "@/hooks/use-saved-recipes";
import { playClick } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function SaveRecipeButton({ recipeId }: { recipeId: string }) {
  const { data: savedRecipes } = useSavedRecipes();
  const saveRecipe = useSaveRecipe();
  const unsaveRecipe = useUnsaveRecipe();
  // Incremented (not just a boolean) so the motion.span below always remounts on a fresh
  // "save" — a boolean would only flip true->false->true across two saves, which wouldn't
  // retrigger a key change if the intervening unsave never happened.
  const [popKey, setPopKey] = useState(0);

  const existing = savedRecipes?.find((s) => s.recipeId === recipeId);
  const isPending = saveRecipe.isPending || unsaveRecipe.isPending;
  const saved = Boolean(existing);

  const handleClick = () => {
    playClick();
    if (existing) {
      unsaveRecipe.mutate(existing);
    } else {
      setPopKey((k) => k + 1);
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
      <motion.span
        key={popKey}
        initial={popKey > 0 ? { scale: 1.6 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.6, duration: 0.4 }}
      >
        <Heart className={cn("size-3.5", saved && "fill-favorite text-favorite")} />
      </motion.span>
      {saved ? "Saved" : "Save recipe"}
    </Button>
  );
}
