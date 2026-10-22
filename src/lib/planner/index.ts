import { generateGeminiPlan } from "./gemini";
import { generateSamplePlan } from "./sample";
import type { TripPlan, TripRequest } from "./types";

export type PlanResult = { plan: TripPlan; source: "sample" | "ai" };

// The one place that decides who writes the plan: Gemini when GEMINI_API_KEY is set,
// otherwise (or if Gemini fails) the built-in sample planner, so the page always works.
export async function generatePlan(request: TripRequest): Promise<PlanResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return { plan: await generateGeminiPlan(request, apiKey), source: "ai" };
    } catch (error) {
      console.error("AI plan failed, showing a sample plan instead:", error);
    }
  }
  return { plan: generateSamplePlan(request), source: "sample" };
}
