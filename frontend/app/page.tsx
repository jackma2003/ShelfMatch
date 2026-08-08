import Link from "next/link";
import { ChefHat, Package, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";

const WHAT_IT_DOES = [
  {
    icon: Package,
    title: "Log what you have",
    description: "Ingredients, quantities, even expiry dates — takes about a minute.",
  },
  {
    icon: ChefHat,
    title: "Get real recipe ideas",
    description: "Meals you can actually cook right now, not someday.",
  },
  {
    icon: ShoppingCart,
    title: "Fill in the gaps",
    description: "Missing an ingredient? It goes straight to a shopping list.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Nav strip */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 text-lg">
          <img src="/icon.svg" className="animate-idle-bounce size-7" alt="ShelfMatch" />
          <span className="font-heading text-primary-accent">ShelfMatch</span>
        </span>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="sm">
          Sign in
        </Button>
      </header>

      {/* Hero */}
      <section
        className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:py-28"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--gold), transparent 30%) 0%, transparent 70%)",
        }}
      >
        <p className="animate-in fade-in slide-in-from-bottom-2 text-muted-foreground mb-4 text-sm duration-700">
          A little side project — built for myself, now shared with you
        </p>
        <h1 className="animate-in fade-in slide-in-from-bottom-3 font-heading max-w-xl text-4xl leading-tight tracking-tight delay-100 duration-700 sm:text-5xl md:text-6xl">
          Turn what&apos;s already in your kitchen into{" "}
          <span className="text-primary-accent">dinner</span>
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-3 text-muted-foreground mt-5 max-w-md text-lg leading-relaxed delay-200 duration-700">
          I built ShelfMatch to answer one question every night: what can I actually cook with what
          I already have? Tell it what&apos;s in your pantry and get real meals you can start
          cooking right now.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom-3 mt-8 flex flex-col items-center gap-3 delay-300 duration-700">
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            size="lg"
            className="h-11 px-8 text-base"
          >
            Get started
          </Button>
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            Already have an account? Log in
          </Link>
        </div>
      </section>

      {/* Story */}
      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-terracotta mb-2 text-sm font-semibold">Why I made this</p>
          <h2 className="font-heading mb-6 text-2xl sm:text-3xl">
            A project born from a very full, very confusing fridge.
          </h2>
          <div className="text-muted-foreground space-y-4 text-base leading-relaxed">
            <p>
              Most nights went the same way: open the fridge, stare at a few half-used vegetables
              and a jar of something unidentifiable, and order takeout anyway — because turning what
              I had into an actual meal felt like more effort than it should.
            </p>
            <p>
              So I built ShelfMatch to solve exactly that. Tell it what&apos;s in your pantry, and
              it suggests meals you can cook right now — not recipes that assume you&apos;re about
              to go shopping.
            </p>
            <p>
              It started as something just for me. It worked well enough, often enough, that I
              cleaned it up and decided to share it.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {WHAT_IT_DOES.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <div className="bg-primary/10 flex size-9 items-center justify-center rounded-full">
                  <item.icon className="text-primary-accent size-5" />
                </div>
                <h3 className="font-heading text-sm font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start gap-4 border-t pt-8 sm:flex-row sm:items-center">
            <Button render={<Link href="/signup" />} nativeButton={false} size="lg">
              Give it a try
            </Button>
            <p className="text-muted-foreground text-sm">
              Free, and takes about a minute to get set up.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-muted-foreground border-t px-6 py-6 text-center text-xs">
        Built by Jack — a weekend project that turned into something I use every night.
      </footer>
    </div>
  );
}
