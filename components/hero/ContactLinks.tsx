import Link from "next/link";

export function ContactLinks() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/about"
        className="accent-gradient-bg inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold text-bg-base shadow-[0_12px_36px_-12px_rgb(0_212_255/0.65)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        About / Contact
      </Link>
      <Link
        href="/log"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-bg-elevated px-6 py-3 text-base font-semibold text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover-accent-glow-sm active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        View logs
      </Link>
    </div>
  );
}
