import Link from "next/link";
import { Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Recipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", className: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  HARD: { label: "Hard", className: "bg-red-100 text-red-700" },
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
        {recipe.imageUrl && (
          <img src={recipe.imageUrl} alt="" className="h-32 w-full object-cover" />
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
            <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium">
              <Clock className="size-3.5" /> {recipe.cookTimeMinutes} min
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                difficulty.className,
              )}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Ingredient match */}
          {hasMatchInfo && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ingredients you have</span>
                <span
                  className={cn("font-semibold", fullMatch ? "text-green-600" : "text-amber-600")}
                >
                  {recipe.matchedCount}/{recipe.totalCount}
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    fullMatch ? "bg-green-500" : "bg-amber-400",
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
