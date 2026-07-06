import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent },
  })),
}));

process.env.GEMINI_API_KEY = "test-key";

const { generateJson } = await import("../src/lib/gemini.js");

beforeEach(() => {
  mockGenerateContent.mockReset();
});

describe("generateJson", () => {
  it("returns text on a successful first attempt", async () => {
    mockGenerateContent.mockResolvedValue({ text: '{"recipes":[]}' });

    const result = await generateJson("prompt");

    expect(result).toBe('{"recipes":[]}');
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  // The stale-pooled-connection scenario: fetch fails once with the exact "fetch failed"
  // TypeError undici throws for a reset connection, then a fresh connection succeeds.
  it("retries once on a transient fetch failure and succeeds", async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({ text: '{"recipes":[]}' });

    const result = await generateJson("prompt");

    expect(result).toBe('{"recipes":[]}');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
  });

  it("gives up after exhausting retries on persistent fetch failures", async () => {
    mockGenerateContent.mockRejectedValue(new TypeError("fetch failed"));

    await expect(generateJson("prompt")).rejects.toThrow("fetch failed");
    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
  });

  it("does not retry errors that aren't the network-level fetch failure", async () => {
    mockGenerateContent.mockRejectedValue(new Error("some other API error"));

    await expect(generateJson("prompt")).rejects.toThrow("some other API error");
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it("does not retry an empty response — that's a real API response, not a network blip", async () => {
    mockGenerateContent.mockResolvedValue({ text: "" });

    await expect(generateJson("prompt")).rejects.toMatchObject({ code: "AI_EMPTY_RESPONSE" });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });
});
