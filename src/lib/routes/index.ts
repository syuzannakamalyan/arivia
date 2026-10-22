import { generateGeminiRoutes } from "./gemini";
import type { RouteRequest, RouteResult } from "./types";

// The one place that decides where route options come from.
// Today: Gemini estimates when GEMINI_API_KEY is set. Without it (or if Gemini fails) the page
// shows no options, only links to search Omio and others directly.
// When Arivia gets Omio's Search API (through its affiliate programme), call it here first.
export async function findRoutes(request: RouteRequest): Promise<RouteResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { options: [], source: "none", reason: "noKey" };
  try {
    return { options: await generateGeminiRoutes(request, apiKey), source: "ai" };
  } catch (error) {
    console.error("Route search failed:", error);
    const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
    return { options: [], source: "none", reason: "aiFailed", detail };
  }
}
