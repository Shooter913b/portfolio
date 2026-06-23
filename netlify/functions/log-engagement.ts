import type { Handler } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import {
  localAdjustReaction,
  localGetAllEngagement,
  localGetPostEngagement,
  localRecordView,
} from "../../lib/admin/localEngagement";
import { isLogReaction } from "../../lib/log/engagement";
import {
  blobAdjustReaction,
  blobGetAllEngagement,
  blobGetPostEngagement,
  blobRecordView,
} from "../../lib/log/engagementStore";
import { json, requireAuth, isHandlerResult } from "../../lib/admin/http";

type EngagementBody = {
  slug?: string;
  action?: "view" | "react";
  reaction?: string;
  delta?: 1 | -1;
};

function slugFromQuery(event: { queryStringParameters?: Record<string, string | undefined> | null }) {
  return event.queryStringParameters?.slug?.trim() ?? "";
}

export const handler: Handler = async (event) => {
  const useLocal = isAdminDevBypass();

  if (event.httpMethod === "GET") {
    const slug = slugFromQuery(event);
    const all = event.queryStringParameters?.all === "1";

    if (all) {
      const session = requireAuth(event.headers.cookie);
      if (isHandlerResult(session)) return session;

      const data = useLocal ? localGetAllEngagement() : await blobGetAllEngagement();
      return json(200, data);
    }

    if (!slug) {
      return json(400, { error: "Missing slug" });
    }

    const engagement = useLocal
      ? localGetPostEngagement(slug)
      : await blobGetPostEngagement(slug);
    return json(200, { slug, ...engagement });
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body ?? "{}") as EngagementBody;
    const slug = body.slug?.trim();
    if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
      return json(400, { error: "Invalid slug" });
    }

    if (body.action === "view") {
      const engagement = useLocal ? localRecordView(slug) : await blobRecordView(slug);
      return json(200, { slug, ...engagement });
    }

    if (body.action === "react") {
      const reaction = body.reaction?.trim();
      const delta = body.delta === -1 ? -1 : 1;
      if (!reaction || !isLogReaction(reaction)) {
        return json(400, { error: "Invalid reaction" });
      }

      const engagement = useLocal
        ? localAdjustReaction(slug, reaction, delta)
        : await blobAdjustReaction(slug, reaction, delta);
      return json(200, { slug, ...engagement });
    }

    return json(400, { error: "Invalid action" });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Engagement update failed",
    });
  }
};
