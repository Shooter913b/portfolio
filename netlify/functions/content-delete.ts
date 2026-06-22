import type { Handler } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import {
  deleteFileFromGitHub,
  getFileFromGitHub,
} from "../../lib/admin/github";
import { localDeleteContent } from "../../lib/admin/localStore";
import { isAllowedContentPath } from "../../lib/admin/paths";
import { isHandlerResult, json, requireAuth } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const session = requireAuth(event.headers.cookie);
  if (isHandlerResult(session)) return session;

  try {
    const body = JSON.parse(event.body ?? "{}") as {
      path?: string;
      message?: string;
    };

    const path = body.path;
    if (!path || !isAllowedContentPath(path) || !path.startsWith("content/blog/")) {
      return json(400, { error: "Only blog posts can be deleted" });
    }

    if (isAdminDevBypass()) {
      localDeleteContent(path);
      return json(200, { ok: true, deploy: "local" });
    }

    const existing = await getFileFromGitHub(path, session.accessToken);
    if (!existing) {
      return json(404, { error: "Not found" });
    }

    await deleteFileFromGitHub(
      path,
      existing.sha,
      body.message ?? `admin: delete ${path}`,
      session.accessToken
    );

    return json(200, { ok: true, deploy: "pending" });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Delete failed",
    });
  }
};
