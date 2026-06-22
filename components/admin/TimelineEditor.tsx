"use client";

import { useEffect, useState } from "react";
import type { TimelineEntry } from "@/lib/schemas/timeline";
import { getContent, saveContent } from "@/lib/admin/client";
import { TimelineMediaEditor } from "./TimelineMediaEditor";
import { LinksEditor } from "./LinksEditor";
import {
  AdminPanel,
  Button,
  CheckboxField,
  Field,
  MonthInput,
  RadioGroup,
  SaveBar,
  StringListEditor,
  TextArea,
  TextInput,
} from "./AdminUi";
import { TimelineEntryPreview } from "./AdminPreview";

type TimelineData = { entries: TimelineEntry[] };

type NarrativeType = "experience" | "education" | "project";

function isNarrative(entry: TimelineEntry): entry is Extract<
  TimelineEntry,
  { type: NarrativeType }
> {
  return (
    entry.type === "experience" ||
    entry.type === "education" ||
    entry.type === "project"
  );
}

function isStatic(entry: TimelineEntry): boolean {
  return entry.type === "resume" || entry.type === "skills";
}

function createNarrativeEntry(type: NarrativeType): Extract<TimelineEntry, { type: NarrativeType }> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return {
    id: `new-${type}-${Date.now()}`,
    type,
    order: 0,
    visible: true,
    title: "New entry",
    subtitle: "",
    location: "",
    startDate: month,
    endDate: null,
    summary: "",
    body: [],
    tags: [],
    media: [],
    links: [],
  };
}

function normalizeOrder(entries: TimelineEntry[]): TimelineEntry[] {
  return entries.map((entry, index) => ({ ...entry, order: index * 10 }));
}

function entryLabel(entry: TimelineEntry): string {
  if (isNarrative(entry)) {
    return entry.title || entry.id;
  }
  return entry.type === "resume" ? "Resume" : "Skills";
}

export function TimelineEditor() {
  const [data, setData] = useState<TimelineData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent<TimelineData>("content/timeline.json")
      .then((result) => {
        setData(result.data);
        setSelectedId(result.data.entries[0]?.id ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#8888a0]">Loading timeline…</p>;

  const index = data.entries.findIndex((entry) => entry.id === selectedId);
  const entry = index >= 0 ? data.entries[index] : null;

  const setEntries = (entries: TimelineEntry[]) => {
    setData({ entries });
  };

  const updateEntry = (patch: Partial<TimelineEntry>) => {
    if (index < 0) return;
    const entries = [...data.entries];
    entries[index] = { ...entries[index], ...patch } as TimelineEntry;
    setEntries(entries);
  };

  const moveEntry = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    if (to < 0 || to >= data.entries.length) return;
    const entries = [...data.entries];
    [entries[from], entries[to]] = [entries[to], entries[from]];
    setEntries(entries);
  };

  const addEntry = (type: NarrativeType) => {
    const entries = [...data.entries, createNarrativeEntry(type)];
    setEntries(entries);
    setSelectedId(entries[entries.length - 1].id);
  };

  const removeEntry = () => {
    if (!entry || isStatic(entry)) return;
    if (!confirm(`Remove "${entryLabel(entry)}"?`)) return;
    const entries = data.entries.filter((e) => e.id !== entry.id);
    setEntries(entries);
    setSelectedId(entries[0]?.id ?? null);
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const payload = { entries: normalizeOrder(data.entries) };
      await saveContent("content/timeline.json", payload, "admin: update timeline");
      setData(payload);
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-[#111118] p-4 text-sm text-[#8888a0]">
        <p>
          <strong className="text-[#c8c8d8]">How ordering works:</strong> Resume and Skills
          always appear first. Other entries sort by <em>start date</em> (newest first). List
          position here is a tiebreaker when two entries share the same month — use ↑↓ to
          adjust. You don&apos;t need to edit order numbers manually.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => addEntry("experience")}>
          + Experience
        </Button>
        <Button variant="secondary" onClick={() => addEntry("education")}>
          + Education
        </Button>
        <Button variant="secondary" onClick={() => addEntry("project")}>
          + Project
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,280px)_1fr]">
        <aside className="space-y-1 rounded-lg border border-white/10 bg-[#111118] p-2">
          {data.entries.map((item, itemIndex) => (
            <div
              key={item.id}
              className={`flex items-center gap-1 rounded-md ${
                item.id === selectedId ? "bg-[#00d4ff]/15 ring-1 ring-[#00d4ff]/40" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="min-w-0 flex-1 truncate px-2 py-2 text-left text-sm text-[#f0f0f5]"
              >
                <span className="text-xs uppercase text-[#8888a0]">{item.type}</span>
                <br />
                {entryLabel(item)}
              </button>
              <div className="flex shrink-0 flex-col">
                <Button
                  variant="ghost"
                  className="px-1.5 py-0.5 text-xs"
                  onClick={() => moveEntry(itemIndex, -1)}
                  disabled={itemIndex === 0}
                  aria-label="Move up"
                >
                  Up
                </Button>
                <Button
                  variant="ghost"
                  className="px-1.5 py-0.5 text-xs"
                  onClick={() => moveEntry(itemIndex, 1)}
                  disabled={itemIndex === data.entries.length - 1}
                  aria-label="Move down"
                >
                  Down
                </Button>
              </div>
            </div>
          ))}
        </aside>

        {entry && (
          <AdminPanel
            title={`Edit ${entry.type} — ${entry.id}`}
            previewLayout="bottom"
            preview={<TimelineEntryPreview entry={entry} />}
          >
            {!isStatic(entry) && (
              <div className="flex justify-end">
                <Button variant="danger" onClick={removeEntry}>
                  Remove entry
                </Button>
              </div>
            )}

            <Field label="ID" hint="Used in URLs and log links (e.g. ?entry=aed-drone)">
              <TextInput
                value={entry.id}
                onChange={(e) => updateEntry({ id: e.target.value } as Partial<TimelineEntry>)}
                disabled={isStatic(entry)}
              />
            </Field>

            <CheckboxField
              label="Visible on site"
              checked={entry.visible}
              onChange={(visible) =>
                updateEntry({ visible } as Partial<TimelineEntry>)
              }
            />

            {isNarrative(entry) && (
              <>
                <RadioGroup
                  label="Type"
                  value={entry.type}
                  options={[
                    { value: "experience", label: "Experience" },
                    { value: "education", label: "Education" },
                    { value: "project", label: "Project" },
                  ]}
                  onChange={(type) =>
                    updateEntry({ type } as Partial<TimelineEntry>)
                  }
                />

                <Field label="Title">
                  <TextInput
                    value={entry.title}
                    onChange={(e) => updateEntry({ title: e.target.value })}
                  />
                </Field>

                <Field label="Subtitle">
                  <TextInput
                    value={entry.subtitle ?? ""}
                    onChange={(e) => updateEntry({ subtitle: e.target.value })}
                  />
                </Field>

                <Field label="Location">
                  <TextInput
                    value={entry.location ?? ""}
                    onChange={(e) => updateEntry({ location: e.target.value })}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Start date">
                    <MonthInput
                      value={entry.startDate}
                      onChange={(value) => updateEntry({ startDate: value })}
                    />
                  </Field>

                  <Field label="End date">
                    <CheckboxField
                      label="Currently active (no end date)"
                      checked={entry.endDate === null}
                      onChange={(active) =>
                        updateEntry({
                          endDate: active ? null : entry.startDate,
                        })
                      }
                    />
                    {entry.endDate !== null && (
                      <MonthInput
                        value={entry.endDate}
                        onChange={(value) => updateEntry({ endDate: value })}
                      />
                    )}
                  </Field>
                </div>

                <Field label="Summary">
                  <TextArea
                    rows={3}
                    value={entry.summary}
                    onChange={(e) => updateEntry({ summary: e.target.value })}
                  />
                </Field>

                <Field label="Body">
                  <StringListEditor
                    values={entry.body}
                    onChange={(body) => updateEntry({ body })}
                    placeholder="Bullet point"
                    addLabel="Add bullet"
                  />
                </Field>

                <Field label="Tags">
                  <StringListEditor
                    values={entry.tags}
                    onChange={(tags) => updateEntry({ tags })}
                    placeholder="Tag"
                    addLabel="Add tag"
                  />
                </Field>

                <Field label="Links">
                  <LinksEditor
                    links={entry.links}
                    onChange={(links) => updateEntry({ links })}
                  />
                </Field>

                <Field
                  label="Media"
                  hint="Upload images or videos. Check “Feature on timeline card” for spine previews — multiple featured items rotate in a carousel."
                >
                  <TimelineMediaEditor
                    media={entry.media}
                    onChange={(media) => updateEntry({ media })}
                    assetFolder={`timeline/${entry.id}`}
                    showFeatured
                    onStatus={setStatus}
                  />
                </Field>
              </>
            )}
          </AdminPanel>
        )}
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />
    </div>
  );
}
