"use client";

import {
  Beef,
  Cookie,
  CupSoda,
  Droplet,
  Flame,
  type LucideIcon,
  Milk,
  Package,
  Snowflake,
  Wheat,
  Salad,
} from "lucide-react";

import { PantryItemRow } from "@/components/pantry/pantry-item-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePantryItems, type PantryItem } from "@/hooks/use-pantry";
import { PANTRY_CATEGORY_LABELS, type PantryCategory } from "@/lib/pantry-categories";

const CATEGORY_ICON: Record<PantryCategory, LucideIcon> = {
  PRODUCE: Salad,
  DAIRY: Milk,
  MEAT_SEAFOOD: Beef,
  GRAIN_BREAD: Wheat,
  CANNED_JARRED: Package,
  CONDIMENT_SAUCE: Droplet,
  SPICE_SEASONING: Flame,
  BAKING: Cookie,
  FROZEN: Snowflake,
  BEVERAGE: CupSoda,
  OTHER: Package,
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

function ItemGroup({ category, items }: { category: PantryCategory; items: PantryItem[] }) {
  const CategoryIcon = CATEGORY_ICON[category];
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <CategoryIcon className="text-muted-foreground size-4" />
        <h3 className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
          {PANTRY_CATEGORY_LABELS[category]}
        </h3>
        <span className="text-muted-foreground ml-auto text-xs">{items.length}</span>
      </div>
      <div className="bg-card rounded-2xl border px-4">
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
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Your pantry is empty"
        description="Add your first item above to get started. ShelfMatch will suggest meals based on what you have."
      />
    );
  }

  if (sortExpiring) {
    return (
      <div className="bg-card rounded-2xl border px-4">
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
