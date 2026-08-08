"use client";

import { useState } from "react";

import { PantryItemForm } from "@/components/pantry/pantry-item-form";
import { PantryList } from "@/components/pantry/pantry-list";
import { Card, CardContent } from "@/components/ui/card";
import { FilterButton } from "@/components/ui/filter-button";
import { useCreatePantryItem, usePantryItems } from "@/hooks/use-pantry";
import { celebrate } from "@/lib/celebrate";
import { playClick } from "@/lib/sound";
import type { PantryItemFormValues } from "@/lib/validators/pantry";

export default function PantryPage() {
  const [sortExpiring, setSortExpiring] = useState(false);
  const createItem = useCreatePantryItem();
  const { data: items } = usePantryItems();

  const handleCreate = (values: PantryItemFormValues) => {
    // Captured before the mutation fires — by the time onSuccess runs, the pantry query has
    // already been invalidated/refetched with the new item, so this is the only point where
    // "was the pantry empty" is still knowable.
    const wasEmpty = (items?.length ?? 0) === 0;
    playClick();
    createItem.mutate(values, {
      onSuccess: () => {
        if (wasEmpty) celebrate();
      },
    });
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      {/* Page header */}
      <div>
        <h1 className="font-heading text-2xl tracking-tight">Your pantry</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Keep track of what you have on hand so ShelfMatch can find the right recipes for you.
        </p>
      </div>

      {/* Add item form */}
      <Card>
        <CardContent>
          <h2 className="font-heading mb-5 font-semibold">Add an item</h2>
          <PantryItemForm
            onSubmit={handleCreate}
            submitLabel="Add to pantry"
            isPending={createItem.isPending}
          />
        </CardContent>
      </Card>

      {/* Filter + list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold">Items</h2>
          <div className="flex gap-2">
            <FilterButton active={!sortExpiring} onClick={() => setSortExpiring(false)}>
              All
            </FilterButton>
            <FilterButton active={sortExpiring} onClick={() => setSortExpiring(true)}>
              Expiring soon
            </FilterButton>
          </div>
        </div>

        <PantryList sortExpiring={sortExpiring} />
      </div>
    </main>
  );
}
