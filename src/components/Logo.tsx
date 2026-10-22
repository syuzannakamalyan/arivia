import Link from "next/link";

// Wordmark: "Ari" in brand, "via" in the text color (navy, or light in dark mode).
export default function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <Link href="/" className={`font-extrabold tracking-tight ${className}`} aria-label="Arivia">
      <span className="text-brand">Ari</span>
      <span className="text-ink">via</span>
    </Link>
  );
}
