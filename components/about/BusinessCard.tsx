"use client";

import { useState } from "react";
import type { About } from "@/lib/schemas/about";
import type { Profile } from "@/lib/schemas/profile";
import type { Site } from "@/lib/schemas/site";
import { ProfilePhoto } from "@/components/hero/ProfilePhoto";
import { ContactActions } from "./ContactActions";
import { cn } from "@/lib/cn";

type BusinessCardProps = {
  site: Site;
  profile: Profile;
  about: About;
  className?: string;
};

const faceClasses =
  "business-card accent-glow-xl relative overflow-visible rounded-3xl border border-white/10 bg-bg-elevated";

/** h-80: bottom of photo at 2/3 height + generous gap before name */
const CONTENT_TOP = "pt-[16rem]";

export function BusinessCard({ site, profile, about, className }: BusinessCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={cn(
        "flip-perspective animate-rise-in mx-auto w-full max-w-md pt-[6.75rem]",
        className
      )}
    >
      <div className={cn("flip-inner", flipped && "is-flipped")}>
        {/* FRONT */}
        <article
          className={cn(faceClasses, "flip-face-front")}
          inert={flipped}
          aria-hidden={flipped}
        >
          {/* Photo: top third peaks above the card edge */}
          <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/3">
            <ProfilePhoto
              profile={profile}
              sizeClassName="h-80 w-80"
              initialsClassName="text-7xl"
              className="accent-glow-md rounded-[1.75rem] ring-[6px] ring-bg-elevated"
            />
          </div>

          <div className={cn("relative px-6 pb-8 sm:px-8", CONTENT_TOP)}>
            <div className="text-center">
              <h1 className="accent-gradient-text font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {site.name}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-text-muted sm:text-[15px]">
                {site.tagline}
              </p>
              {about.location && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-bg-subtle/60 px-3 py-1 font-mono text-[11px] text-text-muted">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden>
                    <path
                      d="M12 21s-7-5.686-7-11a7 7 0 1 1 14 0c0 5.314-7 11-7 11Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {about.location}
                </p>
              )}
            </div>

            {about.bio.length > 0 && (
              <p className="mt-4 text-center text-sm leading-relaxed text-text-primary/85">
                {about.bio[0]}
              </p>
            )}

            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="accent-gradient-bg relative z-10 mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-base font-semibold text-bg-base shadow-[0_12px_36px_-12px_rgb(0_212_255/0.65)] transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
            >
              View more
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M5 12h14m-6-6 6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="mt-6 text-center font-mono text-[10px] tracking-wider text-text-muted/70">
              {site.links.site.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </article>

        {/* BACK */}
        <article
          className={cn(faceClasses, "flip-face-back overflow-hidden p-6 sm:p-8")}
          inert={!flipped}
          aria-hidden={!flipped}
        >
          <ContactActions site={site} about={about} onFlipBack={() => setFlipped(false)} />
        </article>
      </div>
    </div>
  );
}
