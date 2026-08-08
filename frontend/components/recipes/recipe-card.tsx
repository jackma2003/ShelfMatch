"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RecipeImage } from "@/components/recipes/recipe-image";
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

  // Starts at 0 and animates up to the real value on mount, so the match bar reads as a
  // "reveal" of how well the recipe fits the pantry rather than a static, already-filled stat.
  const [displayPercent, setDisplayPercent] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayPercent(matchPercent));
    return () => cancelAnimationFrame(id);
  }, [matchPercent]);

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <motion.div
        className="h-full"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.3 }}
      >
        <Card className="hover:border-primary-accent h-full gap-0 py-0 transition-colors hover:shadow-md">
          <RecipeImage imageUrl={recipe.imageUrl} className="h-32 w-full" iconClassName="size-8" />
          <div className="flex flex-1 flex-col gap-4 p-5">
            {/* Header */}
            <div className="flex-1">
              <h3 className="group-hover:text-primary-accent font-heading leading-snug font-semibold transition-colors">
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

            {/* Ingredient match — styled like a game XP bar */}
            {hasMatchInfo && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ingredients you have</span>
                  <span
                    className={cn("font-semibold", fullMatch ? "text-success" : "text-terracotta")}
                  >
                    {recipe.matchedCount}/{recipe.totalCount}
                  </span>
                </div>
                <div className="bg-muted border-border h-2.5 overflow-hidden rounded-full border">
                  <div
                    className={cn(
                      "h-full rounded-full bg-linear-to-b transition-[width] duration-700 ease-out",
                      fullMatch ? "from-success/80 to-success" : "from-gold/80 to-gold",
                    )}
                    style={{ width: `${displayPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
