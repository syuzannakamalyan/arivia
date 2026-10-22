import { generatePlan } from "@/lib/planner";
import { INTERESTS, MAX_DAYS, PACES, tripLength, type TripRequest } from "@/lib/planner/types";

// AI plans can take a while to write.
export const maxDuration = 60;

// POST /api/plan with a TripRequest, returns { plan, source }.
// Runs on the server, so an AI API key never reaches the browser.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<TripRequest> | null;
  if (!body) return Response.json({ error: "invalid" }, { status: 400 });

  const request: TripRequest = {
    destination: String(body.destination ?? "").trim().slice(0, 80),
    startDate: String(body.startDate ?? ""),
    endDate: String(body.endDate ?? ""),
    travellers: Math.min(Math.max(Number(body.travellers) || 1, 1), 20),
    budgetAmd: Math.max(Number(body.budgetAmd) || 0, 0),
    interests: (Array.isArray(body.interests) ? body.interests : []).filter((i) => INTERESTS.includes(i)),
    pace: PACES.includes(body.pace as TripRequest["pace"]) ? (body.pace as TripRequest["pace"]) : "balanced",
    lang: body.lang === "en" ? "en" : "hy",
  };

  const length = tripLength(request.startDate, request.endDate);
  if (!request.destination || request.budgetAmd <= 0 || length < 1 || length > MAX_DAYS) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json(await generatePlan(request));
}
