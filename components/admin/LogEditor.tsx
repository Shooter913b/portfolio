"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { BlogFrontmatter } from "@/lib/schemas/blog";
import { blogFrontmatterSchema } from "@/lib/schemas/blog";
import type { TimelineEntry } from "@/lib/schemas/timeline";
import { preprocessPostFrontmatter } from "@/lib/log/preprocessPost";
import {
  deleteContent,
  getContent,
  listBlogPosts,
  saveContent,
} from "@/lib/admin/client";
import { RelatedTimelineEditor } from "./RelatedTimelineEditor";
import { TimelineMediaEditor } from "./TimelineMediaEditor";
import { LinksEditor } from "./LinksEditor";
import {
  AdminPanel,
  Button,
  CheckboxField,
  Field,
  SaveBar,
  SelectInput,
  StringListEditor,
  TextArea,
  TextInput,
} from "./AdminUi";
import { LogPostPreview } from "./AdminPreview";

type PostFile = { name: string; path: string; slug: string };

type PostPayload = {
  frontmatter: BlogFrontmatter;
  body: string;
};

type TimelineData = { entries: TimelineEntry[] };

function timelineOptionLabel(entry: TimelineEntry): string {
  if (
    entry.type === "experience" ||
    entry.type === "education" ||
    entry.type === "project"
  ) {
    return `${entry.type}: ${entry.title}`;
  }
  if (entry.type === "resume") return "resume: Resume download";
  return "skills: Skills block";
}

function postSlugFromPath(path: string | null): string {
  return path?.replace("content/blog/", "").replace(".mdx", "") ?? "post";
}

export function LogEditor() {
  const [files, setFiles] = useState<PostFile[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [payload, setPayload] = useState<PostPayload | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assetFolder = useMemo(
    () => `blog/${postSlugFromPath(selectedPath)}`,
    [selectedPath]
  );

  const loadFiles = useCallback(async () => {
    const result = await listBlogPosts();
    setFiles(result.files);
    setSelectedPath((current) => current ?? result.files[0]?.path ?? null);
  }, []);

  useEffect(() => {
    Promise.all([
      loadFiles(),
      getContent<TimelineData>("content/timeline.json").then((result) =>
        setTimelineEntries(result.data.entries)
      ),
    ]).catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [loadFiles]);

  useEffect(() => {
    if (!selectedPath) return;
    getContent<{ frontmatter: unknown; body: string }>(selectedPath)
      .then((result) => {
        const frontmatter = blogFrontmatterSchema.parse(
          preprocessPostFrontmatter(result.data.frontmatter)
        );
        setPayload({ frontmatter, body: result.data.body });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Load failed"));
  }, [selectedPath]);

  if (error) return <p className="text-red-400">{error}</p>;

  const relatedTimelineLabels = payload
    ? payload.frontmatter.relatedTimeline
        .map((id) => {
          const entry = timelineEntries.find((item) => item.id === id);
          return entry ? `${timelineOptionLabel(entry)} (${id})` : id;
        })
        .join(", ")
    : "";

  const save = async () => {
    if (!selectedPath || !payload) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveContent(selectedPath, payload, `admin: update ${selectedPath}`);
      setStatus("Saved. Netlify will rebuild in ~1–3 minutes.");
      await loadFiles();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const createPost = async () => {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug) return;
    const path = `content/blog/${slug}.mdx`;
    const initial: PostPayload = {
      frontmatter: {
        title: "New log post",
        date: new Date().toISOString().slice(0, 10),
        featured: false,
        excerpt: "",
        tags: [],
        media: [],
        links: [],
        relatedTimeline: [],
      },
      body: "Write your post here.\n",
    };
    setSaving(true);
    try {
      await saveContent(path, initial, `admin: create ${path}`);
      setNewSlug("");
      await loadFiles();
      setSelectedPath(path);
      setPayload(initial);
      setStatus("Post created.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Create failed");
    } finally {
      setSaving(false);
    }
  };

  const removePost = async () => {
    if (!selectedPath) return;
    if (!window.confirm(`Delete ${selectedPath}?`)) return;
    setSaving(true);
    try {
      await deleteContent(selectedPath);
      setSelectedPath(null);
      setPayload(null);
      await loadFiles();
      setStatus("Post deleted.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <SelectInput
          value={selectedPath ?? ""}
          onChange={(e) => setSelectedPath(e.target.value)}
          className="min-w-[14rem]"
        >
          <option value="" disabled>
            Select post
          </option>
          {files.map((file) => (
            <option key={file.path} value={file.path}>
              {file.slug}
            </option>
          ))}
        </SelectInput>
        <Field label="New slug">
          <div className="flex gap-2">
            <TextInput value={newSlug} onChange={(e) => setNewSlug(e.target.value)} />
            <Button variant="secondary" onClick={() => void createPost()}>
              Create
            </Button>
          </div>
        </Field>
      </div>

      {payload && (
        <AdminPanel
          title="Log post"
          previewLayout="bottom"
          preview={
            <LogPostPreview
              frontmatter={payload.frontmatter}
              body={payload.body}
              timelineLabel={relatedTimelineLabels || undefined}
            />
          }
        >
          <Field label="Title">
            <TextInput
              value={payload.frontmatter.title}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, title: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Date">
            <TextInput
              type="date"
              value={payload.frontmatter.date}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, date: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Excerpt">
            <TextArea
              rows={2}
              value={payload.frontmatter.excerpt ?? ""}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, excerpt: e.target.value },
                })
              }
            />
          </Field>
          <CheckboxField
            label="Featured on homepage"
            checked={payload.frontmatter.featured ?? false}
            onChange={(featured) =>
              setPayload({
                ...payload,
                frontmatter: { ...payload.frontmatter, featured },
              })
            }
          />
          <Field
            label="Related timeline entries"
            hint="Link this post to one or more experience, education, or project entries."
          >
            <RelatedTimelineEditor
              value={payload.frontmatter.relatedTimeline ?? []}
              entries={timelineEntries}
              onChange={(relatedTimeline) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, relatedTimeline },
                })
              }
            />
          </Field>
          <Field label="Tags">
            <StringListEditor
              values={payload.frontmatter.tags ?? []}
              onChange={(tags) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, tags },
                })
              }
              placeholder="Tag"
              addLabel="Add tag"
            />
          </Field>
          <Field
            label="Media"
            hint="Check “Feature on post” for items shown in the header carousel and log index. Other media appears in the gallery below the written content."
          >
            <TimelineMediaEditor
              media={payload.frontmatter.media ?? []}
              onChange={(media) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, media },
                })
              }
              assetFolder={assetFolder}
              onStatus={setStatus}
              showFeatured
              featuredLabel="Feature on post"
            />
          </Field>
          <Field label="Links">
            <LinksEditor
              links={payload.frontmatter.links ?? []}
              onChange={(links) =>
                setPayload({
                  ...payload,
                  frontmatter: { ...payload.frontmatter, links },
                })
              }
            />
          </Field>
          <Field label="Body">
            <TextArea
              rows={12}
              value={payload.body}
              onChange={(e) => setPayload({ ...payload, body: e.target.value })}
            />
          </Field>
          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
            <SaveBar onSave={save} saving={saving} status={status} />
            <Button variant="danger" onClick={() => void removePost()}>
              Delete post
            </Button>
          </div>
        </AdminPanel>
      )}
    </div>
  );
}
