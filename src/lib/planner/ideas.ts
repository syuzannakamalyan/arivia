import { callGeminiJson } from "@/lib/ai/gemini";
import { sampleIdeas } from "./sample";
import type { Activity, Interest } from "./types";

// Place ideas for people planning a trip themselves: real places at the destination they haven't added yet.

export type IdeasRequest = { destination: string; interests: Interest[]; travellers: number; exclude: string[]; lang: "hy" | "en" };
export type IdeasResult = { ideas: Activity[]; source: "ai" | "sample"; reason?: "noKey" | "aiFailed"; detail?: string };

const IDEAS_SCHEMA = {
  type: "OBJECT",
  properties: {
    ideas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          time: { type: "STRING", enum: ["morning", "afternoon", "evening"] },
          place: { type: "STRING" },
          description: { type: "STRING" },
          costAmd: { type: "INTEGER" },
        },
        required: ["time", "place", "description", "costAmd"],
      },
    },
  },
  required: ["ideas"],
};

function prompt({ destination, interests, travellers, exclude, lang }: IdeasRequest) {
  const language = lang === "hy" ? "Eastern Armenian (Armenian script)" : "English";
  return `You are Arivia, a trip planner for travellers from Armenia.
Suggest 8 real places or things to do in ${destination} for ${travellers} travellers.
- Interests: ${interests.join(", ") || "general sightseeing"}.
- Skip these, they are already in the plan: ${exclude.join("; ") || "nothing yet"}.
- place is the real name as it appears on a map. Never invent places.
- time is the best part of the day for it (morning, afternoon or evening).
- description is one short sentence on why to go and a tip.
- costAmd is the estimated cost in Armenian dram for all travellers; 0 when free.
- Write place and description in ${language}. Keep "time" values in English.`;
}

export async function findIdeas(request: IdeasRequest): Promise<IdeasResult> {
  const sample = (reason: "noKey" | "aiFailed", detail?: string): IdeasResult => ({
    ideas: sampleIdeas(request.destination, request.interests, request.lang),
    source: "sample",
    reason,
    detail,
  });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return sample("noKey");
  try {
    const result = (await callGeminiJson(prompt(request), IDEAS_SCHEMA, apiKey, { quick: true })) as { ideas?: Activity[] };
    if (!Array.isArray(result?.ideas) || result.ideas.length === 0) throw new Error("Gemini returned no ideas");
    return { ideas: result.ideas, source: "ai" };
  } catch (error) {
    console.error("Place ideas failed:", error);
    return sample("aiFailed", (error instanceof Error ? error.message : String(error)).slice(0, 200));
  }
}
