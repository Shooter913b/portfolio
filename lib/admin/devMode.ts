/** Local development: skip GitHub OAuth and write to the filesystem. */
export function isAdminDevBypass(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NETLIFY_DEV === "true" ||
    process.env.ADMIN_DEV_BYPASS === "true"
  );
}

export const DEV_LOGIN = "local-dev";
