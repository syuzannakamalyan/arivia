# Արիvia · Arivia

A trip planner for Armenian travellers: plan a trip from start to finish, in Armenian first and English second, with budgets in AMD.

This first version has no accounts, so anyone can open every page:

- **Overview page** (`/`): what Arivia offers, a spinning 3D globe with the New 7 Wonders (apricot pins) and the Ancient 7 Wonders (pomegranate pins), a sample trip and FAQ.
- **Visa guide** (`/visa`): where Armenian passport holders need a visa (link to the MFA lookup), the MFA rules for visiting Armenia, a residence-permit exemption checker and MFA contacts.
- **AI planner** (`/planner`): destination, dates, travellers, budget in AMD, interests and pace in; a day-by-day plan with costs, a budget split and tips out.
- **Armenian / English switch** in the header; the choice is remembered.

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

Without a key, the planner shows a sample plan built from templates. To get real AI plans from Google Gemini (free tier):

1. Open [Google AI Studio](https://aistudio.google.com/apikey), sign in with Google and click **Create API key**.
2. Copy `.env.example` to a new file named `.env.local` and paste the key after `GEMINI_API_KEY=`.
3. Restart `npm run dev`.
4. For the live site: in Vercel open the project, **Settings → Environment Variables**, add `GEMINI_API_KEY` with the same key, then redeploy.

## Where things are

| What | File |
| --- | --- |
| All Armenian and English text | `src/lib/dictionaries.ts` |
| Brand colors and button styles | `src/app/globals.css` |
| Overview page | `src/app/page.tsx` |
| The globe | `src/components/WonderGlobe.tsx` |
| The 14 wonders and their places | `src/data/wonders.ts` |
| AI planner page | `src/app/planner/page.tsx` |
| Who writes the plan (Gemini or sample) | `src/lib/planner/` |
| Visa guide page | `src/app/visa/page.tsx` |
| Visa rules and MFA links | `src/data/visaRules.ts` |

Built with Next.js, Tailwind CSS, and globe.gl.
