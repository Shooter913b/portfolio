import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isAllowedContentPath, isListableDir } from "./paths";
import { validateContentForPath } from "./validate";

const ROOT = process.cwd();

function resolveSafe(relativePath: string): string {
  const full = path.join(ROOT, relativePath);
  const normalized = path.normalize(full);
  if (!normalized.startsWith(ROOT)) {
    throw new Error("Invalid path");
  }
  return normalized;
}

function pseudoSha(filePath: string): string {
  if (!fs.existsSync(filePath)) return "new";
  const stat = fs.statSync(filePath);
  return `dev-${stat.mtimeMs}`;
}

export function localGetContent(filePath: string) {
  if (!isAllowedContentPath(filePath)) {
    throw new Error("Invalid path");
  }

  const full = resolveSafe(filePath);
  if (!fs.existsSync(full)) return null;

  const content = fs.readFileSync(full, "utf8");
  const sha = pseudoSha(full);

  if (filePath.endsWith(".json")) {
    return { path: filePath, sha, data: JSON.parse(content) };
  }

  if (filePath.endsWith(".mdx")) {
    const parsed = matter(content);
    return {
      path: filePath,
      sha,
      data: { frontmatter: parsed.data, body: parsed.content },
    };
  }

  return { path: filePath, sha, data: content };
}

export function localSaveContent(
  filePath: string,
  raw: unknown,
  _message?: string
) {
  if (!isAllowedContentPath(filePath)) {
    throw new Error("Invalid path");
  }

  const validated = validateContentForPath(filePath, raw);
  if (!validated.ok) {
    throw new Error(validated.error);
  }

  const full = resolveSafe(filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, validated.serialized);
  return { path: filePath, sha: pseudoSha(full) };
}

export function localListDir(dir: string) {
  if (!isListableDir(dir)) {
    throw new Error("Invalid directory");
  }

  const full = resolveSafe(dir);
  if (!fs.existsSync(full)) return [];

  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => ({
      name,
      path: `${dir}/${name}`,
      slug: name.replace(/\.mdx$/, ""),
    }));
}

export function localDeleteContent(filePath: string) {
  if (!isAllowedContentPath(filePath) || !filePath.startsWith("content/blog/")) {
    throw new Error("Only blog posts can be deleted");
  }

  const full = resolveSafe(filePath);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

export function localUploadAsset(
  filePath: string,
  bytes: Buffer,
  updateResumeDate?: boolean
) {
  if (!isAllowedContentPath(filePath)) {
    throw new Error("Invalid path");
  }

  const full = resolveSafe(filePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, bytes);

  if (updateResumeDate && filePath === "public/resume.pdf") {
    const sitePath = resolveSafe("content/site.json");
    const site = JSON.parse(fs.readFileSync(sitePath, "utf8"));
    site.resume.lastUpdated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(sitePath, `${JSON.stringify(site, null, 2)}\n`);
  }

  return {
    path: filePath,
    publicPath: `/${filePath.replace(/^public\//, "")}`,
    sha: pseudoSha(full),
  };
}
