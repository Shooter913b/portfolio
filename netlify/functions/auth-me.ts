import type { Handler } from "@netlify/functions";
import { json, requireAuth, isHandlerResult } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const session = requireAuth(event.headers.cookie);
  if (isHandlerResult(session)) return session;

  return json(200, { login: session.login });
};
