"use client";

import { useState } from "react";
import { uploadAsset } from "@/lib/admin/client";
import { AssetUploadField } from "./AssetUploadField";
import { AdminPanel, Field } from "./AdminUi";
import { ResumePreview } from "./AdminPreview";

export function ResumeEditor() {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [uploadedPath, setUploadedPath] = useState<string | undefined>();

  const onUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      throw new Error("Please upload a PDF file.");
    }
    setSaving(true);
    setStatus(null);
    try {
      await uploadAsset("public/resume.pdf", file, { updateResumeDate: true });
      setUploadedPath("/resume.pdf");
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
      preview={<ResumePreview pdfPath={uploadedPath ?? "/resume.pdf"} />}
    >
      <Field label="Resume file">
        <AssetUploadField
          label="Upload a PDF resume"
          value={uploadedPath}
          accept="application/pdf"
          emptyLabel="Upload PDF"
          onUpload={onUpload}
        />
      </Field>
      {status && <p className="text-sm text-[#8888a0]">{status}</p>}
    </AdminPanel>
  );
}
