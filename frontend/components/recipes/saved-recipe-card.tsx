"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUnsaveRecipe, useUpdateSavedRecipeStatus, type SavedRecipe } from "@/hooks/use-saved-recipes";

const STATUS_LABELS = { FAVORITE: "Favorite", COOKED: "Cooked", PLANNED: "Planned" } as const;

export function SavedRecipeCard({ savedRecipe }: { savedRecipe: SavedRecipe }) {
  const updateStatus = useUpdateSavedRecipeStatus();
  const unsave = useUnsaveRecipe();
  const { recipe } = savedRecipe;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link href={`/recipes/${recipe.id}`} className="hover:underline">
            {recipe.title}
          </Link>
        </CardTitle>
        <CardDescription>{recipe.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{recipe.cookTimeMinutes} min</Badge>
        <Badge variant={recipe.matchedCount === recipe.totalCount ? "secondary" : "destructive"}>
          You have {recipe.matchedCount}/{recipe.totalCount} ingredients
        </Badge>
        <Select
          value={savedRecipe.status}
          onValueChange={(status) => {
            if (status) updateStatus.mutate({ id: savedRecipe.id, status });
          }}
        >
          <SelectTrigger size="sm">
            <SelectValue>
              {(value: string | null) => (value ? STATUS_LABELS[value as keyof typeof STATUS_LABELS] : "")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          disabled={unsave.isPending}
          onClick={() => unsave.mutate(savedRecipe.id)}
        >
          Remove
        </Button>
      </CardContent>
    </Card>
  );
}
