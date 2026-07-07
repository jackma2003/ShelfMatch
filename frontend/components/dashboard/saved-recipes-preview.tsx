"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSavedRecipes } from "@/hooks/use-saved-recipes";

const PREVIEW_COUNT = 3;

export function SavedRecipesPreview() {
  const { data: savedRecipes, isLoading } = useSavedRecipes();
  const preview = (savedRecipes ?? []).slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Saved recipes</h2>
        {preview.length > 0 && (
          <Link
            href="/saved"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            View all
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52" />
          ))}
        </div>
      ) : preview.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Generate some meals and save the ones you'll want to make again."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((saved) => (
            <RecipeCard key={saved.id} recipe={saved.recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
