import { cn } from "@/lib/cn";

type TimelineBodyProps = {
  body: string[];
  className?: string;
};

export function TimelineBody({ body, className }: TimelineBodyProps) {
  if (body.length === 0) return null;

  if (body.length === 1) {
    return (
      <p
        className={cn(
          "text-[15px] leading-relaxed text-text-primary/85 md:text-base",
          className
        )}
      >
        {body[0]}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-4", className)}>
      {body.map((paragraph) => (
        <li key={paragraph.slice(0, 48)} className="flex gap-3.5">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_0_8px_rgb(0_212_255/0.6)]"
            aria-hidden
          />
          <span className="text-[15px] leading-relaxed text-text-primary/85 md:text-base">
            {paragraph}
          </span>
        </li>
      ))}
    </ul>
  );
}
