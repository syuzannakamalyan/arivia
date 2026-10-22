// What the tours and cruises forms send, and the options that come back.

import type { TourType } from "@/data/services";

export type OfferKind = "tours" | "cruises" | "esim";

export type OfferRequest = {
  kind: OfferKind;
  place: string; // destination (tours), departure port (cruises) or country (eSIM)
  start: string; // YYYY-MM-DD
  end: string; // may be empty for tours
  people: number;
  tourType: TourType; // tours only: all, private or group
  lang: "hy" | "en";
};

export type OfferOption = {
  title: string; // "Louvre Museum skip-the-line ticket" / "MSC Fantasia: 7-night Western Mediterranean"
  details: string[]; // duration, type, group size / nights, ports, ship
  priceAmdMin: number; // per person (tours, cruises) or for the whole plan (eSIM)
  priceAmdMax: number;
  providers: string[]; // tour operators, the cruise line, or the eSIM brand
  description: string; // one or two sentences
};

export type OfferResult = {
  options: OfferOption[];
  source: "ai" | "none";
  reason?: "noKey" | "aiFailed";
  detail?: string;
};
