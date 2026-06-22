"use client";

import { useRouter } from "next/navigation";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { getTimelineTypeLabel } from "@/lib/log/timelineLabels";
import { cn } from "@/lib/cn";

type LogFilterDropdownProps = {
  filterOptions: PostTimelineRef[];
  activeId: string | null;
};

export function LogFilterDropdown({
  filterOptions,
  activeId,
}: LogFilterDropdownProps) {
  const router = useRouter();

  if (filterOptions.length === 0) return null;

  return (
    <div className="relative min-w-[min(100%,14rem)] sm:min-w-[12rem]">
      <label htmlFor="log-filter" className="sr-only">
        Filter logs
      </label>
      <select
        id="log-filter"
        value={activeId ?? ""}
        onChange={(event) => {
          const value = event.target.value;
          router.push(value ? `/log?related=${value}` : "/log");
        }}
        className={cn(
          "w-full appearance-none rounded-xl border border-white/10 bg-bg-subtle py-2 pl-3 pr-9",
          "font-mono text-xs text-text-primary",
          "transition-colors hover:border-white/20 focus:border-accent-blue/40 focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
        )}
      >
        <option value="">All logs</option>
        {filterOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {getTimelineTypeLabel(option.type)} · {option.title}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
        aria-hidden
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
