"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { WONDERS, type Wonder } from "@/data/wonders";

// The globe uses WebGL, so it only loads in the browser.
const WonderGlobe = dynamic(() => import("@/components/WonderGlobe"), { ssr: false });

const FEATURE_ICONS = ["✨", "֏", "🛂", "🏨"];

export default function Home() {
  const { t, lang } = useLanguage();
  const [selected, setSelected] = useState<Wonder | null>(null);

  return (
    <>
      {/* Hero with the globe */}
      <section id="globe" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 pt-10 pb-6 sm:px-6 lg:grid-cols-2 lg:pt-16">
          <div className="min-w-0">
            <span className="inline-block rounded-full bg-apricot/15 px-3 py-1 text-sm font-semibold text-apricot-dark">
              {t.hero.badge}
            </span>
            <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-5xl">{t.hero.title}</h1>
            <p className="mt-4 max-w-xl text-lg text-navy/70">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#wonders" className="btn-primary">{t.hero.cta}</a>
              <a href="#features" className="btn-secondary">{t.hero.secondary}</a>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-[560px] min-w-0 justify-self-center overflow-hidden">
            <WonderGlobe selected={selected} onSelect={setSelected} lang={lang} />
            {selected && <WonderCard wonder={selected} onClose={() => setSelected(null)} />}
          </div>
        </div>

        {/* Wonder list, in two colors like the pins */}
        <div id="wonders" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6">
          <h2 className="text-2xl font-bold">{t.globe.title}</h2>
          <p className="mt-1 text-navy/70">{t.globe.subtitle}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {(["new", "ancient"] as const).map((group) => (
              <div key={group} className="card p-5">
                <h3 className="flex items-center gap-2 font-semibold">
                  <span className={`h-3 w-3 rounded-full ${group === "new" ? "bg-apricot" : "bg-pomegranate"}`} />
                  {group === "new" ? t.globe.newWonders : t.globe.ancientWonders}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {WONDERS.filter((w) => w.group === group).map((w) => (
                    <li key={w.id}>
                      <button
                        onClick={() => setSelected(w)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${
                          selected?.id === w.id
                            ? "border-navy bg-navy text-white"
                            : "border-sand bg-cream hover:border-navy/30"
                        }`}
                      >
                        {w.name[lang]}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="features" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">{t.features.title}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((item, i) => (
              <div key={item.title} className="rounded-3xl bg-cream p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-apricot text-2xl text-white">
                  {FEATURE_ICONS[i]}
                </div>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-navy/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample trip preview */}
      <section className="py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">{t.sample.title}</h2>
            <p className="mt-3 text-navy/70">{t.hero.subtitle}</p>
          </div>
          <div className="card overflow-hidden">
            <div className="bg-navy p-6 text-cream">
              <p className="text-2xl font-bold">{t.sample.trip}</p>
              <p className="mt-1 text-cream/70">{t.sample.dates}</p>
            </div>
            <ul className="divide-y divide-sand">
              {t.sample.days.map((d) => (
                <li key={d.day} className="flex gap-4 p-5">
                  <span className="shrink-0 rounded-full bg-apricot/15 px-3 py-1 text-sm font-bold text-apricot-dark">
                    {d.day}
                  </span>
                  <span>{d.text}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between bg-cream px-5 py-4">
              <span className="text-navy/70">{t.sample.budget}</span>
              <span className="text-lg font-bold">420 000 ֏ <span className="text-sm font-normal text-navy/50">≈ €1 000</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold">{t.faq.title}</h2>
          <div className="mt-6 space-y-3">
            {t.faq.items.map((item) => (
              <details key={item.q} className="group rounded-2xl bg-cream p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                  {item.q}
                  <span className="text-apricot transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-navy/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final call to action */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t.footer.tagline}</h2>
          <Link href="/visa" className="btn-primary mt-6">{t.visa.title}</Link>
        </div>
      </section>
    </>
  );
}

function WonderCard({ wonder, onClose }: { wonder: Wonder; onClose: () => void }) {
  const { t, lang } = useLanguage();
  return (
    <div className="card absolute right-2 bottom-2 left-2 p-4 sm:left-auto sm:w-72">
      <button onClick={onClose} className="absolute top-2 right-3 text-xl text-navy/40 hover:text-navy" aria-label="Close">×</button>
      <p className={`text-xs font-semibold ${wonder.group === "new" ? "text-apricot-dark" : "text-pomegranate"}`}>
        {wonder.group === "new" ? t.globe.newWonders : t.globe.ancientWonders}
      </p>
      <p className="mt-1 text-lg font-bold">{wonder.name[lang]}</p>
      <p className="text-sm text-navy/60">{wonder.place[lang]}</p>
      <p className="mt-2 text-xs text-navy/50">{wonder.standing ? t.globe.standing : t.globe.lost}</p>
    </div>
  );
}
