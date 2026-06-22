"use client";

import { useEffect, useRef, useState } from "react";
import { PDF_WORKER_SRC } from "@/lib/pdf/worker";

type ResumePreviewProps = {
  src: string;
};

export function ResumePreview({ src }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldRender, setShouldRender] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;

    const renderPage = async () => {
      try {
        setLoading(true);
        setError(false);

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

        const pdf = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const containerWidth = container.clientWidth || 320;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);

        await page.render({ canvasContext: context, viewport }).promise;

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [shouldRender, src]);

  if (error) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-2 p-4 text-center text-sm text-text-muted">
        <p>Preview unavailable.</p>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-blue transition-colors hover:underline"
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-72 overflow-y-auto overflow-x-hidden bg-bg-base"
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          Loading preview…
        </div>
      )}
      <canvas ref={canvasRef} className="mx-auto block min-h-full" />
    </div>
  );
}
