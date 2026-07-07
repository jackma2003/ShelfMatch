"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";

import { AddMissingButton } from "@/components/recipes/add-missing-button";
import { SaveRecipeButton } from "@/components/recipes/save-recipe-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", className: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  HARD: { label: "Hard", className: "bg-red-100 text-red-700" },
} as const;

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(params.id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </main>
    );
  }

  if (isError || !recipe) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <EmptyState
          title="Recipe not found"
          description="This recipe may have been removed, or the link is incorrect."
          action={
            <Button variant="outline" render={<Link href="/recipes/generate" />}>
              Back to recipes
            </Button>
          }
        />
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt=""
          className="h-48 w-full rounded-2xl object-cover sm:h-64"
        />
      )}

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{recipe.title}</h1>
          <p className="text-muted-foreground mt-1.5 leading-relaxed">{recipe.description}</p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium">
            <Clock className="size-3.5" /> {recipe.cookTimeMinutes} min
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
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={cn("h-full rounded-full", fullMatch ? "bg-green-500" : "bg-amber-400")}
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
        <h2 className="text-base font-semibold">Ingredients</h2>
        <div className="bg-card divide-y rounded-2xl border">
          {recipe.ingredients.map((ingredient) => (
            <div key={ingredient.id} className="flex items-center gap-3 px-4 py-2.5">
              {ingredient.inPantry ? (
                <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              ) : (
                <XCircle className="text-muted-foreground/40 size-4 shrink-0" />
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
        <h2 className="text-base font-semibold">Instructions</h2>
        <ol className="space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-primary/10 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-foreground pt-0.5 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
