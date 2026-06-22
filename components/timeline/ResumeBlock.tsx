"use client";

import type { Site } from "@/lib/schemas/site";
import { ButtonLink } from "@/components/ui/Button";
import { trackResumeDownload } from "@/lib/analytics";
import { ResumePreview } from "./ResumePreview";

type ResumeBlockProps = {
  site: Site;
};

export function ResumeBlock({ site }: ResumeBlockProps) {
  return (
    <div>
      <h3 className="font-display text-lg font-medium text-text-primary">
        Resume
      </h3>
      <p className="mt-2 text-sm text-text-muted">
        Last updated {site.resume.lastUpdated}
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        <ResumePreview src={site.resume.pdfPath} cacheKey={site.resume.lastUpdated} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <ButtonLink
          href={site.resume.pdfPath}
          download="resume.pdf"
          onClick={trackResumeDownload}
        >
          Download PDF
        </ButtonLink>
        <ButtonLink
          href={site.resume.pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
        >
          View online
        </ButtonLink>
      </div>
    </div>
  );
}
