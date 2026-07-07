import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
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
        className="text-primary mb-8 flex items-center gap-2 text-xl font-bold transition-opacity hover:opacity-80"
      >
        <img src="/icon.svg" className="size-7" alt="ShelfMatch" /> ShelfMatch
      </Link>
      <Card className="shadow-foreground/5 w-full max-w-sm shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Page not found</CardTitle>
          <CardDescription>That page doesn&apos;t exist, or may have moved.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="h-10 w-full" render={<Link href="/dashboard" />} nativeButton={false}>
            Go home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
