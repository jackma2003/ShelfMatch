"use client";

import { PantryItemRow } from "@/components/pantry/pantry-item-row";
import { usePantryItems, type PantryItem } from "@/hooks/use-pantry";
import { PANTRY_CATEGORY_LABELS, type PantryCategory } from "@/lib/pantry-categories";

const CATEGORY_EMOJI: Record<PantryCategory, string> = {
  PRODUCE: "🥦",
  DAIRY: "🧀",
  MEAT_SEAFOOD: "🥩",
  GRAIN_BREAD: "🍞",
  CANNED_JARRED: "🥫",
  CONDIMENT_SAUCE: "🫙",
  SPICE_SEASONING: "🌶️",
  BAKING: "🫖",
  FROZEN: "🧊",
  BEVERAGE: "🧃",
  OTHER: "📦",
};

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

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
      <span className="text-5xl">🛒</span>
      <p className="font-medium text-foreground">Your pantry is empty</p>
      <p className="text-sm text-muted-foreground max-w-xs">
        Add your first item above to get started. ShelfMatch will suggest meals based on what you
        have.
      </p>
    </div>
  );
}

function ItemGroup({ category, items }: { category: PantryCategory; items: PantryItem[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{CATEGORY_EMOJI[category]}</span>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {PANTRY_CATEGORY_LABELS[category]}
        </h3>
        <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="rounded-xl border bg-card px-4">
        {items.map((item) => (
          <PantryItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function PantryList({ sortExpiring }: { sortExpiring: boolean }) {
  const { data: items, isLoading } = usePantryItems(sortExpiring ? "expiring" : undefined);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <EmptyState />;
  }

  if (sortExpiring) {
    return (
      <div className="rounded-xl border bg-card px-4">
        {items.map((item) => (
          <PantryItemRow key={item.id} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupByCategory(items).map(([category, categoryItems]) => (
        <ItemGroup key={category} category={category} items={categoryItems} />
      ))}
    </div>
  );
}
