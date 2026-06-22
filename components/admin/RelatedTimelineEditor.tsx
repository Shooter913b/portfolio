"use client";

import type { NarrativeEntry, TimelineEntry } from "@/lib/schemas/timeline";
import { Button, EntryCard, SelectInput } from "./AdminUi";

type RelatedTimelineEditorProps = {
  value: string[];
  entries: TimelineEntry[];
  onChange: (ids: string[]) => void;
};

function optionLabel(entry: NarrativeEntry): string {
  return `${entry.type}: ${entry.title} (${entry.id})`;
}

function isLinkableEntry(entry: TimelineEntry): entry is NarrativeEntry {
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
}: RelatedTimelineEditorProps) {
  const narrativeEntries = entries.filter(isLinkableEntry);
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
            <option value="">Add experience, education, or project…</option>
            {available.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {optionLabel(entry)}
              </option>
            ))}
          </SelectInput>
        </div>
      ) : (
        value.length > 0 && (
          <p className="text-xs text-[#8888a0]">All narrative timeline entries are linked.</p>
        )
      )}
    </div>
  );
}
