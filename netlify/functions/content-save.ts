import type { Handler } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import { getFileFromGitHub, putFileToGitHub } from "../../lib/admin/github";
import { localSaveContent } from "../../lib/admin/localStore";
import { isAllowedContentPath } from "../../lib/admin/paths";
import { validateContentForPath } from "../../lib/admin/validate";
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
      content?: unknown;
      message?: string;
    };

    const path = body.path;
    if (!path || !isAllowedContentPath(path)) {
      return json(400, { error: "Invalid path" });
    }

    if (isAdminDevBypass()) {
      const result = localSaveContent(path, body.content, body.message);
      return json(200, { ok: true, ...result, deploy: "local" });
    }

    const validated = validateContentForPath(path, body.content);
    if (!validated.ok) {
      return json(400, { error: validated.error });
    }

    const existing = await getFileFromGitHub(path, session.accessToken);
    const result = await putFileToGitHub(
      path,
      validated.serialized,
      body.message ?? `admin: update ${path}`,
      session.accessToken,
      existing?.sha
    );

    return json(200, {
      ok: true,
      path,
      sha: result.sha,
      deploy: "pending",
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Save failed",
    });
  }
};
