import Link from "next/link";
import { ChefHat, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Recipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", variant: "success" as const },
  MEDIUM: { label: "Medium", variant: "warning" as const },
  HARD: { label: "Hard", variant: "destructive" as const },
} as const;

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const hasMatchInfo = typeof recipe.totalCount === "number" && recipe.totalCount > 0;
  const fullMatch = recipe.matchedCount === recipe.totalCount;
  const matchPercent = hasMatchInfo
    ? Math.round((recipe.matchedCount / recipe.totalCount) * 100)
    : 0;
  const difficulty = DIFFICULTY_CONFIG[recipe.difficulty];

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <Card className="hover:ring-primary/30 h-full gap-0 py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt="" className="h-32 w-full object-cover" />
        ) : (
          <div className="from-primary/15 to-primary/5 flex h-32 w-full items-center justify-center bg-linear-to-br">
            <ChefHat className="text-primary/40 size-8" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-4 p-5">
          {/* Header */}
          <div className="flex-1">
            <h3 className="group-hover:text-primary leading-snug font-semibold transition-colors">
              {recipe.title}
            </h3>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="muted">
              <Clock /> {recipe.cookTimeMinutes} min
            </Badge>
            <Badge variant={difficulty.variant}>{difficulty.label}</Badge>
          </div>

          {/* Ingredient match */}
          {hasMatchInfo && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ingredients you have</span>
                <span className={cn("font-semibold", fullMatch ? "text-success" : "text-primary")}>
                  {recipe.matchedCount}/{recipe.totalCount}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    fullMatch ? "bg-success" : "bg-primary",
                  )}
                  style={{ width: `${matchPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
