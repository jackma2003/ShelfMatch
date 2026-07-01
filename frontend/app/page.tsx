import Link from "next/link";

import { Button } from "@/components/ui/button";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-border">
      <span className="text-3xl">{icon}</span>
      <h3 className="font-semibold text-base">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Nav strip */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🍳</span>
          <span className="text-primary">ShelfMatch</span>
        </span>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </header>

      {/* Hero */}
      <section
        className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.94 0.04 70 / 0.7) 0%, transparent 70%)",
        }}
      >
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span>✨</span> No grocery run required
        </div>
        <h1 className="max-w-2xl text-5xl font-extrabold tracking-tight leading-tight sm:text-6xl">
          Turn what&apos;s in your kitchen into{" "}
          <span className="text-primary">real meals</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground leading-relaxed">
          Tell ShelfMatch what&apos;s in your pantry and get recipes you can cook right now —
          powered by AI, without the fuss.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="px-8 text-base h-11">
            Get cooking free
          </Button>
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="h-11"
          >
            I already have an account
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            How it works
          </p>
          <h2 className="text-center text-3xl font-bold mb-12">
            From pantry to plate in three steps
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FeatureCard
              icon="🥫"
              title="Stock your pantry"
              description="Add what you have on hand — ingredients, quantities, even expiry dates so nothing goes to waste."
            />
            <FeatureCard
              icon="🤖"
              title="Get AI-powered recipes"
              description="ShelfMatch scans your pantry and suggests meals you can actually make right now, not someday."
            />
            <FeatureCard
              icon="🛒"
              title="Build your shopping list"
              description="Missing one ingredient? Add it to your list with a single tap and pick it up next time you're out."
            />
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to cook something good?</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          It takes about 2 minutes to get started.
        </p>
        <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="px-8">
          Create your free account
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-5 text-center text-xs text-muted-foreground">
        Made with care for home cooks everywhere.
      </footer>
    </div>
  );
}
