import { generateGeminiHotels } from "./gemini";
import type { HotelRequest, HotelResult } from "./types";

// The one place that decides where the hotel list comes from.
// Today: Gemini suggestions when GEMINI_API_KEY is set. Without it (or if Gemini fails) the page
// shows no list, only links to search Booking.com and Google Hotels directly.
// When Arivia gets a hotel API with live prices (Booking.com Affiliate, Agoda, Amadeus...), call it here first.
export async function findHotels(request: HotelRequest): Promise<HotelResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { hotels: [], source: "none", reason: "noKey" };
  try {
    return { hotels: await generateGeminiHotels(request, apiKey), source: "ai" };
  } catch (error) {
    console.error("Hotel search failed:", error);
    const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    return { hotels: [], source: "none", reason: "aiFailed", detail };
  }
}
