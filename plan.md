# elfrick.xyz — Portfolio Plan

> **Status:** Static site — plane motion and loading screen removed (see `planeremoval.md`).  
> **Hosting:** Netlify · **Content:** `content/*.json` · **Analytics:** GoatCounter

---

## 1. Vision

Single-page portfolio, OLED-dark, electric blue accent:

1. **Hero** — photo, name, contact, featured blog carousel (when posts exist)
2. **Timeline** — resume → skills → experience → education → projects

---

## 2. Design System

| Token | Value |
|---|---|
| `--bg-base` | `#000000` |
| `--bg-elevated` | `#0a0a0f` |
| `--accent-blue` | `#00d4ff` |
| `--accent-purple` | `#a855f7` (sparingly — standard skill tier) |

Fonts: Space Grotesk (display), DM Sans (body), JetBrains Mono (dates/tags).

---

## 3. Content Architecture

All copy in modular JSON under `content/` — components are dumb renderers.

```
content/
├── site.json       # name, tagline, links, meta, resume date
├── profile.json    # photo / placeholder initials
├── skills.json     # skill categories + strong/standard tiers
├── timeline.json   # ordered entries (order, visible, stable id)
└── blog/*.mdx      # posts; prebuild script enables /blog/[slug]
```

Timeline entry types: `resume` | `skills` | `experience` | `education` | `project`

---

## 4. Timeline Layout

- Vertical spine centered on desktop
- Staggered left/right cards
- Skills entry shows all categories in one card
- Experience/project blocks expand locally via button
- Resume block always expanded

---

## 5. Done / Deferred

### Done
- Next.js static export, Tailwind, Zod content pipeline
- Hero, timeline, all block renderers, content seeded from resume
- Blog pipeline + prebuild route script
- GoatCounter (loads immediately), favicon, Netlify config
- Paper plane motion removed — static timeline only

### Deferred
- Admin dashboard (Phase 8)
- Real profile photo (`content/profile.json`)
- Blog posts before publish
- LaTeX → PDF CI (compile locally for now)

### Resolved decisions
- Placeholder photo · FTC full entry · Education in timeline · GoatCounter · `/blog/[slug]`
- No animated plane motif (removed per `planeremoval.md`)

---

## 6. Success Criteria

- [x] Site loads without loading overlay
- [x] Timeline renders all entry types
- [x] Skills show all categories in one card
- [x] Experience/project expand/collapse works locally
- [x] Resume PDF preview works
- [x] Blog index and featured carousel work
- [x] GoatCounter loads on page load
- [x] `prefers-reduced-motion` respected in carousel
