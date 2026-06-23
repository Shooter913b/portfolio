import type { PostEngagement } from "@/lib/log/engagement";

const API_BASE = "/api";

export type PostEngagementResponse = PostEngagement & { slug: string };

async function engagementRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export function getStoredReaction(slug: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(`log-reaction:${slug}`);
}

export function setStoredReaction(slug: string, reaction: string | null): void {
  if (typeof window === "undefined") return;
  const key = `log-reaction:${slug}`;
  if (reaction) localStorage.setItem(key, reaction);
  else localStorage.removeItem(key);
}

export function hasRecordedView(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(`log-view:${slug}`) === "1";
}

export function markViewRecorded(slug: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`log-view:${slug}`, "1");
}

export async function fetchPostEngagement(slug: string): Promise<PostEngagementResponse> {
  return engagementRequest(`/log-engagement?slug=${encodeURIComponent(slug)}`);
}

export async function recordPostView(slug: string): Promise<PostEngagementResponse> {
  return engagementRequest("/log-engagement", {
    method: "POST",
    body: JSON.stringify({ slug, action: "view" }),
  });
}

export async function adjustPostReaction(
  slug: string,
  reaction: string,
  delta: 1 | -1
): Promise<PostEngagementResponse> {
  return engagementRequest("/log-engagement", {
    method: "POST",
    body: JSON.stringify({ slug, action: "react", reaction, delta }),
  });
}
