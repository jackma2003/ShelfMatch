"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Heart, ListChecks } from "lucide-react";

import { SavedRecipeCard } from "@/components/recipes/saved-recipe-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterButton } from "@/components/ui/filter-button";
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
  const { data: savedRecipes, isLoading, isError, refetch } = useSavedRecipes(filter);

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
            <Card key={i} className="flex-col gap-3 p-5 sm:flex-row sm:items-start">
              <div className="skeleton-shimmer h-32 w-full shrink-0 rounded-xl sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-1/2 rounded" />
                <div className="skeleton-shimmer h-3 w-full rounded" />
                <div className="flex gap-2 pt-1">
                  <div className="skeleton-shimmer h-5 w-16 rounded-full" />
                  <div className="skeleton-shimmer h-5 w-20 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && (
        <EmptyState
          icon={AlertTriangle}
          title="Couldn't load your saved recipes"
          description="Something went wrong on our end. Try again?"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      )}

      {/* Empty state */}
      {!isLoading && !isError && (!savedRecipes || savedRecipes.length === 0) && (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Generate some meals and save the ones you'll want to make again."
        />
      )}

      {/* Recipe list */}
      {savedRecipes && savedRecipes.length > 0 && (
        <div className="space-y-3">
          {savedRecipes.map((saved, i) => (
            <div
              key={saved.id}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 60, 300)}ms` }}
            >
              <SavedRecipeCard savedRecipe={saved} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
