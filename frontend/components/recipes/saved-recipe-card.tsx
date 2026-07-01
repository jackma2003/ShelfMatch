"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnsaveRecipe, useUpdateSavedRecipeStatus, type SavedRecipe } from "@/hooks/use-saved-recipes";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  FAVORITE: { label: "Favorite", emoji: "❤️", className: "bg-rose-100 text-rose-700" },
  COOKED: { label: "Cooked", emoji: "✅", className: "bg-green-100 text-green-700" },
  PLANNED: { label: "Planned", emoji: "📅", className: "bg-blue-100 text-blue-700" },
} as const;

export function SavedRecipeCard({ savedRecipe }: { savedRecipe: SavedRecipe }) {
  const updateStatus = useUpdateSavedRecipeStatus();
  const unsave = useUnsaveRecipe();
  const { recipe } = savedRecipe;
  const statusCfg = STATUS_CONFIG[savedRecipe.status as keyof typeof STATUS_CONFIG];
  const fullMatch = recipe.matchedCount === recipe.totalCount;

  return (
    <div className="group flex flex-col gap-3 rounded-2xl bg-card p-5 ring-1 ring-border transition-all hover:ring-primary/30 sm:flex-row sm:items-start">
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <Link
          href={`/recipes/${recipe.id}`}
          className="font-semibold hover:text-primary transition-colors"
        >
          {recipe.title}
        </Link>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {recipe.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
            ⏱ {recipe.cookTimeMinutes} min
          </span>
          <span
            className={cn(
              "text-xs rounded-full px-2.5 py-0.5 font-medium",
              fullMatch ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
            )}
          >
            {recipe.matchedCount}/{recipe.totalCount} ingredients
          </span>
          {statusCfg && (
            <span className={cn("text-xs rounded-full px-2.5 py-0.5 font-medium", statusCfg.className)}>
              {statusCfg.emoji} {statusCfg.label}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={savedRecipe.status}
          onValueChange={(status) => {
            if (status) updateStatus.mutate({ id: savedRecipe.id, status });
          }}
        >
          <SelectTrigger size="sm" className="w-auto min-w-[100px]">
            <SelectValue>
              {(value: string | null) =>
                value ? STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.label ?? value : ""
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
              <SelectItem key={value} value={value}>
                {cfg.emoji} {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={unsave.isPending}
          onClick={() => unsave.mutate(savedRecipe.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
