import { generateGeminiCars } from "./gemini";
import type { CarRequest, CarResult } from "./types";

// The one place that decides where car options come from.
// Today: Gemini estimates when GEMINI_API_KEY is set. Without it (or if Gemini fails) the page
// shows no list, only links to search the partner sites directly.
// When Arivia joins a car rental or transfer affiliate programme with an API, call it here first.
export async function findCars(request: CarRequest): Promise<CarResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { options: [], source: "none", reason: "noKey" };
  try {
    return { options: await generateGeminiCars(request, apiKey), source: "ai" };
  } catch (error) {
    console.error("Car search failed:", error);
    const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    return { options: [], source: "none", reason: "aiFailed", detail };
  }
}
