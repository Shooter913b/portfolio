import type { ResolvedSkillsEntry } from "@/lib/schemas/timeline";
import { SkillsCarousel } from "./SkillsCarousel";

type SkillsTimelineGroupProps = {
  entry: ResolvedSkillsEntry;
  index: number;
};

export function SkillsTimelineGroup({ entry, index }: SkillsTimelineGroupProps) {
  const isLeft = index % 2 === 0;

  return (
    <SkillsCarousel
      categories={entry.categories}
      isLeft={isLeft}
      entryId={entry.id}
    />
  );
}
