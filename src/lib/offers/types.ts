// What the tours and cruises forms send, and the options that come back.

import type { TourType } from "@/data/services";

export type OfferKind = "tours" | "cruises";

export type OfferRequest = {
  kind: OfferKind;
  place: string; // destination (tours) or departure port (cruises)
  start: string; // YYYY-MM-DD
  end: string; // may be empty for tours
  people: number;
  tourType: TourType; // tours only: all, private or group
  lang: "hy" | "en";
};

export type OfferOption = {
  title: string; // "Louvre Museum skip-the-line ticket" / "MSC Fantasia: 7-night Western Mediterranean"
  details: string[]; // duration, type, group size / nights, ports, ship
  priceAmdMin: number; // per person
  priceAmdMax: number;
  providers: string[]; // tour operators or the cruise line
  description: string; // one or two sentences
};

export type OfferResult = {
  options: OfferOption[];
  source: "ai" | "none";
  reason?: "noKey" | "aiFailed";
  detail?: string;
};
