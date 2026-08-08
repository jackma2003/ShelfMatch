import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
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
          <CardTitle className="text-xl">Page not found</CardTitle>
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
