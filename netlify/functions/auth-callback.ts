import type { Handler } from "@netlify/functions";
import { getAllowedUsers, getSiteOrigin, requireEnv } from "../../lib/admin/env";
import { getGitHubUser } from "../../lib/admin/github";
import {
  buildSessionCookie,
  parseCookies,
  signSession,
} from "../../lib/admin/session";
import { redirect } from "../../lib/admin/http";

const SESSION_MAX_AGE = 60 * 60 * 12;

export const handler: Handler = async (event) => {
  try {
    const origin = getSiteOrigin(event.headers);
    const params = event.queryStringParameters ?? {};
    const code = params.code;
    const state = params.state;

    if (!code || !state) {
      return redirect(`${origin}/admin?error=missing_code`);
    }

    const cookies = parseCookies(event.headers.cookie);
    if (!cookies.oauth_state || cookies.oauth_state !== state) {
      return redirect(`${origin}/admin?error=invalid_state`);
    }

    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    const clearState = `oauth_state=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: requireEnv("GITHUB_CLIENT_ID"),
        client_secret: requireEnv("GITHUB_CLIENT_SECRET"),
        code,
      }),
    });

    if (!tokenResponse.ok) {
      return redirect(`${origin}/admin?error=token_exchange`, {
        cookies: [clearState],
      });
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (!tokenData.access_token) {
      return redirect(`${origin}/admin?error=token_missing`, {
        cookies: [clearState],
      });
    }

    const user = await getGitHubUser(tokenData.access_token);
    const allowed = getAllowedUsers();
    if (allowed.length > 0 && !allowed.includes(user.login.toLowerCase())) {
      return redirect(`${origin}/admin?error=not_allowed`, {
        cookies: [clearState],
      });
    }

    const session = signSession(
      {
        login: user.login,
        accessToken: tokenData.access_token,
        exp: Date.now() + SESSION_MAX_AGE * 1000,
      },
      requireEnv("SESSION_SECRET")
    );

    // Set only the session cookie here — combining multiple Set-Cookie headers in one
    // header breaks in browsers. oauth_state expires on its own after 10 minutes.
    return redirect(`${origin}/admin`, {
      cookies: [buildSessionCookie(session, SESSION_MAX_AGE)],
    });
  } catch (error) {
    const origin = getSiteOrigin(event.headers);
    return redirect(
      `${origin}/admin?error=${encodeURIComponent(error instanceof Error ? error.message : "auth_failed")}`
    );
  }
};
