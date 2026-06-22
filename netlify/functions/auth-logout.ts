import type { Handler } from "@netlify/functions";
import { clearSessionCookie } from "../../lib/admin/session";
import { json } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  return json(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
};
