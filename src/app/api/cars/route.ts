import { findCars } from "@/lib/cars";
import type { CarRequest } from "@/lib/cars/types";

// AI answers can take a while.
export const maxDuration = 60;

// POST /api/cars with a CarRequest, returns a CarResult.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<CarRequest> | null;
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  const mode = body.mode === "transfer" ? "transfer" : "rental";
  const request: CarRequest = {
    mode,
    place: String(body.place ?? "").trim().slice(0, 80),
    to: mode === "transfer" ? String(body.to ?? "").trim().slice(0, 80) : undefined,
    start: String(body.start ?? ""),
    end: mode === "rental" ? String(body.end ?? "") : undefined,
    people: Math.min(Math.max(Number(body.people) || 1, 1), 20),
    lang: body.lang === "en" ? "en" : "hy",
  };
  const datesOk =
    mode === "rental" ? Date.parse(request.end ?? "") >= Date.parse(request.start) : !Number.isNaN(Date.parse(request.start));
  if (!request.place || (mode === "transfer" && !request.to) || !datesOk) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json(await findCars(request));
}
