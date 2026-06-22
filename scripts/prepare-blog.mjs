import fs from "fs";
import path from "path";

const blogDir = path.join(process.cwd(), "content/blog");
const template = path.join(process.cwd(), "templates/blog-slug-page.tsx");
const logTemplate = path.join(process.cwd(), "templates/log-slug-page.tsx");

const routes = [
  {
    label: "Blog",
    slugDir: path.join(process.cwd(), "app/blog/[slug]"),
    template,
  },
  {
    label: "Log",
    slugDir: path.join(process.cwd(), "app/log/[slug]"),
    template: logTemplate,
  },
];

const posts =
  fs.existsSync(blogDir)
    ? fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    : [];

for (const { label, slugDir, template: routeTemplate } of routes) {
  const slugPage = path.join(slugDir, "page.tsx");

  if (posts.length > 0) {
    fs.mkdirSync(slugDir, { recursive: true });
    fs.copyFileSync(routeTemplate, slugPage);
    console.log(`${label}: enabled /${label.toLowerCase()}/[slug] for ${posts.length} post(s)`);
  } else if (fs.existsSync(slugPage)) {
    fs.rmSync(slugDir, { recursive: true });
    console.log(`${label}: no posts — removed /${label.toLowerCase()}/[slug] route for static export`);
  }
}
