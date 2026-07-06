"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useState } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { FilterButton } from "@/components/ui/filter-button";
import { type DietaryTag, type Recipe, useGenerateRecipes } from "@/hooks/use-recipes";
import { ApiError } from "@/lib/api-client";

const STORAGE_KEY = "shelfmatch:generated-recipes";

const DIETARY_TAGS: { value: DietaryTag | undefined; label: string }[] = [
  { value: undefined, label: "Any diet" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
];

const FRIENDLY_ERRORS: Record<string, string> = {
  EMPTY_PANTRY: "Add some items to your pantry first, then come back to generate meals.",
  AI_NOT_CONFIGURED: "Recipe generation isn't set up yet — check back soon.",
  AI_INVALID_JSON: "The AI gave us something we couldn't read. Try again.",
  AI_INVALID_SHAPE: "The AI's response didn't look right. Try again.",
  AI_EMPTY_RESPONSE: "The AI didn't return anything. Try again.",
};

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function GenerateContent() {
  const generate = useGenerateRecipes();
  const [quickOnly, setQuickOnly] = useState(false);
  const [dietaryTag, setDietaryTag] = useState<DietaryTag | undefined>(undefined);

  const [persistedRecipes, setPersistedRecipes] = useState<Recipe[] | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Recipe[]) : null;
    } catch {
      return null;
    }
  });

  const displayedRecipes = generate.isSuccess ? generate.data.recipes : persistedRecipes;

  const errorMessage =
    generate.error instanceof ApiError
      ? (generate.error.code && FRIENDLY_ERRORS[generate.error.code]) || generate.error.message
      : "Something went wrong";

  const handleGenerate = () => {
    generate.mutate(
      { maxCookTimeMinutes: quickOnly ? 20 : undefined, dietaryTag },
      {
        onSuccess: ({ recipes }) => {
          setPersistedRecipes(recipes);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
        },
      },
    );
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">What can I make?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ShelfMatch will suggest meals based on what&apos;s in your pantry.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generate.isPending}
            className="shrink-0 gap-2"
            size="lg"
          >
            <Sparkles className="size-4" />
            {generate.isPending ? "Thinking..." : "Generate meals"}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <FilterButton active={!quickOnly} onClick={() => setQuickOnly(false)}>
              Any time
            </FilterButton>
            <FilterButton active={quickOnly} onClick={() => setQuickOnly(true)}>
              Quick (~20 min)
            </FilterButton>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {DIETARY_TAGS.map((tag) => (
              <FilterButton
                key={tag.label}
                active={dietaryTag === tag.value}
                onClick={() => setDietaryTag(tag.value)}
              >
                {tag.label}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* Error state */}
        {generate.isError && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 space-y-2">
            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
            {generate.error instanceof ApiError && generate.error.code === "EMPTY_PANTRY" && (
              <Link
                href="/pantry"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                → Go to pantry
              </Link>
            )}
          </div>
        )}

        {/* Loading */}
        {generate.isPending && (
          <>
            <p className="text-sm text-muted-foreground animate-pulse">
              Looking at your pantry and dreaming up something delicious...
            </p>
            <LoadingSkeleton />
          </>
        )}

        {/* Empty / initial state */}
        {!generate.isPending && !generate.isError && !displayedRecipes && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
            <img src="/icon.svg" className="size-16" alt="" />
            <div>
              <p className="font-medium">Ready when you are</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
                Hit &ldquo;Generate meals&rdquo; and we&apos;ll suggest recipes based on what&apos;s in your pantry.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!generate.isPending && !generate.isError && displayedRecipes && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {displayedRecipes.length} meal
              {displayedRecipes.length !== 1 ? "s" : ""} you can make right now.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {displayedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function GenerateRecipesPage() {
  return (
    <AuthGuard>
      <GenerateContent />
    </AuthGuard>
  );
}
