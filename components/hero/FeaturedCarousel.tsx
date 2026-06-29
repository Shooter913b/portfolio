"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/lib/schemas/blog";
import { getFeaturedPostMedia } from "@/lib/log/postMedia";
import { formatDisplayDate } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAutoplayActive } from "@/hooks/useAutoplayActive";
import { MediaCarouselControls } from "@/components/media/MediaCarouselControls";
import { TimelineCardFeatured } from "@/components/timeline/TimelineCardFeatured";

const SLIDE_INTERVAL_MS = 5000;

type FeaturedCarouselProps = {
  posts: BlogPost[];
  className?: string;
};

export function FeaturedCarousel({ posts, className }: FeaturedCarouselProps) {
  const reducedMotion = useReducedMotion();
  const { ref: rootRef, active: onScreen } = useAutoplayActive<HTMLDivElement>();
  const [postIndex, setPostIndex] = useState(0);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stateRef = useRef({ postIndex: 0, mediaIndex: 0 });

  stateRef.current = { postIndex, mediaIndex };

  const post = posts[postIndex];
  const featuredMedia = post ? getFeaturedPostMedia(post) : [];
  const safeMediaIndex =
    featuredMedia.length > 0
      ? Math.min(mediaIndex, featuredMedia.length - 1)
      : 0;

  useEffect(() => {
    setMediaIndex(0);
  }, [postIndex]);

  const advanceSlide = useCallback(() => {
    const { postIndex: currentPostIndex, mediaIndex: currentMediaIndex } = stateRef.current;
    const currentPost = posts[currentPostIndex];
    if (!currentPost) return;

    const media = getFeaturedPostMedia(currentPost);
    if (media.length > 1 && currentMediaIndex < media.length - 1) {
      setMediaIndex(currentMediaIndex + 1);
      return;
    }

    setMediaIndex(0);
    if (posts.length > 1) {
      setPostIndex((currentPostIndex + 1) % posts.length);
    }
  }, [posts]);

  const hasMultipleSlides =
    featuredMedia.length > 1 || posts.length > 1;
  const autoPlaying = hasMultipleSlides && !paused && !reducedMotion && onScreen;

  useEffect(() => {
    if (!autoPlaying) return;
    const id = window.setInterval(advanceSlide, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [autoPlaying, advanceSlide, postIndex, featuredMedia.length]);

  if (posts.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("mt-8", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-text-muted">
        Featured
      </p>

      <Link
        href={`/log/${post.slug}`}
        className="block overflow-hidden rounded-xl border border-white/5 bg-bg-elevated transition-all hover-accent-glow-sm hover:border-white/10"
      >
        <article>
          {featuredMedia.length > 0 && (
            <div className="border-b border-white/5 [&_figure]:rounded-none [&_div]:rounded-none">
              <TimelineCardFeatured
                items={featuredMedia}
                variant="banner"
                activeIndex={safeMediaIndex}
                onActiveIndexChange={setMediaIndex}
                intervalMs={SLIDE_INTERVAL_MS}
                showAutoProgress={autoPlaying}
              />
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
            <span className="mt-4 inline-block text-sm text-accent-blue">
              Read more →
            </span>
          </div>
        </article>
      </Link>

      {posts.length > 1 && (
        <MediaCarouselControls
          count={posts.length}
          index={postIndex}
          onIndexChange={setPostIndex}
          autoPlay={autoPlaying}
          intervalMs={SLIDE_INTERVAL_MS}
          showCounter
          label="Featured posts"
          className="mt-3"
        />
      )}
    </div>
  );
}
