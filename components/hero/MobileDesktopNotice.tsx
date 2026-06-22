function MonitorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-8 w-8 shrink-0 text-accent-blue"
      aria-hidden
    >
      <rect
        x="2"
        y="4"
        width="20"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 21h8M12 17v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MobileDesktopNotice() {
  return (
    <section
      aria-label="Desktop viewing recommendation"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16 md:hidden"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent-blue/25 to-transparent"
        aria-hidden
      />

      <div className="relative w-full max-w-sm">
        <div
          className="pointer-events-none absolute -inset-6 rounded-3xl accent-gradient-soft-bg opacity-60 blur-2xl"
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-2xl border border-accent-blue/35 bg-bg-elevated p-6 shadow-[0_0_40px_-8px_rgb(0_212_255/0.45)] accent-glow-md">
          <div className="accent-gradient-bg h-1 w-full" aria-hidden />
          <div className="mt-5 flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-blue/30 bg-bg-subtle accent-gradient-soft-bg">
              <MonitorIcon />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-blue">
              Heads up
            </p>
            <h2 className="accent-gradient-text mt-2 font-display text-xl font-semibold leading-snug tracking-tight">
              Best viewed on a computer
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              This portfolio is designed for a large screen. For the full
              timeline, animations, and detail views, open it on a desktop or
              laptop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
