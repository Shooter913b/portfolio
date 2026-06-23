import { getStore } from "@netlify/blobs";
import {
  emptyPostEngagement,
  normalizeLogEngagement,
  normalizePostEngagement,
  type LogEngagementData,
  type PostEngagement,
} from "@/lib/log/engagement";

const STORE_NAME = "log-engagement";
const DATA_KEY = "data";

async function readAll(): Promise<LogEngagementData> {
  const store = getStore(STORE_NAME);
  const raw = await store.get(DATA_KEY, { type: "json" });
  return normalizeLogEngagement(raw ?? { posts: {} });
}

async function writeAll(data: LogEngagementData): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(DATA_KEY, data);
}

function getPost(data: LogEngagementData, slug: string): PostEngagement {
  return normalizePostEngagement(data.posts[slug]);
}

export async function blobGetPostEngagement(slug: string): Promise<PostEngagement> {
  const data = await readAll();
  return getPost(data, slug);
}

export async function blobGetAllEngagement(): Promise<LogEngagementData> {
  return readAll();
}

export async function blobRecordView(slug: string): Promise<PostEngagement> {
  const data = await readAll();
  const current = getPost(data, slug);
  const next = { ...current, views: current.views + 1 };
  data.posts[slug] = { ...emptyPostEngagement(), ...next };
  await writeAll(data);
  return next;
}

export async function blobAdjustReaction(
  slug: string,
  reaction: string,
  delta: 1 | -1
): Promise<PostEngagement> {
  const data = await readAll();
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
  await writeAll(data);
  return next;
}
