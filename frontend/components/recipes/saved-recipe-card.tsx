"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, Clock, Heart, Trash2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUnsaveRecipe,
  useUpdateSavedRecipeStatus,
  type SavedRecipe,
} from "@/hooks/use-saved-recipes";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  FAVORITE: { label: "Favorite", icon: Heart, className: "bg-rose-100 text-rose-700" },
  COOKED: { label: "Cooked", icon: CheckCircle2, className: "bg-green-100 text-green-700" },
  PLANNED: { label: "Planned", icon: CalendarClock, className: "bg-blue-100 text-blue-700" },
} as const;

export function SavedRecipeCard({ savedRecipe }: { savedRecipe: SavedRecipe }) {
  const updateStatus = useUpdateSavedRecipeStatus();
  const unsave = useUnsaveRecipe();
  const { recipe } = savedRecipe;
  const statusCfg = STATUS_CONFIG[savedRecipe.status as keyof typeof STATUS_CONFIG];
  const hasMatchInfo = typeof recipe.totalCount === "number" && recipe.totalCount > 0;
  const fullMatch = recipe.matchedCount === recipe.totalCount;

  return (
    <Card className="group hover:ring-primary/30 flex-col gap-3 p-5 transition-all sm:flex-row sm:items-start">
      {recipe.imageUrl && (
        <div className="shrink-0">
          <img
            src={recipe.imageUrl}
            alt=""
            className="h-32 w-full rounded-xl object-cover sm:h-20 sm:w-20"
          />
        </div>
      )}
      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={`/recipes/${recipe.id}`}
          className="hover:text-primary font-semibold transition-colors"
        >
          {recipe.title}
        </Link>
        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
          {recipe.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-muted-foreground bg-muted inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs">
            <Clock className="size-3" /> {recipe.cookTimeMinutes} min
          </span>
          {hasMatchInfo && (
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                fullMatch ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
              )}
            >
              {recipe.matchedCount}/{recipe.totalCount} ingredients
            </span>
          )}
          {statusCfg && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                statusCfg.className,
              )}
            >
              <statusCfg.icon className="size-3" /> {statusCfg.label}
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
                value ? (STATUS_CONFIG[value as keyof typeof STATUS_CONFIG]?.label ?? value) : ""
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
              <SelectItem key={value} value={value}>
                <cfg.icon className="size-3.5" /> {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={unsave.isPending}
          onClick={() => unsave.mutate(savedRecipe.id)}
          aria-label="Remove from saved"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}
