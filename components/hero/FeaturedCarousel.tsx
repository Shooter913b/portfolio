"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/schemas/blog";
import { getFeaturedPostMedia } from "@/lib/log/postMedia";
import { formatDisplayDate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { TimelineCardFeatured } from "@/components/timeline/TimelineCardFeatured";

type FeaturedCarouselProps = {
  posts: BlogPost[];
  className?: string;
};

export function FeaturedCarousel({ posts, className }: FeaturedCarouselProps) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % posts.length);
  }, [posts.length]);

  useEffect(() => {
    if (posts.length <= 1 || paused || reducedMotion) return;
    const id = window.setInterval(next, 6000);
    return () => window.clearInterval(id);
  }, [posts.length, paused, reducedMotion, next]);

  if (posts.length === 0) return null;

  const post = posts[index];
  const featuredMedia = getFeaturedPostMedia(post);

  return (
    <div
      className={cn("mt-8", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-muted">
        Featured
      </p>
      <article className="overflow-hidden rounded-xl border border-white/5 bg-bg-elevated transition-all hover-accent-glow-sm hover:border-white/10">
        {featuredMedia.length > 0 && (
          <div className="border-b border-white/5 [&_figure]:rounded-none [&_div]:rounded-none">
            <TimelineCardFeatured items={featuredMedia} variant="banner" />
          </div>
        )}
        <div className="p-5">
          <time className="font-mono text-xs text-text-muted">
            {formatDisplayDate(post.date)}
          </time>
          <h3 className="mt-2 font-display text-lg font-medium text-text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-muted">
            {post.excerpt ?? post.content.slice(0, 140).trim()}
            {(post.excerpt ?? post.content).length > 140 ? "…" : ""}
          </p>
          <Link
            href={`/log/${post.slug}`}
            className="mt-4 inline-block text-sm text-accent-blue transition-opacity hover:opacity-80"
          >
            Read more →
          </Link>
        </div>
      </article>
      {posts.length > 1 && (
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Featured posts">
          {posts.map((p, i) => (
            <button
              key={p.slug}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${p.title}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "carousel-indicator-active w-6" : "w-1.5 bg-bg-subtle hover:bg-text-muted"
              )}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
