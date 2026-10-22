import { TOUR_TYPES } from "@/data/services";
import { findOffers } from "@/lib/offers";
import type { OfferRequest } from "@/lib/offers/types";

// AI answers can take a while.
export const maxDuration = 60;

// POST /api/offers with an OfferRequest (tours or cruises), returns an OfferResult.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<OfferRequest> | null;
  if (!body || !["tours", "cruises", "esim"].includes(body.kind as string)) return Response.json({ error: "invalid" }, { status: 400 });

  const request: OfferRequest = {
    kind: body.kind!,
    place: String(body.place ?? "").trim().slice(0, 80),
    start: String(body.start ?? ""),
    end: String(body.end ?? ""),
    people: Math.min(Math.max(Number(body.people) || 1, 1), 20),
    tourType: TOUR_TYPES.includes(body.tourType as never) ? body.tourType! : "all",
    lang: body.lang === "en" ? "en" : "hy",
  };
  // Tours can leave the end date empty.
  const datesOk = request.kind === "tours" && !request.end ? !Number.isNaN(Date.parse(request.start)) : Date.parse(request.end) >= Date.parse(request.start);
  if (!request.place || !datesOk) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json(await findOffers(request));
}
