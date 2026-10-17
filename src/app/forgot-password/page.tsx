"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, FormError, isValidEmail } from "@/components/AuthCard";
import { backend } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) return setError(t.auth.errors.emailInvalid);
    await backend.resetPassword(cleanEmail);
    setSent(true);
  }

  return (
    <AuthCard title={t.auth.resetTitle} subtitle={sent ? t.auth.resetSent : t.auth.resetSubtitle}>
      {!sent && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">{t.auth.email}</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </label>
          <FormError message={error} />
          <button className="btn-primary w-full">{t.auth.resetSubmit}</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/signin" className="font-semibold text-apricot-dark hover:underline">{t.auth.backToSignIn}</Link>
      </p>
    </AuthCard>
  );
}
