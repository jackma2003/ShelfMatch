"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Heart, Home, Package, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";

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
      className="bg-card/95 border-border/70 fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="focus-visible:ring-ring/50 flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-t-lg py-2 text-xs font-medium focus-visible:ring-2 focus-visible:outline-none"
          >
            {/* Keyed by active tab only — remounts (and replays the spring pop) the moment
                this tab becomes the active one, but not on every re-render while it stays
                active (e.g. navigating between sub-routes under the same tab). */}
            <motion.span
              key={active ? tab.href : undefined}
              initial={active ? { scale: 0.55 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.55, duration: 0.4 }}
            >
              <tab.icon
                className={cn("size-5", active ? "text-primary-accent" : "text-muted-foreground")}
              />
            </motion.span>
            <span className={active ? "text-primary-accent" : "text-muted-foreground"}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
