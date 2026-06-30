import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">
        What can I make right now?
      </h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Tell ShelfMatch what&apos;s in your fridge or pantry, and get realistic meals you can cook
        immediately — no grocery run required.
      </p>
      <div className="flex gap-4">
        <Button render={<Link href="/signup" />} nativeButton={false} size="lg">
          Get started
        </Button>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="lg">
          Log in
        </Button>
      </div>
    </div>
  );
}
