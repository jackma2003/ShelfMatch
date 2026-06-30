"use client";

import { useState } from "react";

import { PantryItemForm } from "@/components/pantry/pantry-item-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeletePantryItem, useUpdatePantryItem, type PantryItem } from "@/hooks/use-pantry";
import type { PantryItemFormValues } from "@/lib/validators/pantry";

function daysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function ExpirationBadge({ expirationDate }: { expirationDate: string | null }) {
  if (!expirationDate) return null;

  const days = daysUntil(expirationDate);
  const label =
    days < 0
      ? "Expired"
      : days === 0
        ? "Expires today"
        : days === 1
          ? "Expires tomorrow"
          : `Expires in ${days}d`;
  const variant = days <= 2 ? "destructive" : "secondary";

  return <Badge variant={variant}>{label}</Badge>;
}

export function PantryItemRow({ item }: { item: PantryItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateItem = useUpdatePantryItem();
  const deleteItem = useDeletePantryItem();

  const handleUpdate = (values: PantryItemFormValues) => {
    updateItem.mutate(
      { id: item.id, input: values },
      { onSuccess: () => setEditOpen(false) },
    );
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{item.name}</p>
        <p className="text-muted-foreground text-sm">
          {item.quantity} {item.unit}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ExpirationBadge expirationDate={item.expirationDate} />
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>Edit</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {item.name}</DialogTitle>
            </DialogHeader>
            <PantryItemForm
              defaultValues={{
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                expirationDate: item.expirationDate?.slice(0, 10) ?? "",
              }}
              onSubmit={handleUpdate}
              submitLabel="Save changes"
              isPending={updateItem.isPending}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="sm"
          disabled={deleteItem.isPending}
          onClick={() => deleteItem.mutate(item.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
