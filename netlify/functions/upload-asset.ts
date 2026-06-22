import type { Handler } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import { getFileFromGitHub, putFileToGitHub } from "../../lib/admin/github";
import { localUploadAsset } from "../../lib/admin/localStore";
import { isAllowedContentPath } from "../../lib/admin/paths";
import { siteSchema } from "../../lib/schemas/site";
import { isHandlerResult, json, requireAuth } from "../../lib/admin/http";

const MAX_BYTES = 8 * 1024 * 1024;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const session = requireAuth(event.headers.cookie);
  if (isHandlerResult(session)) return session;

  try {
    const body = JSON.parse(event.body ?? "{}") as {
      path?: string;
      base64?: string;
      message?: string;
      updateResumeDate?: boolean;
    };

    const path = body.path;
    if (!path || !isAllowedContentPath(path)) {
      return json(400, { error: "Invalid path" });
    }

    if (!body.base64) {
      return json(400, { error: "Missing base64 payload" });
    }

    const bytes = Buffer.from(body.base64, "base64");
    if (bytes.byteLength > MAX_BYTES) {
      return json(400, { error: "File too large (max 8MB)" });
    }

    if (isAdminDevBypass()) {
      const result = localUploadAsset(path, bytes, body.updateResumeDate);
      return json(200, { ok: true, ...result, deploy: "local" });
    }

    const existing = await getFileFromGitHub(path, session.accessToken);
    const result = await putFileToGitHub(
      path,
      bytes,
      body.message ?? `admin: upload ${path}`,
      session.accessToken,
      existing?.sha
    );

    if (body.updateResumeDate && path === "public/resume.pdf") {
      const siteFile = await getFileFromGitHub("content/site.json", session.accessToken);
      if (siteFile) {
        const site = siteSchema.parse(JSON.parse(siteFile.content));
        site.resume.lastUpdated = new Date().toISOString().slice(0, 10);
        await putFileToGitHub(
          "content/site.json",
          `${JSON.stringify(site, null, 2)}\n`,
          "admin: update resume date",
          session.accessToken,
          siteFile.sha
        );
      }
    }

    return json(200, {
      ok: true,
      path,
      sha: result.sha,
      publicPath: `/${path.replace(/^public\//, "")}`,
      deploy: "pending",
    });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Upload failed",
    });
  }
};
