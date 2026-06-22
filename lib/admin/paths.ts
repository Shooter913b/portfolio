const ALLOWED_PATTERNS = [
  /^content\/site\.json$/,
  /^content\/profile\.json$/,
  /^content\/about\.json$/,
  /^content\/skills\.json$/,
  /^content\/timeline\.json$/,
  /^content\/blog\/[a-z0-9][a-z0-9-]*\.mdx$/,
  /^public\/resume\.pdf$/,
  /^public\/blog\/.+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)$/i,
  /^public\/profile\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i,
  /^public\/timeline\/.+\.(jpg|jpeg|png|gif|webp|svg|mp4|webm)$/i,
];

const LISTABLE_DIRS = ["content/blog"] as const;

export function isAllowedContentPath(path: string): boolean {
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(path));
}

export function isListableDir(dir: string): dir is (typeof LISTABLE_DIRS)[number] {
  return (LISTABLE_DIRS as readonly string[]).includes(dir);
}

export function parseRepo(repo: string): { owner: string; repo: string } {
  const [owner, name] = repo.split("/");
  if (!owner || !name) {
    throw new Error("GITHUB_REPO must be in owner/repo format");
  }
  return { owner, repo: name };
}
