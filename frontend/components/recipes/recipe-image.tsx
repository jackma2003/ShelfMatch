"use client";

import { useState } from "react";
import { ChefHat } from "lucide-react";

import { cn } from "@/lib/utils";

// Two independent fallback layers: the backend now always resolves a real imageUrl (search
// result or a local stock-photo fallback — see backend/src/lib/unsplash.ts), so `imageUrl`
// should rarely be null. But a URL that was valid at generation time can still 404 later
// (hotlink protection, the photo being taken down, a flaky network on the client), so `onError`
// swaps to the same warm ChefHat placeholder used for the null case instead of a broken-image
// icon.
export function RecipeImage({
  imageUrl,
  className,
  iconClassName,
}: {
  imageUrl: string | null;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Tracks the imageUrl each render's state was computed for, so a change can be detected and
  // reset during render itself (React's recommended "adjust state while rendering" pattern —
  // https://react.dev/learn/you-might-not-need-an-effect) rather than in a useEffect, which
  // would commit one render with the stale image before a second render corrects it. Needed
  // because client-side navigation between two recipe detail pages can reuse this component
  // instance without remounting it (same gotcha noted on AddMissingButton for `recipeId`) — a
  // new recipe's image would otherwise inherit the previous one's `loaded`/`failed` state.
  const [trackedUrl, setTrackedUrl] = useState(imageUrl);
  if (imageUrl !== trackedUrl) {
    setTrackedUrl(imageUrl);
    setFailed(false);
    setLoaded(false);
  }

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        // Every recipe image is an external Unsplash fetch (see backend/src/lib/unsplash.ts),
        // so several cards on the results grid finish downloading at slightly different times.
        // Fading each in on its own `onLoad` smooths that out instead of each one abruptly
        // popping into place. Cached images fire `onLoad` synchronously (or are already
        // `complete` before React even attaches the handler) — checked via a ref callback so
        // there's no flash-of-invisible-image for those.
        ref={(el) => {
          if (el?.complete) setLoaded(true);
        }}
        className={cn(
          "object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "from-primary/15 to-primary/5 flex items-center justify-center bg-linear-to-br",
        className,
      )}
    >
      <ChefHat className={cn("text-primary/40", iconClassName)} />
    </div>
  );
}
