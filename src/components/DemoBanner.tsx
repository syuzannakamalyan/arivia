"use client";

import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

// Reminds that accounts are only stored in this browser until Supabase is connected.
export default function DemoBanner() {
  const { isDemo } = useAuth();
  const { t } = useLanguage();
  if (!isDemo) return null;
  return (
    <div className="bg-navy px-4 py-1.5 text-center text-xs font-medium text-cream/90">{t.demo.banner}</div>
  );
}
