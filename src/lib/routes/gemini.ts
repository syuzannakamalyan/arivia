import { callGeminiJson } from "@/lib/ai/gemini";
import { MODES, type RouteOption, type RouteRequest } from "./types";

// Asks Gemini for the realistic ways to get from A to B, with time and price estimates.

const ROUTES_SCHEMA = {
  type: "OBJECT",
  properties: {
    options: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          mode: { type: "STRING", enum: [...MODES] },
          title: { type: "STRING" },
          durationMinutes: { type: "INTEGER" },
          transfers: { type: "INTEGER" },
          priceAmdMin: { type: "INTEGER" },
          priceAmdMax: { type: "INTEGER" },
          steps: { type: "ARRAY", items: { type: "STRING" } },
          note: { type: "STRING" },
        },
        required: ["mode", "title", "durationMinutes", "transfers", "priceAmdMin", "priceAmdMax", "steps", "note"],
      },
    },
  },
  required: ["options"],
};

function prompt({ from, to, date, travellers, lang }: RouteRequest) {
  const language = lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  return `You are Arivia, a travel planner for people living in Armenia.
List the realistic ways to travel from "${from}" to "${to}" on ${date} for ${travellers} traveller(s).

Rules:
- Give 2 to 5 options, ordered from most to least practical. Only include modes that really exist on this route
  (for example, no train or car if there is no land connection that works).
- For flights, mention real airports and typical airlines, and whether connections are usually needed.
- durationMinutes is the typical door-to-door travel time; transfers is the number of changes.
- priceAmdMin and priceAmdMax are a typical price range in Armenian dram for all ${travellers} traveller(s), one way.
- steps lists each leg in order, for example "Yerevan (EVN) → Vienna (VIE), Austrian Airlines, ~4h".
- note is one sentence: how often it runs, the best time to book, or a useful tip.
- These are estimates; never claim live prices or exact timetables.
- Write title, steps and note in ${language}. Keep "mode" in English.`;
}

function isOptions(value: unknown): value is { options: RouteOption[] } {
  const v = value as { options?: RouteOption[] };
  return (
    Array.isArray(v?.options) &&
    v.options.every((o) => MODES.includes(o.mode) && typeof o.title === "string" && Array.isArray(o.steps))
  );
}

export async function generateGeminiRoutes(request: RouteRequest, apiKey: string): Promise<RouteOption[]> {
  const result = await callGeminiJson(prompt(request), ROUTES_SCHEMA, apiKey);
  if (!isOptions(result) || result.options.length === 0) throw new Error("Gemini returned unexpected routes");
  return result.options;
}
