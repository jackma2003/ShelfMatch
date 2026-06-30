import { GoogleGenAI } from "@google/genai";

import { HttpError } from "../middleware/error-handler.js";

const MODEL = "gemini-2.5-flash";

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

export async function generateJson(prompt: string): Promise<string> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new HttpError(502, "AI service returned an empty response", "AI_EMPTY_RESPONSE");
  }

  return text;
}
