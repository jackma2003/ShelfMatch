"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ShoppingListItemRow } from "@/components/recipes/shopping-list-item-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddShoppingListItem,
  useShoppingListItems,
  type ShoppingListItem,
} from "@/hooks/use-shopping-list";

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
    addItem.mutate(values, { onSuccess: () => reset({ name: "", quantity: "", unit: "" }) });
  };

  const checkedCount = items?.filter((i) => i.isChecked).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shopping list</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Add items manually or let ShelfMatch add missing recipe ingredients for you.
        </p>
      </div>

      {/* Add form */}
      <Card>
        <CardContent>
          <h2 className="mb-5 font-semibold">Add an item</h2>
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
          <h2 className="font-semibold">Your list</h2>
          {totalCount > 0 && (
            <span className="text-muted-foreground text-sm">
              {checkedCount}/{totalCount} checked
            </span>
          )}
        </div>

        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12" />
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
                <div className="bg-card rounded-2xl border px-4">
                  {groupItems.map((item) => (
                    <ShoppingListItemRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
