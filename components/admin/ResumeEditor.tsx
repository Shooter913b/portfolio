"use client";

import { useState } from "react";
import { uploadAsset } from "@/lib/admin/client";
import { AssetUploadField } from "./AssetUploadField";
import { AdminPanel, Field } from "./AdminUi";
import { ResumePreview } from "./AdminPreview";

export function ResumeEditor() {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | undefined>();

  const onUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      throw new Error("Please upload a PDF file.");
    }

    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const valid =
      header.length >= 5 &&
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46;
    if (!valid) {
      throw new Error("That file does not look like a valid PDF.");
    }

    setSaving(true);
    setStatus(null);
    try {
      await uploadAsset("public/resume.pdf", file, { updateResumeDate: true });
      setUploadedAt(new Date().toISOString());
      setStatus("Resume uploaded. Netlify will rebuild in ~1–3 minutes.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPanel
      title="Resume PDF"
      preview={
        <ResumePreview pdfPath="/resume.pdf" cacheKey={uploadedAt} key={uploadedAt ?? "default"} />
      }
    >
      <Field label="Resume file">
        <AssetUploadField
          label="Upload a PDF resume"
          value={uploadedAt ? "/resume.pdf" : undefined}
          accept="application/pdf"
          emptyLabel="Upload PDF"
          onUpload={onUpload}
        />
      </Field>
      {status && <p className="text-sm text-[#8888a0]">{status}</p>}
    </AdminPanel>
  );
}
