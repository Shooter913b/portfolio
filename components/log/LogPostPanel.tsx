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
        "overflow-hidden rounded-xl border border-white/5 bg-bg-elevated/90 shadow-[0_16px_48px_-32px_rgb(0_0_0/0.75)] backdrop-blur-sm",
        className
      )}
    >
      {label && (
        <div
          className={cn(
            "px-6 py-4 sm:px-8",
            !headerOnly && "border-b border-white/5"
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
