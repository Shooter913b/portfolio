import { cn } from "@/lib/cn";

const variants = {
  primary:
    "accent-gradient-soft-bg accent-glow-button text-accent-blue hover-accent-glow-button",
  ghost: "text-text-muted hover:text-accent-blue hover:bg-bg-subtle",
  secondary: "glass-pane hover-glass text-text-primary",
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: keyof typeof variants;
};

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
