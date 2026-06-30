"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useLogout, useMe } from "@/hooks/use-auth";

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
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold">
          ShelfMatch
        </Link>
        {user && (
          <>
            <Link href="/pantry" className="text-muted-foreground hover:text-foreground text-sm">
              Pantry
            </Link>
            <Link
              href="/recipes/generate"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Recipes
            </Link>
            <Link href="/saved" className="text-muted-foreground hover:text-foreground text-sm">
              Saved
            </Link>
            <Link
              href="/shopping-list"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Shopping List
            </Link>
          </>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm">{user.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} disabled={logout.isPending}>
            {logout.isPending ? "Logging out..." : "Log out"}
          </Button>
        </div>
      )}
    </nav>
  );
}
