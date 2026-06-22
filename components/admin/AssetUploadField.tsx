"use client";

import { useRef, useState } from "react";
import { Button } from "./AdminUi";

type AssetUploadFieldProps = {
  label: string;
  value?: string;
  accept: string;
  onUpload: (file: File) => Promise<void>;
  emptyLabel?: string;
};

export function AssetUploadField({
  label,
  value,
  accept,
  onUpload,
  emptyLabel = "Upload file",
}: AssetUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-[#8888a0]">{label}</p>
      {value ? (
        <p className="truncate font-mono text-xs text-[#c8c8d8]" title={value}>
          {value}
        </p>
      ) : (
        <p className="text-xs italic text-[#5a5a70]">No file uploaded</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading…" : value ? "Replace" : emptyLabel}
        </Button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
