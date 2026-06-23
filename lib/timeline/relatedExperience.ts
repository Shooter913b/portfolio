import type { NarrativeEntry, ProjectEntry } from "@/lib/schemas/timeline";
import type { PostTimelineRef } from "@/lib/log/timelineLabels";

export function getProjectRelatedExperienceIds(
  project: Pick<ProjectEntry, "relatedExperience">
): string[] {
  return project.relatedExperience ?? [];
}

export function projectRelatesToExperience(
  project: Pick<ProjectEntry, "relatedExperience">,
  experienceId: string
): boolean {
  return getProjectRelatedExperienceIds(project).includes(experienceId);
}

export function resolveExperienceRefs(
  ids: string[],
  entries: NarrativeEntry[]
): PostTimelineRef[] {
  const refs: PostTimelineRef[] = [];

  for (const id of ids) {
    const entry = entries.find((item) => item.id === id);
    if (!entry || entry.type !== "experience") continue;
    refs.push({ id: entry.id, title: entry.title, type: entry.type });
  }

  return refs;
}

export function resolveProjectExperienceRefs(
  project: ProjectEntry,
  entries: NarrativeEntry[]
): PostTimelineRef[] {
  return resolveExperienceRefs(getProjectRelatedExperienceIds(project), entries);
}
