import type { ReactNode } from "react";
import type { AboutContactLinks } from "@/lib/schemas/about";

const iconClass = "h-5 w-5";

export const CONTACT_ICONS: Record<"email" | keyof AboutContactLinks, ReactNode> = {
  email: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M20.3 4.4A17.2 17.2 0 0 0 15.5 3l-.2.4a15.7 15.7 0 0 1 4.7 2.3 12.4 12.4 0 0 0-9.8-3.8 12.4 12.4 0 0 0-9.8 3.8 15.7 15.7 0 0 1 4.7-2.3l-.2-.4a17.2 17.2 0 0 0-4.8 1.4C.7 8.7.2 12.8.5 16.8a17.4 17.4 0 0 0 5.3 2.7l1.3-2a9.5 9.5 0 0 1-2.1-1.1l.5-.4a10.8 10.8 0 0 0 9.2 0l.5.4a9.5 9.5 0 0 1-2.1 1.1l1.3 2a17.4 17.4 0 0 0 5.3-2.7c.5-4.8-.2-8.8-3.3-12.4ZM8.7 14.1c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M18.9 3H22l-6.8 7.8L23 21h-6.2l-4.9-6.4L5.8 21H2.7l7.3-8.4L1 3h6.3l4.4 5.8L18.9 3Zm-1.1 16h1.7L7.1 4.9H5.3L17.8 19Z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M16.6 3h3.1v3.1a6.8 6.8 0 0 0 4.3 1.5V10a9.8 9.8 0 0 1-4.3-1v8.4a6.4 6.4 0 1 1-6.4-6.4c.3 0 .7 0 1 .1v3.2a3.2 3.2 0 1 0 2.3 3.1V3Z" />
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconClass} aria-hidden>
      <path d="M12 2.2c-3.1 0-5.6 2.5-5.6 5.6v8.6c0 3.1 2.5 5.6 5.6 5.6s5.6-2.5 5.6-5.6v-6.2h-2.4v6.2c0 1.8-1.4 3.2-3.2 3.2s-3.2-1.4-3.2-3.2V7.8c0-1.8 1.4-3.2 3.2-3.2s3.2 1.4 3.2 3.2v.6h2.4v-.6c0-3.1-2.5-5.6-5.6-5.6Z" />
    </svg>
  ),
};
