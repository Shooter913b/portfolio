"use client";

import { useEffect, useState } from "react";
import type { SkillCategory, SkillItem, Skills } from "@/lib/schemas/skills";
import { skillsSchema } from "@/lib/schemas/skills";
import { normalizeSkills } from "@/lib/skills/normalize";
import { getContent, saveContent } from "@/lib/admin/client";
import {
  AdminPanel,
  Button,
  EntryCard,
  Field,
  SaveBar,
  SkillListEditor,
  TextInput,
} from "./AdminUi";
import { SkillsCategoryPreview, SkillsFullPreview } from "./AdminPreview";

export function SkillsEditor() {
  const [data, setData] = useState<Skills | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent<{ categories: unknown[] }>("content/skills.json")
      .then((result) => setData(skillsSchema.parse(normalizeSkills(result.data))))
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#8888a0]">Loading skills…</p>;

  const updateCategory = (index: number, patch: Partial<SkillCategory>) => {
    const categories = [...data.categories];
    categories[index] = { ...categories[index], ...patch };
    setData({ categories });
  };

  const addCategory = () => {
    const id = `skills-category-${Date.now()}`;
    setData({
      categories: [
        ...data.categories,
        { id, label: "New category", skills: [] as SkillItem[] },
      ],
    });
  };

  const removeCategory = (index: number) => {
    if (!confirm("Remove this category and all its skills?")) return;
    setData({ categories: data.categories.filter((_, i) => i !== index) });
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const cleaned: Skills = {
        categories: data.categories.map((cat) => ({
          ...cat,
          skills: cat.skills.filter((s) => s.name.trim()),
        })),
      };
      await saveContent("content/skills.json", cleaned, "admin: update skills");
      setData(cleaned);
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPanel
        title="All skills"
        previewLayout="bottom"
        preview={<SkillsFullPreview categories={data.categories} />}
      >
        <p className="text-sm text-[#8888a0]">
          Overview of every category. Edit individual categories below.
        </p>
      </AdminPanel>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={addCategory}>
          Add category
        </Button>
        <p className="text-xs text-[#8888a0]">
          Each skill has a proficiency rank from 1 (familiar) to 4 (expert), shown as dots on the site.
        </p>
      </div>

      {data.categories.map((category, index) => (
          <AdminPanel
            key={`${category.id}-${index}`}
            title={category.label || "Untitled category"}
            preview={<SkillsCategoryPreview category={category} />}
          >
            <EntryCard>
              <div className="flex justify-end">
                <Button variant="danger" onClick={() => removeCategory(index)}>
                  Remove category
                </Button>
              </div>
              <Field label="Category ID">
                <TextInput
                  value={category.id}
                  onChange={(e) => updateCategory(index, { id: e.target.value })}
                />
              </Field>
              <Field label="Label">
                <TextInput
                  value={category.label}
                  onChange={(e) => updateCategory(index, { label: e.target.value })}
                />
              </Field>
            </EntryCard>
            <Field
              label="Skills"
              hint="Rank 1 = familiar · 2 = comfortable · 3 = proficient · 4 = expert"
            >
              <SkillListEditor
                skills={category.skills ?? []}
                onChange={(skills) => updateCategory(index, { skills })}
              />
            </Field>
          </AdminPanel>
      ))}

      <SaveBar onSave={save} saving={saving} status={status} />
    </div>
  );
}
