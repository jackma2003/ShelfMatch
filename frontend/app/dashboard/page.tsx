"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { Navbar } from "@/components/layout/navbar";
import { useMe } from "@/hooks/use-auth";

function DashboardContent() {
  const { data: user } = useMe();
  const searchParams = useSearchParams();
  const justVerified = searchParams.get("verified") === "true";

  return (
    <div>
      <Navbar />
      <main className="p-6">
        {justVerified && (
          <p className="mb-4 rounded-md border border-green-600/30 bg-green-600/10 px-4 py-2 text-sm text-green-700 dark:text-green-400">
            Email verified — welcome to ShelfMatch.
          </p>
        )}
        <h1 className="text-2xl font-semibold">Welcome back, {user?.name}.</h1>
        <p className="text-muted-foreground mt-2">
          Pantry management and recipe generation land in the next phases.
        </p>
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
