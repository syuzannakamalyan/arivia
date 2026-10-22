# Արիvia · Arivia

A trip planner for Armenian travellers: plan a trip from start to finish, in Armenian first and English second, with budgets in AMD.

This first version has no accounts, so anyone can open every page:

- **Overview page** (`/`): what Arivia offers, a spinning 3D globe with the New 7 Wonders (apricot pins) and the Ancient 7 Wonders (pomegranate pins), a sample trip and FAQ.
- **Visa guide** (`/visa`): where Armenian passport holders need a visa (link to the MFA lookup), the MFA rules for visiting Armenia, a residence-permit exemption checker and MFA contacts.
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

## Where things are

| What | File |
| --- | --- |
| All Armenian and English text | `src/lib/dictionaries.ts` |
| Brand colors and button styles | `src/app/globals.css` |
| Overview page | `src/app/page.tsx` |
| The globe | `src/components/WonderGlobe.tsx` |
| The 14 wonders and their places | `src/data/wonders.ts` |
| Visa guide page | `src/app/visa/page.tsx` |
| Visa rules and MFA links | `src/data/visaRules.ts` |

Built with Next.js, Tailwind CSS, and globe.gl.
