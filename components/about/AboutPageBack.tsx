import Link from "next/link";
import { cn } from "@/lib/cn";

type AboutPageBackProps = {
  className?: string;
};

export function AboutPageBack({ className }: AboutPageBackProps) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-text-muted transition-colors hover:text-accent-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d="M9 18 3 12l6-6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Back to portfolio
    </Link>
  );
}
