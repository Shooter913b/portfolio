import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full bg-bg-subtle px-2.5 py-0.5 font-mono text-xs text-text-muted ring-1 ring-white/5",
        className
      )}
    >
      {children}
    </span>
  );
}
