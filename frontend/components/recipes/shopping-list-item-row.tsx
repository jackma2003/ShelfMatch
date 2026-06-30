"use client";

import { Button } from "@/components/ui/button";
import { useDeleteShoppingListItem, useUpdateShoppingListItem, type ShoppingListItem } from "@/hooks/use-shopping-list";

export function ShoppingListItemRow({ item }: { item: ShoppingListItem }) {
  const updateItem = useUpdateShoppingListItem();
  const deleteItem = useDeleteShoppingListItem();

  return (
    <div className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0">
      <label className="flex min-w-0 flex-1 items-center gap-3">
        <input
          type="checkbox"
          checked={item.isChecked}
          onChange={(e) =>
            updateItem.mutate({ id: item.id, input: { isChecked: e.target.checked } })
          }
          className="size-4"
        />
        <span className={item.isChecked ? "text-muted-foreground truncate line-through" : "truncate"}>
          {item.quantity} {item.unit} {item.name}
        </span>
      </label>
      <Button
        variant="ghost"
        size="sm"
        disabled={deleteItem.isPending}
        onClick={() => deleteItem.mutate(item.id)}
      >
        Delete
      </Button>
    </div>
  );
}
