"use client";

import type { TimelineMediaItem } from "@/lib/schemas/timeline-media";
import { uploadAsset } from "@/lib/admin/client";
import {
  acceptForMediaType,
  buildUploadPath,
  IMAGE_ACCEPT,
} from "@/lib/admin/assets";
import { AssetUploadField } from "./AssetUploadField";
import {
  Button,
  CheckboxField,
  EntryCard,
  RadioGroup,
  TextInput,
} from "./AdminUi";

type TimelineMediaEditorProps = {
  media: TimelineMediaItem[];
  onChange: (media: TimelineMediaItem[]) => void;
  assetFolder: string;
  onStatus?: (message: string) => void;
  showFeatured?: boolean;
  featuredLabel?: string;
};

export function TimelineMediaEditor({
  media,
  onChange,
  assetFolder,
  onStatus,
  showFeatured = false,
  featuredLabel = "Feature on timeline card",
}: TimelineMediaEditorProps) {
  const update = (index: number, patch: Partial<TimelineMediaItem>) => {
    const next = [...media];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const uploadFile = async (
    index: number,
    file: File,
    field: "src" | "poster"
  ) => {
    const path = buildUploadPath(assetFolder, file);
    const result = await uploadAsset(path, file);
    update(index, { [field]: result.publicPath });
    onStatus?.(`Uploaded ${result.publicPath}. Save to commit.`);
  };

  return (
    <div className="space-y-3">
      {media.map((item, index) => (
        <EntryCard key={index}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[#8888a0]">
              Media {index + 1}
            </p>
            <Button variant="ghost" onClick={() => onChange(media.filter((_, i) => i !== index))}>
              Remove
            </Button>
          </div>

          <RadioGroup
            label="Type"
            value={item.type}
            options={[
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
              { value: "youtube", label: "YouTube" },
            ]}
            onChange={(type) =>
              update(index, { type, src: type === item.type ? item.src : "" })
            }
          />

          {item.type === "youtube" ? (
            <TextInput
              value={item.src}
              onChange={(e) => update(index, { src: e.target.value })}
              placeholder="YouTube URL or video ID"
            />
          ) : (
            <AssetUploadField
              label={item.type === "image" ? "Image file" : "Video file"}
              value={item.src || undefined}
              accept={acceptForMediaType(item.type)}
              emptyLabel={item.type === "image" ? "Upload image" : "Upload video"}
              onUpload={(file) => uploadFile(index, file, "src")}
            />
          )}

          <TextInput
            value={item.alt ?? ""}
            onChange={(e) => update(index, { alt: e.target.value || undefined })}
            placeholder="Alt text"
          />
          <TextInput
            value={item.caption ?? ""}
            onChange={(e) => update(index, { caption: e.target.value || undefined })}
            placeholder="Caption (optional)"
          />

          {item.type === "video" && (
            <AssetUploadField
              label="Poster image (optional)"
              value={item.poster}
              accept={IMAGE_ACCEPT}
              emptyLabel="Upload poster"
              onUpload={(file) => uploadFile(index, file, "poster")}
            />
          )}

          {showFeatured && (
            <CheckboxField
              label={featuredLabel}
              hint={
                item.type !== "image"
                  ? "Uses poster image or YouTube preview on cards"
                  : undefined
              }
              checked={item.featured ?? false}
              onChange={(featured) => update(index, { featured })}
            />
          )}
        </EntryCard>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            onChange([...media, { type: "image", src: "", alt: "", featured: false }])
          }
        >
          Add image
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            onChange([...media, { type: "video", src: "", alt: "", featured: false }])
          }
        >
          Add video
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            onChange([...media, { type: "youtube", src: "", alt: "", featured: false }])
          }
        >
          Add YouTube
        </Button>
      </div>
    </div>
  );
}
