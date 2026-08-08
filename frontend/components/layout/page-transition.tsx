"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

// Keyed by pathname so a route change unmounts the old page and mounts the new one, giving
// navigation a spring-y slide/fade instead of an instant cut — like moving between "areas" in
// a game rather than a flat page swap. Reduced-motion handling comes from the app-wide
// <MotionConfig reducedMotion="user"> in the root layout rather than a per-component check —
// branching on useReducedMotion() here directly caused a hydration mismatch, since the
// server always renders as if motion is fine (it can't see the client's OS preference).
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
