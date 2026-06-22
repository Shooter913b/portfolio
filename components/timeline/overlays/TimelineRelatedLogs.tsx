import Link from "next/link";
import type { BlogPost } from "@/lib/schemas/blog";
import type { NarrativeEntry } from "@/lib/schemas/timeline";
import { formatDisplayDate } from "@/lib/dates";
import { SectionLabel } from "@/components/timeline/overlays/SectionLabel";

type TimelineRelatedLogsProps = {
  entry: NarrativeEntry;
  posts: BlogPost[];
};

export function TimelineRelatedLogs({ entry, posts }: TimelineRelatedLogsProps) {
  if (posts.length === 0) return null;

  return (
    <div className="border-t border-white/5 pt-8">
      <SectionLabel>Related logs</SectionLabel>
      <ul className="mt-4 space-y-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/log/${post.slug}`}
              className="group block rounded-xl border border-white/5 bg-bg-base/40 px-4 py-3 transition-all hover:border-white/10 hover-accent-glow-sm"
            >
              <time className="font-mono text-xs text-text-muted">
                {formatDisplayDate(post.date)}
              </time>
              <p className="mt-1 font-display text-base font-medium text-text-primary transition-colors group-hover:text-accent-blue">
                {post.title}
              </p>
              {post.excerpt && (
                <p className="mt-1 line-clamp-2 text-sm text-text-muted">
                  {post.excerpt}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/log?related=${entry.id}`}
        className="mt-4 inline-block font-mono text-xs text-accent-blue transition-opacity hover:opacity-80"
      >
        View all related logs →
      </Link>
    </div>
  );
}
