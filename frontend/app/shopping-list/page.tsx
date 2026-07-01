"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { ShoppingListItemRow } from "@/components/recipes/shopping-list-item-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddShoppingListItem, useShoppingListItems, type ShoppingListItem } from "@/hooks/use-shopping-list";

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

function ShoppingListContent() {
  const { data: items, isLoading } = useShoppingListItems();
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
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopping list</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add items manually or let ShelfMatch add missing recipe ingredients for you.
          </p>
        </div>

        {/* Add form */}
        <div className="rounded-2xl bg-card ring-1 ring-border p-6">
          <h2 className="mb-5 font-semibold">Add an item</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sl-name">Name</Label>
              <Input id="sl-name" placeholder="e.g. Olive oil" className="h-10" {...register("name")} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-quantity">Quantity</Label>
              <Input id="sl-quantity" type="number" step="any" placeholder="1" className="h-10" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-destructive text-sm">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sl-unit">Unit</Label>
              <Input id="sl-unit" placeholder="e.g. bottle" className="h-10" {...register("unit")} />
              {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={addItem.isPending} className="h-9">
                {addItem.isPending ? "Adding..." : "Add to list"}
              </Button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your list</h2>
            {totalCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {checkedCount}/{totalCount} checked
              </span>
            )}
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && (!items || items.length === 0) && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
              <ShoppingCart className="size-10 text-muted-foreground/40" />
              <p className="font-medium">Your list is empty</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                Add an item above, or generate a recipe and tap &ldquo;Add missing ingredients&rdquo;.
              </p>
            </div>
          )}

          {items && items.length > 0 && (
            <div className="space-y-6">
              {groupByRecipe(items).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {groupName}
                  </h3>
                  <div className="rounded-xl border bg-card px-4">
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
    </div>
  );
}

export default function ShoppingListPage() {
  return (
    <AuthGuard>
      <ShoppingListContent />
    </AuthGuard>
  );
}
