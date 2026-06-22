import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogIndexClient } from "@/components/log/LogIndexClient";
import { getAllPosts } from "@/lib/content/getFeaturedPosts";
import { getSite } from "@/lib/content/getSite";
import { getTimelineEntriesWithPosts } from "@/lib/log/timelinePosts";

const site = getSite();

export const metadata: Metadata = {
  title: `${site.name} · Logs`,
  description: "Project write-ups, lessons learned, and updates.",
};

export default function LogIndexPage() {
  const posts = getAllPosts();
  const filterOptions = getTimelineEntriesWithPosts();

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-5 py-20 sm:px-6 sm:py-24">
      <Link
        href="/"
        className="font-mono text-sm text-text-muted transition-colors hover:text-accent-blue"
      >
        ← Home
      </Link>

      <header className="mt-8 animate-rise-in">
        <h1 className="accent-gradient-text font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Logs
        </h1>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-text-muted">
          Latest updates
        </p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-muted">
          Project write-ups, lessons learned, and the occasional deep dive into
          something that didn&apos;t work the first time.
        </p>
      </header>

      <div className="mt-10 animate-rise-in" style={{ animationDelay: "80ms" }}>
        <Suspense fallback={null}>
          <LogIndexClient posts={posts} filterOptions={filterOptions} />
        </Suspense>
      </div>
    </main>
  );
}
