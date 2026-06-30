import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recipe } from "@/hooks/use-recipes";

const DIFFICULTY_LABELS: Record<Recipe["difficulty"], string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const fullMatch = recipe.matchedCount === recipe.totalCount;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>{recipe.title}</CardTitle>
          <CardDescription>{recipe.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{recipe.cookTimeMinutes} min</Badge>
          <Badge variant="secondary">{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
          <Badge variant={fullMatch ? "secondary" : "destructive"}>
            You have {recipe.matchedCount}/{recipe.totalCount} ingredients
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
