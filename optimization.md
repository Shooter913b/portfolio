# Optimization Report

A code-health and performance audit of the portfolio (Next.js 15 App Router, React 19,
static export). Findings are grouped by the three goals: **redundant code**,
**over-complicated code**, and **responsiveness / compute cost to view**.

Every item lists concrete `file:line` references so each can be picked off independently.

> **Deployment context:** `next.config.ts` uses `output: "export"` (fully static site,
> no server runtime in production) and `images: { unoptimized: true }`. This shapes the
> priorities below:
> - Content I/O (`fs` reads, JSON/MDX parsing) only costs **build/dev time**, not per-request.
> - The real user-facing costs are **JS bundle size**, **serialized props**, **image bytes**,
>   and **continuous client animation work**.

---

## TL;DR — highest-impact wins

| # | Item | Type | Impact | Effort |
|---|------|------|--------|--------|
| 1 | Pause `WireframeBackground` rAF when tab hidden / off-screen | compute | High (runs 60fps every page, all session) | Low |
| 2 | Pause `TimelinePlane` rAF on mobile / off-screen / hidden | compute | High (layout reads every frame) | Low |
| 3 | Remove `HomePageClient` `"use client"` wrapper | bundle | High (forces whole homepage tree client-side) | Med |
| 4 | Optimize images (sizes/quality) — `images.unoptimized` is on | bytes | High (full-res images shipped) | Med |
| 5 | Consolidate 4 carousel implementations into one hook | redundant | Med–High | Med |
| 6 | Pause off-screen carousel autoplay timers (N `setInterval`s) | compute | Med | Low |
| 7 | Memoize `getAllPosts()` / `getTimeline()` (build speed) | redundant | Med (build/dev) | Low |
| 8 | Delete dead code & thin pass-through wrappers | redundant | Low | Low |

---

## 1. Redundant code

### 1.1 Four separate carousel implementations
The same index/paused/autoplay/reduced-motion state machine is written four times:

- `components/media/MediaCarousel.tsx:25-72`
- `components/timeline/TimelineCardFeatured.tsx:119-205`
- `components/hero/FeaturedCarousel.tsx:22-125` (nested post + media)
- `components/timeline/SkillsCarousel.tsx:60-193` (also re-implements the controls markup)

**Fix:** Extract a `useCarousel({ count, autoPlay, intervalMs, controlled? })` hook and reuse
`MediaCarouselControls` everywhere. `SkillsCarousel` lines `136-193` can be replaced with
`<MediaCarouselControls compact label="Skill categories" />`.

### 1.2 Duplicated media-splitting helpers
Identical "filter by `featured`" logic in two modules:

- `lib/timeline/featuredMedia.ts:4-10` — `getFeaturedMedia` / `getSupplementaryMedia`
- `lib/log/postMedia.ts:4-10` — `getFeaturedPostMedia` / `getSupplementaryPostMedia`

**Fix:** One `lib/media/splitFeatured.ts` consumed by both timeline and log code.

### 1.3 Triplicated image-expand / lightbox handlers
The `data-media-expand` + click/keydown + `ImageLightbox` pattern is copy-pasted:

- `components/timeline/TimelineCardFeatured.tsx:56-84, 208-215`
- `components/media/GalleryTile.tsx:57-78, 139-147`
- `components/timeline/media/TimelineMedia.tsx:54-71, 119-127`

**Fix:** A `useImageLightbox()` hook or `ExpandableImageFrame` wrapper; each surface only
supplies `object-cover` vs `object-contain`.

### 1.4 Duplicated overlay scaffolding
The three detail overlays share the same header → featured → body → gallery → links shape:

- `components/timeline/overlays/ExperienceDetail.tsx:15-52`
- `components/timeline/overlays/EducationDetail.tsx:15-43`
- `components/timeline/overlays/ProjectDetail.tsx:20-55`

And the related-list cards are copy-pasted:

- `components/timeline/overlays/TimelineRelatedLogs.tsx:19-36`
- `components/timeline/overlays/TimelineRelatedExperiences.tsx:18-31`

**Fix:** A `NarrativeDetailLayout` with named slots, and a `RelatedCardList` taking
`{ title, href, meta?, excerpt? }[]`.

### 1.5 Small duplicated utilities
- **Play overlay badge** — `TimelineCardFeatured.tsx:33-40` (`PlayOverlay`) vs `GalleryTile.tsx:19-26` (`PlayBadge`).
- **Body scroll lock** — `ImageLightbox.tsx:26-34` vs `TimelineDetailOverlay.tsx:41-47` → extract `useBodyScrollLock(active)`.
- **Close-button SVG** — `ImageLightbox.tsx:77-84` vs `TimelineDetailOverlay.tsx:141-148`.
- **`hasPostMedia`** defined twice — `lib/log/postMedia.ts:22-24` and `components/blog/PostMedia.tsx:21-23`.

### 1.6 Dead code (safe to delete)
- `components/timeline/SkillsBlock.tsx` — no importers anywhere.
- `components/media/MediaCarouselControls.tsx:137-139` — `wrapCarouselIndex` exported, unused.
- `components/timeline/media/TimelineMedia.tsx` — `hasTimelineMedia` unused.
- `lib/skills/proficiency.ts:24-27` — `proficiencyGlow` unused.
- `lib/log/postMedia.ts:12-20` — `getPostCarouselItems` / `getSupplementaryGalleryItems` (`@deprecated`, no callers).
- `lib/content/getTimeline.ts:55-57` — `getTimelineEntryIds` unused.
- `components/timeline/SkillCategoryPanel.tsx:9` — `buildSkillList` exported but only used in-file.

### 1.7 Thin pass-through wrappers (extra indirection / client boundaries)
- `components/timeline/ExperienceBlock.tsx`, `ProjectBlock.tsx`, `EducationBlock.tsx` — each is
  just `"use client"` + `<TimelineCard entry={entry} />`. Inline into the `TimelineEntry` switch.
- `components/timeline/media/DetailFeaturedMedia.tsx:9-12` and
  `components/blog/PostMedia.tsx:12-18` — wrap `MediaCarousel` with near-zero added value.

---

## 2. Over-complicated code

### 2.1 `TimelineCardFeatured` controlled/uncontrolled hybrid
`components/timeline/TimelineCardFeatured.tsx:124-168` mixes an internal index, an optional
external `activeIndex`/`onActiveIndexChange`, and a corrective sync `useEffect` (`164-168`).
Only `FeaturedCarousel` needs controlled mode; timeline cards and log thumbnails do not.

- **Bug:** `intervalMs` prop is accepted (`:28,116`) but autoplay hardcodes `AUTO_INTERVAL_MS`
  at `:157`, so progress dots desync if a caller passes a custom interval.

**Fix:** Split into always-uncontrolled `TimelineCardFeatured` + a controlled variant, or use a
`useControllableState` hook; remove the sync effect by clamping index in the parent. Use
`intervalMs` at `:157`.

### 2.2 `FeaturedCarousel` nested orchestration
`components/hero/FeaturedCarousel.tsx:22-125` tracks `postIndex` + `mediaIndex`, mirrors them in
a `stateRef`, drives a controlled `TimelineCardFeatured`, **and** renders a second
`MediaCarouselControls` for posts.

**Fix:** Either a `useNestedCarousel(posts, getMedia)` hook, or flatten to a single virtual slide
list `[p0m0, p0m1, p1m0, …]` with one carousel — removes the `stateRef` sync and dual controls.

### 2.3 `SkillsCarousel` double-mounts every panel + measures the DOM
`components/timeline/SkillsCarousel.tsx`:
- `:88-97` renders a hidden duplicate of **all** `SkillCategoryPanel`s purely to measure height.
- `:42-58` reads `offsetHeight` on each panel + a `resize` listener (forced layout / thrashing).
- `:105-120` mounts **all** categories (opacity/absolute), not just the active one.

**Fix:** Use CSS grid stacking (`grid-area: 1/1`) on one panel set, or measure a single panel
with `ResizeObserver` only when the active category changes. Consider `content-visibility: auto`
on inactive panels.

### 2.4 Reduced-motion handled three different ways
There's a good hook (`hooks/useReducedMotion.ts`, with live `change` subscription), but the three
heaviest animators call `window.matchMedia` once and never listen for changes:
`WireframeBackground.tsx`, `TimelinePlane.tsx`, `LoadingScreen.tsx`. Meanwhile 9 leaf components
each create their own subscription.

**Fix:** A single `ReducedMotionProvider` / shared singleton consumed everywhere — consistent
behavior and one listener.

---

## 3. Responsiveness & compute cost to view

### 3.1 `WireframeBackground` — biggest continuous cost
`components/layout/WireframeBackground.tsx` runs a full-viewport canvas at 60fps for the **entire
session, on every route**, even when fully covered by content (`z-0` under `z-10`).

- `:309-313, 205-301` — perpetual rAF, full `clearRect` + redraw each frame; no
  `document.hidden` / occlusion pause.
- `:213-224` — ~220 node objects re-allocated each frame (`TARGET_POINTS = 220`) → GC churn.
- `:226-284` — per-edge `beginPath()`/`stroke()` → potentially hundreds of draw calls/frame.
- `:122-167` — `createRadialGradient` per star **per frame** (one of the most expensive 2D ops).
- `:193-203` — full mesh rebuild on every resize, no debounce.

**Fixes (in priority order):**
1. Pause rAF when `document.hidden` or when an `IntersectionObserver` says the canvas is occluded.
2. Batch links into a single `Path2D`; cap links/frame; lower `TARGET_POINTS` on mobile.
3. Pre-bake star sprites to offscreen canvases (per hue/size) and `drawImage` them.
4. Debounce resize; preallocate `Float32Array`s instead of per-frame `map`.

### 3.2 `TimelinePlane` — layout reads every frame
`components/timeline/TimelinePlane.tsx:91-199` polls via rAF (never via scroll) and each frame does
`document.querySelectorAll("[data-timeline-entry]")` + `getBoundingClientRect()` on every dot
(`:109-127`). It keeps running even when:
- the plane is `opacity: 0` / timeline out of view (`:129-139`),
- on mobile where the element is `hidden md:block` (`:214`) — **hidden but still looping**.

It correctly avoids React re-renders (mutates `data-focused` attributes), but the **layout reads**
are the cost.

**Fixes:** Bail out of the loop (don't reschedule) when `!inView`, tab hidden, or viewport `< md`;
resume via `IntersectionObserver` + a `matchMedia('(min-width: 768px)')` gate. Cache the NodeList;
refresh only on `ResizeObserver`.

### 3.3 `LoadingScreen` — heavy burst on every load
`components/loading/LoadingScreen.tsx` (~523 lines) runs a ~4s dual-canvas animation on every
navigation with no "already seen" gate.
- `:245-290` — `getPointAtLength` ~42×/frame (~10k path samples per load).
- `:341-346` — full-canvas `destination-out` fade each frame at 2× DPR.
- `:377-390` — 8 strip transforms + 2 clip-paths written per reveal frame.

**Fixes:** Skip the loader on repeat visits via `sessionStorage`; pre-sample the path to a
`Float64Array` lookup at init; shorten on mobile. It's also pulled into **every** route's bundle
via `AppShell` — load it as a client island only where needed.

### 3.4 Images are completely unoptimized
`next.config.ts` sets `images: { unoptimized: true }` (required by `output: "export"`). Every
`next/image` ships at original resolution/format with no resizing — large byte cost on the hero,
carousels, and galleries.

**Fixes:** Pre-generate responsive/WebP derivatives at build (e.g. a `sharp` script over
`public/timeline/**`), or move to an image CDN / Netlify Image CDN. Ensure off-screen images use
`loading="lazy"` (next/image default) and only the first visible thumbnail uses `priority`
(see `LogEntryThumbnail` → `TimelineCardFeatured variant="thumb"`).

### 3.5 `HomePageClient` forces the whole homepage into the client bundle
`components/HomePageClient.tsx:1` is `"use client"` and imports `HeroSection` and
`TimelineSection` directly (`:7-9`). In Next.js this drags the entire homepage subtree — and all
serialized props (`timeline`, full `posts` **with markdown bodies**, `featuredPosts`, `site`,
`profile` from `app/page.tsx:18-24`) — into client JS.

**Fix:** Render server components directly from `app/page.tsx`; pass the timeline as `children` and
keep small client islands (`FeaturedCarousel`, overlay provider, `ProfilePhotoGate`) as leaves.
Pass a `PostSummary` (no `content`) to anything that only needs title/date/excerpt
(`TimelineOverlayContext.tsx:84-87`, `TimelineRelatedLogs.tsx:19-35`, `LogEntryRow.tsx:14-15`).

### 3.6 N simultaneous autoplay timers
Each timeline card, log row, detail overlay, and the skills block runs its own `setInterval`:
- `TimelineCardFeatured.tsx:155-159`, `LogEntryThumbnail.tsx:17-24`,
  `MediaCarousel.tsx:37-41`, `SkillsCarousel.tsx:60-64`.

On the log index this means many timers firing at once, plus a parallel engagement fetch per row
(`LogEntryEngagementStats.tsx:16-26`).

**Fixes:** Pause autoplay when off-screen (`IntersectionObserver`) or `document.hidden`; consider a
single shared scheduler. Batch engagement into one `GET /api/log-engagement?slugs=a,b,c` loaded in
`LogIndexClient` and drilled to rows.

### 3.7 Overlay double-renders the live card
`components/timeline/TimelineDetailOverlay.tsx:204-208` renders `<TimelineCard>` on the flip front
while the original stays mounted — two live carousels for the same entry during the flip.

**Fix:** Use a static snapshot (image + title) for the flip front, or pause the underlying card's
carousel while the overlay is open.

### 3.8 Scroll handler triggering React re-renders
`components/hero/ScrollIndicator.tsx:11-18` calls `setVisible` on scroll (passive, but still a
React re-render per threshold cross).

**Fix:** Toggle opacity via a ref + direct `style.opacity`, or coalesce with rAF.

---

## 4. Build/dev-time redundancy (static export — not per-request)

These don't affect production runtime (the site is pre-rendered) but slow builds and `next dev`,
and matter if the site ever moves off static export. **No `React.cache()` / `unstable_cache` /
module memoization exists anywhere.**

- `lib/content/getFeaturedPosts.ts:9-48` — `getAllPosts()` re-scans and re-parses the whole blog
  dir on every call; `getFeaturedPosts()`, `getPostBySlug()`, `getPostSlugs()` each call it again.
  `getPostBySlug` reads **all** posts to return one.
- `lib/content/getTimeline.ts:36-52` — full preprocess + Zod parse + a second `getSkills()` file
  read on every call.
- `lib/log/timelinePosts.ts:12-42` — `resolvePostTimelineRefs` / `getTimelineEntriesWithPosts`
  call `getTimeline()` once per related ID.
- Per render, `site.json` is read 2–3× on `/` and `/about` (`app/layout.tsx`, page metadata,
  `getAbout()` at `lib/content/getAbout.ts:4-8`).

**Fix:** Wrap each getter in `cache()` from `react` (or a module-level singleton for the static
build), build a `Map<id, NarrativeEntry>` once for ref resolution, and add
`getAllPostSummaries()` that omits `content` for index/overlay use.

---

## 5. Suggested order of execution

1. **Quick compute wins (low effort, high impact):** §3.1 + §3.2 visibility/off-screen rAF gates;
   §3.6 off-screen autoplay pause.
2. **Bundle:** §3.5 remove `HomePageClient`; introduce `PostSummary`.
3. **Images:** §3.4 build-time derivatives.
4. **Consolidation:** §1.1 carousel hook, §1.2 media-split helper, §2.1/§2.2 simplify
   `TimelineCardFeatured` + `FeaturedCarousel`.
5. **Cleanup:** §1.6 dead code, §1.7 wrappers, §4 caching.

Each section is independent, so they can land as separate small PRs.
