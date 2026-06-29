import { cache } from "react";
import { readJsonFile } from "./readJson";
import { getSkills } from "./getSkills";
import {
  timelineSchema,
  type ResolvedTimelineEntry,
  type TimelineEntry,
} from "@/lib/schemas/timeline";
import { preprocessTimelineData } from "@/lib/timeline/preprocess";

function isStaticEntry(entry: TimelineEntry): boolean {
  return entry.type === "resume" || entry.type === "skills";
}

function hasStartDate(
  entry: TimelineEntry
): entry is Exclude<TimelineEntry, { type: "resume" } | { type: "skills" }> {
  return !isStaticEntry(entry);
}

function compareTimelineEntries(a: TimelineEntry, b: TimelineEntry): number {
  const aStatic = isStaticEntry(a);
  const bStatic = isStaticEntry(b);

  if (aStatic && bStatic) return a.order - b.order;
  if (aStatic) return -1;
  if (bStatic) return 1;

  if (!hasStartDate(a) || !hasStartDate(b)) return 0;

  const byStart = b.startDate.localeCompare(a.startDate);
  if (byStart !== 0) return byStart;

  return a.order - b.order;
}

export const getTimeline = cache((): ResolvedTimelineEntry[] => {
  const preprocessed = preprocessTimelineData(readJsonFile("content/timeline.json"));
  const { entries } = timelineSchema.parse(preprocessed);
  const skills = getSkills();

  return entries
    .filter((e) => e.visible)
    .sort(compareTimelineEntries)
    .map((entry) => {
      if (entry.type === "skills") {
        return {
          ...entry,
          categories: skills.categories,
        } satisfies ResolvedTimelineEntry;
      }
      return entry as ResolvedTimelineEntry;
    });
});
