import { callGeminiJson } from "@/lib/ai/gemini";
import { tripLength, type TripPlan, type TripRequest } from "./types";

// Writes the plan with Google's Gemini API (see src/lib/ai/gemini.ts).

// The JSON shape Gemini must return, in Gemini's schema format. Matches TripPlan.
const PLAN_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: { type: "STRING" },
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          date: { type: "STRING" },
          title: { type: "STRING" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                time: { type: "STRING", enum: ["morning", "afternoon", "evening"] },
                place: { type: "STRING" },
                description: { type: "STRING" },
                costAmd: { type: "INTEGER" },
              },
              required: ["time", "place", "description", "costAmd"],
            },
          },
        },
        required: ["date", "title", "activities"],
      },
    },
    budget: {
      type: "OBJECT",
      properties: {
        transport: { type: "INTEGER" },
        stay: { type: "INTEGER" },
        food: { type: "INTEGER" },
        activities: { type: "INTEGER" },
      },
      required: ["transport", "stay", "food", "activities"],
    },
    tips: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["summary", "days", "budget", "tips"],
};

function prompt(request: TripRequest) {
  const language = request.lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  return `You are Arivia, a trip planner for travellers from Armenia.
Write a realistic day-by-day plan for this trip:
- Destination: ${request.destination}
- Dates: ${request.startDate} to ${request.endDate} (${tripLength(request.startDate, request.endDate)} days, both included)
- Travellers: ${request.travellers}
- Total budget for the whole trip and all travellers: ${request.budgetAmd} AMD
- Interests: ${request.interests.join(", ") || "general sightseeing"}
- Pace: ${request.pace} (relaxed = 2 activities a day, balanced = 3, packed = 3 busy ones)

Rules:
- One entry in "days" per date, in order, with "date" as YYYY-MM-DD.
- Use real, well-known places in ${request.destination}. Never invent places.
- Day 1 includes arrival and check-in; the last day includes departure.
- costAmd is the estimated cost in Armenian dram for all travellers; 0 when free.
- budget splits the total budget into transport, stay, food and activities in AMD, and the four add up to the total.
- Give 3 to 5 practical tips, including visa or documents if relevant for an Armenian passport.
- Write every text field in ${language}. Keep "time" values in English.`;
}

function isPlan(value: unknown, days: number): value is TripPlan {
  const plan = value as TripPlan;
  return (
    !!plan &&
    typeof plan.summary === "string" &&
    Array.isArray(plan.days) &&
    plan.days.length === days &&
    plan.days.every((d) => typeof d.title === "string" && Array.isArray(d.activities)) &&
    !!plan.budget &&
    Array.isArray(plan.tips)
  );
}

export async function generateGeminiPlan(request: TripRequest, apiKey: string): Promise<TripPlan> {
  const plan = await callGeminiJson(prompt(request), PLAN_SCHEMA, apiKey);
  if (!isPlan(plan, tripLength(request.startDate, request.endDate))) throw new Error("Gemini returned an unexpected plan");
  return plan;
}
