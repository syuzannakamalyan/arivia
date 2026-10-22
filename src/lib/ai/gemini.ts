// Calls Google's Gemini API and returns its JSON answer. Shared by the trip planner, routes and hotels.
// Needs GEMINI_API_KEY in .env.local (and in Vercel → Project → Settings → Environment Variables).
// GEMINI_MODEL can put a model first in the list.

// Tried in order. A retired model (404) or a busy one (429/500/503, after one retry) falls through to the next.
// "gemini-flash-latest" always points at Google's current Flash model; Flash-Lite is the lighter, faster one.
const MODELS = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"];
// Lists people wait for (hotels, routes) start with Flash-Lite, which answers in a few seconds.
const FAST_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest", "gemini-3.8-flash"];
const SKIP = [404, 429, 500, 503];
const DEADLINE_MS = 45_000; // stay well under the API routes' 60 s limit

// Flash models "think" before answering by default, which makes answers several times slower.
// These lists don't need it, so thinking is turned off. If a model rejects the setting (400),
// the same model is asked again without it.
const NO_THINKING = { thinkingConfig: { thinkingBudget: 0 } };

// The same question within an hour gets the saved answer instead of a new AI call.
const CACHE_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

export async function callGeminiJson(prompt: string, schema: object, apiKey: string, { quick = false } = {}): Promise<unknown> {
  const saved = cache.get(prompt);
  if (saved && Date.now() - saved.at < CACHE_MS) return saved.value;

  const list = quick ? FAST_MODELS : MODELS;
  const models = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL, ...list] : list;
  const body = (fast: boolean) =>
    JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
        ...(fast ? NO_THINKING : {}),
      },
    });
  const started = Date.now();

  let res: Response | undefined;
  attempts: for (const model of models) {
    let fast = true;
    for (let attempt = 0; attempt < 2; attempt++) {
      const left = DEADLINE_MS - (Date.now() - started);
      if (left < 5_000) break attempts;
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: body(fast),
        signal: AbortSignal.timeout(left),
      });
      if (res.status === 400 && fast && /thinking/i.test(await res.clone().text())) {
        fast = false; // this model doesn't take the setting: ask again without it
        continue;
      }
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
  const value = JSON.parse(text);
  cache.set(prompt, { at: Date.now(), value });
  return value;
}
