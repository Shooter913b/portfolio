"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/schemas/site";
import { getContent, saveContent } from "@/lib/admin/client";
import { AdminPanel, Field, SaveBar, TextArea, TextInput } from "./AdminUi";
import { SitePreview } from "./AdminPreview";

export function SiteEditor() {
  const [data, setData] = useState<Site | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent<Site>("content/site.json")
      .then((result) => setData(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#8888a0]">Loading site…</p>;

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveContent("content/site.json", data, "admin: update site");
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanel
      title="Site"
      preview={<SitePreview data={data} />}
    >
      <Field label="Name">
        <TextInput
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </Field>
      <Field label="Tagline">
        <TextInput
          value={data.tagline}
          onChange={(e) => setData({ ...data, tagline: e.target.value })}
        />
      </Field>
      <Field label="Site URL" hint="Used for SEO metadata and Open Graph">
        <TextInput
          value={data.links.site}
          onChange={(e) =>
            setData({ ...data, links: { ...data.links, site: e.target.value } })
          }
        />
      </Field>
      <Field label="Meta title">
        <TextInput
          value={data.meta.title}
          onChange={(e) =>
            setData({ ...data, meta: { ...data.meta, title: e.target.value } })
          }
        />
      </Field>
      <Field label="Meta description">
        <TextArea
          rows={3}
          value={data.meta.description}
          onChange={(e) =>
            setData({
              ...data,
              meta: { ...data.meta, description: e.target.value },
            })
          }
        />
      </Field>
      <SaveBar onSave={save} saving={saving} status={status} />
    </AdminPanel>
  );
}
