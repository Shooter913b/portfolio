import type { Config, Context } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import {
  localAdjustReaction,
  localGetAllEngagement,
  localGetPostEngagement,
  localRecordView,
} from "../../lib/admin/localEngagement";
import { isHandlerResult, requireAuth } from "../../lib/admin/http";
import { isLogReaction } from "../../lib/log/engagement";
import {
  blobAdjustReaction,
  blobGetAllEngagement,
  blobGetPostEngagement,
  blobRecordView,
  setBlobRuntimeSiteId,
} from "../../lib/log/engagementStore";

type EngagementBody = {
  slug?: string;
  action?: "view" | "react";
  reaction?: string;
  delta?: 1 | -1;
};

function jsonResponse(status: number, data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function handlerResultToResponse(result: {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}): Response {
  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
}

async function handleGet(url: URL, cookieHeader: string | undefined): Promise<Response> {
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const all = url.searchParams.get("all") === "1";
  const useLocal = isAdminDevBypass();

  if (all) {
    const session = requireAuth(cookieHeader);
    if (isHandlerResult(session)) return handlerResultToResponse(session);

    const data = useLocal ? localGetAllEngagement() : await blobGetAllEngagement();
    return jsonResponse(200, data);
  }

  if (!slug) {
    return jsonResponse(400, { error: "Missing slug" });
  }

  const engagement = useLocal
    ? localGetPostEngagement(slug)
    : await blobGetPostEngagement(slug);
  return jsonResponse(200, { slug, ...engagement });
}

async function handlePost(body: EngagementBody, useLocal: boolean): Promise<Response> {
  const slug = body.slug?.trim();
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return jsonResponse(400, { error: "Invalid slug" });
  }

  if (body.action === "view") {
    const engagement = useLocal ? localRecordView(slug) : await blobRecordView(slug);
    return jsonResponse(200, { slug, ...engagement });
  }

  if (body.action === "react") {
    const reaction = body.reaction?.trim();
    const delta = body.delta === -1 ? -1 : 1;
    if (!reaction || !isLogReaction(reaction)) {
      return jsonResponse(400, { error: "Invalid reaction" });
    }

    const engagement = useLocal
      ? localAdjustReaction(slug, reaction, delta)
      : await blobAdjustReaction(slug, reaction, delta);
    return jsonResponse(200, { slug, ...engagement });
  }

  return jsonResponse(400, { error: "Invalid action" });
}

export default async function handler(req: Request, context: Context): Promise<Response> {
  const useLocal = isAdminDevBypass();

  if (!useLocal) {
    setBlobRuntimeSiteId(context.site.id);
  }

  try {
    const url = new URL(req.url);
    const cookieHeader = req.headers.get("cookie") ?? undefined;

    if (req.method === "GET") {
      return handleGet(url, cookieHeader);
    }

    if (req.method !== "POST") {
      return jsonResponse(405, { error: "Method not allowed" });
    }

    const body = (await req.json().catch(() => ({}))) as EngagementBody;
    return handlePost(body, useLocal);
  } catch (error) {
    console.error("log-engagement error:", error);
    return jsonResponse(500, {
      error: error instanceof Error ? error.message : "Engagement update failed",
    });
  }
}

export const config: Config = {
  path: "/api/log-engagement",
};
