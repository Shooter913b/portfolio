import type { SessionPayload } from "./session";
import { getSessionFromRequest } from "./session";
import { DEV_LOGIN, isAdminDevBypass } from "./devMode";

export type HandlerResult = {
  statusCode: number;
  headers?: Record<string, string>;
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

export function redirect(location: string, headers: Record<string, string> = {}): HandlerResult {
  return {
    statusCode: 302,
    headers: { Location: location, ...headers },
    body: "",
  };
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
