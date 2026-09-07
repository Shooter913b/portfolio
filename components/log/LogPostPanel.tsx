import { cn } from "@/lib/cn";

type LogPostPanelProps = {
  label?: string;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Render only the labeled header strip (no content area). */
  headerOnly?: boolean;
};

export function LogPostPanel({
  label,
  children,
  className,
  contentClassName,
  headerOnly = false,
}: LogPostPanelProps) {
  return (
    <section
      className={cn(
        "glass-pane overflow-hidden",
        className
      )}
    >
      {label && (
        <div
          className={cn(
            "px-6 py-4 sm:px-8",
            !headerOnly && "glass-seam-b"
          )}
        >
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            {label}
          </h2>
        </div>
      )}
      {!headerOnly && children != null && (
        <div className={cn("px-6 py-7 sm:px-8 sm:py-8", contentClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}
