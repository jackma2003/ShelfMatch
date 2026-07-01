"use client";

import { useState } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { SavedRecipeCard } from "@/components/recipes/saved-recipe-card";
import { useSavedRecipes, type SavedRecipeStatus } from "@/hooks/use-saved-recipes";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; emoji: string; value: SavedRecipeStatus | undefined }[] = [
  { label: "All", emoji: "📋", value: undefined },
  { label: "Favorites", emoji: "❤️", value: "FAVORITE" },
  { label: "Cooked", emoji: "✅", value: "COOKED" },
  { label: "Planned", emoji: "📅", value: "PLANNED" },
];

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function SavedContent() {
  const [filter, setFilter] = useState<SavedRecipeStatus | undefined>(undefined);
  const { data: savedRecipes, isLoading } = useSavedRecipes(filter);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Saved recipes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your collection of favorites, planned meals, and things you&apos;ve cooked.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <FilterPill
                key={f.label}
                active={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.emoji} {f.label}
              </FilterPill>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!savedRecipes || savedRecipes.length === 0) && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
            <span className="text-5xl">❤️</span>
            <p className="font-medium">Nothing saved yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Generate some meals and save the ones that look delicious.
            </p>
          </div>
        )}

        {/* Recipe list */}
        {savedRecipes && savedRecipes.length > 0 && (
          <div className="space-y-3">
            {savedRecipes.map((saved) => (
              <SavedRecipeCard key={saved.id} savedRecipe={saved} />
            ))}
          </div>
        )}
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
