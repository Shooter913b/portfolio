import type { Handler } from "@netlify/functions";
import matter from "gray-matter";
import { isAdminDevBypass } from "../../lib/admin/devMode";
import { getFileFromGitHub } from "../../lib/admin/github";
import { localGetContent } from "../../lib/admin/localStore";
import { isAllowedContentPath } from "../../lib/admin/paths";
import { isHandlerResult, json, requireAuth } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const session = requireAuth(event.headers.cookie);
  if (isHandlerResult(session)) return session;

  const path = event.queryStringParameters?.path;
  if (!path || !isAllowedContentPath(path)) {
    return json(400, { error: "Invalid path" });
  }

  try {
    if (isAdminDevBypass()) {
      const file = localGetContent(path);
      if (!file) return json(404, { error: "Not found" });
      return json(200, file);
    }

    const file = await getFileFromGitHub(path, session.accessToken);
    if (!file) {
      return json(404, { error: "Not found" });
    }

    if (path.endsWith(".json")) {
      return json(200, {
        path,
        sha: file.sha,
        data: JSON.parse(file.content),
      });
    }

    if (path.endsWith(".mdx")) {
      const parsed = matter(file.content);
      return json(200, {
        path,
        sha: file.sha,
        data: {
          frontmatter: parsed.data,
          body: parsed.content,
        },
      });
    }

    return json(200, { path, sha: file.sha, data: file.content });
  } catch (error) {
    return json(500, {
      error: error instanceof Error ? error.message : "Read failed",
    });
  }
};
