import { LOG_REACTIONS } from "@/lib/log/engagement";
import { cn } from "@/lib/cn";

type LogEngagementStatsProps = {
  views: number | null;
  reactions: Record<string, number>;
  className?: string;
  /** When true, only reactions with a count greater than zero are shown. */
  compact?: boolean;
};

export function LogEngagementStats({
  views,
  reactions,
  className,
  compact = false,
}: LogEngagementStatsProps) {
  const visibleReactions = LOG_REACTIONS.filter((reaction) => {
    const count = reactions[reaction] ?? 0;
    return !compact || count > 0;
  });

  const hasReactions = visibleReactions.length > 0;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-text-muted",
        className
      )}
    >
      <span>
        {views === null ? "… views" : `${views.toLocaleString()} view${views === 1 ? "" : "s"}`}
      </span>
      {hasReactions && (
        <>
          <span className="text-white/15" aria-hidden>
            ·
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {visibleReactions.map((reaction) => (
              <span key={reaction} className="inline-flex items-center gap-1">
                <span aria-hidden>{reaction}</span>
                <span>{reactions[reaction] ?? 0}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
