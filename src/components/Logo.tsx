import Link from "next/link";

// Wordmark: Արի in apricot, via in navy.
export default function Logo({ className = "text-2xl" }: { className?: string }) {
  return (
    <Link href="/" className={`font-extrabold tracking-tight ${className}`} aria-label="Arivia">
      <span className="text-apricot">Արի</span>
      <span className="text-navy">via</span>
    </Link>
  );
}
