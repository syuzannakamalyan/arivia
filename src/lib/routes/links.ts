import type { Mode, RouteRequest } from "./types";

// Where to check live prices and book. Omio covers trains and buses (and flights in Europe);
// once Arivia joins the Omio affiliate programme, swap OMIO for the partner deep link.
const OMIO = "https://www.omio.com/";

export function bookingLinks(mode: Mode, { from, to, date }: Pick<RouteRequest, "from" | "to" | "date">) {
  const q = encodeURIComponent;
  const rome2rio = { name: "Rome2rio", url: `https://www.rome2rio.com/map/${q(from)}/${q(to)}` };
  switch (mode) {
    case "flight":
      return [
        { name: "Google Flights", url: `https://www.google.com/travel/flights?q=${q(`Flights from ${from} to ${to} on ${date}`)}` },
        { name: "Omio", url: OMIO },
      ];
    case "car":
      return [
        {
          name: "Google Maps",
          url: `https://www.google.com/maps/dir/?api=1&origin=${q(from)}&destination=${q(to)}&travelmode=driving`,
        },
      ];
    default:
      return [{ name: "Omio", url: OMIO }, rome2rio];
  }
}

export function searchLinks(request: Pick<RouteRequest, "from" | "to" | "date">) {
  return [bookingLinks("flight", request)[0], { name: "Omio", url: OMIO }, bookingLinks("train", request)[1], bookingLinks("car", request)[0]];
}
