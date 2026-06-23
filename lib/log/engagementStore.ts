import { getStore } from "@netlify/blobs";
import {
  emptyPostEngagement,
  normalizeLogEngagement,
  normalizePostEngagement,
  type LogEngagementData,
  type PostEngagement,
} from "./engagement";

const STORE_NAME = "log-engagement";
const LEGACY_DATA_KEY = "data";
const POST_PREFIX = "post:";
const MAX_WRITE_RETRIES = 12;

function postKey(slug: string): string {
  return `${POST_PREFIX}${slug}`;
}

function resolveStore() {
  return getStore(STORE_NAME);
}

async function readLegacyPosts(): Promise<LogEngagementData> {
  const store = resolveStore();
  const raw = await store.get(LEGACY_DATA_KEY, { type: "json", consistency: "strong" });
  return normalizeLogEngagement(raw ?? { posts: {} });
}

async function migrateSlugFromLegacy(slug: string): Promise<PostEngagement | null> {
  const legacy = await readLegacyPosts();
  const post = legacy.posts[slug];
  if (!post) return null;

  const store = resolveStore();
  const key = postKey(slug);
  const normalized = normalizePostEngagement(post);
  await store.setJSON(key, normalized, { onlyIfNew: true });
  return normalized;
}

async function readPost(slug: string): Promise<PostEngagement> {
  const store = resolveStore();
  const key = postKey(slug);
  const raw = await store.get(key, { type: "json", consistency: "strong" });
  if (raw) return normalizePostEngagement(raw);

  const migrated = await migrateSlugFromLegacy(slug);
  return migrated ?? emptyPostEngagement();
}

async function updatePost(
  slug: string,
  updater: (current: PostEngagement) => PostEngagement
): Promise<PostEngagement> {
  const store = resolveStore();
  const key = postKey(slug);

  for (let attempt = 0; attempt < MAX_WRITE_RETRIES; attempt++) {
    const existing = await store.getWithMetadata(key, { type: "json", consistency: "strong" });
    const current = existing?.data
      ? normalizePostEngagement(existing.data)
      : (await migrateSlugFromLegacy(slug)) ?? emptyPostEngagement();
    const next = updater(current);

    const result = await store.setJSON(
      key,
      next,
      existing?.etag ? { onlyIfMatch: existing.etag } : { onlyIfNew: true }
    );

    if (result.modified) return next;
  }

  throw new Error(`Failed to update engagement for "${slug}" after ${MAX_WRITE_RETRIES} attempts`);
}

async function readAllPosts(): Promise<LogEngagementData> {
  const store = resolveStore();
  const posts: Record<string, PostEngagement> = {};

  const listed = await store.list({ prefix: POST_PREFIX });
  for (const blob of listed.blobs) {
    const slug = blob.key.slice(POST_PREFIX.length);
    if (!slug) continue;
    const raw = await store.get(blob.key, { type: "json", consistency: "strong" });
    if (raw) posts[slug] = normalizePostEngagement(raw);
  }

  const legacy = await readLegacyPosts();
  for (const [slug, engagement] of Object.entries(legacy.posts)) {
    if (!posts[slug]) {
      posts[slug] = normalizePostEngagement(engagement);
    }
  }

  return { posts };
}

export async function blobGetPostEngagement(slug: string): Promise<PostEngagement> {
  return readPost(slug);
}

export async function blobGetAllEngagement(): Promise<LogEngagementData> {
  return readAllPosts();
}

export async function blobRecordView(slug: string): Promise<PostEngagement> {
  return updatePost(slug, (current) => ({
    ...current,
    views: current.views + 1,
  }));
}

export async function blobAdjustReaction(
  slug: string,
  reaction: string,
  delta: 1 | -1
): Promise<PostEngagement> {
  return updatePost(slug, (current) => {
    const reactions = { ...current.reactions };
    const nextCount = (reactions[reaction] ?? 0) + delta;
    if (nextCount <= 0) {
      delete reactions[reaction];
    } else {
      reactions[reaction] = nextCount;
    }
    return { ...current, reactions };
  });
}
