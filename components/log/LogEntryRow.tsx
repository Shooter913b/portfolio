import Link from "next/link";
import type { BlogPost } from "@/lib/schemas/blog";
import { formatDisplayDate } from "@/lib/dates";
import { flightCode } from "@/lib/log/flightCode";
import { LogEntryThumbnail } from "./LogEntryThumbnail";
import { LogEntryEngagementStats } from "./LogEntryEngagementStats";

type LogEntryRowProps = {
  post: BlogPost;
};

export function LogEntryRow({ post }: LogEntryRowProps) {
  const code = flightCode(post.slug, post.date);
  const excerpt =
    post.excerpt ?? post.content.replace(/\s+/g, " ").trim().slice(0, 160);

  return (
    <li>
      <Link
        href={`/log/${post.slug}`}
        className="group block rounded-xl border border-white/5 bg-bg-elevated p-4 transition-all hover:border-white/10 hover-accent-glow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <LogEntryThumbnail post={post} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono text-xs font-medium tracking-wider text-accent-blue">
                {code}
              </span>
              <time className="font-mono text-xs text-text-muted">
                {formatDisplayDate(post.date)}
              </time>
            </div>

            <h2 className="mt-2 font-display text-xl font-medium text-text-primary transition-colors group-hover:text-accent-blue">
              {post.title}
            </h2>

            {excerpt && (
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">
                {excerpt}
                {!post.excerpt && post.content.length > 160 ? "…" : ""}
              </p>
            )}

            <LogEntryEngagementStats slug={post.slug} className="mt-3" />

            <p className="mt-3 font-mono text-xs text-accent-blue/80">
              Read entry →
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}
