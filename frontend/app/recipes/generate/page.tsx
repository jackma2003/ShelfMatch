"use client";

import Link from "next/link";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { Button } from "@/components/ui/button";
import { useGenerateRecipes } from "@/hooks/use-recipes";
import { ApiError } from "@/lib/api-client";

const FRIENDLY_ERRORS: Record<string, string> = {
  EMPTY_PANTRY: "Add some items to your pantry first, then come back to generate meals.",
  AI_NOT_CONFIGURED: "Recipe generation isn't set up yet — check back soon.",
  AI_INVALID_JSON: "The AI gave us something we couldn't read. Try again.",
  AI_INVALID_SHAPE: "The AI's response didn't look right. Try again.",
  AI_EMPTY_RESPONSE: "The AI didn't return anything. Try again.",
};

function GenerateContent() {
  const generate = useGenerateRecipes();

  const errorMessage =
    generate.error instanceof ApiError
      ? (generate.error.code && FRIENDLY_ERRORS[generate.error.code]) || generate.error.message
      : "Something went wrong";

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">What can I make right now?</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              We&apos;ll suggest meals based on what&apos;s in your pantry.
            </p>
          </div>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending}>
            {generate.isPending ? "Thinking..." : "Generate meals"}
          </Button>
        </div>

        {generate.isError && (
          <div className="space-y-2">
            <p className="text-destructive text-sm">{errorMessage}</p>
            {generate.error instanceof ApiError && generate.error.code === "EMPTY_PANTRY" && (
              <Link href="/pantry" className="text-foreground text-sm underline underline-offset-4">
                Go to pantry
              </Link>
            )}
          </div>
        )}

        {generate.isPending && (
          <p className="text-muted-foreground text-sm">
            Looking at your pantry and dreaming up some meals...
          </p>
        )}

        {generate.isSuccess && (
          <div className="grid gap-4 sm:grid-cols-2">
            {generate.data.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
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
