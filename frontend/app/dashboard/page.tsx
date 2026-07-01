"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ChefHat, Package, Heart, ShoppingCart } from "lucide-react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { useMe } from "@/hooks/use-auth";

function greeting(name: string) {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}`;
}

const QUICK_ACTIONS = [
  {
    href: "/recipes/generate",
    icon: ChefHat,
    emoji: <img src="/icon.svg" className="size-5" alt="" />,
    title: "Generate meals",
    description: "See what you can cook from your pantry right now.",
    accent: "bg-primary text-primary-foreground",
    primary: true,
  },
  {
    href: "/pantry",
    icon: Package,
    emoji: "🥫",
    title: "Manage pantry",
    description: "Add, update, or remove items from your pantry.",
    accent: "bg-amber-100 text-amber-800",
    primary: false,
  },
  {
    href: "/saved",
    icon: Heart,
    emoji: "❤️",
    title: "Saved recipes",
    description: "Browse your favorites, planned meals, and cooked dishes.",
    accent: "bg-rose-100 text-rose-700",
    primary: false,
  },
  {
    href: "/shopping-list",
    icon: ShoppingCart,
    emoji: "🛒",
    title: "Shopping list",
    description: "Check off items as you shop or add missing ingredients.",
    accent: "bg-green-100 text-green-700",
    primary: false,
  },
];

function DashboardContent() {
  const { data: user } = useMe();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        {justVerified && !bannerDismissed && (
          <div className="flex items-center justify-between rounded-xl border border-green-600/20 bg-green-50 px-4 py-3 text-sm text-green-700">
            <span>🎉 Email verified — welcome to ShelfMatch!</span>
            <button
              onClick={() => setBannerDismissed(true)}
              className="ml-4 text-green-600 hover:text-green-800"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Greeting */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.name ? greeting(user.name) + "." : "Welcome back."}
          </h1>
          <p className="mt-1.5 text-muted-foreground">
            What are you in the mood to cook today?
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`group relative flex flex-col gap-3 rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                action.primary
                  ? "bg-primary text-primary-foreground shadow-primary/20 shadow-sm"
                  : "bg-card ring-1 ring-border hover:ring-primary/30"
              }`}
            >
              <div
                className={`flex size-10 items-center justify-center rounded-xl text-xl ${
                  action.primary ? "bg-white/20" : action.accent
                }`}
              >
                {action.emoji}
              </div>
              <div>
                <h2
                  className={`font-semibold ${action.primary ? "text-primary-foreground" : "text-foreground"}`}
                >
                  {action.title}
                </h2>
                <p
                  className={`mt-0.5 text-sm leading-relaxed ${
                    action.primary ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Suspense>
        <DashboardContent />
      </Suspense>
    </AuthGuard>
  );
}
