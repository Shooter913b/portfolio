import fs from "fs";
import path from "path";
import {
  emptyPostEngagement,
  normalizeLogEngagement,
  normalizePostEngagement,
  type LogEngagementData,
  type PostEngagement,
} from "../log/engagement";

const ENGAGEMENT_PATH = "content/log-engagement.json";
const ROOT = process.cwd();

function resolveSafe(relativePath: string): string {
  const full = path.join(ROOT, relativePath);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(ROOT)) {
    throw new Error("Invalid path");
  }
  return normalized;
}

function readAll(): LogEngagementData {
  const full = resolveSafe(ENGAGEMENT_PATH);
  if (!fs.existsSync(full)) {
    return { posts: {} };
  }
  const raw = JSON.parse(fs.readFileSync(full, "utf8"));
  return normalizeLogEngagement(raw);
}

function writeAll(data: LogEngagementData): void {
  const full = resolveSafe(ENGAGEMENT_PATH);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, `${JSON.stringify(data, null, 2)}\n`);
}

function getPost(data: LogEngagementData, slug: string): PostEngagement {
  return normalizePostEngagement(data.posts[slug]);
}

export function localGetPostEngagement(slug: string): PostEngagement {
  const data = readAll();
  return getPost(data, slug);
}

export function localGetAllEngagement(): LogEngagementData {
  return readAll();
}

export function localRecordView(slug: string): PostEngagement {
  const data = readAll();
  const current = getPost(data, slug);
  const next = { ...current, views: current.views + 1 };
  data.posts[slug] = next;
  writeAll(data);
  return next;
}

export function localAdjustReaction(
  slug: string,
  reaction: string,
  delta: 1 | -1
): PostEngagement {
  const data = readAll();
  const current = getPost(data, slug);
  const reactions = { ...current.reactions };
  const nextCount = (reactions[reaction] ?? 0) + delta;
  if (nextCount <= 0) {
    delete reactions[reaction];
  } else {
    reactions[reaction] = nextCount;
  }
  const next = { ...current, reactions };
  data.posts[slug] = next;
  writeAll(data);
  return next;
}

export function localEnsurePost(slug: string): PostEngagement {
  const data = readAll();
  if (!data.posts[slug]) {
    data.posts[slug] = emptyPostEngagement();
    writeAll(data);
  }
  return getPost(data, slug);
}
