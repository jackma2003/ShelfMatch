"use client";

import { useParams } from "next/navigation";

import { AddMissingButton } from "@/components/recipes/add-missing-button";
import { SaveRecipeButton } from "@/components/recipes/save-recipe-button";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { useRecipe } from "@/hooks/use-recipes";

const DIFFICULTY_LABELS = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" } as const;

function RecipeDetailContent() {
  const params = useParams<{ id: string }>();
  const { data: recipe, isLoading, isError } = useRecipe(params.id);

  if (isLoading) {
    return <p className="text-muted-foreground p-6 text-sm">Loading recipe...</p>;
  }

  if (isError || !recipe) {
    return <p className="text-destructive p-6 text-sm">Recipe not found.</p>;
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{recipe.title}</h1>
        <p className="text-muted-foreground mt-1">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary">{recipe.cookTimeMinutes} min</Badge>
          <Badge variant="secondary">{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
          <Badge variant={recipe.matchedCount === recipe.totalCount ? "secondary" : "destructive"}>
            You have {recipe.matchedCount}/{recipe.totalCount} ingredients
          </Badge>
        </div>
        <div className="mt-4 flex gap-2">
          <SaveRecipeButton recipeId={recipe.id} />
          <AddMissingButton recipeId={recipe.id} />
        </div>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Ingredients</h2>
        <ul className="space-y-1">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id} className="flex items-center gap-2 text-sm">
              <span className={ingredient.inPantry ? "text-foreground" : "text-destructive"}>
                {ingredient.inPantry ? "✓" : "✗"}
              </span>
              <span>
                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                {ingredient.isOptional && (
                  <span className="text-muted-foreground"> (optional)</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {recipe.instructions.map((step, i) => (
            <li key={i}>{step}</li>
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
