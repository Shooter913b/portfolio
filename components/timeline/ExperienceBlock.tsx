"use client";

import type { ExperienceEntry } from "@/lib/schemas/timeline";
import { TimelineCard } from "./TimelineCard";

type ExperienceBlockProps = {
  entry: ExperienceEntry;
};

export function ExperienceBlock({ entry }: ExperienceBlockProps) {
  return <TimelineCard entry={entry} />;
}
