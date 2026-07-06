const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

interface UnsplashSearchResponse {
  results: { urls: { small: string } }[];
}

// A missing/failed image lookup must never break recipe generation — recipes are still
// fully usable without a photo, so this always resolves rather than throwing.
export async function getRecipeImageUrl(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const url = new URL(UNSPLASH_SEARCH_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "1");
    url.searchParams.set("orientation", "landscape");

    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as UnsplashSearchResponse;
    return data.results[0]?.urls.small ?? null;
  } catch {
    return null;
  }
}
