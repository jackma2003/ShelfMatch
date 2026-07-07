"use client";

import { AlertTriangle, CalendarClock } from "lucide-react";
import { useState } from "react";

import { PantryItemForm } from "@/components/pantry/pantry-item-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeletePantryItem, useUpdatePantryItem, type PantryItem } from "@/hooks/use-pantry";
import { daysUntil } from "@/lib/date";
import type { PantryItemFormValues } from "@/lib/validators/pantry";
import { cn } from "@/lib/utils";

function ExpiryPill({ expirationDate }: { expirationDate: string | null }) {
  if (!expirationDate) return null;
  const days = daysUntil(expirationDate);

  const label = days < 0 ? "Expired" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;

  const urgent = days <= 2;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        urgent ? "bg-red-100 text-red-700" : "bg-amber-100/70 text-amber-700",
      )}
    >
      {urgent ? <AlertTriangle className="size-3" /> : <CalendarClock className="size-3" />}
      {label}
    </span>
  );
}

export function PantryItemRow({ item }: { item: PantryItem }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateItem = useUpdatePantryItem();
  const deleteItem = useDeletePantryItem();

  const handleUpdate = (values: PantryItemFormValues) => {
    updateItem.mutate({ id: item.id, input: values }, { onSuccess: () => setEditOpen(false) });
  };

  return (
    <div className="group flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium">{item.name}</p>
          <ExpiryPill expirationDate={item.expirationDate} />
        </div>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {item.quantity} {item.unit}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger render={<Button variant="ghost" size="sm" />}>Edit</DialogTrigger>
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
          className="text-muted-foreground hover:text-destructive"
          onClick={() => deleteItem.mutate(item.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
