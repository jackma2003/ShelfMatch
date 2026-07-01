"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDeleteShoppingListItem, useUpdateShoppingListItem, type ShoppingListItem } from "@/hooks/use-shopping-list";
import { cn } from "@/lib/utils";

export function ShoppingListItemRow({ item }: { item: ShoppingListItem }) {
  const updateItem = useUpdateShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();

  return (
    <div className="group flex items-center gap-3 border-b py-3 last:border-b-0">
      <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
        <div className="relative flex shrink-0">
          <input
            type="checkbox"
            checked={item.isChecked}
            onChange={(e) =>
              updateItem.mutate({ id: item.id, input: { isChecked: e.target.checked } })
            }
            className="peer size-[18px] cursor-pointer appearance-none rounded-md border-2 border-border checked:border-primary checked:bg-primary transition-all"
          />
          {/* checkmark */}
          <svg
            className="pointer-events-none absolute inset-0 size-[18px] scale-0 text-white transition-transform peer-checked:scale-100"
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
        size="icon-sm"
        disabled={deleteItem.isPending}
        onClick={() => deleteItem.mutate(item.id)}
        className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}
