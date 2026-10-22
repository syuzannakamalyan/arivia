// What the route form sends, and the travel options that come back.

export const MODES = ["flight", "train", "bus", "car", "ferry"] as const;
export type Mode = (typeof MODES)[number];

export type RouteRequest = {
  from: string;
  to: string;
  date: string; // YYYY-MM-DD
  travellers: number;
  lang: "hy" | "en";
};

export type RouteOption = {
  mode: Mode;
  title: string; // e.g. "Direct flight Yerevan – Rome"
  durationMinutes: number;
  transfers: number;
  priceAmdMin: number; // for all travellers
  priceAmdMax: number;
  steps: string[]; // the legs, in order
  note: string; // carriers, how often it runs, tips
};

export type RouteResult = {
  options: RouteOption[];
  source: "ai" | "none";
  reason?: "noKey" | "aiFailed";
  detail?: string;
};
