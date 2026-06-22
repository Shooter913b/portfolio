import type { SessionPayload } from "./session";
import { getSessionFromRequest } from "./session";
import { DEV_LOGIN, isAdminDevBypass } from "./devMode";

export type HandlerResult = {
  statusCode: number;
  headers?: Record<string, string>;
  multiValueHeaders?: Record<string, string[]>;
  body: string;
};

export function json(
  statusCode: number,
  data: unknown,
  headers: Record<string, string> = {}
): HandlerResult {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  };
}

type RedirectOptions = {
  cookies?: string[];
  headers?: Record<string, string>;
};

/** Netlify requires multiple Set-Cookie values via multiValueHeaders, not comma-joined headers. */
export function redirect(location: string, options: RedirectOptions = {}): HandlerResult {
  const result: HandlerResult = {
    statusCode: 302,
    headers: { Location: location, ...options.headers },
    body: "",
  };

  const cookies = options.cookies ?? [];
  if (cookies.length === 1) {
    result.headers = { ...result.headers, "Set-Cookie": cookies[0] };
  } else if (cookies.length > 1) {
    result.multiValueHeaders = { "Set-Cookie": cookies };
  }

  return result;
}

export function getRequestSession(
  cookieHeader: string | undefined
): SessionPayload | null {
  return getSessionFromRequest(cookieHeader, process.env.SESSION_SECRET);
}

export function requireAuth(cookieHeader: string | undefined): SessionPayload | HandlerResult {
  if (isAdminDevBypass()) {
    return {
      login: DEV_LOGIN,
      accessToken: "__dev__",
      exp: Number.MAX_SAFE_INTEGER,
    };
  }

  const session = getRequestSession(cookieHeader);
  if (!session) {
    return json(401, { error: "Unauthorized" });
  }
  return session;
}

export function isHandlerResult(value: unknown): value is HandlerResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "statusCode" in value &&
    "body" in value
  );
}
