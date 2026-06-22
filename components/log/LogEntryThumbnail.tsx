"use client";

import type { BlogPost } from "@/lib/schemas/blog";
import { getFeaturedPostMedia } from "@/lib/log/postMedia";
import { TimelineCardFeatured } from "@/components/timeline/TimelineCardFeatured";
import { PaperPlaneSvg } from "@/components/ui/PaperPlaneSvg";
import { cn } from "@/lib/cn";

type LogEntryThumbnailProps = {
  post: BlogPost;
  className?: string;
};

export function LogEntryThumbnail({ post, className }: LogEntryThumbnailProps) {
  const featured = getFeaturedPostMedia(post);

  if (featured.length > 0) {
    return (
      <TimelineCardFeatured
        items={featured}
        variant="thumb"
        compactControls
        className={cn("w-full shrink-0 sm:w-44 md:w-48", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex aspect-[5/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-bg-subtle accent-gradient-soft-bg sm:w-44 md:w-48",
        className
      )}
      aria-hidden
    >
      <PaperPlaneSvg className="opacity-35" width={32} height={24} />
    </div>
  );
}
