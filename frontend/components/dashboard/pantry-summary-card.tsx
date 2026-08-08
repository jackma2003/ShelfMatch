"use client";

import Link from "next/link";
import { AlertTriangle, Package } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePantryItems } from "@/hooks/use-pantry";
import { daysUntil } from "@/lib/date";

const EXPIRING_WINDOW_DAYS = 5;

export function PantrySummaryCard() {
  const { data: items, isLoading, isError, refetch } = usePantryItems("expiring");

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-24" />
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
            <Package className="text-muted-foreground size-4" />
            <h3 className="font-semibold">Pantry</h3>
          </div>
          <p className="text-muted-foreground flex-1 text-sm">Couldn&apos;t load your pantry.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="self-start">
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const total = items?.length ?? 0;
  const expiringSoon = (items ?? []).filter(
    (item) => item.expirationDate && daysUntil(item.expirationDate) <= EXPIRING_WINDOW_DAYS,
  );

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", bounce: 0.4, duration: 0.3 }}>
      <Card>
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2">
            <Package className="text-primary-accent size-4" />
            <h3 className="font-heading font-semibold">Pantry</h3>
          </div>

          {total === 0 ? (
            <p className="text-muted-foreground flex-1 text-sm">
              Nothing logged yet — add what you have and I&apos;ll help you use it.
            </p>
          ) : expiringSoon.length > 0 ? (
            <div className="flex-1 space-y-1.5">
              <p className="text-terracotta flex items-center gap-1.5 text-sm font-medium">
                <AlertTriangle className="size-3.5" />
                {expiringSoon.length} {expiringSoon.length === 1 ? "item" : "items"} expiring soon
              </p>
              <p className="text-muted-foreground text-sm">
                {expiringSoon
                  .slice(0, 3)
                  .map((item) => item.name)
                  .join(", ")}
                {expiringSoon.length > 3 && ` +${expiringSoon.length - 3} more`}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground flex-1 text-sm">
              {total} {total === 1 ? "item" : "items"} on hand. Nothing expiring soon.
            </p>
          )}

          <Button
            render={<Link href="/pantry" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="self-start"
          >
            {total === 0 ? "Add items" : "Manage pantry"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
