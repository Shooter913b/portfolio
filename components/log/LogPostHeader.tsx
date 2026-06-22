import type { BlogPost } from "@/lib/schemas/blog";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";
import { formatDisplayDate } from "@/lib/dates";
import { TimelineLinks } from "@/components/timeline/overlays/TimelineLinks";
import { Tag } from "@/components/ui/Tag";
import { LogTimelineLink } from "./LogTimelineLink";
import { LogPostPanel } from "./LogPostPanel";

type LogPostHeaderProps = {
  post: BlogPost;
  timelineRefs?: PostTimelineRef[];
};

export function LogPostHeader({ post, timelineRefs = [] }: LogPostHeaderProps) {
  return (
    <LogPostPanel className="relative">
      <div className="pointer-events-none absolute inset-0 accent-gradient-soft-bg opacity-35" />
      <div className="relative">
        <time className="font-mono text-xs text-text-muted">
          {formatDisplayDate(post.date)}
        </time>

        <h1 className="accent-gradient-text mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        {post.excerpt && (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-muted">
            {post.excerpt}
          </p>
        )}

        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {timelineRefs.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-text-muted">
              Related timeline
            </p>
            <div className="flex flex-wrap gap-2.5">
              {timelineRefs.map((timelineRef) => (
                <LogTimelineLink key={timelineRef.id} timelineRef={timelineRef} />
              ))}
            </div>
          </div>
        )}

        {post.links.length > 0 && (
          <div className="mt-6 border-t border-white/5 pt-6">
            <TimelineLinks links={post.links} />
          </div>
        )}
      </div>
    </LogPostPanel>
  );
}
