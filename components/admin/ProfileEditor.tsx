"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/schemas/profile";
import { getContent, saveContent, uploadAsset } from "@/lib/admin/client";
import { IMAGE_ACCEPT } from "@/lib/admin/assets";
import { AssetUploadField } from "./AssetUploadField";
import { AdminPanel, Field, SaveBar, TextInput } from "./AdminUi";
import { ProfilePreview } from "./AdminPreview";

export function ProfileEditor() {
  const [data, setData] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getContent<Profile>("content/profile.json")
      .then((result) => setData(result.data))
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, []);

  if (error) return <p className="text-red-400">{error}</p>;
  if (!data) return <p className="text-[#8888a0]">Loading profile…</p>;

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveContent("content/profile.json", data, "admin: update profile");
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onPhotoUpload = async (file: File) => {
    setStatus(null);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const result = await uploadAsset(`public/profile/photo.${ext}`, file);
    setData({
      ...data,
      photo: {
        ...data.photo,
        src: result.publicPath,
      },
    });
    setStatus(`Uploaded ${result.publicPath}. Click Save & deploy to commit.`);
  };

  return (
    <AdminPanel
      title="Profile photo"
      preview={<ProfilePreview data={data} />}
    >
      <Field label="Photo">
        <AssetUploadField
          label="Upload a profile photo"
          value={data.photo.src ?? undefined}
          accept={IMAGE_ACCEPT}
          emptyLabel="Upload photo"
          onUpload={onPhotoUpload}
        />
      </Field>
      <Field label="Alt text">
        <TextInput
          value={data.photo.alt}
          onChange={(e) =>
            setData({
              ...data,
              photo: { ...data.photo, alt: e.target.value },
            })
          }
        />
      </Field>
      <Field label="Placeholder initials">
        <TextInput
          value={data.photo.placeholderInitials}
          onChange={(e) =>
            setData({
              ...data,
              photo: { ...data.photo, placeholderInitials: e.target.value },
            })
          }
        />
      </Field>
      <SaveBar onSave={save} saving={saving} status={status} />
    </AdminPanel>
  );
}
