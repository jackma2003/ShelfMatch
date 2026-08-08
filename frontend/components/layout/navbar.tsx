"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

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
        "hover:text-foreground text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      {active && (
        <span className="bg-gold mt-0.5 block h-1 rounded-full shadow-[0_0_6px_var(--gold)]" />
      )}
    </Link>
  );
}

export function Navbar() {
  const router = useRouter();
  const { data: user } = useMe();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.push("/login"),
    });
  };

  return (
    <header className="bg-card/95 border-border/70 sticky top-0 z-50 border-b-2 backdrop-blur-md">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-base font-bold transition-opacity hover:opacity-80"
        >
          <img src="/icon.svg" className="animate-idle-bounce size-6" alt="ShelfMatch" />
          <span className="font-heading text-primary-accent">ShelfMatch</span>
        </Link>

        {/* Desktop links */}
        {user && (
          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        )}

        {/* Right side */}
        {user && (
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="text-muted-foreground hover:text-foreground hidden text-sm transition-colors md:block"
            >
              {user.name}
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="hidden md:inline-flex"
            >
              {logout.isPending ? "..." : "Log out"}
            </Button>
            {/* Compact mobile actions — bottom tab bar covers primary nav */}
            <Button
              variant="ghost"
              size="icon-lg"
              render={<Link href="/settings" />}
              nativeButton={false}
              aria-label="Settings"
              className="md:hidden"
            >
              <Settings className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={handleLogout}
              disabled={logout.isPending}
              aria-label="Log out"
              className="md:hidden"
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
