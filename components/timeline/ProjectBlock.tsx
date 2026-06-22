"use client";

import type { ProjectEntry } from "@/lib/schemas/timeline";
import { TimelineCard } from "./TimelineCard";

type ProjectBlockProps = {
  entry: ProjectEntry;
};

export function ProjectBlock({ entry }: ProjectBlockProps) {
  return <TimelineCard entry={entry} />;
}
