"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { backend, useAuth, type Visa } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { countryName } from "@/data/countries";
import { CONTACTS, EXEMPTION, LINKS, MFA_VISA_URL, checkExemption } from "@/data/visaRules";
import VisaBadge from "@/components/VisaBadge";

// Each rule card and the links it shows, in the order of its dictionary link labels.
const RULES = [
  { key: "visaFree", icon: "🕊️", urls: [LINKS.visaFreeUnilateral, LINKS.visaFreeByAgreement] },
  { key: "exemption", icon: "🪪", urls: [LINKS.exemptionCountries] },
  { key: "evisa", icon: "💻", urls: [LINKS.evisa] },
  { key: "length", icon: "📅", urls: [] },
  { key: "invitation", icon: "✉️", urls: [LINKS.invitationOnly, LINKS.eRequest] },
  { key: "laissezPasser", icon: "🇺🇳", urls: [] },
] as const;

export default function VisaGuidePage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">{t.visa.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-navy/70">{t.visa.subtitle}</p>
      <SourceLine />

      {/* Armenians going abroad */}
      <div className="mt-8 grid gap-6 md:grid-cols-[3fr_2fr]">
        <section className="rounded-3xl bg-navy p-6 text-cream shadow-sm">
          <h2 className="text-2xl font-bold">✈️ {t.visa.abroad.title}</h2>
          <p className="mt-3 text-cream/80">{t.visa.abroad.text}</p>
          <a href={MFA_VISA_URL} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
            {t.visa.abroad.button} ↗
          </a>
          <p className="mt-3 text-xs text-cream/60">{t.visa.abroad.note}</p>
        </section>
        <MyVisas />
      </div>

      {/* Foreign visitors coming to Armenia */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">🇦🇲 {t.visa.visiting.title}</h2>
        <p className="mt-1 text-navy/70">{t.visa.visiting.subtitle}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {RULES.map(({ key, icon, urls }) => {
            const rule = t.visa.rules[key];
            return (
              <article key={key} className="card p-5">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span aria-hidden>{icon}</span> {rule.title}
                </h3>
                <p className="mt-2 text-navy/75">{rule.text}</p>
                {urls.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {urls.map((url, i) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-apricot-dark hover:underline">
                        {(rule.links as readonly string[])[i]} ↗
                      </a>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <ExemptionChecker />

      {/* MFA contacts */}
      <section className="card mt-12 p-6">
        <h2 className="text-xl font-bold">{t.visa.contacts.title}</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold">Email</dt>
            <dd><a href={`mailto:${CONTACTS.email}`} className="text-apricot-dark hover:underline">{CONTACTS.email}</a></dd>
            <dd className="mt-1 text-navy/60">{t.visa.contacts.emailNote}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t.visa.contacts.entry}</dt>
            {CONTACTS.entryPhones.map((phone) => <dd key={phone}>{phone}</dd>)}
          </div>
          <div>
            <dt className="font-semibold">{t.visa.contacts.invitations}</dt>
            {CONTACTS.invitationPhones.map((phone) => <dd key={phone}>{phone}</dd>)}
          </div>
        </dl>
      </section>

      <p className="mt-6 text-sm text-navy/60">{t.visa.disclaimer}</p>
    </div>
  );
}

function SourceLine() {
  const { t } = useLanguage();
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-navy/60">
      <span>{t.visa.source}</span>
      <span aria-hidden>·</span>
      <span>{t.visa.lastChecked}</span>
      <span aria-hidden>·</span>
      <a href={MFA_VISA_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-apricot-dark hover:underline">
        {t.visa.openSource} ↗
      </a>
    </p>
  );
}

// The visas the signed-in person saved in their profile, with their status.
function MyVisas() {
  const { t, lang } = useLanguage();
  const { user, loading } = useAuth();
  const [visas, setVisas] = useState<Visa[] | null>(null);

  useEffect(() => {
    if (user) backend.getProfile(user).then((p) => setVisas(p.visas));
  }, [user]);

  return (
    <section className="card p-6">
      <h2 className="text-xl font-bold">{t.visa.mine.title}</h2>
      {loading ? null : !user ? (
        <>
          <p className="mt-2 text-sm text-navy/60">{t.visa.mine.signIn}</p>
          <Link href="/signin" className="btn-secondary mt-4 !py-2 text-sm">{t.nav.signIn}</Link>
        </>
      ) : (
        <>
          {visas && visas.length === 0 && <p className="mt-2 text-sm text-navy/60">{t.visa.mine.empty}</p>}
          <ul className="mt-3 space-y-2">
            {visas?.map((visa) => (
              <li key={visa.id} className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3">
                <div>
                  <p className="font-semibold">{visa.country ? countryName(visa.country, lang) : "—"}</p>
                  <p className="text-xs text-navy/60">
                    {t.profile.visaTypes[visa.type as keyof typeof t.profile.visaTypes] ?? visa.type}
                    {visa.expiry && ` · ${t.profile.visaExpiry} ${visa.expiry}`}
                  </p>
                </div>
                <VisaBadge expiry={visa.expiry} />
              </li>
            ))}
          </ul>
          <Link href="/profile" className="mt-4 inline-block text-sm font-semibold text-apricot-dark hover:underline">
            {t.visa.mine.manage} →
          </Link>
        </>
      )}
    </section>
  );
}

// Checks a guest's residence permit against the temporary exemption's conditions.
function ExemptionChecker() {
  const { t } = useLanguage();
  const [permitFrom, setPermitFrom] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [permitExpiry, setPermitExpiry] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkExemption> | null>(null);

  // Names come from the dictionary (not the browser) so the server and browser render the same text.
  const names = t.visa.checker.permitCountries;

  const tone =
    result === "ok"
      ? "bg-emerald-50 text-emerald-800"
      : result === "incomplete"
        ? "bg-sand/60 text-navy"
        : "bg-pomegranate/10 text-pomegranate";

  return (
    <section className="card mt-12 p-6">
      <h2 className="text-xl font-bold">🧭 {t.visa.checker.title}</h2>
      <p className="mt-1 text-navy/70">{t.visa.checker.text}</p>
      <form
        className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setResult(checkExemption(permitFrom, entryDate, permitExpiry));
        }}
      >
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.permitFrom}</span>
          <select className="input" value={permitFrom} onChange={(e) => setPermitFrom(e.target.value)}>
            <option value="">—</option>
            {EXEMPTION.permitCountries.map((code) => (
              <option key={code} value={code}>{names[code as keyof typeof names]}</option>
            ))}
            <option value="OTHER">{t.visa.checker.other}</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.entryDate}</span>
          <input className="input" type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.visa.checker.permitExpiry}</span>
          <input className="input" type="date" value={permitExpiry} onChange={(e) => setPermitExpiry(e.target.value)} />
        </label>
        <button className="btn-primary">{t.visa.checker.button}</button>
      </form>
      {result && (
        <div role="status" className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${tone}`}>
          {t.visa.checker.results[result]}
          {result === "ok" && (
            <a href={LINKS.exemptionCountries} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold underline">
              {t.visa.checker.checkList} ↗
            </a>
          )}
        </div>
      )}
    </section>
  );
}
