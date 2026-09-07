"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { captureVideoPoster } from "@/lib/media/captureVideoPoster";
import { cn } from "@/lib/cn";

type VideoThumbnailProps = {
  src: string;
  /** Explicit poster — used as-is when present. */
  poster?: string;
  alt?: string;
  className?: string;
  /** object-fit for the thumbnail image. */
  objectFit?: "cover" | "contain";
  sizes?: string;
  priority?: boolean;
  /** Optional overlay (e.g. play badge) rendered above the thumb. */
  children?: React.ReactNode;
};

/**
 * Shows `poster` when set; otherwise captures an early frame from the video.
 * Auto-captured frames use a plain <img> (data URL) so Next/Image config is untouched.
 */
export function VideoThumbnail({
  src,
  poster,
  alt = "",
  className,
  objectFit = "cover",
  sizes = "(max-width: 768px) 100vw, 320px",
  priority = false,
  children,
}: VideoThumbnailProps) {
  const [autoPoster, setAutoPoster] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (poster || !src) return;

    let cancelled = false;
    setFailed(false);
    setAutoPoster(null);

    captureVideoPoster(src).then((frame) => {
      if (cancelled) return;
      if (frame) setAutoPoster(frame);
      else setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [src, poster]);

  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div className={cn("relative h-full w-full", className)}>
      {poster ? (
        <Image
          src={poster}
          alt={alt}
          fill
          priority={priority}
          className={fitClass}
          sizes={sizes}
        />
      ) : autoPoster ? (
        // eslint-disable-next-line @next/next/no-img-element -- data-URL from canvas capture
        <img
          src={autoPoster}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", fitClass)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-bg-subtle font-mono text-[10px] uppercase tracking-wider text-text-muted">
          {failed ? "video" : "…"}
        </div>
      )}
      {children}
    </div>
  );
}
