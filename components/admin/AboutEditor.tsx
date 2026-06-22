"use client";

import { useEffect, useState } from "react";
import type { About, AboutContactLinks } from "@/lib/schemas/about";
import type { Site } from "@/lib/schemas/site";
import { CONTACT_LINK_FIELDS } from "@/lib/about/contact";
import { normalizeAbout } from "@/lib/about/normalize";
import { getContent, saveContent } from "@/lib/admin/client";
import { AdminPanel, Field, SaveBar, StringListEditor, TextInput } from "./AdminUi";
import { AboutPreview } from "./AdminPreview";

export function AboutEditor() {
  const [data, setData] = useState<About | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getContent<About>("content/about.json"),
      getContent<Site>("content/site.json"),
    ])
      .then(([aboutResult, siteResult]) =>
        setData(normalizeAbout(aboutResult.data, siteResult.data))
      )
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#8888a0]">Loading about…</p>;

  const updateLink = (key: keyof AboutContactLinks, value: string) => {
    setData({ ...data, links: { ...data.links, [key]: value } });
  };

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveContent("content/about.json", data, "admin: update about");
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanel title="About / Contact" preview={<AboutPreview data={data} />}>
      <Field label="Bio paragraphs">
        <StringListEditor
          values={data.bio}
          onChange={(bio) => setData({ ...data, bio })}
          placeholder="Paragraph text"
          addLabel="Add paragraph"
        />
      </Field>
      <Field label="Location">
        <TextInput
          value={data.location ?? ""}
          onChange={(e) => setData({ ...data, location: e.target.value })}
        />
      </Field>

      <div className="mt-2 border-t border-white/10 pt-4">
        <p className="mb-3 text-sm font-medium text-[#f0f0f5]">Contact</p>
        <p className="mb-4 text-xs text-[#8888a0]">
          Leave a field empty to hide it on the site.
        </p>
        <Field label="Email">
          <TextInput
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="you@example.com"
          />
        </Field>
        {CONTACT_LINK_FIELDS.map((field) => (
          <Field key={field.key} label={field.label} hint={field.hint}>
            <TextInput
              value={data.links[field.key]}
              onChange={(e) => updateLink(field.key, e.target.value)}
              placeholder={field.kind === "username" ? "Username" : "https://"}
            />
          </Field>
        ))}
      </div>

      <SaveBar onSave={save} saving={saving} status={status} />
    </AdminPanel>
  );
}
