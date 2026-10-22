import { MAX_DAYS, tripLength, type Activity, type Interest, type TripDay, type TripPlan, type TripRequest } from "./types";

// A built-in planner that needs no API key. It fills a day-by-day plan from
// templates, so the page works until a real AI API is connected (see index.ts).

type Lang = TripRequest["lang"];
type Template = { place: Record<Lang, string>; description: Record<Lang, string> };
type Slot = Activity["time"];

// {city} is replaced with the destination.
const IDEAS: Record<Interest, Record<Slot, Template>> = {
  food: {
    morning: {
      place: { hy: "Տեղական շուկա", en: "Local market" },
      description: { hy: "Նախաճաշիր շուկայում և փորձիր {city}-ի թարմ մրգերն ու թխվածքները։", en: "Have breakfast at the market and try {city}'s fresh fruit and pastries." },
    },
    afternoon: {
      place: { hy: "Խոհարարական դաս", en: "Cooking class" },
      description: { hy: "Սովորիր պատրաստել տեղական ազգային ուտեստ։", en: "Learn to cook a local signature dish." },
    },
    evening: {
      place: { hy: "Ավանդական ռեստորան", en: "Traditional restaurant" },
      description: { hy: "Ընթրիք տեղացիների սիրելի ռեստորանում։", en: "Dinner at a restaurant the locals love." },
    },
  },
  history: {
    morning: {
      place: { hy: "Հին քաղաք", en: "Old town" },
      description: { hy: "Զբոսանք {city}-ի պատմական կենտրոնում՝ էքսկուրսավարի հետ։", en: "Guided walk through {city}'s historic centre." },
    },
    afternoon: {
      place: { hy: "Գլխավոր թանգարան", en: "Main museum" },
      description: { hy: "Ծանոթացիր քաղաքի պատմությանը գլխավոր թանգարանում։", en: "Learn the city's story at its main museum." },
    },
    evening: {
      place: { hy: "Լուսավորված հուշարձաններ", en: "Monuments by night" },
      description: { hy: "Երեկոյան զբոսանք լուսավորված հուշարձանների մոտ։", en: "Evening walk past the lit-up monuments." },
    },
  },
  nature: {
    morning: {
      place: { hy: "Քաղաքային այգի", en: "City park" },
      description: { hy: "Առավոտյան զբոսանք կամ հեծանիվ այգում։", en: "Morning walk or bike ride in the park." },
    },
    afternoon: {
      place: { hy: "Մոտակա արշավային երթուղի", en: "Nearby hiking trail" },
      description: { hy: "Կարճ արշավ {city}-ի մոտակայքում՝ գեղեցիկ տեսարաններով։", en: "Short hike near {city} with great views." },
    },
    evening: {
      place: { hy: "Դիտակետ", en: "Viewpoint" },
      description: { hy: "Դիմավորիր մայրամուտը քաղաքի լավագույն դիտակետից։", en: "Watch the sunset from the best viewpoint in town." },
    },
  },
  shopping: {
    morning: {
      place: { hy: "Արհեստագործների փողոց", en: "Craft street" },
      description: { hy: "Փնտրիր ձեռագործ հուշանվերներ տեղական վարպետներից։", en: "Find handmade souvenirs from local makers." },
    },
    afternoon: {
      place: { hy: "Գլխավոր առևտրային փողոց", en: "Main shopping street" },
      description: { hy: "Խանութներ և կոնցեպտ-սթորներ {city}-ի կենտրոնում։", en: "Shops and concept stores in central {city}." },
    },
    evening: {
      place: { hy: "Երեկոյան տոնավաճառ", en: "Evening market" },
      description: { hy: "Փողոցային ուտելիք և փոքր գնումներ։", en: "Street food and small buys." },
    },
  },
  nightlife: {
    morning: {
      place: { hy: "Սրճարան", en: "Café" },
      description: { hy: "Հանգիստ առավոտ տեղական սրճարանում։", en: "Slow morning at a local café." },
    },
    afternoon: {
      place: { hy: "Արվեստի թաղամաս", en: "Arts district" },
      description: { hy: "Պատկերասրահներ և փողոցային արվեստ։", en: "Galleries and street art." },
    },
    evening: {
      place: { hy: "Կենդանի երաժշտություն", en: "Live music" },
      description: { hy: "Համերգ կամ ջազ-ակումբ, հետո՝ զբոսանք գիշերային {city}-ով։", en: "A concert or jazz bar, then a walk through {city} at night." },
    },
  },
  kids: {
    morning: {
      place: { hy: "Կենդանաբանական այգի", en: "Zoo" },
      description: { hy: "Առավոտը երեխաների հետ կենդանաբանական այգում։", en: "Morning at the zoo with the kids." },
    },
    afternoon: {
      place: { hy: "Ինտերակտիվ թանգարան", en: "Hands-on museum" },
      description: { hy: "Գիտության կամ մանկական թանգարան՝ խաղերով։", en: "A science or children's museum with games." },
    },
    evening: {
      place: { hy: "Ընտանեկան ընթրիք", en: "Family dinner" },
      description: { hy: "Ընթրիք ընտանեկան ռեստորանում՝ խաղասենյակով։", en: "Dinner at a family restaurant with a play corner." },
    },
  },
};

const TEXT = {
  arrival: { hy: "Ժամանում", en: "Arrival" },
  arrivalPlace: { hy: "Հյուրանոց", en: "Hotel" },
  arrivalText: { hy: "Ժամանիր, տեղավորվիր հյուրանոցում և հանգստացիր։", en: "Arrive, check in and rest." },
  departure: { hy: "Վերադարձ", en: "Departure" },
  departurePlace: { hy: "Օդանավակայան կամ կայարան", en: "Airport or station" },
  departureText: { hy: "Վերջին գնումներ և ճանապարհ դեպի տուն։", en: "Last shopping and the trip home." },
  day: { hy: "Օր", en: "Day" },
  summary: {
    hy: "{days} օր {city}-ում, {travellers} ճամփորդ, բյուջե՝ {budget} ֏։",
    en: "{days} days in {city}, {travellers} travellers, budget {budget} AMD.",
  },
  tips: {
    hy: [
      "Ստուգիր վիզայի պահանջները մեկնելուց առաջ։",
      "Թանգարանների տոմսերը գնիր նախօրոք՝ հերթերից խուսափելու համար։",
      "Վերցրու ճանապարհորդական ապահովագրություն։",
      "Տեղական տրանսպորտի օրական տոմսը սովորաբար ավելի էժան է։",
    ],
    en: [
      "Check visa requirements before you go.",
      "Book museum tickets ahead to skip the queues.",
      "Get travel insurance.",
      "A day pass for local transport is usually cheaper.",
    ],
  },
};

const SLOTS: Record<TripRequest["pace"], Slot[]> = {
  relaxed: ["morning", "evening"],
  balanced: ["morning", "afternoon", "evening"],
  packed: ["morning", "afternoon", "evening"],
};

function fill(text: string, values: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Rounds to the nearest 500 AMD so amounts look natural.
const round = (amd: number) => Math.round(amd / 500) * 500;

export function generateSamplePlan(request: TripRequest): TripPlan {
  const { lang, destination: city } = request;
  const length = Math.min(Math.max(tripLength(request.startDate, request.endDate), 1), MAX_DAYS);
  const interests: Interest[] = request.interests.length ? request.interests : ["history", "food"];

  const budget = {
    transport: round(request.budgetAmd * 0.35),
    stay: round(request.budgetAmd * 0.35),
    food: round(request.budgetAmd * 0.18),
    activities: round(request.budgetAmd * 0.12),
  };
  const slots = SLOTS[request.pace];
  const paidActivities = Math.max(length * slots.length, 1);
  const costPerActivity = round(budget.activities / paidActivities);

  const days: TripDay[] = Array.from({ length }, (_, i) => {
    const interest = interests[i % interests.length];
    const activities: Activity[] = slots.map((time) => {
      const idea = IDEAS[interest][time];
      return {
        time,
        place: idea.place[lang],
        description: fill(idea.description[lang], { city }),
        costAmd: costPerActivity,
      };
    });

    let title = `${TEXT.day[lang]} ${i + 1}`;
    if (i === 0 && length > 1) {
      title = TEXT.arrival[lang];
      activities[0] = { time: "morning", place: TEXT.arrivalPlace[lang], description: TEXT.arrivalText[lang], costAmd: 0 };
    } else if (i === length - 1 && length > 1) {
      title = TEXT.departure[lang];
      activities[activities.length - 1] = {
        time: "evening",
        place: TEXT.departurePlace[lang],
        description: TEXT.departureText[lang],
        costAmd: 0,
      };
    }

    return { date: addDays(request.startDate, i), title, activities };
  });

  return {
    summary: fill(TEXT.summary[lang], {
      days: length,
      city,
      travellers: request.travellers,
      budget: request.budgetAmd.toLocaleString("en-US"),
    }),
    days,
    budget,
    tips: TEXT.tips[lang],
  };
}
