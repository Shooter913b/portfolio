import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "glass-tag inline-block px-2.5 py-0.5 font-mono text-xs",
        className
      )}
    >
      {children}
    </span>
  );
}
