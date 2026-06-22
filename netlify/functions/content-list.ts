import type { Handler } from "@netlify/functions";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import { listGitHubDirectory } from "../../lib/admin/github";
import { localListDir } from "../../lib/admin/localStore";
import { isListableDir } from "../../lib/admin/paths";
import { isHandlerResult, json, requireAuth } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const session = requireAuth(event.headers.cookie);
  if (isHandlerResult(session)) return session;

  const dir = event.queryStringParameters?.dir;
  if (!dir || !isListableDir(dir)) {
    return json(400, { error: "Invalid directory" });
  }

  try {
    if (isAdminDevBypass()) {
      return json(200, { files: localListDir(dir) });
    }

    const entries = await listGitHubDirectory(dir, session.accessToken);
    const files = entries
      .filter((entry) => entry.type === "file" && entry.name.endsWith(".mdx"))
      .map((entry) => ({
        name: entry.name,
        path: entry.path,
        slug: entry.name.replace(/\.mdx$/, ""),
      }));

    return json(200, { files });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "List failed",
    });
  }
};
