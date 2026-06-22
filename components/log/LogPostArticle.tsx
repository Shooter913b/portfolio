import Link from "next/link";
import type { BlogPost } from "@/lib/schemas/blog";
import {
  getFeaturedPostMedia,
  getSupplementaryPostMedia,
} from "@/lib/log/postMedia";
import { resolvePostTimelineRefs } from "@/lib/log/timelinePosts";
import { LogPostBody } from "./LogPostBody";
import { LogPostGallery } from "./LogPostGallery";
import { LogPostHeader } from "./LogPostHeader";
import { LogPostMediaCarousel } from "./LogPostMediaCarousel";
import { LogPostPanel } from "./LogPostPanel";

type LogPostArticleProps = {
  post: BlogPost;
};

export function LogPostArticle({ post }: LogPostArticleProps) {
  const featuredMedia = getFeaturedPostMedia(post);
  const supplementaryMedia = getSupplementaryPostMedia(post);
  const timelineRefs = resolvePostTimelineRefs(post);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-20 sm:px-6 sm:py-24">
      <Link
        href="/log"
        className="font-mono text-sm text-text-muted transition-colors hover:text-accent-blue"
      >
        ← Logs
      </Link>

      <div className="mt-8 animate-rise-in space-y-6">
        <LogPostHeader post={post} timelineRefs={timelineRefs} />

        {featuredMedia.length > 0 && (
          <LogPostMediaCarousel items={featuredMedia} />
        )}

        <LogPostPanel label="Written content">
          <LogPostBody content={post.content} />
        </LogPostPanel>

        {supplementaryMedia.length > 0 && (
          <LogPostGallery items={supplementaryMedia} />
        )}
      </div>
    </main>
  );
}
