import type { ReactNode } from "react";

type SectionLabelProps = {
  children: ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-px w-6 bg-gradient-to-r from-accent-blue to-accent-purple" />
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
        {children}
      </span>
    </div>
  );
}
