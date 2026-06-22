import { extractYouTubeId, youTubeEmbedUrl } from "@/lib/admin/youtube";
import { cn } from "@/lib/cn";

type YouTubeEmbedProps = {
  src: string;
  title?: string;
  className?: string;
};

export function YouTubeEmbed({ src, title = "YouTube video", className }: YouTubeEmbedProps) {
  const id = extractYouTubeId(src);
  if (!id) return null;

  return (
    <iframe
      src={youTubeEmbedUrl(id)}
      title={title}
      className={cn("h-full w-full border-0", className)}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}
