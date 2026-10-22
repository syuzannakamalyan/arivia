// The booking options that Arivia searches on partner sites (cars, tours, cruises, eSIM).
// Each mode lists the form fields it needs and the partner searches it opens.
// Partner deep links with Arivia's affiliate ids can replace these once Arivia joins the programmes.

export type ServiceField = "destination" | "tourType" | "pickUp" | "airport" | "address" | "country" | "port" | "dates" | "date" | "people";
export const TOUR_TYPES = ["all", "private", "group"] as const;
export type TourType = (typeof TOUR_TYPES)[number];
export type ServiceValues = { place: string; to: string; start: string; end: string; people: number; tourType: TourType };
export type PartnerLink = { name: string; url: string };
export type ListedOption = { title: string; providers: string[] };

export type ServiceMode = {
  key: string;
  fields: ServiceField[];
  endOptional?: boolean; // the "Until" date can be left empty
  partners: (v: ServiceValues) => PartnerLink[];
  // Pages with an AI options list: the booking links for one option from that list.
  optionLinks?: (option: ListedOption, v: ServiceValues) => PartnerLink[];
  priceNote?: "perPerson" | "perPlan"; // what the list's prices cover (per person unless set)
};

const enc = encodeURIComponent;
const google = (q: string) => `https://www.google.com/search?q=${enc(q)}`;
const getYourGuide = (q: string) => ({ name: "GetYourGuide", url: `https://www.getyourguide.com/s/?q=${enc(q)}` });
// eSIMDB compares plans from many brands; its country pages use the lowercase English name with dashes.
const eSimDb = (country: string) => ({
  name: "eSIMDB",
  url: `https://esimdb.com/${country.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
});
const ESIM_SITES: Record<string, string> = {
  airalo: "https://www.airalo.com/",
  holafly: "https://esim.holafly.com/",
  saily: "https://saily.com/",
  yesim: "https://yesim.app/",
  nomad: "https://www.getnomad.app/",
  ubigi: "https://cellulardata.ubigi.com/",
};
const viator = (q: string) => ({ name: "Viator", url: `https://www.viator.com/searchResults/all?text=${enc(q)}` });

export const SERVICES = {
  cars: [
    {
      key: "rental",
      fields: ["pickUp", "dates", "people"],
      partners: (v) => [
        { name: "Kayak", url: `https://www.kayak.com/cars/${enc(v.place)}/${v.start}/${v.end}` },
        { name: "Rentalcars.com", url: "https://www.rentalcars.com/" },
        { name: "DiscoverCars", url: "https://www.discovercars.com/" },
      ],
    },
    {
      key: "transfer",
      fields: ["airport", "address", "date", "people"],
      partners: (v) => [
        { name: "Kiwitaxi", url: "https://kiwitaxi.com/" },
        { name: "GetTransfer", url: "https://gettransfer.com/" },
        { name: "Google Maps", url: `https://www.google.com/maps/dir/?api=1&origin=${enc(v.place)}&destination=${enc(v.to)}&travelmode=driving` },
      ],
    },
  ],
  tours: [
    {
      key: "default",
      fields: ["destination", "tourType", "dates", "people"],
      endOptional: true,
      partners: (v) => {
        const q = { all: v.place, private: `private tour ${v.place}`, group: `group tour ${v.place}` }[v.tourType];
        return [getYourGuide(q), viator(q)];
      },
      optionLinks: ({ title }, v) => [getYourGuide(`${title} ${v.place}`), viator(`${title} ${v.place}`)],
    },
  ],
  cruises: [
    {
      key: "default",
      fields: ["port", "dates", "people"],
      partners: (v) => [
        { name: "Google", url: google(`cruises from ${v.place} ${v.start}`) },
        { name: "Cruise Critic", url: "https://www.cruisecritic.com/" },
      ],
      optionLinks: ({ title }, v) => [
        { name: "Google", url: google(`${title} cruise ${v.start}`) },
        { name: "Cruise Critic", url: "https://www.cruisecritic.com/" },
      ],
    },
  ],
  esim: [
    {
      key: "default",
      fields: ["country", "dates"],
      partners: (v) => [
        { name: "Airalo", url: "https://www.airalo.com/" },
        { name: "Holafly", url: "https://esim.holafly.com/" },
        eSimDb(v.place),
      ],
      priceNote: "perPlan",
      // The brand's own site when Arivia knows it, otherwise a search for that brand and country.
      optionLinks: ({ providers }, v) => {
        const brand = providers[0] ?? "";
        const site = ESIM_SITES[brand.toLowerCase()];
        return [site ? { name: brand, url: site } : { name: brand || "Google", url: google(`${brand} eSIM ${v.place}`) }, eSimDb(v.place)];
      },
    },
  ],
} satisfies Record<string, ServiceMode[]>;

export type ServiceKey = keyof typeof SERVICES;
