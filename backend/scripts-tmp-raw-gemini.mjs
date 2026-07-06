import "dotenv/config";
async function main() {
  const { generateJson } = await import("./src/lib/gemini.js");
  const prompt = `You are a practical home cooking assistant. A user has the following ingredients in their kitchen:

- Ground beef: 1 lb
- Spaghetti: 1 box

Suggest 3 to 5 realistic, cookable meals that primarily use these ingredients. Prioritize recipes that:
1. Use ingredients marked "(expiring soon)" first, to help reduce food waste.
2. Minimize the number of additional ingredients not already listed above.
3. Are realistic for a home cook to actually make tonight.


Respond with ONLY valid JSON (no markdown code fences, no commentary) matching exactly this shape:
{
  "recipes": [
    {
      "title": string,
      "description": string (one sentence),
      "instructions": string[] (numbered steps, no leading numbers in the text),
      "cookTimeMinutes": number,
      "difficulty": "EASY" | "MEDIUM" | "HARD",
      "ingredients": [
        { "name": string, "quantity": number, "unit": string, "isOptional": boolean }
      ]
    }
  ]
}`;
  const raw = await generateJson(prompt);
  console.log("RAW LENGTH:", raw.length);
  console.log("RAW TEXT:\n", raw);
  try {
    const parsed = JSON.parse(raw);
    console.log("PARSED OK. Keys:", Object.keys(parsed));
    if (parsed.recipes) {
      console.log("recipes count:", parsed.recipes.length);
      console.log("first recipe keys:", Object.keys(parsed.recipes[0] ?? {}));
    }
  } catch (e) {
    console.log("JSON.parse FAILED:", e.message);
  }
}
main();
