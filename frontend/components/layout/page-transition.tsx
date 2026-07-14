"use client";

import { usePathname } from "next/navigation";

// Keying by pathname forces a remount on every route change, which restarts the
// `animate-fade-in` CSS animation — gives navigation a soft entrance instead of an
// instant cut, without needing per-page wiring.
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
