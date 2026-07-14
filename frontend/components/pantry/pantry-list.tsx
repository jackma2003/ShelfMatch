"use client";

import {
  AlertTriangle,
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
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
      <Card className="gap-0 px-4 py-0">
        {items.map((item) => (
          <PantryItemRow key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
}

function PantryListSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="mb-2 flex items-center gap-2">
            <div className="skeleton-shimmer size-4 rounded" />
            <div className="skeleton-shimmer h-3 w-24 rounded" />
          </div>
          <Card className="gap-0 px-4 py-0">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b py-3 last:border-b-0">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="skeleton-shimmer h-4 w-32 rounded" />
                  <div className="skeleton-shimmer h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

export function PantryList({ sortExpiring }: { sortExpiring: boolean }) {
  const {
    data: items,
    isLoading,
    isError,
    refetch,
  } = usePantryItems(sortExpiring ? "expiring" : undefined);

  if (isLoading) {
    return <PantryListSkeleton />;
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load your pantry"
        description="Something went wrong on our end. Try again?"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
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
      <Card className="gap-0 px-4 py-0">
        {items.map((item, i) => (
          <PantryItemRow
            key={item.id}
            item={item}
            className="animate-fade-in"
            style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
          />
        ))}
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {groupByCategory(items).map(([category, categoryItems], i) => (
        <div
          key={category}
          className="animate-fade-in"
          style={{ animationDelay: `${Math.min(i * 70, 300)}ms` }}
        >
          <ItemGroup category={category} items={categoryItems} />
        </div>
      ))}
    </div>
  );
}
