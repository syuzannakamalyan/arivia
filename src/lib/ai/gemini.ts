// Calls Google's Gemini API and returns its JSON answer. Shared by the trip and route planners.
// Needs GEMINI_API_KEY in .env.local (and in Vercel → Project → Settings → Environment Variables).
// GEMINI_MODEL can put a model first in the list.

// Tried in order. A retired model (404) or a busy one (429/500/503, after one retry) falls through to the next.
// "gemini-flash-latest" always points at Google's current Flash model; Flash-Lite is the lighter backup.
const MODELS = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"];
const SKIP = [404, 429, 500, 503];
const DEADLINE_MS = 50_000; // stay under the routes' 60 s limit

export async function callGeminiJson(prompt: string, schema: object, apiKey: string): Promise<unknown> {
  const models = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...MODELS] : MODELS;
  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.7 },
  });
  const started = Date.now();

  let res: Response | undefined;
  attempts: for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const left = DEADLINE_MS - (Date.now() - started);
      if (left < 5_000) break attempts;
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body,
        signal: AbortSignal.timeout(left),
      });
      if (!SKIP.includes(res.status)) break attempts;
      if (res.status === 404) break; // retired: go straight to the next model
      await new Promise((resolve) => setTimeout(resolve, 1_500));
    }
  }
  if (!res?.ok) {
    const error = await res?.json().catch(() => null);
    throw new Error(`Gemini ${res?.status}: ${error?.error?.message ?? res?.statusText}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no answer");
  return JSON.parse(text);
}
