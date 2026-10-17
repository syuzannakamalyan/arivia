"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { backend, useAuth, type Profile, type Visa } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";
import { countryName, countryOptions } from "@/data/countries";

const STYLES = ["culture", "food", "nature", "beach", "shopping", "adventure", "family", "budget"] as const;
const VISA_TYPES = ["schengen", "tourist", "business", "student", "work", "residence", "other"] as const;
const CURRENCIES = ["AMD", "USD", "EUR", "RUB", "GBP"];

export default function ProfilePage() {
  const { t, lang, setLang } = useLanguage();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const countries = useMemo(() => countryOptions(lang), [lang]);

  // Only signed-in people can see this page.
  useEffect(() => {
    if (!loading && !user) router.replace("/signin");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) backend.getProfile(user).then(setProfile);
  }, [user]);

  if (!user || !profile) {
    return <div className="flex flex-1 items-center justify-center p-12 text-navy/50">…</div>;
  }

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setStatus("idle");
  }

  function updateVisa(id: string, changes: Partial<Visa>) {
    update("visas", profile!.visas.map((v) => (v.id === id ? { ...v, ...changes } : v)));
  }

  async function save() {
    setStatus("saving");
    try {
      await backend.saveProfile(user!, profile!);
      if (profile!.language !== lang) setLang(profile!.language);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  async function deleteAccount() {
    if (!window.confirm(t.profile.deleteConfirm)) return;
    await backend.deleteAccount(user!);
    router.push("/");
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold text-apricot-dark">{t.profile.welcome}, {profile.fullName || user.email}</p>
      <h1 className="mt-1 text-3xl font-extrabold">{t.profile.title}</h1>
      <p className="mt-2 text-navy/70">{t.profile.subtitle}</p>

      {/* Personal details */}
      <section className="card mt-8 p-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <PhotoPicker url={profile.avatarUrl} name={profile.fullName} onChange={(url) => update("avatarUrl", url)} />
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <Field label={t.profile.fullName}>
              <input className="input" value={profile.fullName} onChange={(e) => update("fullName", e.target.value)} />
            </Field>
            <Field label={t.auth.email}>
              <input className="input bg-sand/40" value={user.email} disabled />
            </Field>
            <Field label={t.profile.homeCity}>
              <input className="input" value={profile.homeCity} onChange={(e) => update("homeCity", e.target.value)} />
            </Field>
            <Field label={t.profile.passportCountry}>
              <select className="input" value={profile.passportCountry} onChange={(e) => update("passportCountry", e.target.value)}>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </Field>
            <Field label={t.profile.language}>
              <select className="input" value={profile.language} onChange={(e) => update("language", e.target.value as Profile["language"])}>
                <option value="hy">Հայերեն</option>
                <option value="en">English</option>
              </select>
            </Field>
            <Field label={t.profile.currency}>
              <select className="input" value={profile.currency} onChange={(e) => update("currency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold">{t.profile.travelStyle}</p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((style) => {
              const on = profile.travelStyles.includes(style);
              return (
                <button
                  key={style}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    update("travelStyles", on ? profile.travelStyles.filter((s) => s !== style) : [...profile.travelStyles, style])
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    on ? "border-apricot bg-apricot text-white" : "border-sand bg-cream hover:border-navy/30"
                  }`}
                >
                  {t.profile.styles[style]}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visas */}
      <section className="card mt-6 p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{t.profile.visas}</h2>
            <p className="text-sm text-navy/60">{t.profile.visasHint}</p>
          </div>
          <button
            type="button"
            className="btn-secondary !py-2 text-sm"
            onClick={() =>
              update("visas", [...profile.visas, { id: crypto.randomUUID(), country: "", type: "schengen", expiry: "" }])
            }
          >
            + {t.profile.addVisa}
          </button>
        </div>

        {profile.visas.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-cream p-4 text-sm text-navy/60">{t.profile.noVisas}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {profile.visas.map((visa) => (
              <li key={visa.id} className="grid gap-3 rounded-2xl bg-cream p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
                <Field label={t.profile.visaCountry}>
                  <select className="input" value={visa.country} onChange={(e) => updateVisa(visa.id, { country: e.target.value })}>
                    <option value="">—</option>
                    {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label={t.profile.visaType}>
                  <select className="input" value={visa.type} onChange={(e) => updateVisa(visa.id, { type: e.target.value })}>
                    {VISA_TYPES.map((type) => <option key={type} value={type}>{t.profile.visaTypes[type]}</option>)}
                  </select>
                </Field>
                <Field label={t.profile.visaExpiry}>
                  <input className="input" type="date" value={visa.expiry} onChange={(e) => updateVisa(visa.id, { expiry: e.target.value })} />
                </Field>
                <div className="flex items-center gap-3 sm:pb-3">
                  <VisaBadge expiry={visa.expiry} />
                  <button
                    type="button"
                    className="text-sm font-semibold text-pomegranate hover:underline"
                    onClick={() => update("visas", profile.visas.filter((v) => v.id !== visa.id))}
                  >
                    {t.profile.remove}
                  </button>
                </div>
                {visa.country && (
                  <p className="text-xs text-navy/50 sm:col-span-4">
                    {countryName(visa.country, lang)} · {t.profile.visaTypes[visa.type as keyof typeof t.profile.visaTypes]}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Save bar */}
      <div className="sticky bottom-4 mt-6 flex items-center justify-end gap-4 rounded-full bg-white/90 p-2 pl-6 shadow-lg backdrop-blur">
        <span className="text-sm font-medium text-navy/60" aria-live="polite">
          {status === "saved" && `✓ ${t.profile.saved}`}
          {status === "error" && <span className="text-pomegranate">{t.auth.errors.generic}</span>}
        </span>
        <button className="btn-primary" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? t.profile.saving : t.profile.save}
        </button>
      </div>

      {/* My trips comes next */}
      <section className="card mt-6 p-6">
        <h2 className="text-xl font-bold">{t.profile.myTrips}</h2>
        <p className="mt-2 text-sm text-navy/60">{t.profile.tripsSoon}</p>
      </section>

      <section className="mt-10 border-t border-sand pt-6">
        <h2 className="text-sm font-semibold text-navy/60">{t.profile.account}</h2>
        <button onClick={deleteAccount} className="mt-2 text-sm font-semibold text-pomegranate hover:underline">
          {t.profile.deleteAccount}
        </button>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function VisaBadge({ expiry }: { expiry: string }) {
  const { t } = useLanguage();
  const [now] = useState(() => Date.now());
  if (!expiry) return null;
  const days = (new Date(expiry).getTime() - now) / 86_400_000;
  const [label, style] =
    days < 0
      ? [t.profile.expired, "bg-pomegranate/15 text-pomegranate"]
      : days < 60
        ? [t.profile.expiresSoon, "bg-apricot/20 text-apricot-dark"]
        : [t.profile.valid, "bg-emerald-100 text-emerald-700"];
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${style}`}>{label}</span>;
}

// Shrinks the chosen photo to 256px so it stays small enough to save with the profile.
function PhotoPicker({ url, name, onChange }: { url: string; name: string; onChange: (url: string) => void }) {
  const { t } = useLanguage();

  function pick(file: File | undefined) {
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      canvas.getContext("2d")!.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      onChange(canvas.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-apricot text-4xl font-bold text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? <img src={url} alt={t.profile.photo} className="h-full w-full object-cover" /> : (name || "?").charAt(0).toUpperCase()}
      </div>
      <label className="cursor-pointer text-sm font-semibold text-apricot-dark hover:underline">
        {t.profile.changePhoto}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
    </div>
  );
}
