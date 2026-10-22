import { findRoutes } from "@/lib/routes";
import type { RouteRequest } from "@/lib/routes/types";

// AI answers can take a while.
export const maxDuration = 60;

// POST /api/routes with a RouteRequest, returns a RouteResult.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<RouteRequest> | null;
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  const request: RouteRequest = {
    from: String(body.from ?? "").trim().slice(0, 80),
    to: String(body.to ?? "").trim().slice(0, 80),
    date: String(body.date ?? ""),
    returnDate: body.returnDate ? String(body.returnDate) : undefined,
    travellers: Math.min(Math.max(Number(body.travellers) || 1, 1), 20),
    lang: body.lang === "en" ? "en" : "hy",
  };
  const badReturn = request.returnDate !== undefined && !(Date.parse(request.returnDate) >= Date.parse(request.date));
  if (!request.from || !request.to || Number.isNaN(Date.parse(request.date)) || badReturn) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json(await findRoutes(request));
}
