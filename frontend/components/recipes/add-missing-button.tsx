"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAddMissingFromRecipe } from "@/hooks/use-shopping-list";
import { playClick } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function AddMissingButton({ recipeId }: { recipeId: string }) {
  const addMissing = useAddMissingFromRecipe();
  const [flash, setFlash] = useState(false);

  // Client-side navigation between two recipe detail pages can reuse this component
  // instance without remounting it, which would otherwise leave last recipe's
  // "Added N item(s)" result showing for a completely different recipe.
  useEffect(() => {
    addMissing.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId]);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={addMissing.isPending}
      className={cn(flash && "animate-flash-success")}
      onAnimationEnd={() => setFlash(false)}
      onClick={() => {
        playClick();
        addMissing.mutate(recipeId, { onSuccess: () => setFlash(true) });
      }}
    >
      {addMissing.isPending
        ? "Adding..."
        : addMissing.isSuccess
          ? addMissing.data.items.length > 0
            ? `Added ${addMissing.data.items.length} item${addMissing.data.items.length === 1 ? "" : "s"}`
            : "Already on list"
          : "Add missing to shopping list"}
    </Button>
  );
}
