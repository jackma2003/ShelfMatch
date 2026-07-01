"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/pantry", label: "Pantry" },
  { href: "/recipes/generate", label: "Recipes" },
  { href: "/saved", label: "Saved" },
  { href: "/shopping-list", label: "Shopping List" },
] as const;

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      {active && (
        <span className="block h-0.5 rounded-full bg-primary mt-0.5" />
      )}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-base hover:opacity-80 transition-opacity"
        >
          <img src="/icon.svg" className="size-6" alt="ShelfMatch" />
          <span className="text-primary">ShelfMatch</span>
        </Link>

        {/* Desktop links */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <span className="hidden md:block text-sm text-muted-foreground">{user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logout.isPending}
                className="hidden md:inline-flex"
              >
                {logout.isPending ? "..." : "Log out"}
              </Button>
              {/* Mobile hamburger */}
              <button
                className="md:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && user && (
        <div className="md:hidden border-t bg-background px-6 py-4 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              onClick={() => setMobileOpen(false)}
            />
          ))}
          <div className="pt-3 border-t mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{user.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              disabled={logout.isPending}
            >
              Log out
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
