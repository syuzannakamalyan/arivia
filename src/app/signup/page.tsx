"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthCard, FormError, SocialButtons, isValidEmail } from "@/components/AuthCard";
import { AuthError, backend } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export default function SignUpPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmSent, setConfirmSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) return setError(t.auth.errors.nameRequired);
    if (!isValidEmail(cleanEmail)) return setError(t.auth.errors.emailInvalid);
    if (password.length < 8) return setError(t.auth.errors.passwordShort);

    setBusy(true);
    try {
      const { needsConfirmation } = await backend.signUp(name.trim(), cleanEmail, password);
      if (needsConfirmation) setConfirmSent(true);
      else router.push("/profile");
    } catch (err) {
      setError(err instanceof AuthError && err.code === "emailTaken" ? t.auth.errors.emailTaken : t.auth.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  if (confirmSent) {
    return (
      <AuthCard title={t.auth.signUpTitle} subtitle={t.auth.confirmSent}>
        <Link href="/signin" className="btn-primary w-full">{t.auth.backToSignIn}</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t.auth.signUpTitle} subtitle={t.auth.signUpSubtitle}>
      <SocialButtons onDone={() => router.push("/profile")} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.auth.name}</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.auth.email}</span>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">{t.auth.password}</span>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <span className="mt-1 block text-xs text-navy/50">{t.auth.passwordHint}</span>
        </label>
        <FormError message={error} />
        <button className="btn-primary w-full" disabled={busy}>{t.auth.submitSignUp}</button>
      </form>
      <p className="mt-6 text-center text-sm text-navy/70">
        {t.auth.haveAccount} <Link href="/signin" className="font-semibold text-apricot-dark hover:underline">{t.nav.signIn}</Link>
      </p>
    </AuthCard>
  );
}
