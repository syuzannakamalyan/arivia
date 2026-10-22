import { callGeminiJson } from "@/lib/ai/gemini";
import type { HotelOption, HotelRequest } from "./types";

// Asks Gemini for well-known hotels at the destination, with typical prices.

const HOTELS_SCHEMA = {
  type: "OBJECT",
  properties: {
    hotels: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          stars: { type: "INTEGER" },
          area: { type: "STRING" },
          priceAmdMin: { type: "INTEGER" },
          priceAmdMax: { type: "INTEGER" },
          description: { type: "STRING" },
          highlights: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["name", "stars", "area", "priceAmdMin", "priceAmdMax", "description", "highlights"],
      },
    },
  },
  required: ["hotels"],
};

function prompt({ destination, checkIn, checkOut, guests, budgetAmd, lang }: HotelRequest) {
  const language = lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  const budget = budgetAmd
    ? `- Only include hotels whose typical price is at most ${budgetAmd} AMD per night for the room.`
    : "- Mix price levels: some budget, some mid-range, one or two upscale.";
  return `You are Arivia, a travel planner for people living in Armenia.
List 6 good hotels in "${destination}" for ${guests} guest(s), staying ${checkIn} to ${checkOut}.

Rules:
- Only real, well-known hotels that exist today, with their exact official names, so they can be found on Booking.com.
  Never invent a hotel. If you are not sure a hotel exists, leave it out.
${budget}
- stars is the official star rating (1 to 5).
- area is the neighbourhood or a nearby landmark.
- priceAmdMin and priceAmdMax are a typical price range per night for one room in Armenian dram for these dates.
- description is one sentence on who it suits; highlights has 2 or 3 short facts (location, breakfast, pool...).
- These are estimates; never claim live prices or availability.
- Keep "name" as the hotel's official name. Write area, description and highlights in ${language}.`;
}

function isHotels(value: unknown): value is { hotels: HotelOption[] } {
  const v = value as { hotels?: HotelOption[] };
  return (
    Array.isArray(v?.hotels) &&
    v.hotels.every((h) => typeof h.name === "string" && typeof h.priceAmdMin === "number" && Array.isArray(h.highlights))
  );
}

export async function generateGeminiHotels(request: HotelRequest, apiKey: string): Promise<HotelOption[]> {
  const result = await callGeminiJson(prompt(request), HOTELS_SCHEMA, apiKey, { quick: true });
  if (!isHotels(result) || result.hotels.length === 0) throw new Error("Gemini returned unexpected hotels");
  return result.hotels.map((h) => ({ ...h, stars: Math.min(Math.max(Math.round(h.stars), 1), 5) }));
}
