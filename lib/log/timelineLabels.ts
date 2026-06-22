import type { NarrativeEntry } from "@/lib/schemas/timeline";

export type PostTimelineRef = {
  id: string;
  title: string;
  type: NarrativeEntry["type"];
};

const TYPE_LABELS: Record<NarrativeEntry["type"], string> = {
  experience: "Experience",
  education: "Education",
  project: "Project",
};

export function getTimelineTypeLabel(type: NarrativeEntry["type"]): string {
  return TYPE_LABELS[type];
}
