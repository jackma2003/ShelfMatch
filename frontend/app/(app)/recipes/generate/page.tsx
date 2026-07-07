"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
  AI_TIMEOUT: "This is taking longer than usual. Please try again.",
};

// Progresses one message at a time and holds on the last one — never loops back, since a
// restarting message reads as "stuck" once the real wait runs longer than the cycle.
const STATUS_MESSAGES = [
  "Looking at what's in your pantry...",
  "Prioritizing ingredients about to expire...",
  "Dreaming up recipes that fit what you have...",
  "Double-checking cook times and steps...",
  "Plating things up...",
];
const STATUS_INTERVAL_MS = 2600;

// Mounted fresh (via a `key` on the caller) for each generation, so it always starts at the
// first message rather than needing to reset state when a previous run left it further along.
function RotatingStatus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1));
    }, STATUS_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const message = STATUS_MESSAGES[index];

  return (
    <div className="flex items-center gap-2">
      <Sparkles className="text-primary size-4 shrink-0 animate-pulse" />
      <p key={message} className="text-muted-foreground animate-fade-in text-sm">
        {message}
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="animate-fade-in space-y-3 rounded-xl border p-4"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="skeleton-shimmer h-28 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-3/4 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
            <div className="skeleton-shimmer h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GenerateRecipesPage() {
  const generate = useGenerateRecipes();
  const [quickOnly, setQuickOnly] = useState(false);
  const [dietaryTag, setDietaryTag] = useState<DietaryTag | undefined>(undefined);
  const [generationCount, setGenerationCount] = useState(0);

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
    setGenerationCount((count) => count + 1);
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
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">What can I make?</h1>
          <p className="text-muted-foreground mt-1 text-sm">
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
        <div className="bg-destructive/10 space-y-2 rounded-lg px-3 py-2">
          <p className="text-destructive text-sm font-medium">{errorMessage}</p>
          {generate.error instanceof ApiError && generate.error.code === "EMPTY_PANTRY" && (
            <Link
              href="/pantry"
              className="text-primary text-sm font-medium underline-offset-4 hover:underline"
            >
              → Go to pantry
            </Link>
          )}
        </div>
      )}

      {/* Loading */}
      {generate.isPending && (
        <>
          <RotatingStatus key={generationCount} />
          <LoadingSkeleton />
        </>
      )}

      {/* Empty / initial state */}
      {!generate.isPending && !generate.isError && !displayedRecipes && (
        <EmptyState
          icon={Sparkles}
          title="Ready when you are"
          description={`Hit "Generate meals" and we'll suggest recipes based on what's in your pantry.`}
        />
      )}

      {/* Results */}
      {!generate.isPending && !generate.isError && displayedRecipes && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
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
  );
}
