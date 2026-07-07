"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useMe } from "@/hooks/use-auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/login");
    }
  }, [isLoading, isError, user, router]);

  if (isLoading || !user) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 p-4"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.94 0.04 70 / 0.5) 0%, transparent 60%)",
        }}
      >
        <img src="/icon.svg" className="size-8 animate-pulse" alt="" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
