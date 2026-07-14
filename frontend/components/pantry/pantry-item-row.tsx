"use client";

import { AlertTriangle, CalendarClock } from "lucide-react";
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
import { daysUntil } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { PantryItemFormValues } from "@/lib/validators/pantry";

function ExpiryPill({ expirationDate }: { expirationDate: string | null }) {
  if (!expirationDate) return null;
  const days = daysUntil(expirationDate);

  const label = days < 0 ? "Expired" : days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`;

  const urgent = days <= 2;

  return (
    <Badge variant={urgent ? "destructive" : "warning"}>
      {urgent ? <AlertTriangle /> : <CalendarClock />}
      {label}
    </Badge>
  );
}

export function PantryItemRow({
  item,
  className,
  style,
}: {
  item: PantryItem;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const updateItem = useUpdatePantryItem();
  const deleteItem = useDeletePantryItem();

  const handleUpdate = (values: PantryItemFormValues) => {
    updateItem.mutate({ id: item.id, input: values }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    setRemoving(true);
    deleteItem.mutate(item, { onError: () => setRemoving(false) });
  };

  return (
    // Grid-rows 0fr/1fr collapse trick: animates to zero height without measuring the row's
    // actual height in JS. Border/last-child styling lives here (not on the inner content div)
    // so the entrance stagger's className/style — applied by the parent list — keeps working,
    // and `last:border-b-0` still checks this element's position among its real siblings.
    <div
      className={cn(
        "grid border-b transition-all duration-300 ease-in-out last:border-b-0",
        className,
      )}
      style={{ ...style, gridTemplateRows: removing ? "0fr" : "1fr", opacity: removing ? 0 : 1 }}
    >
      <div className="overflow-hidden">
        <div className="group flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-medium">{item.name}</p>
              <ExpiryPill expirationDate={item.expirationDate} />
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {item.quantity} {item.unit}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
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
              disabled={deleteItem.isPending || removing}
              className="text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
