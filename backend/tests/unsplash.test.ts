import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getRecipeImageUrl } = await import("../src/lib/unsplash.js");

const ORIGINAL_KEY = process.env.UNSPLASH_ACCESS_KEY;

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

beforeEach(() => {
  process.env.UNSPLASH_ACCESS_KEY = "test-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  process.env.UNSPLASH_ACCESS_KEY = ORIGINAL_KEY;
});

describe("getRecipeImageUrl", () => {
  it("returns the search result when Unsplash finds a match", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ results: [{ urls: { small: "https://images.unsplash.com/photo-real" } }] }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const url = await getRecipeImageUrl("Garlic Chicken");

    expect(url).toBe("https://images.unsplash.com/photo-real");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to a local stock image when the search returns no results", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ results: [] })));

    const url = await getRecipeImageUrl("A Very Unusual Dish Name");

    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
  });

  it("falls back when the Unsplash API responds with a non-OK status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, false)));

    const url = await getRecipeImageUrl("Garlic Chicken");

    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
  });

  it("falls back when the fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    const url = await getRecipeImageUrl("Garlic Chicken");

    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
  });

  it("falls back when no access key is configured, without calling fetch", async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const url = await getRecipeImageUrl("Garlic Chicken");

    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\/photo-/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns the same fallback for the same title (deterministic, not random)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ results: [] })));

    const first = await getRecipeImageUrl("Repeated Title");
    const second = await getRecipeImageUrl("Repeated Title");

    expect(first).toBe(second);
  });

  it("never resolves to null or an empty string", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

    const url = await getRecipeImageUrl("Anything");

    expect(url).toBeTruthy();
  });
});
