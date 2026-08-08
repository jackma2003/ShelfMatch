"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useDeleteShoppingListItem,
  useUpdateShoppingListItem,
  type ShoppingListItem,
} from "@/hooks/use-shopping-list";
import { playToggle } from "@/lib/sound";
import { cn } from "@/lib/utils";

export function ShoppingListItemRow({
  item,
  className,
  style,
}: {
  item: ShoppingListItem;
  className?: string;
  style?: React.CSSProperties;
}) {
  const updateItem = useUpdateShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();
  const [removing, setRemoving] = useState(false);

  const handleDelete = () => {
    setRemoving(true);
    deleteItem.mutate(item, { onError: () => setRemoving(false) });
  };

  return (
    // Grid-rows 0fr/1fr collapse trick: animates to zero height without measuring the row's
    // actual height in JS. Border/last-child styling lives here (not on the inner content div)
    // so the entrance stagger's className/style — applied by the parent list — keeps working.
    <div
      className={cn(
        "grid border-b transition-all duration-300 ease-in-out last:border-b-0",
        className,
      )}
      style={{ ...style, gridTemplateRows: removing ? "0fr" : "1fr", opacity: removing ? 0 : 1 }}
    >
      <div className="overflow-hidden">
        <div className="group flex items-center gap-3 py-3">
          <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
            <div className="relative flex shrink-0">
              <input
                type="checkbox"
                checked={item.isChecked}
                onChange={(e) => {
                  playToggle();
                  updateItem.mutate({ id: item.id, input: { isChecked: e.target.checked } });
                }}
                className="peer border-border checked:border-primary checked:bg-primary size-4.5 cursor-pointer appearance-none rounded-md border-2 transition-all"
              />
              {/* checkmark */}
              <svg
                className="pointer-events-none absolute inset-0 size-4.5 scale-0 text-white transition-transform peer-checked:scale-100"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M4 9l3.5 3.5 6.5-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className={cn(
                "text-sm transition-colors",
                item.isChecked ? "text-muted-foreground line-through" : "text-foreground",
              )}
            >
              {item.quantity} {item.unit} {item.name}
            </span>
          </label>
          <Button
            variant="ghost"
            size="icon"
            disabled={deleteItem.isPending || removing}
            onClick={handleDelete}
            aria-label={`Remove ${item.name}`}
            className="text-muted-foreground hover:text-destructive shrink-0 opacity-100 transition-all md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
