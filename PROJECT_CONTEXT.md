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
- Rendering: public `/[locale]` pages static/ISR (1 h, shared `public` cache tag expired by admin saves); `/notes` + `/projects` index render per request on cached data; `/admin` dynamic. Public CSP has no nonce (`'unsafe-inline'` scripts); `/admin` and draft-mode requests get nonce + `'strict-dynamic'`.

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

Older and full entries: `docs/CHANGELOG_ARCHIVE.md` (read only when needed).

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
