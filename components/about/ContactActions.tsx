"use client";

import { useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import type { About } from "@/lib/schemas/about";
import type { Site } from "@/lib/schemas/site";
import { buildVCardLines, listContactItems } from "@/lib/about/contact";
import { CONTACT_ICONS } from "./ContactIcons";
import { cn } from "@/lib/cn";

type ContactActionsProps = {
  site: Site;
  about: About;
  onFlipBack: () => void;
};

const SaveIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
    <path
      d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 21v-1a5 5 0 0 1 5-5h2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 13v8m4-4h-8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
    <path
      d="m5 13 4 4L19 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
    <path
      d="M9 18 3 12l6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const contactRowClass =
  "group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-bg-subtle/50 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-blue/40 hover-accent-glow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple";

function ContactRow({
  label,
  value,
  icon,
  href,
  external,
  copyOnly,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  href: string | null;
  external: boolean;
  copyOnly: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value.replace(/^@/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable.
    }
  }, [value]);

  const content = (
    <>
      <span className="text-text-muted transition-colors group-hover:text-accent-blue">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {label}
        </span>
        <span className="block truncate text-sm text-text-primary transition-colors group-hover:text-accent-blue">
          {copyOnly && copied ? "Copied!" : value}
        </span>
      </span>
    </>
  );

  if (copyOnly || !href) {
    return (
      <button type="button" onClick={handleCopy} className={contactRowClass}>
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={contactRowClass}
    >
      {content}
    </a>
  );
}

export function ContactActions({ site, about, onFlipBack }: ContactActionsProps) {
  const [saved, setSaved] = useState(false);
  const contactItems = listContactItems(about);

  const handleSave = useCallback(() => {
    const vcard = buildVCardLines(site.name, site.tagline, site.links.site, about).join("\r\n");
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const slug = site.name.toLowerCase().replace(/\s+/g, "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slug}.vcf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }, [site, about]);

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={onFlipBack}
        className="inline-flex items-center gap-1.5 self-start font-mono text-xs text-text-muted transition-colors hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        {ChevronIcon}
        Back
      </button>

      <h2 className="mt-4 text-center font-display text-xl font-semibold text-text-primary">
        Let&apos;s connect
      </h2>

      <Link
        href="/"
        className="accent-gradient-bg group relative mt-5 flex items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 text-bg-base shadow-[0_14px_40px_-12px_rgb(0_212_255/0.7)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.22)_1px,transparent_0)] [background-size:14px_14px] opacity-60"
        />
        <span className="relative">
          <span className="block text-base font-bold">Explore portfolio</span>
          <span className="block text-xs font-medium text-bg-base/80">
            Projects, experience &amp; more
          </span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
          aria-hidden
        >
          <path
            d="M5 12h14m-6-6 6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {contactItems.length > 0 ? (
        <ul className="mt-5 space-y-2.5">
          {contactItems.map((item) => (
            <li key={item.id}>
              <ContactRow
                label={item.label}
                value={item.value}
                href={item.href}
                external={item.external}
                copyOnly={item.copyOnly}
                icon={CONTACT_ICONS[item.id as keyof typeof CONTACT_ICONS]}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-center text-sm text-text-muted">No contact links yet.</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={contactItems.length === 0}
        aria-live="polite"
        className={cn(
          "mt-auto flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 pt-3 text-sm font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple",
          contactItems.length === 0
            ? "cursor-not-allowed text-text-muted/50"
            : "text-text-muted hover:border-accent-purple/40 hover:text-accent-blue hover-accent-glow-sm"
        )}
        style={{ marginTop: "1.25rem" }}
      >
        {saved ? CheckIcon : SaveIcon}
        {saved ? "Contact saved" : "Save to contacts"}
      </button>
    </div>
  );
}
