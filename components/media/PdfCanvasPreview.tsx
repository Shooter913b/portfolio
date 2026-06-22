"use client";

import { useEffect, useRef, useState } from "react";
import { PDF_WORKER_SRC } from "@/lib/pdf/worker";
import { cn } from "@/lib/cn";

type PdfCanvasPreviewProps = {
  src: string;
  title?: string;
  cacheKey?: string;
  className?: string;
};

function buildPdfUrl(src: string, cacheKey?: string): string {
  const path = src.split("#")[0];
  if (!cacheKey) return path;
  return `${path}?v=${encodeURIComponent(cacheKey)}`;
}

function isValidPdfHeader(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export function PdfCanvasPreview({
  src,
  title = "PDF preview",
  cacheKey,
  className,
}: PdfCanvasPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pdfUrl = buildPdfUrl(src, cacheKey);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;
    let renderTask: { cancel?: () => void } | null = null;

    const render = async () => {
      try {
        setStatus("loading");
        setErrorMessage(null);

        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Could not load PDF (HTTP ${response.status})`);
        }

        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const bytes = new Uint8Array(buffer);
        if (!isValidPdfHeader(bytes)) {
          throw new Error(
            "This file is not a valid PDF. Re-upload your resume from the admin Resume tab."
          );
        }

        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas is not available");

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

        const task = page.render({ canvasContext: context, viewport });
        renderTask = task;
        await task.promise;

        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Could not render PDF preview"
        );
      }
    };

    void render();

    return () => {
      cancelled = true;
      renderTask?.cancel?.();
    };
  }, [shouldLoad, pdfUrl]);

  if (status === "error") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 p-6 text-center text-sm text-text-muted",
          className
        )}
      >
        <p>{errorMessage ?? "Preview unavailable."}</p>
        <a
          href={pdfUrl}
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
      className={cn("relative overflow-y-auto overflow-x-hidden bg-bg-base", className)}
      aria-busy={status === "loading"}
      aria-label={title}
    >
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
          Loading preview…
        </div>
      )}
      <canvas ref={canvasRef} className="mx-auto block min-h-full" />
    </div>
  );
}
