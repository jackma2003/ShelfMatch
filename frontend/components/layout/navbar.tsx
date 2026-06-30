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
      <Link href="/dashboard" className="font-semibold">
        ShelfMatch
      </Link>
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
