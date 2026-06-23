"use client";

import type {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  TimelineEntry,
} from "@/lib/schemas/timeline";
import { Button, EntryCard, SelectInput } from "./AdminUi";

type NarrativeType = ExperienceEntry["type"] | EducationEntry["type"] | ProjectEntry["type"];
type LinkableEntry = ExperienceEntry | EducationEntry | ProjectEntry;

type RelatedTimelineEditorProps = {
  value: string[];
  entries: TimelineEntry[];
  onChange: (ids: string[]) => void;
  filterTypes?: NarrativeType[];
  addLabel?: string;
  emptyLabel?: string;
};

function optionLabel(entry: LinkableEntry): string {
  return `${entry.type}: ${entry.title} (${entry.id})`;
}

function isLinkableEntry(entry: TimelineEntry): entry is LinkableEntry {
  return (
    entry.type === "experience" ||
    entry.type === "education" ||
    entry.type === "project"
  );
}

export function RelatedTimelineEditor({
  value,
  entries,
  onChange,
  filterTypes,
  addLabel = "Add experience, education, or project…",
  emptyLabel = "All narrative timeline entries are linked.",
}: RelatedTimelineEditorProps) {
  const narrativeEntries = entries
    .filter(isLinkableEntry)
    .filter((entry) => !filterTypes || filterTypes.includes(entry.type));
  const available = narrativeEntries.filter((entry) => !value.includes(entry.id));

  const add = (id: string) => {
    if (!id || value.includes(id)) return;
    onChange([...value, id]);
  };

  const remove = (id: string) => {
    onChange(value.filter((entryId) => entryId !== id));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-xs text-[#8888a0]">No timeline links yet.</p>
      ) : (
        value.map((id) => {
          const entry = narrativeEntries.find((item) => item.id === id);
          return (
            <EntryCard key={id} className="flex items-center justify-between gap-3">
              <span className="min-w-0 text-sm text-[#f0f0f5]">
                {entry ? optionLabel(entry) : id}
              </span>
              <Button variant="ghost" onClick={() => remove(id)}>
                Remove
              </Button>
            </EntryCard>
          );
        })
      )}

      {available.length > 0 ? (
        <div className="flex gap-2">
          <SelectInput
            className="min-w-0 flex-1"
            defaultValue=""
            onChange={(e) => {
              add(e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">{addLabel}</option>
            {available.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {optionLabel(entry)}
              </option>
            ))}
          </SelectInput>
        </div>
      ) : (
        value.length > 0 && (
          <p className="text-xs text-[#8888a0]">{emptyLabel}</p>
        )
      )}
    </div>
  );
}
