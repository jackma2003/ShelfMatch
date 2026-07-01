import Link from "next/link";
import type { Recipe } from "@/hooks/use-recipes";
import { cn } from "@/lib/utils";

const DIFFICULTY_CONFIG = {
  EASY: { label: "Easy", className: "bg-green-100 text-green-700" },
  MEDIUM: { label: "Medium", className: "bg-amber-100 text-amber-700" },
  HARD: { label: "Hard", className: "bg-red-100 text-red-700" },
} as const;

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const fullMatch = recipe.matchedCount === recipe.totalCount;
  const matchPercent = recipe.totalCount > 0
    ? Math.round((recipe.matchedCount / recipe.totalCount) * 100)
    : 0;
  const difficulty = DIFFICULTY_CONFIG[recipe.difficulty];

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <div className="flex h-full flex-col gap-4 rounded-2xl bg-card p-5 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/30">
        {/* Header */}
        <div className="flex-1">
          <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
            {recipe.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {recipe.description}
          </p>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            ⏱ {recipe.cookTimeMinutes} min
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
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Ingredients you have</span>
            <span className={cn("font-semibold", fullMatch ? "text-green-600" : "text-amber-600")}>
              {recipe.matchedCount}/{recipe.totalCount}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                fullMatch ? "bg-green-500" : "bg-amber-400",
              )}
              style={{ width: `${matchPercent}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
