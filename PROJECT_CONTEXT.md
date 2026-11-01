# PROJECT_CONTEXT — lil.p (portfolio)

Mandatory reading for every agent. Update §7 and §9 in every PR to `main` (docs-only PRs are exempt). CI checks file presence and a file-level update, not individual sections; `skip-context` bypasses CI.

## 1. Requirements

- Personal portfolio: public site (projects, notes, about) + admin CMS.
- All hosting free tier. Content is data-driven; no hardcoded personal content.
- VI/EN bilingual, light/dark mode.

## 2. Stack (confirmed)

- pnpm 10 monorepo, Node 22. Prettier + Husky + commitlint (conventional commits) at root.
- Web: Next.js 16.4.3, React 19.3.
- API: NestJS 11, Prisma 7 (mariadb adapter). JWT auth with `admin` / `user` roles. Swagger at `/api/docs` (off in production).
- DB: MySQL 8.4 (Docker) locally, TiDB Cloud Serverless in production.
- Editor: Tiptap (core + free extensions only), Markdown storage, shadcn toolbar.
- Hosting: Vercel (web, functions in `sin1` via root `vercel.json`), Render free (API), TiDB Cloud Serverless (DB), Cloudinary (images). cron-job.org pings `/api/health` every 10 min.
- Rendering: public `/[locale]` pages static/ISR (1 h, shared `public` cache tag expired by admin saves); `/notes` index renders per request on cached data, while `/projects` filters its ISR data in the browser; `/admin` is dynamic. Public CSP has no nonce (`'unsafe-inline'` scripts); `/admin` and draft-mode requests get nonce + `'strict-dynamic'`.

## 3. Design (confirmed)

- Redesign plan: `docs/plans/ui-redesign.md`, mockups in `docs/design/redesign/`.
- Shipped as PR #74 ("Ink & Signal") for public + admin.
- Fonts IBM Plex Sans / Mono. Apple-style squircle, concentric radius, 10px base.
- Skeletons / loading states on public and admin routes.
- Priority: R1+R2 → R3+R4+R4b → R5 → R9 → R10+R11 → R12. Later: R13, R14, R7, R8, R6.

## 4. Forbidden

- No secrets, tokens, or `.env` values in the repo, PRs, logs, or chat. Repo is public.
- No real contact info: use `<email>` / `<phone>` placeholders.
- Never name or link any private data repo.
- No paid services or paid Tiptap extensions.
- R16 (Figma) is dropped — do not implement.

## 5. Workflow

- Local: copy `.env.example` to `.env`, then configure two distinct JWT secrets of at least 32 characters each (see [README setup](README.md#local-development)). Run `pnpm install && pnpm db:up && pnpm db:migrate && pnpm db:seed && pnpm dev` (web 3000, API 4000, Adminer 8080).
- Branch off `main`, conventional commits, open a PR, monitor CI until all checks are green.
- Stacked PRs are OK. **Never merge without Parker's explicit OK.**

## 6. Multi-agent rules

- One agent = one branch / worktree = one PR. Never commit to another agent's branch.
- Child agents get only their task prompt; put needed context in this file, not in chat.
- Stay in scope; record anything out of scope in §7.

## 7. Open items

- P6-2 T32: below `lg` the admin uses `AdminBottomBar` (Overview, Content, Inbox with unread badge, More sheet with the remaining groups) and a compact topbar (back link and title from `navItemFor`, editor save status portaled into the topbar slot, account menu with language items). The admin root layout sets `viewport-fit=cover` for the safe-area padding. The bar hides while `visualViewport` is at least 120px shorter than the window; this was checked with a stubbed `visualViewport`, not a real device keyboard. Still failing on the P6-1 base: axe `aria-valid-attr-value` on the Tags, Posts and About tab triggers, and `admin-back-link.spec.ts` still expects `/admin/experience` as the experience parent.
- P6-1 T31: admin navigation now has five groups; About content uses URL tabs, Tags lives under Posts, and legacy section routes redirect. Existing e2e specs that assert the old `/admin/pages` index or experience editor URLs may need updating when the full E2E suite is next run.

- Vercel deploys: `git.deploymentEnabled` in `vercel.json` (`"**": false`, `"main": true`) stops Vercel from creating deployments or PR checks for any branch except `main`. `scripts/vercel-ignore-build.sh` (`ignoreCommand`) is a second guard. Hotfix deploys are paused from 2026-11-01 while the rate limit resets; to re-enable add `"hotfix/**": true` to `git.deploymentEnabled` and set `HOTFIX_DEPLOYS_ENABLED=1` in the script.
- P4-6 T24: `SiteSettings.heroStats Json?` (migration `20261101082635_site_settings_hero_stats`, additive `ADD COLUMN heroStats JSON NULL`) must be applied to TiDB by Parker at merge (`prisma migrate deploy`); the agent did not run it. Contracts `heroStatsSchema` allows 0-3 `{ value, suffix?, labelEn, labelVi }`; an empty list is stored as NULL and stored JSON that fails the schema reads as NULL. `HeroBlock` renders a `<dl class="hero-stats">` after the CTAs from `settings.heroStats`, else the first 3 non-zero profile stats; the demo seed resets `heroStats` to NULL, so the home hero now repeats the "By the numbers" StatBand values until Parker sets hero stats (decide whether to drop the home StatBand). The admin "Hero stats" fieldset (`HeroStatsFieldset`) validates on save; "Clear (use profile stats)" saves the whole form with `heroStats: null`. `public-home` visual baselines were re-rendered.
- P4-5 T22: `e2e/visual.spec.ts` compares `toHaveScreenshot` pixels (full page, 1% diff tolerance) for 6 public routes (`/en` home, projects, `particula` case study, notes, about, contact) and 4 admin routes (login, profile, site settings, new post) at 375 and 1280px. The WebGL hero canvas is hidden by `e2e/visual.css` (the CSS poster and headline stay) and the tech marquee, `<time>` and "Saved HH:mm" are masked. Baselines in `e2e/__screenshots__/` are Linux Chromium only, so the spec skips on other platforms unless a remote browser is set; re-render them with `pnpm --filter @portfolio/web test:visual:update` (Docker `mcr.microsoft.com/playwright` amd64 browser driving the local servers). The admin routes avoid lists and the dashboard because the spec runs after mutating specs. Done criteria "CI green 3 consecutive runs" depends on the existing `/vi/projects` Lighthouse CLS failure (see P4-4).
- P4-4 T21d: the public `CommandPalette` and `ThemeToggle` render a light trigger; the first click (or ⌘K) swaps in `CommandPaletteDialog` / `ThemeMenu` loaded with `next/dynamic` (`ssr: false`, the trigger as `loading` fallback, preloaded on hover/focus), so the Radix menu, popper, React Query and notes search leave the site layout bundle (about 22 KB gzip). Lighthouse `unused-javascript` ignores scripts wasting under 20 KiB, so the counted `/vi` drop (67.6 KB → 26.6 KB) comes from `LazyContactForm` and `LazyNotesBrowser` (the projects island stays static: it imports no runtime contracts code, and lazy-loading it made `/vi/projects` render a skeleton and shift): the server block registry put every block's client component, with zod and the whole `@portfolio/contracts` barrel, in the home page chunk group. `lighthouse.spec.ts` now caps `/vi` unused JS at 36 KiB and `e2e/split-js.spec.ts` checks ⌘K and the theme menu load on demand. Soft navigation to contact, notes or projects shows the block skeleton while the chunk loads. Existing failure (same on the P4-3 base CI): `/vi/projects` Lighthouse CLS is about 0.39, above the 0.1 limit.
- P4-3 T21c: `NavigationProgress` (core, mounted once in `Providers`, so public and admin) shows the `.route-pending` top bar on the click itself: any plain left click on a same-origin link to another path or query, with no modifier key, `target`, or `download`. The bar clears when `usePathname`/`useSearchParams` change or on `pageshow` (back-forward cache). The bar no longer waits 120 ms to appear and grows slowly to 90% (static 60% under reduced motion). The per-link `RoutePending` (header nav and block card links only) is removed. `e2e/navigation-progress.spec.ts` drops prefetches, delays the route fetch by 2 s, and asserts a painted bar within 100 ms on a public and an admin link. Out of scope: programmatic `router.push`/`replace` (admin filters, form redirects) and back/forward show no bar; a fast prefetched route only flashes it.
- P4-2 T21b: every `app/admin/(cms)/<group>` has its own `loading.tsx`. List groups use the new `PageSkeleton variant="table"` (search toolbar + 8 table rows), profile and site use `editor`, analytics, stats and media keep the `admin` card grid. Nested `new` and `[id]` routes without a skeleton (experience, inbox, posts/new, projects/new) got `editor` so the group's table skeleton does not cover editors. `admin-loading.test.ts` globs the group and nested route directories. Out of scope: per-page skeleton geometry (exact columns, filters) is not matched yet.
- P4-1 T21a: `EmptyState` (packages/ui: hatched dashed panel, optional `¶`-style glyph, title, description, action) and `ErrorState` now takes an optional `back` link (`PageHeaderBack` + `linkComponent`) next to Retry. The admin projects, posts, experience and inbox detail views render `AdminLoadError` (admin-core: Retry + "Back to {section}" from `useAdminBack`) when the record fails to load, e.g. a missing id (`e2e/admin-detail-error.spec.ts`). `/notes` with no published notes shows "No notes yet" and a "Read case studies" link to `/projects`; a filtered empty list keeps "Clear". A non-integer inbox id still 404s. Out of scope: `ProjectsGrid` and other callers still use the plain `ui/empty` primitive.
- P3-4 T20: the `CoverPlaceholder` monogram is sized from its own frame (`container-type: inline-size`, `min(14rem, 24cqi)`) and colored with the domain hue (`--cover-hue`); the slug chip truncates inside the frame. Case-study prev/next wraps around (first ↔ last) and a contact `CtaBand` ("Get in touch" → `/contact`) closes every case study. `e2e/case-study-end.spec.ts` checks up to 6 case studies, but the demo seed has only 4. Real cover photos still need Parker's input.
- P3-3 T33b: the full `EditorToolbar` is one non-wrapping row (`overflow-x-auto`, ≤48px at 375px; `e2e/editor-mobile-toolbar.spec.ts`). Below `sm` the block actions (quote, callouts, code block, image, table, divider) move into a "More" dropdown (`more` editor label); the image URL/alt popover now anchors to the toolbar so both paths open it. Arrow keys skip hidden buttons. `admin-scroll.spec.ts` uses 768x800 instead of 768x1024 because the shorter one-row toolbar left `/admin/posts/new` with nothing to scroll.
- P3-2 T33a: `MarkdownEditorGroup` (packages/ui) renders one Write/Preview tablist and shares its mode through context; a `MarkdownEditor` inside it drops its own Write/Split/Preview/Markdown tabs and shows its word count in a footer. The project Content tab wraps its six markdown fields, so `/admin/projects/:id` has 2 tablists instead of 7 (`e2e/editor-mode-toggle.spec.ts`). Out of scope: standalone editors (posts, profile, experience) keep their four tabs, and the page builder `LocalizedWidget` EN/VI pair still shows two editor tablists.
- P3-1 T18: admin chrome uses shared primitives at compact density: the topbar sidebar collapse is an `IconButton` (PanelLeft icon, tooltip, "Collapse/Expand sidebar" label, `aria-expanded`), the inbox bell is a `Button` link, topbar/palette buttons use `size="sm"` (28px) with no height overrides, the login submit uses the default 32px size, native selects reuse the exported `inputClassName`, and sidebar rows are 32px with their border in `SidebarMenuButton` (the `.admin .redesign-sidebar-menu-button` rules are gone). `e2e/admin-components.spec.ts` records computed-style JSON snapshots; Parker still has to approve them. Out of scope: the `AdminTable` sort header button keeps its text-only `.admin-table-sort` style.
- P2-5: TechMarquee pauses on hover, focus within, hidden tabs, and manual request; unit tests cover pause state and the button. The existing reduced-motion static row remains.
- P2-4 T16: public link targets and admin mobile stats grid are adjusted; the new 375px e2e checks visible public links and buttons in both locales. Coarse-pointer 44px targets and truncation tooltips still need device-level review.
- P2-2: `/projects` is ISR with browser URL filters and the existing `projects` publish tag; confirm the second `/vi/projects` request is `x-vercel-cache: HIT` on the stacked PR preview deployment.
- P2-1 T13a: `/projects` keeps the browser filters' mobile and desktop height reserved and uses a route loading skeleton shaped like the page header, filters, view switch, and cards; Lighthouse checks mobile `/vi/projects` CLS at 0.1 or less.
- P1-23 T9 adds app and Apple icons, distinct admin route titles, and the existing home OG image to about/contact/notes/projects; metadata e2e checks cover public and admin routes.
- P1-22 T8c translates Vietnamese admin editors, page blocks, about forms, profile, and site settings; experience ranges display locale-aware month/year, and admin page, post, user, and version timestamps display localized dates.
- P1-21 T8b adds the complete Vietnamese admin key tree and translates dashboard, auth, shell, and list copy. Editor and detail copy remains in English for a later translation task. P1-20 T8a reads the admin locale from `NEXT_LOCALE`, exposes an EN/VI topbar switch, and shares Intl date/relative formatting for audit and inbox.
- P1-19 T11c replaces the remaining `data-slot` stylesheet selectors with explicit component classes; one unused accent-headline selector was removed.
- P1-18 T11b moves the public button size/hover and admin dashboard card/header overrides into explicit UI variants. Badge and tab styles already live in their primitives; the redesign stylesheet now has no `!important` declarations.
- P1-17 T11a moves the admin table overrides out of `redesign.css` into cva variants on the `ui/table` primitives: `TableHead surface` (`plain` default, `muted` = uppercase 11px muted header) and `TableCell density` (`default`, `comfortable` = 12px block padding, `flush` = no padding for link cells). `AdminTable` and `DataTable` pass them explicitly; the AdminTable status row uses `px-4 py-8` classes. `redesign.css` had no `[data-slot=input]` rules, so `Input` is unchanged. `e2e/admin-table-styles.spec.ts` snapshots computed table and input styles on projects, users, audit and tags (JSON under `e2e/__snapshots__/`, platform-free `snapshotPathTemplate`); approve an intended change with `--update-snapshots`.
- P1-16 T5b keeps the projects and posts editor tabs (`?tab=`) and the public `/projects` grid/index switch (`?view=`) in the URL through `useListParams`. `setParams(patch, { history: 'push' })` adds a history entry with `window.history.pushState` (no server round trip; Next syncs `useSearchParams`), so Back restores the previous tab; list filters still use `router.replace`. The public `ProjectsView` imports the hook from `admin-core` (it has no admin dependencies). Out of scope: the site settings tabs keep their own `router.replace` URL tab, and the page builder `BlockInspector` tabs stay local state.
- P1-15 T5a adds `PageHeader` in `packages/ui` (h1 title, actions, optional back link through `linkComponent`). The back link is `sm:hidden`, the mobile counterpart of the topbar breadcrumb (`hidden sm:block`, unchanged). `EditorShell` renders it and takes `back`; the projects, posts, experience and pages editors and the inbox detail pass `useAdminBack(navKey)` (href and label from `ADMIN_NAV`). The inbox detail's bottom "Back to inbox" link is now `sm` and up only. Out of scope: loading and error states (including `[id]/loading.tsx` skeletons) show no back link; index pages and the site profile editor do not use `PageHeader` yet.
- P1-14 T6d moves the pages index, audit log and analytics top pages/referrers to `AdminTable`; the analytics chart's screen-reader table uses `AdminTable visuallyHidden`. The `AdminTable` scroll viewport is now a focusable `region` named by the table label (one extra tab stop per visible table) so the audit table, whose rows have no links, passes axe `scrollable-region-focusable`. The audit log lost TanStack Virtual infinite scroll for a "Load more" button (50 rows per page); `@tanstack/react-virtual` in `apps/web/package.json` is now unused there (removal needs a lockfile change, left out). The media library stays a virtualized thumbnail grid (it never rendered a table). Out of scope: `SmallEntityIndex` inline lists still use `DataTable`. A unit guard fails if an admin module renders `<table>` or imports the `ui/table` primitives.
- P1-13 T6c moves the experience, inbox and users lists to `AdminListTable`; no admin list opens rows with `router.push` any more. Experience and inbox rows link to their editor/detail page; users rows stay plain because editing opens the `UserForm` sheet. `AdminListTable` now takes optional `rowHref`, `onDelete`/`onBulkDelete` (selection only when delete is given) and `onCreate`. Inbox lost its row selection, whose bulk "Mark spam" never called a handler; per-row Mark read/Mark spam stay. Sortable columns follow the API (experience `company`, `startDate`; inbox `createdAt`; users `name`, `email`, `lastLoginAt`). `DataTable` is now only used by `SmallEntityIndex`.
- P1-12 T6b moves the projects and posts lists to `AdminTable` through the web `AdminListTable` wrapper (`next/link` rows, row selection with confirmed archive, prev/next pagination). Dropped with the old `DataTable` there: j/k/x/e keyboard shortcuts and help dialog, column visibility, density, mobile cards, the fetching bar and the separate Edit button (the row link replaces it). Sorting is offered only on columns the API accepts (projects `updatedAt`; posts `publishedAt`, `updatedAt`).
- P1-11 T6a adds `AdminTable` in `packages/ui` (columns, `rowHref` rows as real links via `linkComponent`, 300ms debounced labelled search, sticky header in its own scroll viewport, hover, sort, empty/loading/error slots). No admin index uses it yet; adopting it (passing `next/link`) is left to later T6 tasks.
- P1-10 T7b: editor headers show "Saved HH:mm" from the record's `updatedAt` on load (`useSaveStatus`), keep it while edits are pending, then saving/offline/conflict. Out of scope: `useAutosave` keeps its first `updatedAt`, so the pages editor (no block selected at mount) shows no status and sends a stale concurrency token for selected blocks until a save.
- P1-9 T7a adds `ConfirmDialog` and `toastUndo(msg, onUndo)` (5s); admin toasts sit bottom-right for 4s in `AdminProviders` (kept off public pages per P0-5). A unit guard fails if an admin delete/archive mutation skips ConfirmDialog or toastUndo.
- P1-8 T4c labels shared admin search, site and editor controls including code language; the audit list is keyboard scrollable, with axe WCAG 2.2 AA coverage for admin indexes and editors.
- P1-7 T4b applies accessible action buttons and named search inputs in the shared small-entity admin index; seven admin route axe checks cover the result.
- P1-6 T4a applies FormField to login and contact; contact empty-submit errors and first-field focus are covered by unit and e2e tests.
- P1-5 T3e FormField is stacked on P1-4: required marks, linked inline errors, and character counters are covered by UI unit tests.
- P0-5 T25: mobile `/vi` no longer loads desktop search or global React Query and toast providers; real-device battery impact remains unmeasured.
- P0-4 T12a hides unfinished public text at the web API boundary; source CMS fields still need editorial replacement.
- P0-2 T1 admin editor scroll is stacked on P0-1 T0: narrow editors use `main` as the scroll region; desktop editors split into independent columns.
- P0 UX series in progress: P0-1 T0 "close mobile menus on navigation" is stacked as `ux/p0-1-t0-close-mobile-menus`; later tasks in the series build on it. It also made the admin mobile sheet nav scrollable (`AdminMobileNav` `min-h-0 flex-1 overflow-y-auto`) because unscrollable sheet content blocked taps below the fold.
- Git guardrails and canonical `AGENTS.md` are pending review in `chore/guardrails-agents-md`; do not merge without Parker's OK.
- CI standardization PR (`chore/cicd-standard`) awaits Parker's review; do not merge until Parker explicitly approves.
- ~~Owner/baseline projects are still DRAFT (demo seed publishes projects) → publish migration pending~~ → resolved on `feat/publish-all-content` (pending review): idempotent TiDB-safe migration `20261031120000_publish_all_content` publishes every `project` / `post` DRAFT and backfills `publishedAt`; backup data + owner/baseline seed now seed PUBLISHED with `publishedAt` stamped at seed time.
- Render P3009: before deploying `20261031120000_publish_all_content`, prod on Render may still show P3009 on `20261027150000_portfolio_content`; run `npx prisma migrate resolve --rolled-back 20261027150000_portfolio_content` once, then redeploy.
- `20261027150000_portfolio_content/migration.sql` stays frozen permanently — its bytes are what Render prod replays, so it is never regenerated. `data/portfolio-data.json` is already PUBLISHED; `build-content-migration.ts` `assertCommittedMigrationMatches` and `build-content-migration.spec.ts` permanently normalize (DRAFT→PUBLISHED) when comparing regenerated SQL to the committed file; the publish itself is the idempotent `20261031120000_publish_all_content` migration.
- Review follow-ups: 4px radius step, squircle coverage, About avatar placeholder, mobile stat band, `/projects` gap, page-specific skeletons (admin tables too), slow pages.
- No favicon/app icon yet: browsers still request `/favicon.ico` (now a clean 404, no API call).
- `perf/static-isr-and-api-latency` (pending review, not pushed): after deploy, confirm `x-vercel-id` ends in `::sin1` and public pages return `x-vercel-cache: HIT`/`STALE`; confirm the Vercel Root Directory is still the repo root (that is where `vercel.json` is read).
- Perf follow-ups (uncertain, not done): `render.yaml` has no `region` (Blueprint default is Oregon) while prod was measured in Singapore; region cannot change on an existing service, so only matters for a re-created service. TiDB reports `8.0.11-TiDB`, below the adapter's 8.0.13 relation-JOIN cutoff, so nested `include`s use extra round trips (likely why `/api/public/projects` ~1 s vs ~0.3 s for others). `/notes` and `/projects` could become static if filtering moved client-side. The API `/api/revalidate` webhook covers only pages, posts, projects, domains, skills, profile and site settings; the admin `revalidatePublicContent` action covers the rest. A block that fails to load during ISR regeneration is cached as its inline error state until the next revalidation.

## 8. Deferred

- R13, R14, R7, R8, R6 (after priority list). R15 unranked.

## 9. Changelog

- 2026-11-01: P6-2 T32: admin mobile bottom bar with More sheet, compact touch topbar with save status, and 390px E2E coverage.
- 2026-11-01: P6-1 T31: five-group admin sidebar, URL-backed About and Posts tabs, and legacy route redirects; nav unit and redirect E2E coverage.

Older and full entries: `docs/CHANGELOG_ARCHIVE.md` (read only when needed).

- 2026-11-01: Vercel Git deployments disabled for all branches except `main` via `git.deploymentEnabled`, so PRs no longer get a Vercel check.
- 2026-11-01: Vercel builds only `main` (and `hotfix/*` behind a toggle, currently off); other branches skip via `ignoreCommand`.
- 2026-11-01: Weekly Graphify refresh of `graphify-out/GRAPH_REPORT.md` (code-only, no model calls).
- 2026-11-01: P4-6 T24: hero stats stored in site settings (nullable JSON column, admin fieldset, profile stats fallback). Spec: `docs/specs/2026-11-01-hero-stats.md`.
- 2026-11-01: P4-5 T22: visual baseline screenshots for 6 public and 4 admin routes at 375/1280px in web E2E, with a Docker script to re-render Linux baselines.
- 2026-11-01: P4-4 T21d: command palette, theme menu and the contact, notes and projects block islands load via `dynamic()`; `/vi` Lighthouse unused JS drops 40 KiB.
- 2026-11-01: P4-3 T21c: a global top progress bar starts on every internal link click (public and admin) and ends when the URL changes.
- 2026-11-01: P4-2 T21b: a loading skeleton for every admin group (table skeleton for lists, editor skeleton for profile, site and nested editors).
- 2026-11-01: P4-1 T21a: shared `EmptyState` and a back link on `ErrorState`; admin detail routes with a bad id offer Retry and back-to-list; empty `/notes` links to case studies.
- 2026-11-01: P3-4 T20: cover fallback monogram stays inside its frame in the domain color; case studies end with wrapping prev/next and a contact CTA.
- 2026-11-01: P3-3 T33b: one-row, horizontally scrolling editor toolbar with a "More" overflow menu on mobile.
- 2026-11-01: P3-2 T33a: one Write/Preview toggle drives all six project markdown editors (2 tablists instead of 7).
- 2026-11-01: P3-1 T18: sync admin chrome with shared Button/IconButton/Input/Badge at compact density; the sidebar collapse is an IconButton.
- 2026-11-01: P2-5: pause the tech marquee on hover, focus within, hidden tabs, and manual request.
- 2026-11-01: P2-4 T16: add tap target sizing, mobile dashboard column, truncated-name titles, selection/scrollbar colors, and public-route target e2e coverage.
- 2026-11-01: P2-2: make `/projects` ISR with client-side URL filters, preserving draft version previews and testing filter reloads.
- 2026-11-01: P2-1 T13a: align `/projects` loading geometry with its server-rendered list and guard mobile CLS in Lighthouse.
- 2026-11-01: P1-23 T9: add app icons, admin page titles, and a shared OG image for public index routes.
- 2026-11-01: P1-22 T8c: translate admin editors, about forms, page blocks, profile, and site settings; localize remaining visible ISO dates.
- 2026-11-01: P1-21 T8b: translate Vietnamese admin dashboard, auth, shell, and list messages; cover key parity and visible route copy.
- 2026-11-01: P1-20 T8a: wire the admin locale cookie, topbar switch, and shared Intl date/relative formatting.
- 2026-11-01: P1-19 T11c: move remaining redesign slot selectors to explicit component classes.
- 2026-11-01: P1-18 T11b: use explicit public button and admin card variants; remove six `!important` declarations from `redesign.css`.
- 2026-11-01: P1-17 T11a: move admin table header and cell CSS overrides to `TableHead surface` and `TableCell density` variants; computed styles unchanged.
- 2026-11-01: P1-16 T5b: keep editor tabs and the `/projects` grid/index view in the URL; reload keeps them and Back restores the previous one.
- 2026-11-01: P1-15 T5a: add `PageHeader` with a mobile back link to the parent list on every admin detail and new route.
- 2026-11-01: P1-14 T6d: migrate the admin pages, audit and analytics tables to `AdminTable`; its scroll viewport is a focusable region.
- 2026-11-01: P1-13 T6c: migrate the admin experience, inbox and users lists to `AdminTable`; experience and inbox rows are links.
- 2026-11-01: P1-12 T6b: migrate the admin projects and posts lists to `AdminTable` with link rows and a sticky header.
- 2026-11-01: P1-11 T6a: add the shared `AdminTable` core with link rows, debounced search, sort and state slots.
- 2026-11-01: P1-10 T7b: always show the editor save status with the last saved time from page load.
- 2026-11-01: P1-9 T7a: add ConfirmDialog and the undo toast preset, and route admin delete/archive actions through them.
- 2026-11-01: P1-8 T4c: label remaining admin inputs and expand axe checks across admin indexes and editors.
- 2026-11-01: P1-7 T4b: name inline-list admin actions and search fields, and add axe coverage for seven routes.
- 2026-11-01: P1-6 T4a: apply FormField to login and contact, and focus the first invalid contact field on empty submit.
- 2026-11-01: P1-5 T3e: add FormField with required mark, linked inline error, and maxLength counter.
- 2026-11-01: P0-4 T12a: hide TODO/TBD text from public routes, guard About experience and skills fields, and show the compact location caption.
- 2026-11-01: P0-5 T25: render the static hero on mobile, touch, and reduced motion; load the desktop shader during idle time.
- 2026-11-01: P0-5 T25 follow-up: defer the desktop command palette and scope React Query to notes search and admin so mobile home hydrates less code.
- 2026-11-01: P0-2 T1: admin editor scroll uses one `main` region below `lg` and independently scrolling columns at `lg`; responsive e2e coverage added.
- 2026-11-01: Big docs split into short indexes + verbatim pieces in `docs/archive/` and `docs/design/archive/`; `pnpm check:all` prints only failing checks.
- 2026-11-01: P0-1 T0: public site header and admin topbar mobile Sheets are controlled and close when `usePathname()` changes (`use-close-on-navigate` hook), nav links wrapped in `SheetClose asChild`; new `e2e/ux-overlay.spec.ts` (mobile 375x667: dialogs close on tap/Esc, body stays unlocked, scrolling works) + hook unit tests. Admin mobile nav sheet content is scrollable.
- 2026-11-01: Token savings: `.cursorignore` for generated, binary and duplicate files; AGENTS.md small tasks skip Graphify and avoid reading large files.
- 2026-11-01: Trimmed this changelog to the latest 5 entries; full history moved to `docs/CHANGELOG_ARCHIVE.md`.
- 2026-10-31: Husky branch/secret-scan guardrails, gitleaks CI, canonical `AGENTS.md`, `docs/LESSONS.md`.
- 2026-10-31: Perf: functions pinned to `sin1`; public pages static/ISR, revalidated after admin mutations; nonce CSP only on `/admin`/draft. Spec: `docs/specs/2026-10-31-perf-static-isr.md`.
- 2026-10-31: Data migration `20261031120000_publish_all_content` (DRAFT→PUBLISHED for projects and posts); seeds publish projects.
- 2026-10-31: Graphify code map (`graphify-out/GRAPH_REPORT.md`) and shortened agent rules.
