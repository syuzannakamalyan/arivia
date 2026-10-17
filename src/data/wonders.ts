export type Wonder = {
  id: string;
  group: "new" | "ancient";
  lat: number;
  lng: number;
  standing: boolean;
  name: { hy: string; en: string };
  place: { hy: string; en: string };
};

export const WONDERS: Wonder[] = [
  // New 7 Wonders of the World (2007)
  { id: "great-wall", group: "new", lat: 40.4319, lng: 116.5704, standing: true,
    name: { hy: "Չինական մեծ պարիսպ", en: "Great Wall of China" }, place: { hy: "Չինաստան", en: "China" } },
  { id: "petra", group: "new", lat: 30.3285, lng: 35.4444, standing: true,
    name: { hy: "Պետրա", en: "Petra" }, place: { hy: "Հորդանան", en: "Jordan" } },
  { id: "christ-redeemer", group: "new", lat: -22.9519, lng: -43.2105, standing: true,
    name: { hy: "Քրիստոս Փրկչի արձանը", en: "Christ the Redeemer" }, place: { hy: "Ռիո դե Ժանեյրո, Բրազիլիա", en: "Rio de Janeiro, Brazil" } },
  { id: "machu-picchu", group: "new", lat: -13.1631, lng: -72.545, standing: true,
    name: { hy: "Մաչու Պիկչու", en: "Machu Picchu" }, place: { hy: "Պերու", en: "Peru" } },
  { id: "chichen-itza", group: "new", lat: 20.6843, lng: -88.5678, standing: true,
    name: { hy: "Չիչեն Իցա", en: "Chichen Itza" }, place: { hy: "Մեքսիկա", en: "Mexico" } },
  { id: "colosseum", group: "new", lat: 41.8902, lng: 12.4922, standing: true,
    name: { hy: "Կոլիզեում", en: "Colosseum" }, place: { hy: "Հռոմ, Իտալիա", en: "Rome, Italy" } },
  { id: "taj-mahal", group: "new", lat: 27.1751, lng: 78.0421, standing: true,
    name: { hy: "Թաջ Մահալ", en: "Taj Mahal" }, place: { hy: "Ագրա, Հնդկաստան", en: "Agra, India" } },

  // Seven Wonders of the Ancient World
  { id: "giza", group: "ancient", lat: 29.9792, lng: 31.1342, standing: true,
    name: { hy: "Գիզայի մեծ բուրգ", en: "Great Pyramid of Giza" }, place: { hy: "Եգիպտոս", en: "Egypt" } },
  { id: "babylon", group: "ancient", lat: 32.5364, lng: 44.4209, standing: false,
    name: { hy: "Բաբելոնի կախովի այգիներ", en: "Hanging Gardens of Babylon" }, place: { hy: "Իրաք", en: "Iraq" } },
  { id: "artemis", group: "ancient", lat: 37.9497, lng: 27.3639, standing: false,
    name: { hy: "Արտեմիսի տաճարը", en: "Temple of Artemis" }, place: { hy: "Եփեսոս, Թուրքիա", en: "Ephesus, Türkiye" } },
  { id: "zeus", group: "ancient", lat: 37.6379, lng: 21.63, standing: false,
    name: { hy: "Զևսի արձանը Օլիմպիայում", en: "Statue of Zeus at Olympia" }, place: { hy: "Հունաստան", en: "Greece" } },
  { id: "mausoleum", group: "ancient", lat: 37.0379, lng: 27.4241, standing: false,
    name: { hy: "Հալիկառնասի դամբարանը", en: "Mausoleum at Halicarnassus" }, place: { hy: "Բոդրում, Թուրքիա", en: "Bodrum, Türkiye" } },
  { id: "rhodes", group: "ancient", lat: 36.451, lng: 28.2278, standing: false,
    name: { hy: "Ռոդոսի կոլոսը", en: "Colossus of Rhodes" }, place: { hy: "Ռոդոս, Հունաստան", en: "Rhodes, Greece" } },
  { id: "alexandria", group: "ancient", lat: 31.214, lng: 29.8856, standing: false,
    name: { hy: "Ալեքսանդրիայի փարոսը", en: "Lighthouse of Alexandria" }, place: { hy: "Եգիպտոս", en: "Egypt" } },
];

export const YEREVAN = { lat: 40.1792, lng: 44.4991 };
