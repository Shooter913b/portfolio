# elfrick.xyz

Personal portfolio site. See [plan.md](./plan.md) for the full design spec.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output is written to `out/` for Netlify static deploy.

## Content

All editable site content lives in `content/`:

- `site.json` — name, tagline, links, meta
- `profile.json` — photo / placeholder initials
- `skills.json` — skill categories
- `timeline.json` — ordered timeline entries
- `blog/*.mdx` — blog posts (add before publish)

## Blog posts

Add an MDX file to `content/blog/` with frontmatter:

```yaml
---
title: "Post title"
date: "2026-06-01"
featured: true
excerpt: "Optional excerpt"
---
```

The `prebuild` script auto-enables `/blog/[slug]` routes when posts exist.

## Resume PDF

Compile locally (requires [Tectonic](https://tectonic-typesetting.github.io/) or LaTeX):

```bash
npm run build:resume
```

Or run `scripts/build-resume.sh`. Commit `public/resume.pdf` for Netlify until CI is set up.

### Sync from Overleaf

Overleaf does **not** push to your repo automatically. You need either **Overleaf Premium** (Git integration) or **GitHub sync** (also Premium, manual push/pull in the Overleaf UI).

**Option A — Git pull (best for automation)**

1. In Overleaf: **Menu → Integrations → Git** — copy the Git URL.
2. Create a **Git authentication token** in Overleaf account settings.
3. Add to `.env` (see `.env.example`):
   ```
   OVERLEAF_GIT_URL=https://git:YOUR_TOKEN@git.overleaf.com/PROJECT_ID
   OVERLEAF_MAIN_TEX=main.tex
   ```
4. Pull, compile, and update the site PDF:
   ```bash
   npm run sync:resume:overleaf
   ```

This clones into `resume-latex/` (gitignored), pulls the latest `.tex` from Overleaf, and writes `public/resume.pdf`.

For full automation, run that command on a schedule (e.g. GitHub Actions with `OVERLEAF_GIT_URL` as a secret) and commit `public/resume.pdf`, or trigger a Netlify rebuild.

**Option B — GitHub as middleman**

1. Link the Overleaf project to a GitHub repo (**Integrations → GitHub**).
2. Push from Overleaf when you edit (still manual in the Overleaf UI).
3. Point this portfolio at that repo (submodule, copy step in CI, or keep `.tex` in this repo and merge from GitHub).

**Free Overleaf**

No official Git/API sync. Export a ZIP from Overleaf and replace the `.tex` locally, then `npm run build:resume`.

## Analytics (GoatCounter)

1. Create a site at [goatcounter.com](https://www.goatcounter.com) and note your **site code** (the subdomain before `.goatcounter.com`).
2. Set `NEXT_PUBLIC_GOATCOUNTER_SITE` to that code only — e.g. `elfrick`, not a full URL.
3. In **Netlify → Environment variables**, add the same key, then **redeploy** (public env vars are embedded at build time).
4. Open your dashboard at `https://YOUR_CODE.goatcounter.com`.
5. Under **Settings → Allowed domains**, add your site hostname (e.g. `elfrick.xyz`). Without this, counts from production are ignored.
6. Custom events (resume download, timeline opens, log views) appear under **Events**, not the main pageview chart.
