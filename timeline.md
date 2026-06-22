# Timeline Standardization & Detail Overlay — Implementation Plan

> **Goal:** Unify experience, education, and project entries behind one configurable data model, add optional timeline thumbnails, and replace inline “Show details” expansion with a full-screen detail overlay tailored per entry type.

---

## 1. Current State

| Area | Today |
|---|---|
| **Data** | `content/timeline.json` — three similar but inconsistent shapes (`bullets` vs `details`, project-only `url`) |
| **Cards** | `ExperienceBlock`, `EducationBlock`, `ProjectBlock` — each owns its own expand/collapse UI |
| **Details** | Inline accordion inside the timeline card (`grid-rows` animation) |
| **Media** | None on timeline entries; blog already has `PostMedia` for image/video |
| **Exceptions** | `resume` and `skills` stay special (not part of this standardization) |

**Pain points**

- Adding an entry means learning three slightly different field sets.
- Expanded cards disrupt timeline rhythm and plane focus styling.
- No visual hook on the spine (thumbnail).
- Rich content (photos, videos, external links) has no first-class place in data or UI.

---

## 2. Target Experience

### Timeline card (collapsed — always)

Every standardized entry shows:

- Date range (mono)
- Title
- Organization / subtitle line (where applicable)
- **Optional thumbnail** — small preview image on the card (left rail or top banner)
- 1–2 line **summary** teaser (not the full description)
- Tags (optional, capped on card e.g. 3 + “+N”)
- **“Show details”** button — never expands the card

### Detail view (full-screen overlay)

Clicking **Show details** opens a fixed overlay (`z-50`, covers viewport):

- Dimmed / blurred site behind (`bg-bg-base/90` + backdrop blur)
- Scrollable inner panel with max-width container
- Close: **X**, **Escape**, click backdrop (optional), focus trap + `aria-modal`
- Body scroll locked while open
- Entry-type-specific layout (see §5)
- Optional deep link: `?entry=sbel-research` or `#timeline/sbel-research` for shareable URLs (phase 2)

`resume` and `skills` are unchanged — no overlay.

---

## 3. Unified Data Model

### Design principles

1. **One shared “narrative entry” base** — experience, education, and project extend the same core fields.
2. **Card vs detail separation** — `summary` for the timeline card; `body` for the overlay.
3. **Media and links are reusable primitives** — same shape everywhere.
4. **Type controls layout defaults** — not a separate schema per field name (`bullets` vs `details`).
5. **Easy to add** — one JSON object per entry; validate with Zod at build time.

### Shared primitives

```ts
// lib/schemas/timeline-media.ts (new)

type TimelineLink = {
  label: string;
  href: string;
  icon?: "github" | "external" | "paper" | "video" | "site";
};

type TimelineMediaItem = {
  src: string;           // /timeline/sbel/sandbox.jpg
  alt?: string;
  caption?: string;
  type: "image" | "video";
  poster?: string;       // video poster
};

type TimelineThumbnail = {
  src: string;
  alt?: string;
};
```

### Narrative entry base

```ts
// lib/schemas/timeline.ts — new shared base

const narrativeBase = z.object({
  id: z.string(),
  type: z.enum(["experience", "education", "project"]),
  order: z.number(),
  visible: z.boolean(),

  // Identity
  title: z.string(),
  subtitle: z.string().optional(),      // org, school, or project context
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().nullable(),

  // Card teaser
  summary: z.string(),                  // 1–2 sentences, shown on timeline card
  thumbnail: TimelineThumbnail.optional(),

  // Detail overlay
  body: z.array(z.string()),            // paragraphs or bullet strings (rendered as <ul> if multiple)
  tags: z.array(z.string()).default([]),
  media: z.array(TimelineMediaItem).default([]),
  links: z.array(TimelineLink).default([]),
});
```

### Type-specific optional fields

| Field | Experience | Education | Project |
|---|---|---|---|
| `subtitle` | organization | school name | optional tagline |
| `location` | ✓ | ✓ | — |
| `links` | common | rare | optional (repo, demo, paper) |
| `media` | supporting gallery | **collage** | **hero** media |

No extra required fields per type — **layout variant** is derived from `type`.

### Example entry (experience)

```json
{
  "id": "sbel-research",
  "type": "experience",
  "order": 10,
  "visible": true,
  "title": "SBEL Student Researcher",
  "subtitle": "UW–Madison",
  "location": "Madison, WI",
  "startDate": "2026-04",
  "endDate": null,
  "summary": "Validating physics-based simulations through experimental hardware and FEA-driven test fixtures.",
  "thumbnail": {
    "src": "/timeline/sbel/thumb.jpg",
    "alt": "Inclining sandbox test rig"
  },
  "body": [
    "Collaborated with Simulation-Based Engineering Lab researchers to validate physics-based simulations through experimental testing.",
    "Designed and implemented hardware/software systems for scale models of machines, including lunar landers."
  ],
  "tags": ["FEA", "Simulation", "Hardware"],
  "media": [
    { "type": "image", "src": "/timeline/sbel/sandbox.jpg", "alt": "Sandbox rig", "caption": "Custom inclining sandbox" },
    { "type": "video", "src": "/timeline/sbel/demo.mp4", "poster": "/timeline/sbel/demo-poster.jpg" }
  ],
  "links": [
    { "label": "SBEL", "href": "https://sbel.wisc.edu/", "icon": "external" }
  ]
}
```

### File organization

**Phase 1 (minimal churn):** Keep a single `content/timeline.json` with the new unified shape for narrative entries. Resume + skills blocks stay as-is at the top of the array.

**Phase 2 (optional):** Split narrative entries into `content/timeline/entries/*.json` and merge in `getTimeline()` — better for a future dashboard and large media-heavy entries.

**Assets:** `public/timeline/<entry-id>/` for thumbnails, gallery images, and videos.

---

## 4. Migration Map (current → new)

| Current | New |
|---|---|
| `organization` | `subtitle` |
| `bullets` | `body` |
| `details` (education) | `body` |
| `url` (project, single) | `links: [{ label, href }]` |
| (none) | `summary` — **write new copy** from first bullet or custom teaser |
| (none) | `thumbnail`, `media` — optional, add over time |

Provide a one-time migration script `scripts/migrate-timeline.mjs` that:

1. Reads old `timeline.json`
2. Maps fields per table above
3. Auto-generates `summary` from first bullet/detail (truncate ~140 chars) where missing
4. Converts project `url` → `links` array
5. Writes migrated JSON (or outputs diff for review)

---

## 5. Overlay Layouts by Type

All layouts share a **header band**: date, title, subtitle, location, tags, close button.

### Experience — description-first

```
┌─────────────────────────────────────────────────────────────┐
│  [X]                                                        │
│  Apr 2026 – Present                                         │
│  SBEL Student Researcher                                    │
│  UW–Madison · Madison, WI          [FEA] [Simulation]       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌─────────────────────┐  │
│  │  Body copy (primary column)  │  │  Media stack        │  │
│  │  • bullet / paragraph list │  │  image               │  │
│  │  emphasized typography     │  │  image               │  │
│  │                            │  │  video (optional)    │  │
│  └──────────────────────────────┘  └─────────────────────┘  │
│  Links row: [SBEL ↗] [Paper ↗]                              │
└─────────────────────────────────────────────────────────────┘
```

- **Desktop:** ~60/40 text vs media (text left).
- **Mobile:** text first, media below.
- Body uses comfortable line-height; bullets if `body.length > 1`.
- Media: vertical stack with captions; not the hero — **copy leads**.

### Project — media-first

```
┌─────────────────────────────────────────────────────────────┐
│  [X]                                                        │
│  Jan 2025                                                   │
│  BobaByte Hackathon                                         │
│  [Java] [Outreach]                                          │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  HERO: video or large image (16:9)                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  thumb   │ │  thumb   │ │  thumb   │  secondary gallery  │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  Description block (still prominent — not footnote)         │
│  Links (optional): [Website ↗] [GitHub]                     │
└─────────────────────────────────────────────────────────────┘
```

- First `media` item is **hero** (video preferred if present).
- Remaining media in a horizontal scroll or 2×2 grid.
- Description below hero, full width.
- Links optional — render only if `links.length > 0`.

### Education — description + photo collage

```
┌─────────────────────────────────────────────────────────────┐
│  [X]                                                        │
│  Sep 2025 – Present                                         │
│  B.S. Aerospace Engineering + Computer Science              │
│  University of Wisconsin · Madison, WI                      │
├─────────────────────────────────────────────────────────────┤
│  Body (GPA, focus areas, activities)                        │
│  ┌────┐ ┌────┐                                              │
│  │    │ │    │  masonry / collage grid                     │
│  ├────┤ ├────┤  (2–6 images, varied aspect ratios)          │
│  │    │ └────┘                                              │
│  └────┘                                                     │
└─────────────────────────────────────────────────────────────┘
```

- No required links.
- Collage uses CSS grid with `grid-template-areas` or a simple masonry layout.
- If only one image, show single large tile; if none, text-only overlay.

---

## 6. Component Architecture

```
components/timeline/
├── TimelineSection.tsx          # unchanged shell
├── TimelineEntry.tsx            # routes to card + wires overlay open
├── TimelineCard.tsx             # NEW — shared collapsed card shell
├── TimelineThumbnail.tsx        # NEW — optional thumb on card
├── TimelineDetailOverlay.tsx    # NEW — portal, scroll lock, close
├── overlays/
│   ├── ExperienceDetail.tsx
│   ├── ProjectDetail.tsx
│   └── EducationDetail.tsx
├── ExperienceBlock.tsx          # becomes thin wrapper → TimelineCard
├── ProjectBlock.tsx
├── EducationBlock.tsx
└── media/
    └── TimelineMedia.tsx        # extend or fork PostMedia patterns
```

### State management

**Option A (recommended):** `TimelineOverlayProvider` in `HomePageClient` or `TimelineSection`

```ts
type OverlayState = { entryId: string } | null;
openOverlay(id) / closeOverlay()
```

**Option B:** URL search param `?entry=id` — enables back-button close and sharing; add in phase 2.

### Timeline card (`TimelineCard`)

Shared props:

```ts
type TimelineCardProps = {
  entry: ExperienceEntry | EducationEntry | ProjectEntry;
  onShowDetails: () => void;
};
```

Renders date, title, subtitle, location, summary, optional thumbnail, tags (truncated), **Show details** button.

Remove all `useState(expanded)` from type-specific blocks.

### Overlay (`TimelineDetailOverlay`)

- `createPortal` to `document.body`
- `role="dialog"` `aria-labelledby` pointing at overlay title
- Focus first focusable (close button) on open; restore focus on close
- `useEffect` — `document.body.style.overflow = 'hidden'`
- Renders correct `*Detail` child by `entry.type`
- Reuse `TimelineMedia` (image/video, preview vs full controls)

---

## 7. Timeline Thumbnail on Card

When `thumbnail` is set:

| Breakpoint | Placement |
|---|---|
| **md+** | 56×56 or 64×64 rounded square, left of title block (card gets horizontal flex) |
| **sm** | 100% width banner, `aspect-[2/1]`, top of card |

When absent: current text-only card (no placeholder gap).

Use `next/image` with `sizes` appropriate for small thumb. Static export already uses `unoptimized: true`.

---

## 8. Styling Notes

- Match existing OLED tokens (`bg-bg-elevated`, `border-white/5`, accent gradient on primary actions).
- Overlay panel: `max-w-3xl` (education/project) or `max-w-4xl` (experience split) centered, `py-12 px-6`.
- Animate overlay: `fade-in` backdrop + `scale-95 → 100%` content (`prefers-reduced-motion`: instant).
- Timeline plane / focus styles: opening overlay should **not** break plane snap; overlay sits above plane (`z-50`).

---

## 9. Content Authoring Guide (for future you / dashboard)

To add a new timeline entry:

1. Copy an existing entry object in `content/timeline.json` (or add a new file in phase 2).
2. Set unique `id`, `type`, `order`, `visible: true`.
3. Fill `title`, dates, `summary` (card teaser).
4. Fill `body` (full detail copy).
5. Optionally add `thumbnail` + files under `public/timeline/<id>/`.
6. Optionally add `media` and `links`.
7. Run `npm run build` — Zod will catch schema errors.

**Summary vs body:** Summary is marketing copy for the card; body is the full story for the overlay. They should not be identical.

---

## 10. Implementation Phases

### Phase 1 — Schema & migration
- [ ] Add `TimelineMediaItem`, `TimelineLink`, `TimelineThumbnail` Zod schemas
- [ ] Refactor `experience` / `education` / `project` to `narrativeBase` shape
- [ ] Write `scripts/migrate-timeline.mjs` and migrate `content/timeline.json`
- [ ] Update `getTimeline()` types (`ResolvedTimelineEntry`)
- [ ] Add `summary` copy for all existing entries

### Phase 2 — Shared timeline card
- [ ] Create `TimelineCard` + `TimelineThumbnail`
- [ ] Refactor `ExperienceBlock`, `ProjectBlock`, `EducationBlock` to use `TimelineCard`
- [ ] Remove inline expand logic
- [ ] Truncate tags on card (e.g. max 3)

### Phase 3 — Full-screen overlay
- [ ] `TimelineOverlayProvider` + `TimelineDetailOverlay`
- [ ] `ExperienceDetail`, `ProjectDetail`, `EducationDetail` layouts
- [ ] `TimelineMedia` component (reuse blog `PostMedia` patterns)
- [ ] Accessibility: focus trap, Escape, aria labels
- [ ] Body scroll lock

### Phase 4 — Polish & optional enhancements
- [ ] URL param deep linking (`?entry=id`)
- [ ] Keyboard: focus visible on “Show details”
- [ ] Analytics event: `trackTimelineDetailOpen(entryId)`
- [ ] Split entries into `content/timeline/entries/*.json` if file grows unwieldy
- [ ] Placeholder thumbnails for high-priority entries (SBEL, AED drone, FTC, UW)

### Out of scope (this plan)
- Resume block changes
- Skills carousel changes
- Dashboard UI for editing timeline JSON
- MDX-longform per entry (keep JSON-driven for now)

---

## 11. Testing Checklist

- [ ] All migrated entries pass Zod validation
- [ ] Cards render without thumbnail when field omitted
- [ ] Cards render with thumbnail (sm + md layouts)
- [ ] “Show details” opens overlay; card height unchanged
- [ ] Close via X, Escape, and backdrop
- [ ] Experience overlay: text column readable; media + links render
- [ ] Project overlay: hero media + gallery + description + optional links
- [ ] Education overlay: body + collage (0, 1, many images)
- [ ] `prefers-reduced-motion`: no overlay animation
- [ ] Timeline plane focus still works with overlay closed
- [ ] Static export build succeeds (`npm run build`)
- [ ] No layout shift on timeline when opening/closing overlay

---

## 12. Open Questions

1. **Deep links on launch?** URL param adds complexity but helps sharing — defer to phase 4 unless needed now.
2. **Single `timeline.json` vs per-entry files?** Start unified; split when entry count or media metadata grows.
3. **Body format:** Stay as `string[]` (simple) or support markdown strings later? Recommend `string[]` now; add optional `bodyFormat: "markdown"` later if needed.
4. **Video hosting:** Self-host in `public/timeline/` vs external URLs (YouTube embed)? Start with self-hosted / direct URLs like blog posts; YouTube embed as future `media.type: "embed"`.

---

## 13. Success Criteria

- One schema to learn for experience, education, and project.
- New entry = one JSON object + optional assets folder.
- Timeline cards stay compact; rich content lives in the overlay.
- Each entry type has a distinct, appropriate detail layout.
- Optional thumbnails make the spine visually scannable.
