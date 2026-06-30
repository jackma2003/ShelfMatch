"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { ShoppingListItemRow } from "@/components/recipes/shopping-list-item-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-2xl space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add to shopping list</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="sl-name">Name</Label>
                <Input id="sl-name" placeholder="e.g. Olive oil" {...register("name")} />
                {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sl-quantity">Quantity</Label>
                <Input id="sl-quantity" type="number" step="any" {...register("quantity")} />
                {errors.quantity && (
                  <p className="text-destructive text-sm">{errors.quantity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sl-unit">Unit</Label>
                <Input id="sl-unit" placeholder="e.g. bottle" {...register("unit")} />
                {errors.unit && <p className="text-destructive text-sm">{errors.unit.message}</p>}
              </div>
              <Button type="submit" className="col-span-2 w-fit" disabled={addItem.isPending}>
                {addItem.isPending ? "Adding..." : "Add item"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Your shopping list</h2>
          {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
          {!isLoading && (!items || items.length === 0) && (
            <p className="text-muted-foreground text-sm">
              Your shopping list is empty. Add an item above, or generate a recipe and add its
              missing ingredients.
            </p>
          )}
          <div className="space-y-6">
            {items &&
              groupByRecipe(items).map(([groupName, groupItems]) => (
                <div key={groupName}>
                  <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
                    {groupName}
                  </h3>
                  <div className="rounded-lg border px-4">
                    {groupItems.map((item) => (
                      <ShoppingListItemRow key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
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
