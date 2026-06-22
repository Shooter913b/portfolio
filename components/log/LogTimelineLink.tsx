import Link from "next/link";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { getTimelineTypeLabel } from "@/lib/log/timelineLabels";

const BriefcaseIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
    <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 12h18" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const RocketIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
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
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
    <path d="m3 9 9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M7 11v4c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const ICONS = {
  experience: BriefcaseIcon,
  project: RocketIcon,
  education: CapIcon,
} as const;

type LogTimelineLinkProps = {
  timelineRef: PostTimelineRef;
};

export function LogTimelineLink({ timelineRef }: LogTimelineLinkProps) {
  const typeLabel = getTimelineTypeLabel(timelineRef.type);

  return (
    <Link
      href={`/?entry=${timelineRef.id}#timeline`}
      className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-bg-subtle/50 px-4 py-2.5 text-sm font-medium text-text-primary transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-blue/40 hover:text-accent-blue hover-accent-glow-sm"
    >
      <span className="text-text-muted transition-colors group-hover:text-accent-blue">
        {ICONS[timelineRef.type]}
      </span>
      <span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted group-hover:text-accent-blue/80">
          {typeLabel}
        </span>
        <span className="mt-0.5 block">{timelineRef.title}</span>
      </span>
    </Link>
  );
}
