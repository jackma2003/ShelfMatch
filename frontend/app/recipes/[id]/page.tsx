"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

import { AddMissingButton } from "@/components/recipes/add-missing-button";
import { SaveRecipeButton } from "@/components/recipes/save-recipe-button";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { useRecipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", className: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  HARD: { label: "Hard", className: "bg-red-100 text-red-700" },
} as const;

function RecipeDetailContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(params.id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="space-y-3">
          <div className="h-8 w-2/3 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-3/4 rounded-lg bg-muted animate-pulse" />
        </div>
      </main>
    );
  }

  if (isError || !recipe) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-destructive">Recipe not found.</p>
      </main>
    );
  }

  const difficulty = DIFFICULTY_CONFIG[recipe.difficulty];
  const fullMatch = recipe.matchedCount === recipe.totalCount;
  const matchPercent =
    recipe.totalCount > 0 ? Math.round((recipe.matchedCount / recipe.totalCount) * 100) : 0;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back
      </button>

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{recipe.title}</h1>
          <p className="mt-1.5 text-muted-foreground leading-relaxed">{recipe.description}</p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
            ⏱ {recipe.cookTimeMinutes} min
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
              difficulty.className,
            )}
          >
            {difficulty.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium",
              fullMatch ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
            )}
          >
            {fullMatch ? "✓" : "~"} {recipe.matchedCount}/{recipe.totalCount} ingredients
          </span>
        </div>

        {/* Match bar */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full",
              fullMatch ? "bg-green-500" : "bg-amber-400",
            )}
            style={{ width: `${matchPercent}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <SaveRecipeButton recipeId={recipe.id} />
          <AddMissingButton recipeId={recipe.id} />
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">Ingredients</h2>
        <div className="rounded-xl border bg-card divide-y">
          {recipe.ingredients.map((ingredient) => (
            <div key={ingredient.id} className="flex items-center gap-3 px-4 py-2.5">
              {ingredient.inPantry ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="size-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  "text-sm",
                  ingredient.inPantry ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                {ingredient.isOptional && (
                  <span className="text-muted-foreground"> (optional)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <h2 className="font-semibold text-base">Instructions</h2>
        <ol className="space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-foreground pt-0.5">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

export default function RecipeDetailPage() {
  return (
    <AuthGuard>
      <Navbar />
      <RecipeDetailContent />
    </AuthGuard>
  );
}
