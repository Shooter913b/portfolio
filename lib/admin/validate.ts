import matter from "gray-matter";
import { aboutSchema } from "../schemas/about";
import { blogFrontmatterSchema } from "../schemas/blog";
import { preprocessPostFrontmatter } from "../log/preprocessPost";
import { profileSchema } from "../schemas/profile";
import { siteSchema } from "../schemas/site";
import { skillsSchema } from "../schemas/skills";
import { normalizeSkills } from "@/lib/skills/normalize";
import { timelineSchema } from "../schemas/timeline";
import { preprocessTimelineData } from "../timeline/preprocess";

export function validateContentForPath(
  path: string,
  raw: unknown
): { ok: true; serialized: string } | { ok: false; error: string } {
  try {
    if (path === "content/site.json") {
      const parsed = siteSchema.parse(raw);
      return { ok: true, serialized: `${JSON.stringify(parsed, null, 2)}\n` };
    }
    if (path === "content/profile.json") {
      const parsed = profileSchema.parse(raw);
      return { ok: true, serialized: `${JSON.stringify(parsed, null, 2)}\n` };
    }
    if (path === "content/about.json") {
      const parsed = aboutSchema.parse(raw);
      return { ok: true, serialized: `${JSON.stringify(parsed, null, 2)}\n` };
    }
    if (path === "content/skills.json") {
      const rawData = raw as { categories?: unknown[] };
      const parsed = skillsSchema.parse(
        normalizeSkills({ categories: rawData.categories ?? [] })
      );
      return { ok: true, serialized: `${JSON.stringify(parsed, null, 2)}\n` };
    }
    if (path === "content/timeline.json") {
      const parsed = timelineSchema.parse(preprocessTimelineData(raw));
      return { ok: true, serialized: `${JSON.stringify(parsed, null, 2)}\n` };
    }
    if (path.startsWith("content/blog/") && path.endsWith(".mdx")) {
      if (typeof raw !== "object" || raw === null) {
        return { ok: false, error: "Log post payload must be an object" };
      }
      const payload = raw as { frontmatter?: unknown; body?: unknown };
      const frontmatter = blogFrontmatterSchema.parse(
        preprocessPostFrontmatter(payload.frontmatter ?? {})
      );
      const body = typeof payload.body === "string" ? payload.body : "";
      const serialized = matter.stringify(body.trimEnd() + "\n", frontmatter);
      return { ok: true, serialized };
    }
    if (path === "public/resume.pdf") {
      return { ok: false, error: "Use upload endpoint for resume PDF" };
    }
    return { ok: false, error: "Unsupported content path" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Validation failed",
    };
  }
}
