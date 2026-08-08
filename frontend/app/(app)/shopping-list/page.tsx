"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { z } from "zod";

import { ShoppingListItemRow } from "@/components/recipes/shopping-list-item-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAddShoppingListItem,
  useShoppingListItems,
  type ShoppingListItem,
} from "@/hooks/use-shopping-list";
import { ApiError } from "@/lib/api-client";
import { celebrate } from "@/lib/celebrate";
import { playClick } from "@/lib/sound";
import { cn } from "@/lib/utils";

const manualAddSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required").max(20),
});
type ManualAddInput = z.input<typeof manualAddSchema>;
type ManualAddValues = z.output<typeof manualAddSchema>;

function groupByRecipe(items: ShoppingListItem[]): [string, ShoppingListItem[]][] {
  const groups = new Map<string, ShoppingListItem[]>();
  for (const item of items) {
    const key = item.recipe?.title ?? "Other items";
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return [...groups.entries()];
}

export default function ShoppingListPage() {
  const { data: items, isLoading, isError, refetch } = useShoppingListItems();
  const addItem = useAddShoppingListItem();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManualAddInput, unknown, ManualAddValues>({
    resolver: zodResolver(manualAddSchema),
    defaultValues: { name: "", quantity: "", unit: "" },
  });

  const onSubmit = (values: ManualAddValues) => {
    playClick();
    addItem.mutate(values, { onSuccess: () => reset({ name: "", quantity: "", unit: "" }) });
  };

  const checkedCount = items?.filter((i) => i.isChecked).length ?? 0;
  const totalCount = items?.length ?? 0;

  // Pops the counter on any change *after* the list has first loaded — not on the initial
  // load itself, which would otherwise pop the moment real data replaces the loading state
  // even though the user didn't just do anything. Also celebrates the moment the list first
  // reaches 100% checked (not on every render while it stays at 100% — guarded by comparing
  // against the *previous* count so re-checking an already-complete list doesn't re-fire it).
  const [countPopKey, setCountPopKey] = useState(0);
  const prevCheckedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!items) return;
    const prevChecked = prevCheckedRef.current;
    if (prevChecked !== null && prevChecked !== checkedCount) {
      setCountPopKey((k) => k + 1);
      if (totalCount > 0 && checkedCount === totalCount && prevChecked < totalCount) {
        celebrate();
      }
    }
    prevCheckedRef.current = checkedCount;
  }, [items, checkedCount, totalCount]);

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl tracking-tight">Shopping list</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add items manually or let ShelfMatch add missing recipe ingredients for you.
        </p>
      </div>

      {/* Add form */}
      <Card>
        <CardContent>
          <h2 className="font-heading mb-5 font-semibold">Add an item</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sl-name">Name</Label>
              <Input
                id="sl-name"
                placeholder="e.g. Olive oil"
                className="h-10"
                {...register("name")}
              />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-quantity">Quantity</Label>
              <Input
                id="sl-quantity"
                type="number"
                step="any"
                min="0"
                placeholder="1"
                className="h-10"
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-destructive text-sm">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-unit">Unit</Label>
              <Input
                id="sl-unit"
                placeholder="e.g. bottle"
                className="h-10"
                {...register("unit")}
              />
              {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
            </div>
            {addItem.isError && (
              <p className="bg-destructive/10 text-destructive animate-fade-in col-span-2 rounded-lg px-3 py-2 text-sm">
                {addItem.error instanceof ApiError ? addItem.error.message : "Something went wrong"}
              </p>
            )}
            <div className="col-span-2">
              <Button type="submit" disabled={addItem.isPending} className="h-9">
                {addItem.isPending ? "Adding..." : "Add to list"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold">Your list</h2>
          {totalCount > 0 && (
            <motion.span
              key={countPopKey}
              initial={countPopKey > 0 ? { scale: 1.25 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.6, duration: 0.35 }}
              className={cn(
                "text-sm",
                checkedCount === totalCount
                  ? "text-success font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {checkedCount}/{totalCount} checked
            </motion.span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((g) => (
              <div key={g}>
                <div className="skeleton-shimmer mb-2 h-3 w-24 rounded" />
                <Card className="gap-0 px-4 py-0">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 border-b py-3 last:border-b-0">
                      <div className="skeleton-shimmer size-4.5 shrink-0 rounded-md" />
                      <div className="skeleton-shimmer h-4 w-40 rounded" />
                    </div>
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load your list"
            description="Something went wrong on our end. Try again?"
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        )}

        {!isLoading && !isError && (!items || items.length === 0) && (
          <EmptyState
            icon={ShoppingCart}
            title="Your list is empty"
            description={`Add an item above, or generate a recipe and tap "Add missing ingredients".`}
          />
        )}

        {items && items.length > 0 && (
          <div className="space-y-6">
            {groupByRecipe(items).map(([groupName, groupItems]) => (
              <div key={groupName}>
                <h3 className="text-muted-foreground mb-2 text-xs font-semibold tracking-widest uppercase">
                  {groupName}
                </h3>
                <Card className="gap-0 px-4 py-0">
                  {groupItems.map((item, i) => (
                    <ShoppingListItemRow
                      key={item.id}
                      item={item}
                      className="animate-fade-in"
                      style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                    />
                  ))}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
