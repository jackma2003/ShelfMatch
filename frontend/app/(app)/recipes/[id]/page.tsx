"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { AddMissingButton } from "@/components/recipes/add-missing-button";
import { RecipeImage } from "@/components/recipes/recipe-image";
import { SaveRecipeButton } from "@/components/recipes/save-recipe-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useRecipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", variant: "success" as const },
  MEDIUM: { label: "Medium", variant: "warning" as const },
  HARD: { label: "Hard", variant: "destructive" as const },
} as const;

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: recipe, isLoading, isError } = useRecipe(params.id);

  // Starts at 0 and animates up to the real value on mount (hooks must run before the
  // early returns below), so the match bar reads as a "reveal" rather than a static stat.
  const matchPercent =
    recipe && recipe.totalCount > 0
      ? Math.round((recipe.matchedCount / recipe.totalCount) * 100)
      : 0;
  const [displayPercent, setDisplayPercent] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayPercent(matchPercent));
    return () => cancelAnimationFrame(id);
  }, [matchPercent]);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        <div className="skeleton-shimmer h-8 w-20 rounded-lg" />
        <div className="skeleton-shimmer h-48 w-full rounded-2xl sm:h-64" />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="skeleton-shimmer h-7 w-2/3 rounded" />
            <div className="skeleton-shimmer h-4 w-full rounded" />
          </div>
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-6 w-20 rounded-full" />
            <div className="skeleton-shimmer h-6 w-20 rounded-full" />
            <div className="skeleton-shimmer h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="skeleton-shimmer h-5 w-24 rounded" />
          <Card className="gap-0 py-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b px-4 py-2.5 last:border-b-0">
                <div className="skeleton-shimmer h-4 w-full rounded" />
              </div>
            ))}
          </Card>
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

      <RecipeImage
        imageUrl={recipe.imageUrl}
        className="h-48 w-full rounded-2xl sm:h-64"
        iconClassName="size-10"
      />

      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="font-heading text-2xl tracking-tight">{recipe.title}</h1>
          <p className="text-muted-foreground mt-1.5 leading-relaxed">{recipe.description}</p>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">
            <Clock /> {recipe.cookTimeMinutes} min
          </Badge>
          <Badge variant={difficulty.variant}>{difficulty.label}</Badge>
          <Badge variant={fullMatch ? "success" : "warning"}>
            {fullMatch ? "✓" : "~"} {recipe.matchedCount}/{recipe.totalCount} ingredients
          </Badge>
        </div>

        {/* Match bar — styled like a game XP bar */}
        <div className="bg-muted border-border h-3 overflow-hidden rounded-full border-2">
          <div
            className={cn(
              "h-full rounded-full bg-linear-to-b transition-[width] duration-700 ease-out",
              fullMatch ? "from-success/80 to-success" : "from-gold/80 to-gold",
            )}
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <SaveRecipeButton recipeId={recipe.id} />
          {!fullMatch && <AddMissingButton recipeId={recipe.id} />}
        </div>
      </div>

      {/* Ingredients */}
      <div className="space-y-3">
        <h2 className="font-heading text-base font-semibold">Ingredients</h2>
        <Card className="gap-0 divide-y py-0">
          {recipe.ingredients.map((ingredient) => (
            <div key={ingredient.id} className="flex items-center gap-3 px-4 py-2.5">
              {ingredient.inPantry ? (
                <CheckCircle2 className="text-success size-4 shrink-0" />
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
        </Card>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <h2 className="font-heading text-base font-semibold">Instructions</h2>
        <ol className="space-y-3">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="bg-gold text-foreground font-heading mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs">
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
