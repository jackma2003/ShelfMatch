"use client";

import { useState } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { SavedRecipeCard } from "@/components/recipes/saved-recipe-card";
import { Button } from "@/components/ui/button";
import { useSavedRecipes, type SavedRecipeStatus } from "@/hooks/use-saved-recipes";

const FILTERS: { label: string; value: SavedRecipeStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Favorites", value: "FAVORITE" },
  { label: "Cooked", value: "COOKED" },
  { label: "Planned", value: "PLANNED" },
];

function SavedContent() {
  const [filter, setFilter] = useState<SavedRecipeStatus | undefined>(undefined);
  const { data: savedRecipes, isLoading } = useSavedRecipes(filter);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Saved recipes</h1>
          <div className="flex gap-2">
            {FILTERS.map((f) => (
              <Button
                key={f.label}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

        {!isLoading && (!savedRecipes || savedRecipes.length === 0) && (
          <p className="text-muted-foreground text-sm">
            No saved recipes yet. Generate some meals and save the ones you like.
          </p>
        )}

        <div className="space-y-4">
          {savedRecipes?.map((saved) => (
            <SavedRecipeCard key={saved.id} savedRecipe={saved} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function SavedRecipesPage() {
  return (
    <AuthGuard>
      <SavedContent />
    </AuthGuard>
  );
}
