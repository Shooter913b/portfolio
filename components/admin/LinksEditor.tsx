"use client";

import type { TimelineLink } from "@/lib/schemas/timeline-media";
import { Button, EntryCard, SelectInput, TextInput } from "./AdminUi";

type LinksEditorProps = {
  links: TimelineLink[];
  onChange: (links: TimelineLink[]) => void;
};

export function LinksEditor({ links, onChange }: LinksEditorProps) {
  const update = (index: number, patch: Partial<TimelineLink>) => {
    const next = [...links];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <EntryCard key={index}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8888a0]">
              Link {index + 1}
            </p>
            <Button variant="ghost" onClick={() => onChange(links.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>
          <TextInput
            value={link.label}
            onChange={(e) => update(index, { label: e.target.value })}
            placeholder="Label"
          />
          <TextInput
            value={link.href}
            onChange={(e) => update(index, { href: e.target.value })}
            placeholder="https://…"
          />
          <SelectInput
            value={link.icon ?? ""}
            onChange={(e) =>
              update(index, {
                icon: (e.target.value || undefined) as TimelineLink["icon"],
              })
            }
          >
            <option value="">No icon</option>
            <option value="github">GitHub</option>
            <option value="external">External</option>
            <option value="paper">Paper</option>
            <option value="video">Video</option>
            <option value="site">Site</option>
          </SelectInput>
        </EntryCard>
      ))}
      <Button
        variant="secondary"
        onClick={() =>
          onChange([...links, { label: "", href: "https://", icon: "external" }])
        }
      >
        Add link
      </Button>
    </div>
  );
}
