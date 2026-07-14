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

  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        className={cn("object-cover", className)}
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
