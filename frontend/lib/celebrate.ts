import confetti from "canvas-confetti";

import { playSuccess } from "@/lib/sound";

const WARM_PALETTE = ["#F2C14E", "#6B9B4F", "#D98E4A", "#8FBC6B"];

// Milestone celebration — a short confetti burst + chiptune success chime. Reserved for a
// handful of meaningful state transitions (see call sites), not every mutation, so it keeps
// reading as "you did something" rather than becoming background noise.
//
// Confetti is JS/canvas-driven, so it isn't covered by the CSS-only `prefers-reduced-motion`
// override in globals.css and needs its own explicit guard here. The chime still plays under
// reduced motion — that preference is about visual motion, not audio.
export function celebrate() {
  if (typeof window === "undefined") return;
  playSuccess();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors: WARM_PALETTE,
  });
}
