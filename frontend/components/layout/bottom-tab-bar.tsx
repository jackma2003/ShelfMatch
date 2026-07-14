"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Heart, Home, Package, ShoppingCart } from "lucide-react";

import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/pantry", label: "Pantry", icon: Package },
  { href: "/recipes/generate", label: "Recipes", icon: ChefHat },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/shopping-list", label: "Shopping", icon: ShoppingCart },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="bg-background/95 fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="focus-visible:ring-ring/50 flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg py-2 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            <tab.icon
              className={cn(
                "size-5",
                active ? "text-primary animate-tab-bounce" : "text-muted-foreground",
              )}
            />
            <span className={active ? "text-primary" : "text-muted-foreground"}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
