"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useShoppingListItems } from "@/hooks/use-shopping-list";

export function ShoppingListSummaryCard() {
  const { data: items, isLoading, isError, refetch } = useShoppingListItems();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-muted-foreground size-4" />
            <h3 className="font-semibold">Shopping list</h3>
          </div>
          <p className="text-muted-foreground flex-1 text-sm">Couldn&apos;t load your list.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const total = items?.length ?? 0;
  const unchecked = (items ?? []).filter((item) => !item.isChecked);

  return (
    <Card>
      <CardContent className="flex h-full flex-col gap-3">
        <div className="flex items-center gap-2">
          <ShoppingCart className="text-muted-foreground size-4" />
          <h3 className="font-semibold">Shopping list</h3>
        </div>

        {total === 0 ? (
          <p className="text-muted-foreground flex-1 text-sm">Nothing on your list right now.</p>
        ) : unchecked.length === 0 ? (
          <p className="text-muted-foreground flex-1 text-sm">
            Everything&apos;s checked off. Nice work.
          </p>
        ) : (
          <div className="flex-1 space-y-1.5">
            <p className="text-sm font-medium">
              {unchecked.length} {unchecked.length === 1 ? "item" : "items"} to pick up
            </p>
            <p className="text-muted-foreground text-sm">
              {unchecked
                .slice(0, 3)
                .map((item) => item.name)
                .join(", ")}
              {unchecked.length > 3 && ` +${unchecked.length - 3} more`}
            </p>
          </div>
        )}

        <Button
          render={<Link href="/shopping-list" />}
          nativeButton={false}
          variant="outline"
          size="sm"
          className="self-start"
        >
          View list
        </Button>
      </CardContent>
    </Card>
  );
}
