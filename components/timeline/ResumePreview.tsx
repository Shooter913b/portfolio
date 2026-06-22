"use client";

import { PdfCanvasPreview } from "@/components/media/PdfCanvasPreview";

type ResumePreviewProps = {
  src: string;
  cacheKey?: string;
};

export function ResumePreview({ src, cacheKey }: ResumePreviewProps) {
  return (
    <PdfCanvasPreview
      src={src}
      cacheKey={cacheKey}
      title="Resume preview"
      className="h-72"
    />
  );
}
