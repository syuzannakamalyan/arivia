# Արիvia · Arivia

A trip planner for Armenian travellers: plan a trip from start to finish, in Armenian first and English second, with budgets in AMD.

This first version has:

- **Overview page** (`/`): what Arivia offers, a spinning 3D globe with the New 7 Wonders (apricot pins) and the Ancient 7 Wonders (pomegranate pins), a sample trip and FAQ.
- **Sign up, sign in, forgot password** (`/signup`, `/signin`, `/forgot-password`): email and password, Google, and an Apple ID button that turns on later.
- **Profile** (`/profile`): name, photo, home city, language, currency, passport country, travel style and visas with type and expiry date.
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

## Demo mode and real accounts

Without any setup the app runs in **demo mode**: accounts and profiles are saved only in your browser, so you can try every screen. A dark bar at the top says so.

To use real accounts, connect a free [Supabase](https://supabase.com) project:

1. Create a project on supabase.com.
2. Open **SQL Editor**, paste everything from `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings → API**, copy the project URL and the publishable (anon) key.
4. Copy `.env.example` to a new file named `.env.local` and paste the two values in.
5. Restart `npm run dev`. The demo bar disappears.

For Google sign-in, turn on Google under **Authentication → Providers** in Supabase. Apple ID sign-in needs an Apple developer account first.

## Where things are

| What | File |
| --- | --- |
| All Armenian and English text | `src/lib/dictionaries.ts` |
| Brand colors and button styles | `src/app/globals.css` |
| Overview page | `src/app/page.tsx` |
| The globe | `src/components/WonderGlobe.tsx` |
| The 14 wonders and their places | `src/data/wonders.ts` |
| Sign up / sign in / reset pages | `src/app/signup`, `src/app/signin`, `src/app/forgot-password` |
| Profile page | `src/app/profile/page.tsx` |
| Accounts (demo and Supabase) | `src/lib/auth/` |
| Database setup | `supabase/schema.sql` |

Built with Next.js, Tailwind CSS, globe.gl and Supabase.
