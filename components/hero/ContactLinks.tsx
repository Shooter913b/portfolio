import Link from "next/link";

export function ContactLinks() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/about"
        className="accent-gradient-bg accent-glow-cta inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-bg-base transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        About / Contact
      </Link>
      <Link
        href="/log"
        className="glass-pane hover-glass accent-glow-button-lift inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-text-primary transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        View logs
      </Link>
    </div>
  );
}
