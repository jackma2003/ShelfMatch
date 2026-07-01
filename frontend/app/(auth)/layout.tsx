import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
        <span className="text-2xl">🍳</span> ShelfMatch
      </Link>
      {children}
    </div>
  );
}
