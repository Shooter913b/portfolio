export function buildUploadPath(folder: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const stem =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "file";

  return `public/${folder}/${stem}-${Date.now()}.${ext}`;
}

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";
export const VIDEO_ACCEPT = "video/mp4,video/webm";
export const IMAGE_OR_VIDEO_ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`;

export function acceptForMediaType(type: "image" | "video" | "youtube"): string {
  if (type === "image") return IMAGE_ACCEPT;
  if (type === "video") return VIDEO_ACCEPT;
  return "";
}
