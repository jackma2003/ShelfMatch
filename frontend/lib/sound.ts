import { Howl } from "howler";

type SfxName = "click" | "toggle" | "success";

const SFX_SOURCES: Record<SfxName, string> = {
  click: "/sfx/click.wav",
  toggle: "/sfx/toggle.wav",
  success: "/sfx/success.ogg",
};

const cache = new Map<SfxName, Howl>();

function getHowl(name: SfxName): Howl {
  let howl = cache.get(name);
  if (!howl) {
    howl = new Howl({ src: [SFX_SOURCES[name]], volume: 0.35 });
    cache.set(name, howl);
  }
  return howl;
}

// Lazily instantiated on first call (never at module load), so this stays SSR-safe and never
// fights the browser's autoplay policy — every call site below is wired to a real user gesture
// (a click/toggle handler), never fired on mount or navigation.
function play(name: SfxName) {
  if (typeof window === "undefined") return;
  getHowl(name).play();
}

export const playClick = () => play("click");
export const playToggle = () => play("toggle");
export const playSuccess = () => play("success");
