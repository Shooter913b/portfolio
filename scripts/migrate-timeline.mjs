import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "content/timeline.json");

function summarize(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 140) return clean;
  const cut = clean.slice(0, 137);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function migrateEntry(entry) {
  if (entry.type === "resume" || entry.type === "skills") return entry;

  const body =
    entry.bullets ?? entry.details ?? [];
  const summary = entry.summary ?? summarize(body[0] ?? entry.title);

  const migrated = {
    id: entry.id,
    type: entry.type,
    order: entry.order,
    visible: entry.visible,
    title: entry.title,
    startDate: entry.startDate,
    endDate: entry.endDate,
    summary,
    body,
    tags: entry.tags ?? [],
    media: entry.media ?? [],
    links: entry.links ?? [],
  };

  if (entry.organization) migrated.subtitle = entry.organization;
  if (entry.location) migrated.location = entry.location;

  if (entry.url) {
    migrated.links = [
      { label: "Website", href: entry.url, icon: "external" },
      ...migrated.links,
    ];
  }

  if (entry.thumbnail) {
    const media = [...migrated.media];
    const existingIndex = media.findIndex((item) => item.src === entry.thumbnail.src);
    if (existingIndex >= 0) {
      media[existingIndex] = { ...media[existingIndex], featured: true };
    } else {
      media.unshift({
        type: "image",
        src: entry.thumbnail.src,
        alt: entry.thumbnail.alt,
        featured: true,
      });
    }
    migrated.media = media;
  }

  return migrated;
}

const data = JSON.parse(readFileSync(path, "utf8"));
data.entries = data.entries.map(migrateEntry);
writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
console.log("migrate-timeline: updated content/timeline.json");
