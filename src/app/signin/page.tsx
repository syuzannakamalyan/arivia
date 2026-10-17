"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard, FormError, SocialButtons, isValidEmail } from "@/components/AuthCard";
import { AuthError, useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export default function SignInPage() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) return setError(t.auth.errors.emailInvalid);

    setBusy(true);
    try {
      await signIn(cleanEmail, password);
      router.push("/profile");
    } catch (err) {
      const code = err instanceof AuthError ? err.code : "generic";
      setError(code === "wrongCredentials" || code === "locked" ? t.auth.errors[code] : t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title={t.auth.signInTitle} subtitle={t.auth.signInSubtitle}>
      <SocialButtons onDone={() => router.push("/profile")} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.auth.email}</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-semibold">
            {t.auth.password}
            <Link href="/forgot-password" className="font-medium text-apricot-dark hover:underline">{t.auth.forgot}</Link>
          </span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <FormError message={error} />
        <button className="btn-primary w-full" disabled={busy}>{t.auth.submitSignIn}</button>
      </form>
      <p className="mt-6 text-center text-sm text-navy/70">
        {t.auth.noAccount} <Link href="/signup" className="font-semibold text-apricot-dark hover:underline">{t.nav.signUp}</Link>
      </p>
    </AuthCard>
  );
}
