"use client";

import { useState } from "react";
import { backend } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <p className="mt-2 text-navy/70">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

// Google works now; Apple ID waits for an Apple developer account.
export function SocialButtons({ onDone }: { onDone: () => void }) {
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  async function google() {
    setBusy(true);
    try {
      await backend.signInWithGoogle();
      // With Supabase the browser leaves for Google; in the demo we're signed in already.
      if (backend.isDemo) onDone();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={google} disabled={busy} className="btn-secondary w-full">
        <GoogleIcon /> {t.auth.google}
      </button>
      <button type="button" disabled className="btn-secondary w-full cursor-not-allowed">
        <AppleIcon /> {t.auth.apple}
        <span className="rounded-full bg-sand px-2 py-0.5 text-xs text-navy/70">{t.auth.soon}</span>
      </button>
      {backend.isDemo && <p className="text-center text-xs text-navy/50">{t.demo.google}</p>}
      <div className="flex items-center gap-3 py-2 text-sm text-navy/50">
        <span className="h-px flex-1 bg-sand" /> {t.auth.or} <span className="h-px flex-1 bg-sand" />
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return <p role="alert" className="rounded-xl bg-pomegranate/10 px-4 py-3 text-sm font-medium text-pomegranate">{message}</p>;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
    </svg>
  );
}
