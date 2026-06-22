import type { Handler } from "@netlify/functions";
import { randomBytes } from "crypto";
import { getSiteOrigin, requireEnv } from "../../lib/admin/env";
import { redirect } from "../../lib/admin/http";

export const handler: Handler = async (event) => {
  try {
    const origin = getSiteOrigin(event.headers);
    const clientId = requireEnv("GITHUB_CLIENT_ID");
    const state = randomBytes(16).toString("hex");
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${origin}/.netlify/functions/auth-callback`,
      scope: "repo",
      state,
    });

    return redirect(`https://github.com/login/oauth/authorize?${params.toString()}`, {
      cookies: [`oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`],
    });
  } catch (error) {
    return {
      statusCode: 500,
      body: error instanceof Error ? error.message : "OAuth init failed",
    };
  }
};
