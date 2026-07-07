"use client";

import Link from "next/link";
import { CalendarClock, CheckCircle2, ChefHat, Clock, Heart, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

const STATUS_CONFIG = {
  FAVORITE: { label: "Favorite", icon: Heart, variant: "favorite" as const },
  COOKED: { label: "Cooked", icon: CheckCircle2, variant: "success" as const },
  PLANNED: { label: "Planned", icon: CalendarClock, variant: "planned" as const },
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
      <div className="shrink-0">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt=""
            className="h-32 w-full rounded-xl object-cover sm:h-20 sm:w-20"
          />
        ) : (
          <div className="from-primary/15 to-primary/5 flex h-32 w-full items-center justify-center rounded-xl bg-linear-to-br sm:h-20 sm:w-20">
            <ChefHat className="text-primary/40 size-6" />
          </div>
        )}
      </div>
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
          <Badge variant="muted">
            <Clock /> {recipe.cookTimeMinutes} min
          </Badge>
          {hasMatchInfo && (
            <Badge variant={fullMatch ? "success" : "warning"}>
              {recipe.matchedCount}/{recipe.totalCount} ingredients
            </Badge>
          )}
          {statusCfg && (
            <Badge variant={statusCfg.variant}>
              <statusCfg.icon /> {statusCfg.label}
            </Badge>
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
