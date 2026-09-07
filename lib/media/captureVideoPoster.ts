/**
 * Capture a still frame from a video URL (or blob URL) for use as a poster.
 * Results are cached in-memory by src so repeated mounts don't re-decode.
 */

const posterCache = new Map<string, Promise<string | null>>();

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("seek failed"));
    };
    const cleanup = () => {
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
    };
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);
    try {
      video.currentTime = time;
    } catch {
      cleanup();
      reject(new Error("seek unsupported"));
    }
  });
}

async function captureOnce(src: string): Promise<string | null> {
  if (typeof document === "undefined") return null;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  // Same-origin public assets; keeps canvas export untainted.
  video.crossOrigin = "anonymous";

  try {
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("video load failed"));
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("error", onError);
      video.src = src;
      video.load();
    });

    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    // Prefer a moment slightly after the start so black intro frames are skipped.
    const target =
      duration > 0.5 ? Math.min(0.25, duration * 0.05) : Math.min(0.1, duration || 0);

    if (target > 0) {
      try {
        await seekVideo(video, target);
      } catch {
        // Fall through and draw whatever frame is already decoded.
      }
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    video.load();
  }
}

/** Returns a data-URL JPEG of an early video frame, or null on failure. */
export function captureVideoPoster(src: string): Promise<string | null> {
  if (!src) return Promise.resolve(null);

  const cached = posterCache.get(src);
  if (cached) return cached;

  const pending = captureOnce(src);
  posterCache.set(src, pending);
  pending.then((result) => {
    if (!result) posterCache.delete(src);
  });
  return pending;
}

/** Build a JPEG File from a video File for admin poster uploads. */
export async function posterFileFromVideo(
  file: File,
  stem = "poster"
): Promise<File | null> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const dataUrl = await captureVideoPoster(objectUrl);
    if (!dataUrl) return null;

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const base = file.name.replace(/\.[^.]+$/, "") || stem;
    return new File([blob], `${base}-poster.jpg`, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(objectUrl);
    posterCache.delete(objectUrl);
  }
}
