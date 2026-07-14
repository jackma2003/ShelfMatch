import { Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";

const PARTICLE_COUNT = 6;
const RADIUS_PX = 20;

// Precomputed once at module load (not per-render) — 6 points evenly spaced around a circle,
// expressed as fixed pixel offsets rather than relying on CSS trig functions (cos()/sin() in
// CSS have shakier browser support than a plain translate keyframe).
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
  return {
    tx: Math.round(Math.cos(angle) * RADIUS_PX),
    ty: Math.round(Math.sin(angle) * RADIUS_PX),
    delay: i * 25,
  };
});

// A brief, one-shot radial burst of sparkle particles — meant to be mounted fresh (via a
// `key` on the caller) for a single celebratory moment, not left mounted/looping. Purely
// decorative (aria-hidden) and `pointer-events-none` so it never interferes with the element
// it's layered over.
export function SparkleBurst({ className }: { className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute inset-0", className)} aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <Sparkle
          key={i}
          className="animate-sparkle-burst absolute top-1/2 left-1/2 size-2.5 fill-current"
          style={
            {
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
