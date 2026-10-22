// What the car form sends, and the options that come back.

export type CarMode = "rental" | "transfer";

export type CarRequest = {
  mode: CarMode;
  place: string; // pick-up place (rental) or airport (transfer)
  to?: string; // transfer: address or hotel
  start: string; // YYYY-MM-DD: pick-up day (rental) or transfer day
  end?: string; // rental: drop-off day
  people: number;
  lang: "hy" | "en";
};

export type CarOption = {
  title: string; // "Economy: Toyota Yaris or similar" / "Private transfer, sedan"
  details: string[]; // seats, gearbox, luggage, travel time...
  priceAmdMin: number; // per day (rental) or for the whole ride (transfer)
  priceAmdMax: number;
  providers: string[]; // companies that usually offer it there
  note: string; // one practical tip
};

export type CarResult = {
  options: CarOption[];
  source: "ai" | "none";
  reason?: "noKey" | "aiFailed";
  detail?: string;
};
