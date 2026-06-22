"use client";

import type { EducationEntry } from "@/lib/schemas/timeline";
import { TimelineCard } from "./TimelineCard";

type EducationBlockProps = {
  entry: EducationEntry;
};

export function EducationBlock({ entry }: EducationBlockProps) {
  return <TimelineCard entry={entry} />;
}
