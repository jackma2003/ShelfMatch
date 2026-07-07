"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Sparkles, X } from "lucide-react";

import { PantrySummaryCard } from "@/components/dashboard/pantry-summary-card";
import { SavedRecipesPreview } from "@/components/dashboard/saved-recipes-preview";
import { ShoppingListSummaryCard } from "@/components/dashboard/shopping-list-summary-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMe } from "@/hooks/use-auth";
import { usePantryItems } from "@/hooks/use-pantry";

function greeting(name: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}`;
}

function GenerateCta() {
  const { data: items } = usePantryItems();
  const pantryCount = items?.length ?? 0;
  const hasItems = pantryCount > 0;

  return (
    <Card className="bg-primary text-primary-foreground flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Sparkles className="size-6" />
        </div>
        <div>
          <h2 className="font-semibold">What can I make right now?</h2>
          <p className="text-primary-foreground/80 mt-0.5 max-w-sm text-sm">
            {hasItems
              ? `You've got ${pantryCount} ${pantryCount === 1 ? "item" : "items"} in your pantry — let's see what you can make.`
              : "Add a few pantry items and I'll help you figure out what's for dinner."}
          </p>
        </div>
      </div>
      <Button
        render={<Link href={hasItems ? "/recipes/generate" : "/pantry"} />}
        nativeButton={false}
        variant="secondary"
        className="shrink-0"
      >
        {hasItems ? "Generate meals" : "Add pantry items"}
      </Button>
    </Card>
  );
}

function DashboardContent() {
  const { data: user } = useMe();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
      {justVerified && !bannerDismissed && (
        <div className="flex items-center justify-between rounded-xl border border-green-600/20 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>🎉 Email verified — welcome to ShelfMatch!</span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            className="ml-4 text-green-600 hover:bg-green-100 hover:text-green-800"
          >
            <X />
          </Button>
        </div>
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {user?.name ? greeting(user.name) + "." : "Welcome back."}
        </h1>
        <p className="text-muted-foreground mt-1.5">What are you in the mood to cook today?</p>
      </div>

      <GenerateCta />

      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-2">
        <PantrySummaryCard />
        <ShoppingListSummaryCard />
      </div>

      <SavedRecipesPreview />
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
