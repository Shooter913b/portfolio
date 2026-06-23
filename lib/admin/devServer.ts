import http from "http";
import { URL } from "url";
import { isLogReaction } from "@/lib/log/engagement";
import { DEV_LOGIN, isAdminDevBypass } from "./devMode";
import {
  localAdjustReaction,
  localGetAllEngagement,
  localGetPostEngagement,
  localRecordView,
} from "./localEngagement";
import {
  localDeleteContent,
  localGetContent,
  localListDir,
  localSaveContent,
  localUploadAsset,
} from "./localStore";

function sendJson(res: http.ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function startDevAdminApi(port = 3456) {
  if (!isAdminDevBypass()) {
    throw new Error("Dev admin API can only run in development");
  }

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
      const route = url.pathname.replace(/^\/api\//, "");

      if (route === "auth-me" && req.method === "GET") {
        return sendJson(res, 200, { login: DEV_LOGIN });
      }

      if (route === "auth-logout" && req.method === "POST") {
        return sendJson(res, 200, { ok: true });
      }

      if (route === "auth-github" && req.method === "GET") {
        res.writeHead(302, { Location: "/admin" });
        return res.end();
      }

      if (route === "content-get" && req.method === "GET") {
        const filePath = url.searchParams.get("path");
        if (!filePath) return sendJson(res, 400, { error: "Missing path" });
        const file = localGetContent(filePath);
        if (!file) return sendJson(res, 404, { error: "Not found" });
        return sendJson(res, 200, file);
      }

      if (route === "content-list" && req.method === "GET") {
        const dir = url.searchParams.get("dir");
        if (!dir) return sendJson(res, 400, { error: "Missing dir" });
        return sendJson(res, 200, { files: localListDir(dir) });
      }

      if (route === "content-save" && req.method === "POST") {
        const body = JSON.parse(await readBody(req)) as {
          path?: string;
          content?: unknown;
        };
        if (!body.path) return sendJson(res, 400, { error: "Missing path" });
        const result = localSaveContent(body.path, body.content);
        return sendJson(res, 200, { ok: true, ...result, deploy: "local" });
      }

      if (route === "content-delete" && req.method === "POST") {
        const body = JSON.parse(await readBody(req)) as { path?: string };
        if (!body.path) return sendJson(res, 400, { error: "Missing path" });
        localDeleteContent(body.path);
        return sendJson(res, 200, { ok: true, deploy: "local" });
      }

      if (route === "upload-asset" && req.method === "POST") {
        const body = JSON.parse(await readBody(req)) as {
          path?: string;
          base64?: string;
          updateResumeDate?: boolean;
        };
        if (!body.path || !body.base64) {
          return sendJson(res, 400, { error: "Missing upload payload" });
        }
        const bytes = Buffer.from(body.base64, "base64");
        const result = localUploadAsset(body.path, bytes, body.updateResumeDate);
        return sendJson(res, 200, { ok: true, ...result, deploy: "local" });
      }

      if (route === "log-engagement" && req.method === "GET") {
        const slug = url.searchParams.get("slug")?.trim() ?? "";
        if (url.searchParams.get("all") === "1") {
          return sendJson(res, 200, localGetAllEngagement());
        }
        if (!slug) return sendJson(res, 400, { error: "Missing slug" });
        const engagement = localGetPostEngagement(slug);
        return sendJson(res, 200, { slug, ...engagement });
      }

      if (route === "log-engagement" && req.method === "POST") {
        const body = JSON.parse(await readBody(req)) as {
          slug?: string;
          action?: "view" | "react";
          reaction?: string;
          delta?: 1 | -1;
        };
        const slug = body.slug?.trim();
        if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
          return sendJson(res, 400, { error: "Invalid slug" });
        }

        if (body.action === "view") {
          const engagement = localRecordView(slug);
          return sendJson(res, 200, { slug, ...engagement });
        }

        if (body.action === "react") {
          const reaction = body.reaction?.trim();
          const delta = body.delta === -1 ? -1 : 1;
          if (!reaction || !isLogReaction(reaction)) {
            return sendJson(res, 400, { error: "Invalid reaction" });
          }
          const engagement = localAdjustReaction(slug, reaction, delta);
          return sendJson(res, 200, { slug, ...engagement });
        }

        return sendJson(res, 400, { error: "Invalid action" });
      }

      return sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      return sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Server error",
      });
    }
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(`dev-admin-api: http://127.0.0.1:${port}/api`);
  });

  return server;
}
