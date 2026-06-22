import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { blogFrontmatterSchema, type BlogPost } from "@/lib/schemas/blog";
import { preprocessPostFrontmatter } from "@/lib/log/preprocessPost";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      const frontmatter = blogFrontmatterSchema.parse(preprocessPostFrontmatter(data));
      return { ...frontmatter, slug, content };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getFeaturedPosts(): BlogPost[] {
  const posts = getAllPosts();
  if (posts.length === 0) return [];

  const latest = posts[0];
  const markedFeatured = posts.filter((p) => p.featured);

  const bySlug = new Map<string, BlogPost>();
  bySlug.set(latest.slug, latest);
  for (const post of markedFeatured) {
    bySlug.set(post.slug, post);
  }

  return [...bySlug.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}
