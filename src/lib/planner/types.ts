// The trip details the planner form sends, and the plan that comes back.
// Any AI provider must return a TripPlan in this shape.

export const INTERESTS = ["food", "history", "nature", "shopping", "nightlife", "kids"] as const;
export type Interest = (typeof INTERESTS)[number];

export const PACES = ["relaxed", "balanced", "packed"] as const;
export type Pace = (typeof PACES)[number];

export type TripRequest = {
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travellers: number;
  budgetAmd: number; // whole trip, all travellers
  interests: Interest[];
  pace: Pace;
  lang: "hy" | "en";
};

export type Activity = {
  time: "morning" | "afternoon" | "evening";
  place: string;
  description: string;
  costAmd: number;
};

export type TripDay = {
  date: string; // YYYY-MM-DD
  title: string;
  activities: Activity[];
};

export type TripPlan = {
  summary: string;
  days: TripDay[];
  budget: { transport: number; stay: number; food: number; activities: number };
  tips: string[];
};

export const MAX_DAYS = 14;

// Number of days from start to end, both included. Returns 0 when the dates are invalid.
export function tripLength(startDate: string, endDate: string): number {
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000) + 1;
}
