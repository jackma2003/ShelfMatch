"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, Heart, ListChecks } from "lucide-react";

import { SavedRecipeCard } from "@/components/recipes/saved-recipe-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterButton } from "@/components/ui/filter-button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedRecipes, type SavedRecipeStatus } from "@/hooks/use-saved-recipes";

const FILTERS: {
  label: string;
  icon: typeof ListChecks;
  value: SavedRecipeStatus | undefined;
}[] = [
  { label: "All", icon: ListChecks, value: undefined },
  { label: "Favorites", icon: Heart, value: "FAVORITE" },
  { label: "Cooked", icon: CheckCircle2, value: "COOKED" },
  { label: "Planned", icon: CalendarClock, value: "PLANNED" },
];

export default function SavedRecipesPage() {
  const [filter, setFilter] = useState<SavedRecipeStatus | undefined>(undefined);
  const { data: savedRecipes, isLoading } = useSavedRecipes(filter);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved recipes</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your collection of favorites, planned meals, and things you&apos;ve cooked.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <FilterButton
              key={f.label}
              active={filter === f.value}
              onClick={() => setFilter(f.value)}
            >
              <f.icon className="size-3.5" /> {f.label}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!savedRecipes || savedRecipes.length === 0) && (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Generate some meals and save the ones that look delicious."
        />
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
  );
}
