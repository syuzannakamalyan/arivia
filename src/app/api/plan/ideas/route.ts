import { findIdeas, type IdeasRequest } from "@/lib/planner/ideas";
import { INTERESTS } from "@/lib/planner/types";

// AI answers can take a while.
export const maxDuration = 60;

// POST /api/plan/ideas with an IdeasRequest, returns an IdeasResult.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<IdeasRequest> | null;
  const request: IdeasRequest = {
    destination: String(body?.destination ?? "").trim().slice(0, 80),
    interests: (Array.isArray(body?.interests) ? body.interests : []).filter((i) => INTERESTS.includes(i)),
    travellers: Math.min(Math.max(Number(body?.travellers) || 1, 1), 20),
    exclude: (Array.isArray(body?.exclude) ? body.exclude : []).map((p) => String(p).slice(0, 80)).slice(0, 60),
    lang: body?.lang === "en" ? "en" : "hy",
  };
  if (!request.destination) return Response.json({ error: "invalid" }, { status: 400 });
  return Response.json(await findIdeas(request));
}
