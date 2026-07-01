"use client";

import { useState } from "react";

import { PantryItemForm } from "@/components/pantry/pantry-item-form";
import { PantryList } from "@/components/pantry/pantry-list";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { useCreatePantryItem } from "@/hooks/use-pantry";
import type { PantryItemFormValues } from "@/lib/validators/pantry";
import { cn } from "@/lib/utils";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function PantryContent() {
  const [sortExpiring, setSortExpiring] = useState(false);
  const createItem = useCreatePantryItem();

  const handleCreate = (values: PantryItemFormValues) => {
    createItem.mutate(values);
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your pantry</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of what you have on hand so ShelfMatch can find the right recipes for you.
          </p>
        </div>

        {/* Add item form */}
        <div className="rounded-2xl bg-card ring-1 ring-border p-6">
          <h2 className="mb-5 font-semibold">Add an item</h2>
          <PantryItemForm
            onSubmit={handleCreate}
            submitLabel="Add to pantry"
            isPending={createItem.isPending}
          />
        </div>

        {/* Filter + list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base">Items</h2>
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
    </div>
  );
}

export default function PantryPage() {
  return (
    <AuthGuard>
      <PantryContent />
    </AuthGuard>
  );
}
