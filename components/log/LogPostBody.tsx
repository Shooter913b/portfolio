import { parseLogMarkdown } from "@/lib/log/markdown";
import { cn } from "@/lib/cn";

type LogPostBodyProps = {
  content: string;
  className?: string;
};

const bodyTextClass =
  "text-[15px] leading-relaxed text-text-primary/85 md:text-base [&_a]:text-accent-blue";

export function LogPostBody({ content, className }: LogPostBodyProps) {
  const blocks = parseLogMarkdown(content);
  if (blocks.length === 0) return null;

  return (
    <div className={cn("space-y-5", bodyTextClass, className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  className="font-display text-xl font-semibold text-text-primary"
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            }
            return (
              <h3
                key={index}
                className="font-display text-lg font-medium text-text-primary"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );
          case "list":
            return (
              <ul key={index} className="list-disc space-y-2 pl-5">
                {block.items.map((item) => (
                  <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ul>
            );
          case "blockquote":
            return (
              <blockquote
                key={index}
                className="border-l-2 border-accent-blue/40 pl-4 text-text-muted italic"
                dangerouslySetInnerHTML={{ __html: block.html }}
              />
            );
          default:
            return (
              <p key={index} dangerouslySetInnerHTML={{ __html: block.html }} />
            );
        }
      })}
    </div>
  );
}
