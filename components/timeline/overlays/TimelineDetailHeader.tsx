import type { ReactNode } from "react";
import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { formatDateRange } from "@/lib/dates";
import { Tag } from "@/components/ui/Tag";

const BriefcaseIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const RocketIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
    <path
      d="M5 15c-1.5 1-2 4-2 4s3-.5 4-2c.6-.9.5-2-.3-2.7C5.9 13.6 4.7 14.4 5 15Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9 13c.7-3 3-7 8-8 .3 4-2 7.5-5 9l-3-1Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="14.5" cy="9.5" r="1.2" fill="currentColor" />
  </svg>
);

const CapIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5" aria-hidden>
    <path d="m3 9 9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 11v4c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const PinIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden>
    <path
      d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const TYPE_META: Record<
  NarrativeEntry["type"],
  { label: string; icon: ReactNode }
> = {
  experience: { label: "Experience", icon: BriefcaseIcon },
  project: { label: "Project", icon: RocketIcon },
  education: { label: "Education", icon: CapIcon },
};

type TimelineDetailHeaderProps = {
  entry: NarrativeEntry;
  titleId: string;
};

export function TimelineDetailHeader({ entry, titleId }: TimelineDetailHeaderProps) {
  const meta = TYPE_META[entry.type];

  return (
    <header className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="accent-gradient-soft-bg inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-blue ring-1 ring-white/10">
          {meta.icon}
          {meta.label}
        </span>
        <span className="font-mono text-xs text-text-muted">
          {formatDateRange(entry.startDate, entry.endDate)}
        </span>
      </div>

      <h2
        id={titleId}
        className="accent-gradient-text mt-4 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl"
      >
        {entry.title}
      </h2>

      {(entry.subtitle || entry.location) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
          {entry.subtitle && (
            <span className="font-medium text-text-primary/80">
              {entry.subtitle}
            </span>
          )}
          {entry.location && (
            <span className="inline-flex items-center gap-1.5">
              {PinIcon}
              {entry.location}
            </span>
          )}
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      <div className="mt-6 h-px w-full bg-gradient-to-r from-accent-blue/60 via-accent-purple/40 to-transparent" />
    </header>
  );
}
