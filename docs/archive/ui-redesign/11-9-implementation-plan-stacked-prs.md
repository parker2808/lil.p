<!-- Archived verbatim from docs/plans/ui-redesign.md (9. Implementation plan (stacked PRs)); links re-pointed. Index: ../../plans/ui-redesign.md -->

## 9. Implementation plan (stacked PRs)

Each PR stacks on the previous one (R1 on `main` after this docs PR merges). Every PR is small, keeps `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` and `check:content` green, adds Storybook stories for new or changed components, and adds i18n keys to both `en.json` and `vi.json` for any public chrome label. Admin labels go to `en.json` only, which is the current convention.

### R1 — Tokens, fonts, radius ladder

- **Files:**
  - `packages/ui/src/styles/globals.css`: both scopes, shadcn names, `@theme inline`, radius ladder + `@supports (corner-shape)`, motion tokens, base reduced-motion rule.
  - `apps/web/src/modules/core/utils/fonts.util.ts` → Plex Sans/Mono.
  - Admin layout gets the `admin` scope class.
- **Acceptance:**
  - All existing screens render with the new tokens and no layout breakage.
  - `rounded-*` utilities map onto the ladder.
  - Squircle shows in Chromium; round corners elsewhere.
  - Vietnamese diacritics render in Plex on `/vi` with no clipping.
  - Every duration token is mapped into `@theme` and zeroed by the reduced-motion rule. Today `--dur-fast` is left out (`globals.css:184–188`), so fast hover transitions still animate.
  - `--container` is the only page-width source. Today it is defined (1120px) but unused, and `BlockRenderer` / `SiteHeader` hardcode `max-w-5xl`.
- **Tests:**
  - Vitest contrast test over the token pairs in [§4.1](06-4-tokens.md#41-color).
  - Storybook “Foundations” story (palette, type, radius, motion), ported from `foundations.html`.
  - Playwright `/vi` smoke asserts that the computed `font-family` starts with IBM Plex Sans.
  - axe stays at 0 serious/critical.

### R2 — Public data-quality guards (client-only)

- **Files:**
  - `BlockRenderer.tsx`: no wrapper or padding when a renderer returns `null`; band groups drop empty members.
  - `isPlaceholderText()` util (TODO / TBD / lorem, case-insensitive, trimmed).
  - `formatTitle` de-dup (contains, not only equals).
  - Hero kicker: strip one leading `>`, or drop the icon.
  - Stats: skip zero-valued entries.
  - `Reveal`: SSR-visible.
- **Acceptance:**
  - No `TODO` text on any public page with the live data.
  - No empty bands.
  - `<title>` has no repeated name.
  - Kicker shows a single prompt.
  - No “0” stat.
  - Content is visible with JS disabled.
- **Tests:**
  - Vitest for `isPlaceholderText`, `formatTitle`, and the BlockRenderer empty-block cases.
  - Playwright `public.spec.ts`: no `TODO` in `main`, no section shorter than 40px, JS-disabled context shows the hero and first sections.

### R3 — Public shell: header + footer

- **Files:** `SiteHeader`, `SiteFooter`, mobile `Sheet` menu, theme toggle with a View Transition circular reveal, anchor-positioned nav indicator, ⌘K trigger (the existing `CommandPalette`, restyled).
- **Acceptance:**
  - The header stays visible on scroll and compacts.
  - Keyboard order: skip link → wordmark → nav → tools.
  - The menu sheet traps focus.
  - The theme reveal respects reduced motion.
  - The footer renders `nav.footer` and `socialLinks` from the API.
- **Tests:**
  - Storybook stories for light, dark, mobile and VI.
  - Playwright: header in viewport after scrolling 2000px; menu opens and closes with Esc; axe.
  - Vitest for the nav-number formatter.

### R4 — Public primitives

- **Files:** `Chip`/`FilterChip`, `Tag`, `Monogram`, `Nest`, `GenerativeCover`, `MetricDiff`, `EmptyState`, `SectionHeader` (computed `§` index), `Ticker`, `Stat` (CSS count-up), container-query `CaseCard`.
- **Acceptance:**
  - `GenerativeCover` is deterministic for the same slug and title, on server and client.
  - Every component works in both themes and both locales, and has a reduced-motion story.
- **Tests:**
  - Vitest: slug-hash pattern selection, glyph extraction (including Vietnamese titles), metric before/after rendering, `Stat` SSR output contains the final value.
  - Storybook interaction tests for `FilterChip` (`aria-pressed`).

### R4b — Loading-state foundations (shared by public and admin)

- **Files:**
  - `packages/ui`:
    - `ui/skeleton.tsx`: rewrite the shimmer; the CSS is the `.skel` block of `redesign.css` §16b.
    - New `SkeletonText` and `SkeletonScope`.
    - `ui/button.tsx` `loading`: switch to `aria-disabled`, guard `onClick`/submit while busy, add `done` / `doneLabel`.
    - New `ProgressBar`, `FetchBar`; restyled `Spinner`.
    - `useAnnounce` + `LiveRegion` in the root layouts.
  - `apps/web/src/modules/core`:
    - `lqip.util.ts` (`lqipUrl`, Cloudinary parsing shared with `image-loader.util.ts`).
    - `get-blur-data-url.ts` (server: fetch through the data cache → base64, 1.5s timeout, null on failure).
    - `CmsImage`.
  - `apps/web/e2e/helpers/loading.ts`:
    - `delayApi(page, ms)`: route interception for the public and admin API origins.
    - `collectLayoutShifts(page)`: `PerformanceObserver` with `buffered: true`.
    - `expectBoxParity(skeleton, content)`.
- **Acceptance:**
  - The shimmer animates only `translate`: no paint per frame in a DevTools performance trace, and no `background-position` animation anywhere.
  - Under `reducedMotion: 'reduce'` no skeleton has a running animation.
  - `SkeletonText` lines are exactly one line box of the inherited token.
  - `Button loading`:
    - keeps its width (±0px)
    - keeps focus
    - sets `aria-busy` and `aria-disabled`
    - ignores a second click or Enter
    - announces through the live region
  - `CmsImage` reserves its box before load (no CLS) and shows the blurred preview on first paint. Non-Cloudinary URLs render without a placeholder and without errors.
  - No backend change; CSP unchanged (`data:` is already allowed).
- **Tests:**
  - Vitest:
    - `lqipUrl` (with and without existing transforms, non-Cloudinary passthrough)
    - `getBlurDataURL` (fetch mocked: success, timeout, 404)
    - `Button` loading (width snapshot via computed style, `aria-*`, double-click guard)
    - `SkeletonText` line count and line height
  - Storybook: skeleton and pending stories in light, dark, admin scope and reduced motion.
  - Playwright: a fixture page proves `collectLayoutShifts` catches a deliberate shift and `expectBoxParity` fails on a 2px mismatch, so the helpers themselves are tested.

### R5 — Home blocks

- **Files:** hero (line split, kinetic type), stat band, ticker, featured case, case grid as a sticky stack, domain grid, pinned process, skill groups, post list, CTA inverse band.
- **Acceptance:**
  - Matches `home-*.jpg` within normal implementation tolerance.
  - With today's data: no empty sections, no zero stats, no TODO.
  - With seeded demo data: all sections render.
  - Reduced motion shows every section static and complete.
- **Loading:**
  - `app/[locale]/(site)/loading.tsx` renders `PageSkeleton` from the stored block order when it is cached, or else the home default.
  - Every home block's registry `skeleton` is replaced by its layout-matched version ([§7.9](09-7-per-page-designs.md#79-loading-states-public--admin--loadinghtml-admin-loadinghtml), home map).
  - Blocks that resolve to hidden (no data) render no skeleton after resolution and leave no gap.
- **Tests:**
  - Storybook stories per block for empty, typical and long-VI data, plus a `Skeleton` story placed next to each.
  - Playwright home (EN/VI, light/dark, 390/1440) with no horizontal overflow (`scrollWidth === innerWidth`).
  - Reduced-motion test ([§8.2](10-8-showcase-techniques-fe-skills-budgets.md#82-budgets-ci-enforced-where-possible)).
  - `loading.spec.ts` (home), with the API delayed 1.5s:
    - skeletons visible
    - `aria-busy` on main
    - CLS ≤ 0.02 after data
    - hero and stat-cell skeleton boxes match within 1px at 1440 and 390
  - Lighthouse budget.

### R6 — Hero shader island

- **Files:** `HeroStage` (poster in CSS) and a `hero-shader` dynamic import with WebGL2 init, uniforms from CSS tokens, theme observer, IntersectionObserver / `visibilitychange` pausing, DPR cap, `webglcontextlost` handling. Gated on `showDiagram`, `settings.ambientEffects`, reduced motion, Save-Data and WebGL2 support.
- **Acceptance:**
  - The shader never delays LCP.
  - It pauses offscreen and in hidden tabs.
  - The poster alone looks complete.
  - It costs ≤ 4 KB gz.
- **Tests:**
  - Vitest for the gating function (each flag).
  - Playwright: canvas is absent under reduced motion; canvas is present and the rAF loop stops after scrolling it out of view (instrumented counter).
  - Lighthouse: no LCP regression.

### R7 — Micro-interactions layer

- **Files:** `MotionProvider` (one rAF loop, `pointer: fine` + motion gates), `CursorFollower` (labels from `data-cursor` → i18n key), `Magnetic`, `Tilt`, `RowPreview`, ticker velocity.
- **Acceptance:**
  - Nothing renders on touch devices or under reduced motion.
  - No long tasks above 50 ms from the motion layer during scroll.
  - The system cursor is never hidden.
- **Tests:**
  - Vitest for the lerp and clamp utils and the gate hook.
  - Playwright with `hasTouch` asserts no `.cursor` element.
  - Performance trace in CI logs long tasks (warning only).

### R8 — Page transitions, route progress, first-visit loader

- **Files:** a View Transitions integration for App Router navigation, plus `RouteProgress` and `IntroCurtain`.
  - Spike first: React `<ViewTransition>` or Next `experimental.viewTransition` (Next 16).
  - Fallback: a small `startViewTransition` wrapper around `router.push`, i.e. a `TransitionLink`.
  - Unique `view-transition-name` per project cover (`cover-${slug}`).
- **Acceptance:**
  - Card → case-study cover morph in Chromium.
  - Crossfade elsewhere when supported; instant otherwise.
  - Back/forward works.
  - Focus moves to the new `main`.
- **Route progress:**
  - `PendingLink` is a child of next-intl `Link` that calls `useLinkStatus()` and reports into a `useSyncExternalStore` counter. Programmatic `router.push` goes through the same store via `startTransition`.
  - `RouteProgress` is rendered in `SiteHeader` (and in the admin `Topbar` in R12). It appears only when a navigation is still pending at 120ms, completes on commit, and is `aria-hidden`, because the page's own `role="status"` speaks.
- **Intro curtain:**
  - `IntroCurtain` is server markup in `app/[locale]/(site)/layout.tsx` plus an inline gate script that uses `requestNonce()`. The script sets `html.intro` only when sessionStorage has no flag, motion is allowed and `settings.ambientEffects` is true.
  - `?intro=0` disables it, for tests and for sharing links. It lasts ≤ 700ms, never blocks input, never runs on client navigations, and is absent without JS.
- **Tests:**
  - Playwright navigation in a browser without VT (feature disabled), and with VT, asserting no duplicate `view-transition-name` on a page; a11y focus check.
  - Route bar: with the API delayed 1.5s, the bar is visible within 200ms of the click and gone after commit. With no delay (cached route), it never appears. Back/forward also reports.
  - Curtain:
    - The first visit in a fresh context has `html.intro` and the curtain is removed by 800ms.
    - A second navigation in the same context shows no curtain.
    - `reducedMotion: 'reduce'` shows none.
    - With JS disabled there is no curtain.
    - `elementFromPoint` on a CTA is clickable at 100ms.
    - Lighthouse LCP with the curtain is ≤ `?intro=0` + 100ms.

### R9 — Projects list + case study

- **Files:** `ProjectsBrowserBlock` (wrapping chips, URL state, Grid/Index toggle, row preview), `CaseStudyView` (facts bar, cover, metrics board, sticky TOC with progress, prose tables with `data-label`, “Not mine” callout, release status, next case).
- **Acceptance:**
  - Filters round-trip through the URL.
  - The filter bar never scrolls horizontally.
  - Case-study tables follow rule 5.
  - `isConfidential` hides in-content images.
- **Loading:**
  - `projects/loading.tsx` and `projects/[slug]/loading.tsx` with layout-matched skeletons ([§7.9](09-7-per-page-designs.md#79-loading-states-public--admin--loadinghtml-admin-loadinghtml)).
  - A filter change keeps the previous cards dimmed under a `FetchBar`, with no skeleton, while focus stays on the chip.
  - The case-study cover skeleton keeps `view-transition-name`, so the morph lands on the box.
  - Prose images go through `CmsImage`.
- **Tests:**
  - Vitest for the filter-state ↔ search-params mapping and the TOC extraction from markdown.
  - Playwright for filter interactions, mobile table cards at 390px, axe.
  - `loading.spec.ts` (projects, case study), with the API delayed 1.5s:
    - skeletons visible and CLS ≤ 0.02
    - card skeleton ↔ card box parity within 1px
    - filter click → `FetchBar` visible, previous cards still in the DOM, focused element unchanged

### R10 — About / CV + contact

- **Files:** about intro (`Monogram` fallback), commit-graph timeline, principles, skill matrix, education, CV cards (disabled state); contact layout, topic pills, success state, copy-email.
- **Acceptance:** CV cards show an EN/VI state from `resumeEn` / `resumeVi`; contact form validation and success are unchanged functionally.
- **Loading:**
  - `about/loading.tsx` uses the about skeletons (portrait frame, definition list, timeline, principles, skills).
  - Contact submit: `Button loading` replaces the label swap at `ContactForm.tsx:257–268`, so the width no longer changes and focus stays. The form gets `aria-busy` and its inputs dim but keep their values.
  - On error the draft is kept and the message is `role="alert"`. On success the “sent” card replaces the form at the same height.
  - The live region announces Sending… / Sent.
- **Tests:**
  - Existing `contact.spec.ts` stays green, extended with the API delayed 1.5s:
    - the button has `aria-busy`
    - its bounding width is unchanged
    - a second click sends nothing (request count 1)
    - after a mocked 500, the typed message is still there
  - Storybook for the timeline (current node, multiple roles).
  - Vitest for the copy-email hook (clipboard mocked).

### R11 — Notes list + post reader

- **Files:** `NotesBrowserBlock` (pinned post, chips, diacritics-insensitive search, year groups, EN badge), `PostReader` (three-pane ≥ 1024, document lock scoped to the route, pane-scoped heading observer, lang-switch scroll preservation like the KB `captureLangScroll` / `restoreLangScroll`).
- **Acceptance:**
  - At ≥ 1024 `document.scrollingElement.scrollHeight === innerHeight` and each pane scrolls independently.
  - Below 1024 the page scrolls normally.
  - Switching EN ↔ VI keeps the reading position.
  - A post with a `cover` shows it (through `CmsImage`) on the pinned card and in the reader. Today `PostCard`'s featured variant always renders `CoverPlaceholder` (`PostCard.tsx:42`); the generative cover is only the fallback.
- **Loading:**
  - `notes/loading.tsx` (list rows) and `notes/[slug]/loading.tsx` (`PostReader.Skeleton`: nav, article, TOC at ≥ 1024; article only below).
  - Notes search keeps previous results with a `FetchBar` (`use-notes-search.hook.ts` already uses `keepPreviousData`).
- **Tests:**
  - Vitest for `normalizeForSearch` (“viet” matches “Việt”, “đ” matches “d”).
  - Playwright reader-layout assertions at 1280 and 390, and axe.
  - `loading.spec.ts` (notes, reader): skeleton visible with the API delayed; CLS ≤ 0.02; at ≥ 1024 the document stays locked while the skeleton is shown.

### R12 — Admin shell (KB)

- **Files:** `AdminShell` (`h-dvh`, fixed `Topbar`, `.app` grid, panes), `AdminSidebar` (roman numerals computed, counts from stats), `AdminDrawer`, `AdminCommandPalette` (DocSearch layout, groups, skeleton, highlight, diacritics-insensitive), `animate-fade-up`.
- **Acceptance:**
  - The document never scrolls on any admin route.
  - The sidebar has no horizontal overflow at 256px with long labels.
  - The main pane is the only scroller.
  - Focus is trapped in the drawer and palette.
  - ⌘K / Ctrl K toggles the palette, and Esc closes it.
- **Loading:**
  - `app/admin/(cms)/loading.tsx` shows a generic page-head + panel skeleton inside the real shell; the sidebar and top bar never unmount.
  - `RouteProgress` (teal, from R8) sits under the top bar.
  - The palette shows local commands at once, plus two skeleton rows while the debounced server search is pending.
  - Sign-in uses `Button loading`.
- **Tests:**
  - Playwright `admin-layout.spec.ts` at 1440 and 390: `scrollHeight === innerHeight` on html; sidebar `scrollWidth === clientWidth`; main pane `scrollHeight > clientHeight` on a long form.
  - With the admin API delayed 1.5s, a sidebar click shows the route bar within 200ms and the target route's skeleton, and the sidebar element stays the same DOM node (no remount).
  - `admin-login.spec.ts`: the button has `aria-busy` while the delayed login is pending.
  - Vitest for `toRoman` and the palette filter.
  - axe on dashboard, projects and editor.

### R13 — Admin tables + dashboard

- **Files:** `DataTable` (`cardLabels` → `data-label`, `ThemedCheckbox`, facets, bulk bar, density), dashboard KPIs, health ring and rows with deep links, views chart restyle, inbox preview.
- **Acceptance:** at ≤ 639px every DataTable renders as cards, and no table causes page-level horizontal overflow; each health issue kind maps to a deep link.
- **Loading:**
  - `Dashboard.Skeleton` is used per Suspense boundary: KPI labels real, values skeleton; health ring + 4 rows; chart box; inbox rows. It replaces `StatsSkeleton` / `HealthSkeleton`.
  - DataTable:
    - `isLoading` → `skeletonRows` with real cell structure.
    - Columns get fixed sizes (`column.size` → `<colgroup>`, `table-layout: fixed`).
    - `isFetching` → `FetchBar` in the panel header, and rows `.is-stale`.
    - The skeleton rows become cards at ≤ 639px.
  - Optimistic featured toggle and drag reorder, with rollback and a toast.
- **Tests:**
  - DataTable unit: cards mode attributes, selection, indeterminate, skeleton row count, `isFetching` renders the bar without unmounting rows.
  - Playwright mobile projects table.
  - Vitest for the health-kind → route mapping (exhaustive over the 10 kinds).
  - Playwright with the API delayed:
    - first column x-positions are identical (±1px) before and after rows load
    - a filter change keeps the row count on screen until data arrives
    - a forced 500 on the featured toggle reverts the star and shows the toast

### R14 — Admin editors: project/post editor, page builder, media, inbox, sign in

- **Files:**
  - `EditorShell` focus mode (outline \| 48rem canvas \| publish pane), `LocaleTabs` meters, `MarkdownEditor` toolbar and slash-menu restyle (extensions untouched), `PublishChecks` (server health + client TODO / empty-VI).
  - Page-builder inspector (`Resizable`; presets from the block's `layouts`, surfaces from `BLOCK_SURFACES`; “Hidden publicly · no data” state), media details pane, inbox reading pane, sign-in split layout.
- **Acceptance:**
  - Tiptap behavior is unchanged: existing `MarkdownEditor.test.tsx` passes.
  - The preset picker never offers a layout the block does not allow.
  - The TODO warning appears on the field that contains it.
- **Loading:**
  - `projects/[id]/loading.tsx` and `posts/[id]/loading.tsx` use `EditorShell.Skeleton` (outline, canvas, publish pane; the Tiptap toolbar is rendered disabled). The same skeleton works for `pages/[key]` (56px block rows) and inbox detail.
  - `SaveStatus` has four states in a fixed slot.
  - Publish and Save buttons use `Button loading` + `done`.
  - `UploadQueue` shows per-file progress and Retry.
  - Media tiles keep their 4:3 box and show the LQIP background.
  - Inbox `fetchNextPage` appends two skeleton rows.
- **Tests:**
  - Vitest for locale completeness, `PublishChecks` client rules, and preset filtering from the registry.
  - Vitest for `SaveStatus` (status → label and icon, fixed width) and `UploadQueue` (progress events → `--v`, error → Retry).
  - Playwright with the API delayed:
    - editor skeleton → form with CLS ≤ 0.02 in the canvas pane
    - Publish shows `aria-busy` and then “Published”
    - a second Publish click during pending sends one request
  - Existing `admin-pages.spec.ts` and `admin-publish.spec.ts` stay green.
  - Storybook stories for the editor shell and inspector.

### R15 — Hardening and docs

- **Files:**
  - Lighthouse budgets tightened to the new numbers.
  - A Playwright visual-regression baseline (`toHaveScreenshot`) for the key public pages and admin shell with `?capture`-style motion freezing.
  - A11y sweep, a VI copy review of all new chrome labels.
  - Loading sweep: `loading.spec.ts` loops over every public route and the main admin routes with the API delayed 1.5s and asserts skeleton → content with CLS ≤ 0.02, `aria-busy` cleared, and no skeleton left in the DOM.
  - `docs/design/portfolio-design-system.md` updated to v3.
  - `docs/audits/` gets a before/after.
- **Acceptance:** all budgets in [§8.2](10-8-showcase-techniques-fe-skills-budgets.md#82-budgets-ci-enforced-where-possible) are green in CI; a manual screen-reader pass is recorded (VoiceOver or NVDA) for home, case study, reader and admin editor.

### R16 — Figma library (optional)

An editable Figma file (rule 8):

- variables for both palettes, light and dark
- the type scale as text styles (with a VI specimen)
- radius ladder and spacing variables
- components (Button, Chip, Tag, CaseCard with GenerativeCover variants, StatusPill, nav item, DataTable row, palette)
- the home, case-study, admin-dashboard and editor frames built with auto-layout from those components

No flattened screenshots.

---

