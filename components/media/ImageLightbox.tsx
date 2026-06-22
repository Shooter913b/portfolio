"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ImageLightboxProps = {
  src: string;
  alt?: string;
  caption?: string;
  open: boolean;
  onClose: () => void;
};

export function ImageLightbox({
  src,
  alt = "",
  caption,
  open,
  onClose,
}: ImageLightboxProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      role="presentation"
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-bg-base/92 backdrop-blur-md",
          !reducedMotion && "animate-backdrop-in"
        )}
        aria-label="Close image"
        onClick={onClose}
      />

      <figure
        role="dialog"
        aria-modal="true"
        aria-label={alt || "Expanded image"}
        className="relative z-10 flex max-h-full max-w-full flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -right-1 -top-1 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-bg-elevated text-text-muted shadow-lg transition-colors hover:border-accent-blue/40 hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple sm:-right-3 sm:-top-3"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
            <path
              d="m6 6 12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-bg-subtle shadow-2xl accent-glow-md">
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            className="h-auto max-h-[min(90vh,1200px)] w-auto max-w-[min(95vw,1400px)] object-contain"
            sizes="95vw"
            priority
          />
        </div>

        {(caption || alt) && (
          <figcaption className="mt-3 max-w-xl px-2 text-center text-sm text-text-muted">
            {caption ?? alt}
          </figcaption>
        )}
      </figure>
    </div>,
    document.body
  );
}
