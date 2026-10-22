import { findHotels } from "@/lib/hotels";
import type { HotelRequest } from "@/lib/hotels/types";

// AI answers can take a while.
export const maxDuration = 60;

// POST /api/hotels with a HotelRequest, returns a HotelResult.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<HotelRequest> | null;
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  const request: HotelRequest = {
    destination: String(body.destination ?? "").trim().slice(0, 80),
    checkIn: String(body.checkIn ?? ""),
    checkOut: String(body.checkOut ?? ""),
    guests: Math.min(Math.max(Number(body.guests) || 1, 1), 20),
    budgetAmd: Number(body.budgetAmd) > 0 ? Number(body.budgetAmd) : undefined,
    lang: body.lang === "en" ? "en" : "hy",
  };
  if (!request.destination || !(Date.parse(request.checkOut) > Date.parse(request.checkIn))) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json(await findHotels(request));
}
