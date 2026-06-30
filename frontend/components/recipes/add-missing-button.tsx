"use client";

import { Button } from "@/components/ui/button";
import { useAddMissingFromRecipe } from "@/hooks/use-shopping-list";

export function AddMissingButton({ recipeId }: { recipeId: string }) {
  const addMissing = useAddMissingFromRecipe();

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
