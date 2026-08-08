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
          "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--gold), transparent 55%) 0%, transparent 60%)",
      }}
    >
      <Link
        href="/"
        className="text-primary-accent font-heading mb-8 flex items-center gap-2 text-xl transition-opacity hover:opacity-80"
      >
        <img src="/icon.svg" className="animate-idle-bounce size-7" alt="ShelfMatch" /> ShelfMatch
      </Link>
      <Card className="shadow-foreground/5 w-full max-w-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error happened. You can try again, or head back to the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={reset} className="h-10 flex-1">
            Try again
          </Button>
          <Button
            variant="outline"
            className="h-10 flex-1"
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
