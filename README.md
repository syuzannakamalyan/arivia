# Arivia

A trip planner for Armenian travellers: plan a trip from start to finish, with budgets in AMD. The site is in English for now; the Armenian texts are kept in `src/lib/dictionaries.ts` (switch back with `SITE_LANG` in `src/lib/i18n.tsx`).

This first version has no accounts, so anyone can open every page:

- **Home page** (`/`): a search box with one tab per option (AI planner, flights & trains, hotels, visas) that opens the option's page filled in, popular destinations from Yerevan, a spinning 3D globe with the New 7 Wonders (apricot pins) and the Ancient 7 Wonders (pomegranate pins), and FAQ.
- **Options menu** on the left, like trip.com (a sideways row under the header on phones): AI planner, Hotels, Flights & trains, Cars, Attractions & tours, Cruises, eSIM, Visas.
- **Cars, tours, cruises and eSIM** (`/cars`, `/tours`, `/cruises`, `/esim`): a short form that opens the search on partner sites (Kayak, Kiwitaxi, GetYourGuide, Viator, Airalo and others). Cars has two tabs, car rental and airport transfer, and shows a list from Gemini (car classes with price per day, or ways to get from the airport with price per ride, and the companies that offer them) with links to compare and book. Attractions & tours (with a dropdown for all, private or group tours; the end date is optional) , Cruises and eSIM also show a Gemini list of options with price per person and links to book each one (GetYourGuide and Viator for tours, Google and Cruise Critic for cruises, the provider's own site and eSIMDB for eSIM plans from Airalo, VeloeSIM, Holafly, Saily, Yesim, Nomad or Ubigi). Airalo's Partner Hub API can replace the eSIM list once Arivia is approved.
- **Visa guide** (`/visa`): where Armenian passport holders need a visa (link to the MFA lookup), the MFA rules for visiting Armenia, a residence-permit exemption checker and MFA contacts.
- **AI planner** (`/planner`): destination, dates, travellers, budget in AMD, interests and pace in; a day-by-day plan with costs, a budget split and tips out.
- **Route planner** (`/routes`): from, to, round trip by default (a One way checkbox drops the return date) and travellers in; flight, train, bus, car or ferry options with time, price estimates in AMD and links to Omio, Google Flights, Rome2rio or Google Maps.
- **Hotels** (`/hotels`): city, dates, guests and an optional budget per night in; a list of 6 to 8 real hotels from Gemini (stars, area, price estimate per night in AMD, highlights), each with links to see and book it on Booking.com or Google Hotels.
- **Light and dark mode**: follows the device setting; the moon / sun button in the header switches it and the choice is remembered.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer (on a Mac: download the LTS installer from nodejs.org).

```bash
git clone https://github.com/syuzannakamalyan/arivia.git
cd arivia
npm install
npm run dev
```

Then open http://localhost:3000.

## Turn on the AI planner

The planners and the hotel list use the same key. Without it, the route planner and hotels show only search links, and the trip planner shows a sample plan built from templates. To get real AI plans from Google Gemini (free tier):

1. Open [Google AI Studio](https://aistudio.google.com/apikey), sign in with Google and click **Create API key**.
2. Copy `.env.example` to a new file named `.env.local` and paste the key after `GEMINI_API_KEY=`.
3. Restart `npm run dev`.
4. For the live site: in Vercel open the project, **Settings → Environment Variables**, add `GEMINI_API_KEY` with the same key, then redeploy.

## Where things are

| What | File |
| --- | --- |
| All Armenian and English text | `src/lib/dictionaries.ts` |
| Brand colors, light and dark mode colors, button styles | `src/app/globals.css` |
| Options menu and theme button | `src/components/OptionsBar.tsx`, `src/components/ThemeToggle.tsx` |
| Cars, tours, cruises and eSIM pages and their partner links | `src/components/ServicePage.tsx`, `src/data/services.ts` |
| Tours and cruises options (Gemini now, a GetYourGuide or Viator partner API later) | `src/lib/offers/`, `src/app/api/offers/route.ts` |
| Cars page and where its options come from (Gemini now, a car rental or transfer partner API later) | `src/app/cars/page.tsx`, `src/lib/cars/` |
| Home page and its search box | `src/app/page.tsx` |
| Hotels page | `src/app/hotels/page.tsx` |
| Where the hotel list comes from (Gemini now, a live-price hotel API later) and the booking links | `src/lib/hotels/` |
| The globe | `src/components/WonderGlobe.tsx` |
| The 14 wonders and their places | `src/data/wonders.ts` |
| AI planner page | `src/app/planner/page.tsx` |
| Who writes the plan (Gemini or sample) | `src/lib/planner/` |
| Route planner page | `src/app/routes/page.tsx` |
| Where route options come from (Gemini now, Omio later) | `src/lib/routes/` |
| Gemini API call shared by both planners | `src/lib/ai/gemini.ts` |
| Visa guide page | `src/app/visa/page.tsx` |
| Visa rules and MFA links | `src/data/visaRules.ts` |

Built with Next.js, Tailwind CSS, and globe.gl.
