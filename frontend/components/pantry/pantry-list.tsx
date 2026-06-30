"use client";

import { PantryItemRow } from "@/components/pantry/pantry-item-row";
import { usePantryItems, type PantryItem } from "@/hooks/use-pantry";
import { PANTRY_CATEGORY_LABELS, type PantryCategory } from "@/lib/pantry-categories";

function groupByCategory(items: PantryItem[]): [PantryCategory, PantryItem[]][] {
  const groups = new Map<PantryCategory, PantryItem[]>();
  for (const item of items) {
    const group = groups.get(item.category) ?? [];
    group.push(item);
    groups.set(item.category, group);
  }
  return [...groups.entries()].sort((a, b) =>
    PANTRY_CATEGORY_LABELS[a[0]].localeCompare(PANTRY_CATEGORY_LABELS[b[0]]),
  );
}

export function PantryList({ sortExpiring }: { sortExpiring: boolean }) {
  const { data: items, isLoading } = usePantryItems(sortExpiring ? "expiring" : undefined);

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading pantry...</p>;
  }

  if (!items || items.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Your pantry is empty. Add an item above to get started.
      </p>
    );
  }

  if (sortExpiring) {
    return (
      <div className="rounded-lg border px-4">
        {items.map((item) => (
          <PantryItemRow key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupByCategory(items).map(([category, categoryItems]) => (
        <div key={category}>
          <h3 className="text-muted-foreground mb-2 text-sm font-semibold tracking-wide uppercase">
            {PANTRY_CATEGORY_LABELS[category]}
          </h3>
          <div className="rounded-lg border px-4">
            {categoryItems.map((item) => (
              <PantryItemRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
