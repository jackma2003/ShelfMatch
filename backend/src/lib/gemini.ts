import { ApiError, GoogleGenAI } from "@google/genai";

import { HttpError } from "../middleware/error-handler.js";

const MODEL = "gemini-2.5-flash";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 300;
// Bounds the worst case: without this, a stalled Gemini request leaves the user staring at
// the loading skeleton indefinitely instead of getting a retryable error. This also gets sent
// to Gemini as an X-Server-Timeout header, so it needs enough room for a normal 3-5 recipe
// generation (which can legitimately take 20-30s) or it'll trip on ordinary requests.
const REQUEST_TIMEOUT_MS = 45_000;

let client: GoogleGenAI | null = null;

// Lazily constructed, same pattern as getGoogleClient() — only required when recipe
// generation is actually requested, so the rest of the app works fine without a key.
function getGeminiClient(): GoogleGenAI {
  if (client) return client;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpError(503, "AI recipe generation is not configured on this server", "AI_NOT_CONFIGURED");
  }

  client = new GoogleGenAI({ apiKey });
  return client;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Node's fetch (undici) pools keep-alive connections; if this process has been idle for a
// while, the remote end can close that pooled socket without telling us, and the next request
// dies with "fetch failed" / ECONNRESET on the very first read — not a sign the API or key is
// actually broken. A couple of quick retries clears this without ever surfacing it to the user.
function isRetryableNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message === "fetch failed";
}

// httpOptions.timeout races two things: the SDK aborting the fetch client-side (surfaces as a
// DOMException named "AbortError") and the X-Server-Timeout header it sends causing Gemini
// itself to give up and respond with a 504 DEADLINE_EXCEEDED ApiError. Both mean the same thing
// to the caller.
function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error && error.name === "AbortError") return true;
  return error instanceof ApiError && error.status === 504;
}

export async function generateJson(prompt: string): Promise<string> {
  const ai = getGeminiClient();

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
      });

      const text = response.text;
      if (!text) {
        throw new HttpError(502, "AI service returned an empty response", "AI_EMPTY_RESPONSE");
      }

      return text;
    } catch (error) {
      if (isTimeoutError(error)) {
        throw new HttpError(504, "AI service took too long to respond", "AI_TIMEOUT");
      }
      if (!isRetryableNetworkError(error) || attempt === MAX_ATTEMPTS) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  // Unreachable — the loop above always returns or throws — but keeps TypeScript satisfied.
  throw new HttpError(502, "AI service request failed", "AI_REQUEST_FAILED");
}
