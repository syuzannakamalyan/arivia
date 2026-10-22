// What the hotel form sends, and the hotels that come back.

export type HotelRequest = {
  destination: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  guests: number;
  budgetAmd?: number; // most per night for the room, optional
  lang: "hy" | "en";
};

export type HotelOption = {
  name: string; // the hotel's real name, used to find it on the booking sites
  stars: number; // 1 to 5
  area: string; // neighbourhood or landmark nearby
  priceAmdMin: number; // per night for the room
  priceAmdMax: number;
  description: string; // one sentence on why it's a good pick
  highlights: string[]; // e.g. "Breakfast included", "5 min to the old town"
};

export type HotelResult = {
  hotels: HotelOption[];
  source: "ai" | "none";
  reason?: "noKey" | "aiFailed";
  detail?: string;
};
