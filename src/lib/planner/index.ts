import { generateGeminiPlan } from "./gemini";
import { generateSamplePlan } from "./sample";
import type { TripPlan, TripRequest } from "./types";

// When a sample is shown, "reason" says why: no key set, or the AI call failed (with a short error).
export type PlanResult = { plan: TripPlan; source: "sample" | "ai"; reason?: "noKey" | "aiFailed"; detail?: string };

// The one place that decides who writes the plan: Gemini when GEMINI_API_KEY is set,
// otherwise (or if Gemini fails) the built-in sample planner, so the page always works.
export async function generatePlan(request: TripRequest): Promise<PlanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return { plan: await generateGeminiPlan(request, apiKey), source: "ai" };
    } catch (error) {
      console.error("AI plan failed, showing a sample plan instead:", error);
      const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
      return { plan: generateSamplePlan(request), source: "sample", reason: "aiFailed", detail };
    }
  }
  return { plan: generateSamplePlan(request), source: "sample", reason: "noKey", detail: keyHint() };
}

// Helps find a misnamed key: which deployment this is and any env var names that look like it (names only, never values).
function keyHint() {
  const similar = Object.keys(process.env).filter((name) => /gemini|api_?key/i.test(name));
  const where = [process.env.VERCEL_ENV, process.env.VERCEL_GIT_COMMIT_REF].filter(Boolean).join(", ") || "local";
  return `${where}; similar names: ${similar.length ? similar.join(", ") : "none"}`;
}
