import Link from "next/link";

import { PageTransition } from "@/components/layout/page-transition";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
