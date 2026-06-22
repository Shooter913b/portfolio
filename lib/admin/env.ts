export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function getAllowedUsers(): string[] {
  const raw = process.env.GITHUB_ALLOWED_USERS ?? "";
  return raw
    .split(",")
    .map((user) => user.trim().toLowerCase())
    .filter(Boolean);
}

export function getSiteOrigin(eventHeaders: Record<string, string | undefined>): string {
  const host = eventHeaders.host ?? eventHeaders.Host;
  const protocol = (eventHeaders["x-forwarded-proto"] ?? "https").split(",")[0];
  if (!host) return "http://localhost:8888";
  return `${protocol}://${host}`;
}
