import { callGeminiJson } from "@/lib/ai/gemini";
import type { OfferOption, OfferRequest } from "./types";

// Asks Gemini for typical attractions and tours at a destination, or cruises from a port, with prices.

const OFFERS_SCHEMA = {
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
          description: { type: "STRING" },
        },
        required: ["title", "details", "priceAmdMin", "priceAmdMax", "providers", "description"],
      },
    },
  },
  required: ["options"],
};

const TOUR_KINDS = {
  all: "a mix of attraction tickets (museums, sights), day trips and guided tours",
  private: "private tours only (just this group with its own guide or driver)",
  group: "small or large group tours only (joined with other travellers)",
};

function prompt({ kind, place, start, end, people, tourType, lang }: OfferRequest) {
  const language = lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  const task =
    kind === "tours"
      ? `List 6 popular things to book in "${place}" ${end ? `between ${start} and ${end}` : `on or after ${start}`} for ${people} people: ${TOUR_KINDS[tourType]}.
- title is the real attraction or tour as travellers search for it, e.g. "Louvre Museum skip-the-line ticket".
- details has 2 to 4 short facts: duration, private or group, what's included, meeting point.
- providers lists 1 to 3 real operators or sellers for it (for example the attraction itself, GetYourGuide, Viator), or an empty list.
- Mix famous sights with one or two less obvious ones.`
      : `List 4 to 6 cruises leaving from "${place}" (or the nearest cruise port) between ${start} and ${end}, for ${people} people.
- title is the cruise line, ship and route, e.g. "MSC Fantasia: 7-night Western Mediterranean".
- details has 2 to 4 short facts: number of nights, main ports of call, cabin type the price is for.
- providers lists the cruise line, plus 0 to 2 real sellers.
- Only cruise lines that really sail from that port in that season. If no cruises leave there, list the nearest real ones and say where they leave from.`;
  return `You are Arivia, a travel planner for people living in Armenia.
${task}
- priceAmdMin and priceAmdMax are a typical price range per person in Armenian dram.
- description is one or two sentences on why it's worth it, and any tip (book ahead, dress code, visa...).
- These are estimates; never claim live prices or availability. Never invent companies or places.
- Write every text field in ${language}.`;
}

function isOptions(value: unknown): value is { options: OfferOption[] } {
  const v = value as { options?: OfferOption[] };
  return (
    Array.isArray(v?.options) &&
    v.options.every((o) => typeof o.title === "string" && typeof o.priceAmdMin === "number" && Array.isArray(o.details))
  );
}

export async function generateGeminiOffers(request: OfferRequest, apiKey: string): Promise<OfferOption[]> {
  const result = await callGeminiJson(prompt(request), OFFERS_SCHEMA, apiKey, { quick: true });
  if (!isOptions(result) || result.options.length === 0) throw new Error("Gemini returned unexpected options");
  return result.options.map((o) => ({ ...o, providers: Array.isArray(o.providers) ? o.providers : [] }));
}
