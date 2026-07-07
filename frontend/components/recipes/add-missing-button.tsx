"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { useAddMissingFromRecipe } from "@/hooks/use-shopping-list";

export function AddMissingButton({ recipeId }: { recipeId: string }) {
  const addMissing = useAddMissingFromRecipe();

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
      onClick={() => addMissing.mutate(recipeId)}
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
