import { createHash } from "node:crypto";

const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

// Bounds the worst case: without this, a slow/hung Unsplash response would stall recipe
// generation indefinitely (the caller awaits this before responding to the client).
const REQUEST_TIMEOUT_MS = 3_500;

interface UnsplashSearchResponse {
  results: { urls: { small: string } }[];
}

// A small pool of known-good, stable Unsplash CDN photo URLs (real photo IDs, verified to
// resolve). These serve directly from Unsplash's image CDN — no API key or Search API call
// needed to load them — so they stay available even if UNSPLASH_ACCESS_KEY is missing, the
// hourly Search API rate limit (50 req/hr on the free tier) is exhausted, or the Search API
// itself is down. This is the "reliable" fallback: it does not depend on the same service
// that just failed.
const FALLBACK_IMAGE_IDS = [
  "photo-1668838268173-816ee121ad4a",
  "photo-1512621776951-a57141f2eefd",
  "photo-1473093226795-af9932fe5856",
  "photo-1599297915779-0dadbd376d49",
  "photo-1510035618584-c442b241abe7",
  "photo-1598515214211-89d3c73ae83b",
  "photo-1607532941433-304659e8198a",
  "photo-1606791422814-b32c705e3e2f",
];

function fallbackImageUrl(seed: string): string {
  // Deterministic per recipe title (not random) so repeat lookups for the same recipe are
  // stable rather than flickering between fallbacks on retry/backfill.
  const hash = createHash("sha256").update(seed).digest();
  const index = hash[0] % FALLBACK_IMAGE_IDS.length;
  return `https://images.unsplash.com/${FALLBACK_IMAGE_IDS[index]}?auto=format&fit=crop&w=400&q=80`;
}

async function searchUnsplash(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = new URL(UNSPLASH_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as UnsplashSearchResponse;
    return data.results[0]?.urls.small ?? null;
  } catch {
    // Covers network errors, timeouts (AbortError), and malformed responses alike — all
    // fall through to the local fallback pool below.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// Always resolves to a usable image URL — never throws, and (unlike the old version) never
// resolves to null either. Recipe generation should never be left with "no photo" just
// because the specific-title search missed or Unsplash was unreachable.
export async function getRecipeImageUrl(query: string): Promise<string> {
  const searched = await searchUnsplash(query);
  return searched ?? fallbackImageUrl(query);
}
