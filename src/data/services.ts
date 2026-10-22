// The booking options that Arivia searches on partner sites (cars, tours, cruises, eSIM).
// Each mode lists the form fields it needs and the partner searches it opens.
// Partner deep links with Arivia's affiliate ids can replace these once Arivia joins the programmes.

export type ServiceField = "destination" | "pickUp" | "airport" | "address" | "country" | "port" | "dates" | "date" | "people";
export type ServiceValues = { place: string; to: string; start: string; end: string; people: number };
export type PartnerLink = { name: string; url: string };

export type ServiceMode = {
  key: string;
  fields: ServiceField[];
  partners: (v: ServiceValues) => PartnerLink[];
};

const enc = encodeURIComponent;
const google = (q: string) => `https://www.google.com/search?q=${enc(q)}`;
const getYourGuide = (q: string) => ({ name: "GetYourGuide", url: `https://www.getyourguide.com/s/?q=${enc(q)}` });
const viator = (q: string) => ({ name: "Viator", url: `https://www.viator.com/searchResults/all?text=${enc(q)}` });

export const SERVICES = {
  cars: [
    {
      key: "rental",
      fields: ["pickUp", "dates"],
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
      fields: ["destination", "dates"],
      partners: (v) => [getYourGuide(v.place), viator(v.place)],
    },
  ],
  privateTours: [
    {
      key: "default",
      fields: ["destination", "dates", "people"],
      partners: (v) => [getYourGuide(`private tour ${v.place}`), viator(`private tour ${v.place}`)],
    },
  ],
  groupTours: [
    {
      key: "default",
      fields: ["destination", "dates"],
      partners: (v) => [getYourGuide(`group tour ${v.place}`), viator(`group tour ${v.place}`)],
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
    },
  ],
  esim: [
    {
      key: "default",
      fields: ["country", "dates"],
      partners: (v) => [
        { name: "Airalo", url: "https://www.airalo.com/" },
        { name: "Holafly", url: "https://esim.holafly.com/" },
        { name: "Google", url: google(`eSIM for ${v.place}`) },
      ],
    },
  ],
} satisfies Record<string, ServiceMode[]>;

export type ServiceKey = keyof typeof SERVICES;
