import { generateGeminiOffers } from "./gemini";
import type { OfferRequest, OfferResult } from "./types";

// The one place that decides where tour and cruise options come from.
// Today: Gemini estimates when GEMINI_API_KEY is set. Without it (or if Gemini fails) the page
// shows no list, only links to search the partner sites directly.
// When Arivia joins an affiliate programme with an API (GetYourGuide, Viator...), call it here first.
export async function findOffers(request: OfferRequest): Promise<OfferResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { options: [], source: "none", reason: "noKey" };
  try {
    return { options: await generateGeminiOffers(request, apiKey), source: "ai" };
  } catch (error) {
    console.error(`${request.kind} search failed:`, error);
    const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    return { options: [], source: "none", reason: "aiFailed", detail };
  }
}
