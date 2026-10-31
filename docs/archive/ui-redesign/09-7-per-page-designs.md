<!-- Archived verbatim from docs/plans/ui-redesign.md (7. Per-page designs); links re-pointed. Index: ../../plans/ui-redesign.md -->

## 7. Per-page designs

Every page lists its data sources (unchanged endpoints) and how it behaves with today's data.

### 7.1 Home — `home.html`

Blocks render in the stored order: `hero` → `stat-band` → `tech-marquee` → `featured-case` → `domain-grid` → `case-grid` → `process` → `skill-groups` → `post-list` → `cta-band`. Data comes from `GET /api/public/pages/home` and `GET /api/public/site`.

- **Hero (`SPLIT_7_5`).**
  - Kicker with a blinking caret, then a 4-line masked h1. Lines are split at render from `headline`; the `headlineAccent` substring becomes the italic signal word.
  - Lead, two CTAs (`primaryCta`, `secondaryCta`) and the `status.json` card (`showAvailability`).
  - `HeroStage` (shader + poster) appears when `showDiagram` is on. It animates only when `settings.ambientEffects` is true.
- **Ticker.** `tech-marquee` items from skills; the heading is visually hidden. When `marqueeEnabled` is false it renders a static row.
- **§01 Stats.** Computed and manual stats. A stat that resolves to 0 is not rendered (today: `PROJECT_COUNT`).
- **§02 Featured.** The featured project: `GenerativeCover` (shared element), metric diffs, CTA.
- **§03 Selected work.** Sticky stacking sheets, with concentric radius inside each sheet. **Hidden entirely** when there are no published projects (today).
- **§04 Domains.** Sunken band with four hue-topped columns and case counts.
- **§05 Process.** Pinned on desktop; the line fills and steps light up in order.
- **§06 Writing.** Index rows. Hidden when there are no published posts (today).
- **§07 CTA.** Inverse band: big line, a copy-email button showing `<email>` from settings, social links.
- **Footer.** Columns plus a giant wordmark.
- **`skill-groups`.** Collapses into the ticker when both blocks are on home (P7). Admin shows a hint suggesting one or the other; the public side renders the skill matrix on About only if Parker removes the block from home. This is an open question, Q3.

### 7.2 Projects list — `projects.html`

- **Data:** `GET /api/public/projects` (+ `domain`, `skill`, `featured` params) and `/api/public/domains`.
- **Header:** count, sticky toolbar with **wrapping** filter chips (domain hue dots, counts), Grid / Index toggle, and URL-synced filters.
- **Grid view:** the featured card spans two columns. **Index view:** numbered rows; a pointer-following cover preview appears on fine pointers.
- **Empty (today):** `EmptyState` with the label `projects.empty` and a link to About.

### 7.3 Case study — `case-study.html`

- **Data:** `GET /api/public/projects/:slug`.
- **Top:** crumbs, h1 = `title`, tagline, and a facts bar with client, role, timeline, team size and version `from → to`. Then the 21:9 cover (shared element from the card).
- **Metrics board** (`metrics[]` before/after), then a two-column body: a sticky TOC with progress on the rail, and prose from `problem`, `constraints`, `approach`, `decisions`, `outcome`, `lessons` (markdown from Tiptap).
- **Extra blocks:** key facts (`keyFacts[]`), a **“Not mine” callout** when `notMine` is set (honest attribution, shown prominently), and release status lists.
- **Bottom:** “Next case” with a kinetic hover.
- **`isConfidential`:** the client name is shown as written by the API, and in-content images are hidden.

### 7.4 About / CV — `about.html`

- **Data:** `GET /api/public/pages/about` and `/site`.
- **About intro:** portrait frame showing a `Monogram` while `avatar` is null; definition list from the profile; bio with a drop cap.
- **Then:** compact stats; experience timeline as a commit graph (company → roles → highlights, current node in signal); principles; skill matrix; education.
- **CV download:** EN and VI cards. A card is disabled with a “not uploaded” label when `resumeEn` or `resumeVi` is null (today).

### 7.5 Contact — `contact.html`

- **Data:** the `contact-form` block, the contact topics, and settings (availability, reply-time note).
- **Layout:** big headline and channels on the left (copy-email `<email>`, social links); the form on the right with line inputs, topic pills (radio group) and an inline success state.
- **TODO guard:** notes that still contain `TODO` are not rendered.

### 7.6 Notes list — `notes.html`

- **Data:** `GET /api/public/posts` and tags.
- **Layout:** pinned latest post, tag chips, search (client filter on the loaded page), year groups, and an EN badge on fallback posts when viewing `/vi`.
- **Empty (today):** `EmptyState` (`notes.empty`).

### 7.7 Post reader — `post.html`

- **Data:** `GET /api/public/posts/:slug` plus the posts list for the left pane.
- **≥ 1024px:** KB three-pane, with the document locked. The left pane lists notes grouped by tag with roman numerals (computed), single y-scroll and ellipsis. The center is a 48rem article with a reading-progress bar driven by `scroll(nearest)`. The right pane is the “On this page” tree, whose active heading comes from an IntersectionObserver with root = the article pane, rootMargin `-20% 0 -60% 0` (KB).
- **< 1024px:** normal document with a collapsible TOC box.
- **Locale fallback:** a VI callout with `lang="vi"`.
- **Bottom:** takeaways card and next note.

### 7.8 Admin — `admin-*.html`

- **Sign in.** Teal grid art on the left, form on the right, error callout. The UI stays English-only.
- **Dashboard.** Data from `GET /api/admin/stats?range=7d|30d|90d` and `GET /api/admin/health`.
  - KPIs: views, projects, posts and unread messages.
  - Content health: a ring plus one issue row per kind, each with a deep link (`MISSING_VI` → editor field, `MISSING_ALT` → media filter, `PAGE_STALE_DRAFT` → page builder, and so on).
  - Quick actions with shortcuts, views bars with a range toggle, and an inbox preview.
- **Command palette.** `?palette=1`.
- **Drawer.** `?drawer=1` at mobile width.
- **Projects table.** TanStack Table with search, facets (status, domain, missing VI), density, bulk bar, drag order (dnd-kit), status pills and locale chips. At ≤ 639px rows become cards.
- **Project editor (focus mode).**
  - The outline pane lists sections with completeness marks.
  - The 48rem canvas has locale tabs with meters, a big title, tagline counter, facts fieldset and the Tiptap toolbar and slash menu.
  - The publish pane holds status, save state and version, preview and publish, publish checks (server health for this record plus client TODO / empty-VI checks) and a concentric card preview.
- **Page builder.** Block rows with icon, key, summary and visibility. Rows whose data is empty are marked “Hidden publicly · no data”.
  - The resizable inspector shows only the block's allowed `layouts` (hero: `SPLIT_7_5`, `ONE`) and the PLAIN / BAND surface.
  - Fields come from the block's zod `meta` (`primaryCta` EN/VI + href, `showAvailability`, `showDiagram`), next to a live mini preview.
- **Media.** Drop zone, grid with “No alt” badges, details pane with alt EN/VI and usage count.
- **Inbox.** List with unread dots, reading pane, reply-by-email action.

### 7.9 Loading states (public + admin) — `loading.html`, `admin-loading.html`

The current build shows almost no loading feedback (P18, A10). This section defines one loading system shared by both apps. The mockups show every state at real size (screenshots `loading-*.jpg`, `admin-loading*.jpg`).

**Rule 1: skeleton parity, so nothing shifts.**

- Every data component exports a colocated skeleton built from the **same layout wrapper** as the component. The plan writes it as `X.Skeleton`; in code it follows the existing naming, a named export like `HeroSkeleton`. It shares the same grid classes, `aspect-ratio`, gaps and type tokens. Only the data is swapped for skeleton shapes. The block registry already has a `skeleton` slot per block (`block-renderers.constant.ts:52`); its generic `h-80` boxes are replaced one by one.
- Static UI strings render for real inside skeletons: `§` rails, panel titles, KPI labels, table headers, toolbars, editor section titles. The page reads as itself while the data is pending, and the toolbar stays usable.
- Text lines use `SkeletonText`: each line is exactly `1lh` tall in the same type token as the real text, and the visible bar is clipped to cap height (x-height at display sizes). A 4-line hero skeleton is therefore the height of a 4-line hero.
- Variable text in the real component is **bounded**, so the skeleton can match it. Card titles and excerpts use a two-line clamp plus `min-height: 2lh`; facts and KPIs are single-line. The parity demo in `loading.html` measures Δ 0px between a skeleton card and a real one.
- Media boxes come from `aspect-ratio` (generative covers) or the API's `width`/`height` (`publicImageSchema`).
- Tables use fixed column sizes: TanStack `column.size` renders a `<colgroup>` with `table-layout: fixed`. Skeleton rows reuse the real cell structure (thumb + two text lines), so their height matches.

**Rule 2: one mechanism per situation.**

| Situation                                                  | Mechanism                                                                                 | What the user sees                                                                    |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Navigating to a route segment whose data is not ready      | `loading.tsx` per segment, shown at once by the router                                    | That page's skeleton under the real header/shell                                      |
| A block or panel whose data streams                        | `SectionBoundary` / `<Suspense fallback={<X.Skeleton/>}>`                                 | That block's skeleton; blocks above it are already interactive                        |
| Client query, first load                                   | `useSuspenseQuery` inside a boundary (admin), or `isPending` → `X.Skeleton`               | Skeleton                                                                              |
| Client query, refetch with data on screen                  | `isFetching && !isPending`, with `placeholderData: keepPreviousData` (already in 5 hooks) | Previous data dimmed to 60% plus a 2px `FetchBar`; no skeleton, focus and scroll kept |
| Any client navigation still pending after 120ms            | `useLinkStatus()` in each `Link`, reported to a tiny store read by `RouteProgress`        | 2px bar on the header edge (signal on public, teal in admin)                          |
| Mutation / form submit                                     | `mutation.isPending`, TanStack Form `isSubmitting`                                        | `Button loading`: width locked, spinner, `aria-busy`; double submits ignored          |
| Autosave                                                   | Existing `SaveStatus` on `mutation.status`                                                | Saved · v14 → Unsaved changes → Saving… → Couldn't save · Retry                       |
| Toggles and reordering (featured, drag order, read/unread) | Optimistic `onMutate` snapshot, `onError` rollback, `onSettled` invalidate                | Instant change; a toast with Retry on failure                                         |
| Upload                                                     | XHR progress from `media-upload.service.ts`                                               | Per-file `ProgressBar` with %, error row with Retry                                   |
| Image                                                      | `width`/`height` + Cloudinary LQIP                                                        | Reserved box → blurred preview → full image fades in                                  |
| First hard load of a session (public)                      | `IntroCurtain`                                                                            | Ink curtain, ≤ 700ms                                                                  |

**Rule 3: timing.**

- Skeletons fade in from 100ms (CSS `animation-delay`, no JS timers, SSR-safe), so a fast response never flashes one.
- The route bar appears only if the navigation is still pending after 120ms. It trickles to 92%, completes on commit, then fades.
- “Done” states (Sent ✓, Published ✓) last 1.4s, then return to idle.
- No artificial minimum durations: content always wins.

**Rule 4: motion.**

- The shimmer is a `::after` gradient moved with `translate` (compositor-only), lasting 1.6s with an 80ms stagger per item (`--si`). `background-position` and `animate-pulse` are not used.
- Its colours are mixed from `--foreground` over whatever surface it sits on, so one class works on paper, card, band and dark.
- `prefers-reduced-motion`: no sweep, a static tone only. The route bar becomes a static bar, the spinner stops (the ring with a gap still reads as busy), and there is no image fade and no intro curtain. `?capture=1` freezes the same way for screenshots.

**Rule 5: accessibility.**

- Skeleton subtrees are `aria-hidden`. The region being loaded gets `aria-busy="true"` plus one visually hidden `role="status"` line, such as “Loading case studies…” (`states.*` keys).
- `Button loading` keeps the label in the DOM, so its width is locked. It uses `aria-disabled` instead of `disabled`, so focus stays on the button, and it ignores activation while busy. Today the Button sets `disabled` (`packages/ui/src/components/ui/button.tsx:66`).
- One polite live region per page announces Sending… / Sent / the error. Spinners are `aria-hidden`.
- Arriving content never moves focus; route-change focus is handled in R8.

**Image placeholders (LQIP) without backend changes.**

- `lqipUrl(url)` inserts `w_32,e_blur:1000,q_1,f_auto` after `/upload/` for `res.cloudinary.com` URLs, using the same parsing as `image-loader.util.ts:18`.
- On the server, `getBlurDataURL(url)` fetches that ~300-byte preview through the Next data cache, base64-encodes it and passes it to `next/image` as `placeholder="blur" blurDataURL`. The preview paints on first render with no extra request. CSP already allows `data:` in `img-src`.
- Client-only grids (admin media) use the LQIP URL directly as a CSS background, because it comes from the same CDN.
- Non-Cloudinary URLs or a failed fetch fall back to the sunken box. Generative covers need no placeholder.

**Initial page loader: the “ink curtain” (public only).**

- **Look.** An ink sheet with the monogram and a signal stroke that draws (0–340ms), then the sheet wipes upward with `clip-path` (380–700ms). The hero lines start rising as it leaves.
- **When.** Only on the first hard load of a session. A tiny inline script in `<head>`, using the request nonce from `proxy.ts` like next-themes already does, adds `html.intro` before first paint, and only when all of these hold:
  - `sessionStorage` has no flag
  - motion is allowed
  - `settings.ambientEffects` is true

  Client navigations never show it.

- **Safety.**
  - The real page is server-rendered underneath, and the curtain is `aria-hidden` with `pointer-events: none`, so input is never blocked.
  - It holds no large text or image, so it cannot become the LCP element.
  - Without JS it never appears.
- **Budget.** Lighthouse runs as a first visit, so the curtain is included in the measured LCP. It must stay within the R5 budget, and R8 has the test.

**Per-surface skeleton map** (each line is an acceptance item in the PR named in brackets):

- **Home (R5).** Hero: kicker line, 4 display lines, 3 lead lines, 2 CTA-sized boxes, and the status card with its real header and 5 dt/dd rows. Static ticker strip. Stats: 4 cells with the real rule lines. Featured and stack card: cover box at the real ratio plus meta / 2-line title / 2-line excerpt. Domains: 4 columns with hue rules. Process: 5 nodes with the real line. Post list: index rows. The CSS shader poster paints at once; the canvas never blocks.
- **Projects (R9).** Page head, filter pills (5 capsules), tools, a results line, the featured card spanning both columns, then cards. A filter change keeps the previous cards (FetchBar), and the skeleton appears only on a cold load.
- **Case study (R9).** Crumbs, 2 title lines, 2 tagline lines, the 5-column facts bar, and the 21:9 cover box, which keeps `view-transition-name` so the card → detail morph still lands. Then the metrics board, TOC and paragraph-shaped prose.
- **About (R10).** Portrait frame (monogram box), definition list, timeline nodes with role lines, principles grid, skill matrix columns. **Contact (R10).** The form is static (no skeleton); submitting is shown in `loading.html` board 06.
- **Notes + reader (R11).** List rows with year groups. Reader at ≥ 1024: nav pane lines, a 48rem article (meta, 2 title lines, paragraphs, a figure box) and TOC lines. Below 1024, only the article.
- **Admin shell (R12).** `app/admin/(cms)/loading.tsx` renders the generic page-head + panel skeleton inside the real shell. The sidebar and top bar never unmount. Teal route bar under the top bar. Palette: local commands at once, two skeleton rows while the debounced server search (150ms) is pending.
- **Dashboard and tables (R13).** KPI cards keep their labels with skeleton values; the health panel has a ring and 4 issue rows; then the views chart box and inbox rows. DataTable: a real toolbar and header, 6 skeleton rows with fixed columns, and a `role="status"` footer; at ≤ 639px the skeleton rows become cards like real rows. Refetch shows the FetchBar inside the panel header (absolutely positioned, so there is zero shift).
- **Editors, media, inbox (R14).** The editor in focus mode: outline lines, locale tabs with meter placeholders, 2 big-title lines, a tagline box, the fieldset (real labels and 36px input boxes), the Tiptap toolbar rendered disabled with paragraph lines, and the publish pane (status pill, two button boxes, check rows). Page builder: block rows at 56px. Media: 4:3 tiles, then LQIP. Inbox: message rows; `fetchNextPage` adds two skeleton rows at the end. Sign-in: `Button loading` while signing in (fixes the missing pending state at `LoginForm.tsx:85`).

---

