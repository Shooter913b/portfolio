import { cn } from "@/lib/cn";

type LogPostBodyProps = {
  content: string;
  className?: string;
};

function splitParagraphs(content: string): string[] {
  return content
    .trim()
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function LogPostBody({ content, className }: LogPostBodyProps) {
  const paragraphs = splitParagraphs(content);
  if (paragraphs.length === 0) return null;

  if (paragraphs.length === 1) {
    return (
      <p
        className={cn(
          "text-[15px] leading-relaxed text-text-primary/85 md:text-base",
          className
        )}
      >
        {paragraphs[0]}
      </p>
    );
  }

  return (
    <div className={cn("space-y-5", className)}>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph.slice(0, 48)}
          className="text-[15px] leading-relaxed text-text-primary/85 md:text-base"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}
