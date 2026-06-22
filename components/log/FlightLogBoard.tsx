import type { ReactNode } from "react";
import type { BlogPost } from "@/lib/schemas/blog";
import { LogEntryRow } from "./LogEntryRow";

type FlightLogBoardProps = {
  posts: BlogPost[];
  emptyMessage?: string;
  headerAside?: ReactNode;
};

export function FlightLogBoard({
  posts,
  emptyMessage,
  headerAside,
}: FlightLogBoardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/5 bg-bg-elevated/80 backdrop-blur-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            All logs
          </p>
          <p className="mt-0.5 font-mono text-xs text-text-muted/80">
            {posts.length} {posts.length === 1 ? "entry" : "entries"} logged
          </p>
        </div>
        {headerAside}
      </header>

      {posts.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-text-muted sm:px-6">
          {emptyMessage ?? "No log entries yet. Check back soon."}
        </p>
      ) : (
        <ul className="space-y-3 p-4 sm:p-5">
          {posts.map((post) => (
            <LogEntryRow key={post.slug} post={post} />
          ))}
        </ul>
      )}
    </section>
  );
}
