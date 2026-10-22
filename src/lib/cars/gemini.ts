import { callGeminiJson } from "@/lib/ai/gemini";
import type { CarOption, CarRequest } from "./types";

// Asks Gemini for typical rental car classes, or ways to get from the airport, with prices.

const CARS_SCHEMA = {
  type: "OBJECT",
  properties: {
    options: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          details: { type: "ARRAY", items: { type: "STRING" } },
          priceAmdMin: { type: "INTEGER" },
          priceAmdMax: { type: "INTEGER" },
          providers: { type: "ARRAY", items: { type: "STRING" } },
          note: { type: "STRING" },
        },
        required: ["title", "details", "priceAmdMin", "priceAmdMax", "providers", "note"],
      },
    },
  },
  required: ["options"],
};

function prompt({ mode, place, to, start, end, people, lang }: CarRequest) {
  const language = lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  const task =
    mode === "rental"
      ? `List 4 to 6 rental car classes available at "${place}" from ${start} to ${end}, for ${people} people.
- title is the class and a typical model, e.g. "Economy: Toyota Yaris or similar".
- details has 2 to 4 short facts: seats, gearbox, bags, fuel.
- priceAmdMin and priceAmdMax are a typical price range per day in Armenian dram, with basic insurance.
- providers lists 2 to 4 rental companies that really operate at that place (international or local).
- Order from cheapest to most expensive, and include a class that fits ${people} people with luggage.`
      : `List 3 to 5 ways to get from "${place}" to "${to}" on ${start}, for ${people} people.
- Include what really exists there: taxi apps, official taxi, pre-booked private transfer, shuttle or public bus, train.
- title names the option, e.g. "Pre-booked private transfer (sedan)".
- details has 2 to 3 short facts: travel time, where to find it, luggage.
- priceAmdMin and priceAmdMax are a typical price range in Armenian dram for the whole ride for all ${people} people.
- providers lists the real companies or apps for it there (for example GG, Yandex Go, Kiwitaxi), or an empty list.
- Order from most convenient to cheapest.`;
  return `You are Arivia, a travel planner for people living in Armenia.
${task}
- note is one sentence with a practical tip (deposit, driving permit, how to pay, rush hour...).
- These are estimates; never claim live prices or availability. Never invent companies.
- Write every text field in ${language}.`;
}

function isOptions(value: unknown): value is { options: CarOption[] } {
  const v = value as { options?: CarOption[] };
  return (
    Array.isArray(v?.options) &&
    v.options.every((o) => typeof o.title === "string" && typeof o.priceAmdMin === "number" && Array.isArray(o.providers))
  );
}

export async function generateGeminiCars(request: CarRequest, apiKey: string): Promise<CarOption[]> {
  const result = await callGeminiJson(prompt(request), CARS_SCHEMA, apiKey, { quick: true });
  if (!isOptions(result) || result.options.length === 0) throw new Error("Gemini returned unexpected car options");
  return result.options;
}
