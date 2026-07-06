"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.94 0.04 70 / 0.5) 0%, transparent 60%)",
      }}
    >
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-bold text-primary hover:opacity-80 transition-opacity"
      >
        <img src="/icon.svg" className="size-7" alt="ShelfMatch" /> ShelfMatch
      </Link>
      <Card className="w-full max-w-sm shadow-lg shadow-foreground/5">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error happened. You can try again, or head back to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={reset} className="flex-1 h-10">
            Try again
          </Button>
          <Button
            variant="outline"
            className="flex-1 h-10"
            render={<Link href="/dashboard" />}
            nativeButton={false}
          >
            Go home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
