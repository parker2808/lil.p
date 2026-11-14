# lil.p

The [CMS U0 route/control baseline](./docs/audits/2026-11-10-cms-u0-route-control-baseline.md) maps the current public/admin routes, redirect and role boundaries, control ownership, and existing behavior/visual tests before UI standardization. It records uncovered live/visual states separately from executed focused tests; U0 changes no runtime behavior.

### CMS U1 shared controls

The stacked [CMS U1 shared-controls spec](./docs/specs/2026-11-10-cms-u1-shared-controls.md) tracks the shadcn Select/RadioGroup migration, normalized checkbox/switch/menu states, EN/VI field labels, behavior tests, and the comparison against U0. Its review fixes preserve contact fields typed before hydration, keep the optional topic clearable to an empty payload, and test radio Tab/focus without changing selection. SchemaForm's registry coverage runs once per block, making slow editor forms identifiable without raising test timeouts. The existing test-only loading fixture serves a radio variant only with `R3_E2E_STATES=1` and otherwise returns 404. U0 stays the before reference; U1 does not change the API or database.

### CMS U0 pre-change baseline

The [route/control baseline](./docs/audits/2026-11-10-cms-u0-route-control-baseline.md) maps public and admin routes, redirects, control owners, and remaining accessibility gaps. On a clean `d0d474b` worktree, the guarded `pnpm check:all --e2e` run passed all nine gates with a disposable MySQL container. The reproducible screenshot test is `apps/web/e2e/u0-capture.spec.ts`: set `U0_CAPTURE_DIR` to a local directory **outside the repo** and `R3_E2E_STATES=1`, then run `env -u DATABASE_URL -u DATABASE_URL_TEST bash scripts/r3-12-e2e-gate.sh u0-capture.spec.ts admin-ia.spec.ts`. It records a JSON manifest and EN/VI, light/dark, 1440/390 screenshots; keep platform-specific pixels out of git (only Linux Chromium pixel baselines belong in the tracked visual snapshots). The manifest and location are documented in the audit. Never point this gate at a persistent database.

The [C1 extraction runbook](./docs/specs/2026-11-11-cms-core-extraction-runbook.md#c1-dry-run-gap-closure--proposed-files-not-applied) now contains standalone tsconfig/ESLint, package scripts, measurement relocation, pack allowlist and proprietary-license **proposals** plus a read-only audit of React/React DOM/Zod peers. The [open-PR stack snapshot](./docs/specs/2026-11-10-cms-stack-integration-plan.md#current-open-pr-merge-snapshot-2026-11-11-0505-ict) pins historical GitHub heads/bases and acceptance SHAs; Parker's later conditional merge approval is recorded in the [merge execution checklist](./docs/specs/2026-11-10-cms-stack-integration-plan.md#merge-execution-checklist-future-authorized-owner-only). These docs do not change the live package.

The [D2 persistence draft](./docs/specs/2026-11-11-cms-d2-persistence-design.md#d1-validation-decisions-blocking-d2-wiring) and [D2–D6 lane briefs](./docs/specs/2026-11-11-cms-builder-d-lane-briefs.md) distinguish autosave-safe structural draft validation from H1/required-content publish validation. They require pre-Zod depth/count/byte bounds, a valid one-column mobile grid and typed HTTP rejection without data loss; the historical D1 #194 findings are tracked in the dated stack snapshot. The [stack plan](./docs/specs/2026-11-10-cms-stack-integration-plan.md#parker-approvals-needed) records Parker's conditional merge approval separately from production DB access, secrets and private repository creation.

The [CMS core ADR](./docs/specs/2026-11-10-cms-core-adr.md) defines U → B → D → verification → C, the neutral default theme and screenshot-backed design gates. The [D1–D6 builder](./docs/specs/2026-11-10-cms-builder-phase-d-draft.md) and [C1–C3 distribution](./docs/specs/2026-11-10-cms-core-distribution-c-draft.md) handoffs remain draft implementation plans. Parker approved naming or linking the private `@parker2808/cms-core` repository and declaring it as a dependency; see the [narrow public-repo exception](./docs/specs/2026-11-10-agents-private-cms-core-exception.md). Private source and credentials remain excluded from this public repository.

CMS draft handoff update (2026-11-11): B6b #193 `e12774e` exposes the opt-in neutral `@parker2808/cms-core/theme.css` with light/dark `--builder-*` tokens; D1 #194 `5c31773` exposes the typed `./tree` entry (`readTree`, `migrateTree`, `convertLegacySnapshot`) for the D2–D6 draft briefs. The [stack plan](./docs/specs/2026-11-10-cms-stack-integration-plan.md) preserves both manifest/tsup changes; B7 and D1 acceptance remain pending. This docs update neither imports the theme into the live app nor approves the D2 migration.

The [C1 local extraction dry run](./docs/specs/2026-11-11-cms-core-extraction-runbook.md#local-c1-extraction-dry-run-2026-11-11-not-a-release) tested a throwaway history-preserving split of the latest pushed B6 package and an isolated pnpm 10 build, tests, measurement and local tarball consumer. It exposed root tsconfig/ESLint/script dependencies, overbroad pack contents and an empty B6-only engine; the scan found no gitleaks findings but retained author metadata still needs private review. This is **not** permission to create a repo, switch dependencies, publish or deploy.

The [B7 fixture draft](./docs/specs/2026-11-10-cms-core-b7-fixture-draft.md) now requires the **core-owned** B6b neutral theme subpath with light/dark `--builder-*` defaults; lil.p may override tokens only. B5 #190 `71e9ce4` is accepted with strict no-strip snapshot rejections. B6 #191 awaits host-registered portfolio widgets and host-localized EN/VI field labels; B5b #192 still needs its legacy missing-SEO test. B7 is parked at a local prerequisite spec, not a completed app. See the [conditional stack order](./docs/specs/2026-11-10-cms-stack-integration-plan.md) and [D-lane briefs](./docs/specs/2026-11-11-cms-builder-d-lane-briefs.md); no merge or release is authorized.

The [post-D6 verification checklist](./docs/specs/2026-11-10-cms-core-verification-draft.md#post-d6-execution-checklist-future-authorized-threads-only) reserves serialized DB/E2E/visual evidence for a later authorized owner; the D6 manifest must pin the candidate SHA, CI, exact commands, screenshots and V01–V22 sign-off. B6 #191 is accepted at `9e356db`, B5b #192 at `1645a11`; B7 resumed and D1 started early but neither is accepted, while B6b's neutral core theme remains pending. The [draft stack plan](./docs/specs/2026-11-10-cms-stack-integration-plan.md) records these gates and B5b review follow-ups. Neither this draft nor the checklist authorizes a merge or test run.

The [D2 persistence design for Parker's review](./docs/specs/2026-11-11-cms-d2-persistence-design.md) proposes nullable `Page.draftTree` and an atomic draft revision, with no backfill; it specifies legacy-compatible snapshot dispatch, server validation, conflict handling and transaction/rollback boundaries. **DRAFT:** no schema or migration has been changed, and no DDL, builder publication or production action is authorized by this document.

The [CMS core ADR](./docs/specs/2026-11-10-cms-core-adr.md) maps current portfolio blocks and routes to a reusable package boundary. It orders route-complete shadcn/ui standardization (U), in-repo `@parker2808/cms-core` extraction (B), an accessible visual page builder (D), product verification, then private distribution (C). Draft-ahead handoffs cover the parallel [B5 pure engine/ports](./docs/specs/2026-11-10-cms-core-b5-engine-draft.md) and [B6 React extraction](./docs/specs/2026-11-10-cms-core-b6-react-draft.md) after B4, the [B7 standalone neutral fixture](./docs/specs/2026-11-10-cms-core-b7-fixture-draft.md), [D1–D6 builder](./docs/specs/2026-11-10-cms-builder-phase-d-draft.md), [full verification and design-review matrix](./docs/specs/2026-11-10-cms-core-verification-draft.md), and [C1–C3 distribution](./docs/specs/2026-11-10-cms-core-distribution-c-draft.md). The verification matrix includes a path audit against B1–B3; the B5/B6 handoffs now use B4's pushed `./contracts` exports, its still-empty `./engine`/`./react` entries and actual bundle measurements. The [draft stack integration plan](./docs/specs/2026-11-10-cms-stack-integration-plan.md) records merge order, stacked-base retargeting, observed conflicts (including B4's CI workflow overlap with U2) and post-merge gates; it authorizes no merge or release. These drafts remain pending their ADR gates. The core includes a polished default light/dark theme; lil.p supplies orange/green token overrides. Coordinator design review requires screenshots and findings/fixes for core components and assembled pages, not just working drag/drop. These docs do not implement, switch dependencies, create a private repository, migrate, or deploy. The [current changelog](./PROJECT_CONTEXT.md#9-changelog) records the planning change.

The [B5 API handoff](./docs/specs/2026-11-10-cms-core-b5-engine-draft.md#api-module-and-production-packaging-decision-read-only-audit) records the API's CommonJS/Nest build decision: accepted B4 `8c448ea` exposes `./engine.require`; B5 `acfb18c` adds pure engine exports, while #189 `2de602e` supplies the direct API dependency and Docker/CJS packaging smoke. The [B7 fixture](./docs/specs/2026-11-10-cms-core-b7-fixture-draft.md) now pins B5 `acfb18c` legacy `./engine` policies and B6 #191 `7e3b317` callback-based `renderBlocks` from `./react/server` plus client `./react` form/schema/metadata helpers; neutral style and B7 app outputs remain pending. The [draft D1–D6 lane briefs](./docs/specs/2026-11-11-cms-builder-d-lane-briefs.md) reserve disjoint files, acceptance evidence and serialized E2E/DB gates for up to four implementation threads **after B7**. The [draft extraction runbook](./docs/specs/2026-11-11-cms-core-extraction-runbook.md) compares history-preserving filtered extraction, registry/Git/tarball distribution and credential-free rollback, all pending later authorization. The stack plan covers #189, sibling lockfile/export-test integration and B4–U2 CI resolution. These are design checks, not a deployed change.

The B5 #190 review blocks landing until future-version and unknown block fields cannot be silently stripped. Its follow-on B5b Nest wiring must preserve the legacy read path for older snapshots missing SEO fields. The [B7 fixture draft](./docs/specs/2026-11-10-cms-core-b7-fixture-draft.md), [verification matrix](./docs/specs/2026-11-10-cms-core-verification-draft.md) and [D-lane briefs](./docs/specs/2026-11-11-cms-builder-d-lane-briefs.md) now require typed rejection or lossless preservation of those fixtures, never a successful lossy read. B5b remains in progress; this documentation does not claim either fix is complete.

The [bottom-stack readiness review](./docs/specs/2026-11-10-cms-stack-integration-plan.md#bottom-stack-readiness-at-main-d0d474b-2026-11-10) records the current heads, CI, main mergeability and first-merge sequence for #171/#172/#175/#176/#173/#174. #173's localized labels are already in U1; #174's duplicate guard must survive B2/B4; #184 now has stacked-base context-check proof. This is a docs-only review, not merge authorization.

The [reconciled Phase D draft](./docs/specs/2026-11-10-cms-builder-phase-d-draft.md) uses U3's approved **static** design reference (#178) and B4's actual generic contracts (#185). Tree slots, responsive properties, server rendering and D4/D5 interactions are future work: B4's registry does not implement them, and U3's sample does not save or publish. D1 still waits for B7 and phase authorization; no builder behavior or migration is shipped by these docs.

Portfolio monorepo: Next.js public site + admin (`apps/web`), NestJS API (`apps/api`), design system (`packages/ui`), and shared zod contracts (`packages/contracts`).

The Round 3 integration branch contains the verified PR #169 head and all eleven earlier Round 3 branch tips. It is a review PR to `main`; the stacked PRs remain open. See the [integration handoff](./docs/specs/2026-11-03-r3-stack-integration.md) and [Round 3 audit](./docs/specs/2026-11-03-r3-12-real-flow-audit.md) for scope and checks.

Layout and naming: [STRUCTURE.md](./STRUCTURE.md). Build plan: [docs/PLAN.md](./docs/PLAN.md).

The [D5 draft](./docs/specs/2026-11-11-cms-d5-properties-history-autosave.md) specifies responsive properties, undo/redo and conflict-safe revision autosave against the pending D4 callback and D2 API. The [D6 evidence manifest template](./docs/specs/2026-11-11-cms-d6-evidence-manifest-template.md) keeps the mouse/keyboard journey, EN/VI visual matrix, accessibility, SSR parity, goldens and bundle gates explicitly blocked until a later authorized run. Neither document authorizes DDL, implementation or merge.

The [D2 persistence checklist](./docs/specs/2026-11-11-cms-d2-persistence-design.md#d2-implementation-checklist-handoff-no-migration-authored-here) pins additive schema, Nest revision-checked API, proposed thin web boundary and disposable-MySQL-only migration evidence. The [stack merge execution checklist](./docs/specs/2026-11-10-cms-stack-integration-plan.md#merge-execution-checklist-future-authorized-owner-only) requires individual approval and green checks on each final head; D2's migration merges only after full candidate verification because a `main` deploy runs migrations. Neither document authorizes a merge or deployment.

The [C1 extraction readiness refresh](./docs/specs/2026-11-11-cms-core-extraction-runbook.md#c1-readiness-refresh-at-d-base-3bbd1b2-2026-11-11-local-only) isolates the D-base package in a disposable local copy: standalone unit/build/types/lint and tarball exports pass after package-local config and measurement adjustments. The pack excludes host assets; the root `.` export is absent and its need remains undecided. Final D2–D6 history, browser theme and hosted distribution remain unverified. Parker approved a future private, `UNLICENSED` repository only after verification and merges; none has been created.

## Stack

| Layer     | What runs                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo  | pnpm 10, Node 22, TypeScript 5.9, zod 4 contracts in `packages/contracts`                                                                                                 |
| Web       | Next.js 16.4 (App Router, `proxy.ts`), React 19.3, next-intl 4 (`/en`, `/vi`), TanStack Query 5, shadcn UI in `packages/ui`                                               |
| API       | NestJS 11, Prisma 7 with the `@prisma/adapter-mariadb` driver adapter (one shared pool), JWT in httpOnly cookies                                                          |
| Database  | MySQL 8.4 in Docker locally, TiDB Cloud Serverless in production                                                                                                          |
| Hosting   | Vercel for web (functions pinned to `sin1` Singapore in `vercel.json`, next to the API and DB), Render free for the API (Singapore), Cloudinary for media. All free tiers |
| Keep-warm | A cron-job.org job pings `GET /api/health` (`SELECT 1`) every 10 minutes so the Render free instance does not spin down; `ApiWarmup` also pings it on page load           |

Vercel's repository-owned build command builds the CMS-core dependency before
contracts' declaration output and then the web app. The `vercel-build` CI job
reproduces that command without prebuilt core artifacts.

### Public site

The EN/VI home, projects, notes, about, and contact routes share the round 3 public shell and index styling. They continue to read CMS content through the public API; project and note filters stay in the URL across reloads, and the contact form keeps its server submission. `/[locale]/craft` is a localized, static interaction study linked from the public header. Its presentation and the index styles are scoped to public routes, so project and note details and admin screens keep their own layouts. See the [R3-05 spec](./docs/specs/2026-11-03-r3-05-public-shell-indexes.md) for the route, accessibility, and capture checks.

The contact page, public CTA, and search palette use the contact email configured in site settings. Copy email reports success or failure in the selected language and keeps a direct email link available. See the [R3-06 spec](./docs/specs/2026-11-03-r3-06-copy-email.md).

Project and note detail pages keep their CMS content and draft preview paths. Their loading states now follow the final route layout, and localized error and missing-page screens provide recovery actions. See the [R3-07 spec](./docs/specs/2026-11-03-r3-07-public-details-states.md).

### Brand assets

The public header and footer and the admin login and shell use the shared `lil.parker` `BrandMark` from `packages/ui`. Its icon has one vector source: `packages/ui/src/components/BrandMark/brand-icon.svg`. To refresh the web app's `icon.svg` and `apple-icon.png` after changing that source, run `bash scripts/generate-brand-icons.sh` from the repo root (requires ImageMagick's `magick` command) and commit both generated files. Light and dark orange/green brand colors are defined in `packages/ui/src/styles/globals.css` and scoped to the redesigned surfaces in `packages/ui/src/styles/redesign.css`.

### Caching and rendering

- Public pages under `/[locale]` are static and use ISR. Home, about, contact, project and note detail pages, RSS, OG images and the sitemap are prerendered at build when the API answers, otherwise on first visit.
- Public API reads (`apiServer` without `withAuth`) never read cookies or headers. They use `fetch` with `next: { revalidate: 3600, tags }`, and every one carries the shared `public` tag.
- Admin saves expire the cache right away. Successful admin mutations that change live content call the `revalidatePublicContent` server action (admins only, `updateTag('public')`); draft-only and non-public ones opt out with `meta.publicCache`. The API still posts per-entity tags to `/api/revalidate` for the content it publishes.
- `/notes` and `/projects` filter and paginate by query string, so they render per request, but their API reads still come from the data cache. `/admin` is always dynamic.
- The live admin shell uses role-filtered navigation and a server role check on `/admin/audit`. Its dashboard shows only cards the signed-in role can use; the topbar exposes an EN/VI selector and a theme control, with both actions in the mobile account menu. See [R3-08](./docs/specs/2026-11-03-r3-08-admin-shell-insights.md) for the route and state checks.
- Admin collection lists retain their API-backed filters and actions. Education uses compact mobile cards with reorder controls; media tiles use a responsive, padded preview grid; inbox detail keeps an inline back link and the list shows its message count. The [R3-09 spec](./docs/specs/2026-11-03-r3-09-admin-collections.md) records the collection capture and browser checks.
- Admin page publishing maps the API's `PAGE_BODY_REQUIRED`/`body` error to a linked message in the admin UI language, independent of the page language. Standalone experience editing uses `/admin/experience/new` and `/admin/experience/[id]`, with explicit save, validation, and deletion confirmation; the older About URLs redirect there. See the [R3-10 spec](./docs/specs/2026-11-03-r3-10-admin-editors-settings.md) and the verification entry in [PROJECT_CONTEXT.md §9](./PROJECT_CONTEXT.md#9-changelog).
- If the API is down at build time, the build still succeeds: nothing is prerendered and ISR fills the pages on first visit.
- CSP: `/admin` and draft-mode requests (the site-wide `__prerender_bypass` cookie) get a per-request nonce with `'strict-dynamic'`. Public pages share cached HTML, so they use `script-src 'self' 'unsafe-inline'` with every other directive unchanged (see `csp.util.ts`).
- Development public routes allow React's diagnostic `eval()` under CSP; production and nonce-protected routes do not.

### Custom page creation API

Duplicating a page block respects the block type's `maxPerPage` limit, just like adding a new block. When the limit is reached, `POST /api/admin/pages/:key/blocks/:id/duplicate` returns `409 BLOCK_LIMIT` and leaves the page unchanged. See the [duplicate-limit spec](./docs/specs/2026-11-10-pages-duplicate-limit.md) and the [current changelog](./PROJECT_CONTEXT.md#9-changelog).

Admins can create a draft with `POST /api/admin/pages`. The JSON body requires `title` (1–120 characters after trimming), `key` (a lowercase, one-segment slug of 1–64 characters), `locale` (`en` or `vi`), and `template` (`starter` or `empty`). A successful request returns `201` with the editable admin page; `GET /api/admin/pages/:key` reads it back. Built-in page keys and public route names are reserved, and a taken key returns `409` with `PAGE_KEY_TAKEN`.

In the admin, open `/admin/pages` and use **Add page** in the header or empty state. The dialog suggests an editable slug from the title, validates each field, and keeps the form open if creation fails. After a successful create it opens the new editor. The Pages editor back link returns to the index. See the [R3-04 UI spec](./docs/specs/2026-11-03-r3-04-page-create-ui.md).

`starter` adds a localized page heading and blank prose; `empty` starts without blocks. Both stay drafts until published. Custom pages need a visible first H1 and substantive visible prose in the page locale before publishing; missing prose returns `PAGE_BODY_REQUIRED` on the `body` field. Published custom pages render at `/en/{key}` and `/vi/{key}`, appear in the sitemap, and use the same CMS block rendering and cache invalidation as built-in pages. Drafts stay private but are available through authorized preview and saved versions. See the [R3-02](./docs/specs/2026-11-03-r3-02-page-create-api.md) and [R3-03](./docs/specs/2026-11-03-r3-03-custom-public-pages.md) specs for coverage.

The [CMS B1 golden HTTP suite](./docs/specs/2026-11-10-cms-b1-golden-http.md) freezes API status/shape/error and role/EN–VI behavior across pages, blocks, versions, preview, custom pages, site settings, media and auth using a clean disposable MySQL seed. It checks EN/VI published preview/public block parity, observable draft restore/discard against the version snapshot, unchanged public content, and the missing-version 404. The separately named VI-only custom SEO fallback baseline is fixed on separate PR #186; B1's golden at `apps/api/test/cms-golden.e2e-spec.ts` will update when that fix is stacked. B1 changes no production API; the later B2 sequencing amendment below supersedes B1's original gate for backend B2–B5 only. Run it with `pnpm --filter @portfolio/api exec vitest run --config vitest.e2e.config.ts test/cms-golden.e2e-spec.ts` only against disposable MySQL.

[CMS B2 page allowance](./docs/specs/2026-11-10-cms-b2-page-allowance.md) reads built-in page keys and the explicit custom-page flag from each block definition in one shared predicate for Nest validation and the EN/VI admin Add Block dialog. Only page-header, prose and cta-band allow custom pages; existing HTTP contracts and errors remain unchanged. Per Parker's 2026-11-10 sequencing amendment, backend B2–B5 may proceed alongside U. U2/U3 are accepted on separate unmerged branches; React extraction B6 follows B4 approval and builder D follows B7. B4 now provides `createRegistry` with duplicate-type rejection.

[CMS B3 package scaffold](./docs/specs/2026-11-10-cms-b3-package-skeleton.md), accepted at `814afcf`, adds independently built `./contracts`, `./engine`, and `./react` exports. `pnpm --filter @parker2808/cms-core build` measures and enforces the coordinator-approved browser budgets: combined contracts+engine ≤60 KiB gzip and React ≤35 KiB gzip (declared React/React DOM/Zod peers excluded). The initial empty scaffold measures 40 bytes combined and 34 bytes React; B4 remeasures after extraction. See [package usage and boundaries](./packages/cms-core/README.md). There is no `/help` route; admin table help lives in the Shortcuts dialog.

[CMS B4 contracts and registry](./docs/specs/2026-11-10-cms-b4-contracts-registry.md) moves generic locale/page/block/snapshot contracts, `defineBlock`, duplicate-rejecting `createRegistry` and page allowance into `./contracts`, with all 20 definitions and their copy still [host-owned](./packages/contracts/README.md). Every core subpath supports ESM and CJS; React 19, React DOM 19 and Zod 4 remain declared, externalized peers. Browser gzip measures 864 bytes contracts+engine against 60 KiB and 34 bytes React against 35 KiB. Existing API contracts, locale behavior and the admin table Shortcuts dialog stay unchanged; B6 follows B4 approval, D follows B7.

[API image CMS-core prerequisite](./docs/specs/2026-11-11-api-docker-cms-core.md): the [API Dockerfile](./apps/api/Dockerfile) installs the core workspace manifest, builds core before contracts/API and checks its CommonJS exports against the pruned production layout. The API declares a direct runtime dependency for B5; Render rebuilds the API image on core source changes. No database or deployment changes are part of this integration.

### Real content seed verification

The [R3-11 spec](./docs/specs/2026-11-03-r3-11-real-content-seed.md) requires private source evidence for every factual claim and project cover. Keep source paths, source text, and contact details out of git and logs. The staged migration check is `env -u DATABASE_URL bash apps/api/prisma/seed/migration-gate.sh`; it creates a random, tmpfs-only MySQL container, compares the five built-in page rows across the old and current migrations, checks page constraints and Prisma schema drift, then removes the container. It refuses to run when `DATABASE_URL` is already set.

The `real` seed profile requires `LILP_PRIVATE_SOURCE_PATH` at runtime. It validates nine owner project records, adds one verified public repository project, and publishes exactly ten projects. Run it only on a newly created disposable local database for verification; the guarded migration gate runs it twice and confirms no duplicate or changed rows. Ten repo covers are mapped by project slug: one public README screenshot and nine clearly illustrative covers. A CMS media cover takes priority when present.

### Round 3 integrated audit

The [R3-12 spec](./docs/specs/2026-11-03-r3-12-real-flow-audit.md) covers the integrated page-creation, public-route and seed stack. Run `env -u DATABASE_URL -u DATABASE_URL_TEST bash scripts/r3-12-e2e-gate.sh` for the full `pnpm check:all --e2e` suite on a random no-volume local MySQL container. Set `API_PORT` and `WEB_PORT` when the default local ports are occupied; the gate builds and tests against those ports and keeps the browser on `localhost` for draft cookies. Set `R3_VISUAL_UPDATE=1` to refresh Linux Chromium screenshots through the same disposable database gate. For the staged schema-only migration check, run `env -u DATABASE_URL LILP_MIGRATION_ONLY=1 bash apps/api/prisma/seed/migration-gate.sh`; it still checks five old rows, constraints and Prisma drift, then destroys the container. `python3 scripts/audit-r3-captures.py` validates Desktop screenshot manifests and their PNGs; `--finalize` writes consolidated manifests and archives unreferenced PNGs outside the capture folders.

The PR #169 CI repair passes all nine local `check:all --e2e` gates on disposable MySQL, 17 focused browser tests, and 14 Linux visual tests. Set `R3_E2E_STATES=1` for the focused `public-details-states.spec.ts` run to refresh controlled loading and error captures. The final manifests contain 264 public and 608 admin route/state tuples, with no missing, stale or orphan PNGs.

### CMS U0 pre-change baseline

The [route/control baseline](./docs/audits/2026-11-10-cms-u0-route-control-baseline.md) maps public and admin routes, redirects, control owners, and remaining accessibility gaps. On a clean `d0d474b` worktree, the guarded `pnpm check:all --e2e` run passed all nine gates with a disposable MySQL container. The reproducible screenshot test is `apps/web/e2e/u0-capture.spec.ts`: set `U0_CAPTURE_DIR` to a local directory **outside the repo** and `R3_E2E_STATES=1`, then run `env -u DATABASE_URL -u DATABASE_URL_TEST bash scripts/r3-12-e2e-gate.sh u0-capture.spec.ts admin-ia.spec.ts`. It records a JSON manifest and EN/VI, light/dark, 1440/390 screenshots; keep platform-specific pixels out of git (only Linux Chromium pixel baselines belong in the tracked visual snapshots). The manifest and location are documented in the audit. Never point this gate at a persistent database.

For tracked visual snapshots, use a fresh disposable demo seed: the visual spec checks canonical About/Notes records before capture, so screenshots taken after other E2E specs create posts or education must not become baselines. The U1 spec records why its four accidental About/Notes snapshots were restored to U0 and how to verify them with Linux Chromium.

## Environments

There are three ways to run this repo. Each has its own setup — do not mix the steps.

|                 | [Local development](#local-development)       | [Production-like (local)](#production-like-stack-on-your-machine) | [Production](#production)              |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| Purpose         | Day-to-day coding                             | Test the Docker images before deploy                              | The live site                          |
| Web             | `pnpm dev` → http://localhost:3000            | Docker + Caddy → http://localhost                                 | Vercel (`sin1`)                        |
| API             | `pnpm dev` → http://127.0.0.1:4000            | Docker (behind Caddy)                                             | Render (Docker, `render.yaml`)         |
| Database        | Docker MySQL 8.4 (`docker-compose.yml`)       | Docker MySQL 8.4 (`compose.prod.yml`)                             | TiDB Cloud Serverless                  |
| Media           | In-memory fallback (Cloudinary keys optional) | Cloudinary                                                        | Cloudinary                             |
| Config lives in | Root `.env` (from `.env.example`)             | Root `.env`                                                       | Vercel + Render dashboards only        |
| Migrations      | `pnpm db:migrate` (creates + applies)         | Applied on API boot (`migrate deploy`)                            | Applied on API boot (`migrate deploy`) |

The root `.env` is for your machine only. Production secrets never go in `.env` or in git.

## Local development

### Prerequisites

- Node 22 (`.nvmrc`; `nvm use`)
- pnpm via [corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) so it matches `packageManager` in `package.json`
- Docker Desktop (running)
- git

### First-time setup

Run these in order from the repo root. Every step is needed once per fresh clone.

1. **Install dependencies** (also installs the Husky git hooks and generates the Prisma client):

   ```bash
   nvm use && corepack enable
   pnpm install
   ```

2. **Create `.env`** and fill the values the API refuses to boot without:

   ```bash
   cp .env.example .env
   ```

   | Key                                                     | Local value                                                                                  |
   | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
   | `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Anything. Keep `DATABASE_URL` / `DATABASE_URL_TEST` in sync with the same user and password. |
   | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`              | Two **different** values, 32+ chars: `openssl rand -base64 48`                               |
   | `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD`         | Your local admin login. The seed creates this user only when all three are set.              |

   Leave `CLOUDINARY_*`, `REVALIDATE_SECRET`, and `ANALYTICS_SALT_SECRET` blank unless you need them — the API falls back to in-memory media and skips revalidate and analytics.

   > **Decide `MYSQL_*` before step 3.** MySQL creates the user and grants only the first time the Docker volume is created. If you change `MYSQL_USER` or a password later, reset the volume: `docker compose down -v && pnpm db:up` (this deletes local data).

3. **Start MySQL + Adminer** and wait until `db` is `healthy`:

   ```bash
   pnpm db:up
   docker compose ps
   ```

4. **Build the shared contracts.** The API, the seed, and the web app import `packages/contracts/dist/`, which is not in git:

   ```bash
   pnpm --filter @portfolio/contracts build
   ```

5. **Create the tables and the admin user.** `db:migrate` applies every migration, including `20261027150000_portfolio_content`, which loads the real portfolio content (the same data production has):

   ```bash
   pnpm db:migrate
   pnpm db:seed:admin
   ```

   Want placeholder demo data instead (published projects, posts, inbox messages)? Run `pnpm db:seed` after `db:migrate`. It replaces the portfolio content with demo rows — see [Local data: real content vs demo](#local-data-real-content-vs-demo).

6. **Start web + API:**

   ```bash
   pnpm dev
   ```

| URL                                                                    | What                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [http://localhost:3000](http://localhost:3000)                         | Public site                                                                     |
| [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Admin (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)                           |
| [http://127.0.0.1:4000/api/health](http://127.0.0.1:4000/api/health)   | API health — expect `{"status":"ok","db":"ok"}`                                 |
| [http://localhost:8080](http://localhost:8080)                         | Adminer — system **MySQL**, server **`db`**, user/password/database from `.env` |

In Adminer the server is `db` (the Compose service name), not `localhost` — Adminer runs inside Docker too.

### Daily workflow

```bash
pnpm db:up        # if Docker was stopped
pnpm dev
pnpm db:down      # when done; data stays in the `db-data` volume
```

After `git pull`, run `pnpm install`, `pnpm --filter @portfolio/contracts build`, and `pnpm db:migrate` if dependencies, contracts, or migrations changed.

### Changing the database schema

1. Edit `apps/api/prisma/schema.prisma`.
2. `pnpm db:migrate --name short_description` — writes a new folder in `apps/api/prisma/migrations/` and applies it locally.
3. Commit the migration folder together with the schema. Never edit a migration that is already on `main`; production applies them in order.

### Local data: real content vs demo

| You want                                                       | Run                                   |
| -------------------------------------------------------------- | ------------------------------------- |
| Real portfolio content, exactly as production (projects DRAFT) | `pnpm db:reset && pnpm db:seed:admin` |
| Demo placeholders (`SEED_PROFILE=demo`)                        | `pnpm db:reset && pnpm db:seed`       |
| Only (re)create the admin login, content untouched             | `pnpm db:seed:admin`                  |

- `pnpm db:reset` drops the local database and re-applies every migration (content included). Prisma 7 does **not** seed on reset. When an AI agent runs it, Prisma asks for your explicit confirmation first.
- Do not re-run the content migration SQL by hand on top of demo data (`prisma db execute --file …portfolio_content/migration.sql`). Demo rows reuse the same slugs with different ids, so the upserts update the wrong rows and fail with `project_domainId_fkey`. Use `pnpm db:reset` instead.
- `pnpm db:seed` profiles (PLAN D13): `demo` (default) or `baseline` (`SEED_PROFILE=baseline`). `demo` rewrites most content tables but upserts some by slug, so it can leave real and demo rows mixed; `baseline` wipes content and reloads the portfolio JSON. Seed contact fields are `<email>` / `<phone>`.

### Troubleshooting

- **`db` container exits on `pnpm db:up`, or `pnpm db:migrate` fails with P3014** (cannot create the shadow database): the volume was created with different `MYSQL_*` values than `.env` now has. Run `docker compose down -v && pnpm db:up`, then redo steps 5–6.
- **`Cannot find module '@portfolio/contracts'`** (seed or API) or **`Could not find a declaration file for module '@portfolio/contracts'`**: run step 4, then restart `pnpm dev`.
- **API exits with an env validation error**: `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are missing, shorter than 32 chars, or equal.
- **http://localhost:3000 does not load, only Nest logs appear**: `pnpm dev` was run inside `apps/api`, which starts the API alone. Run it from the repo root (`cd` to `lil.p/`) so web, API, and contracts start together.
- **Port 3306 already in use**: another MySQL is running on your machine. Stop it, or the container cannot bind.
- **Cannot sign in to `/admin`**: set all three `ADMIN_*` keys and run `pnpm db:seed:admin`.
- **`Cannot add or update a child row … project_domainId_fkey`** when loading content: demo and real content are mixed. Run `pnpm db:reset && pnpm db:seed:admin`.

## Production

Live hosting is **Vercel (web) + Render (API) + TiDB Cloud (MySQL) + Cloudinary (media)**. First-time provisioning, every env var, and the admin bootstrap are in [docs/DEPLOY.md](./docs/DEPLOY.md) ([Tiếng Việt](./docs/DEPLOY.vi.md)). Rollback and secret rotation: [docs/runbooks/deploy.md](./docs/runbooks/deploy.md), [docs/runbooks/secrets.md](./docs/runbooks/secrets.md).

### How a change reaches production

1. Open a PR (or push) to `main`. CI runs format, lint, typecheck, tests, content checks, build, and API e2e.
2. Vercel and Render auto-deploy `main`.
3. On boot, the API image runs `prisma migrate deploy` — it applies committed migrations only, never creates new ones, never resets data.

Nothing else is run by hand on a normal deploy.

### Which branches Vercel deploys

Only `main` (production) and `hotfix/*` branches deploy on Vercel; every other branch, including stacked feature PRs, skips the build. Name a branch `hotfix/<topic>` when you need a Vercel preview for a fix. The rule lives in `scripts/vercel-ignore-build.sh`, wired as `ignoreCommand` in `vercel.json`. `hotfix/*` deploys are currently off (`HOTFIX_DEPLOYS_ENABLED=0` in that script, so only `main` deploys); set it to `1` to turn them back on.

### Rules for production

- Env vars and secrets are set **only** in the Vercel and Render dashboards. Never copy them into the repo `.env` or commit them. Never reuse local secrets in production.
- Never run `pnpm db:migrate`, `pnpm db:reset`, or `pnpm db:seed` with `DATABASE_URL` pointing at TiDB. `migrate dev` / `reset` can drop data, and the seed overwrites content rows.
- New migrations are created locally (see [Changing the database schema](#changing-the-database-schema)) and reach production through `main`.
- `infra/mysql/init/` and `docker-compose.yml` are local-only; production never uses them.
- Before pushing: `pnpm check:all` (format, lint, typecheck, test, content, deps, build; prints only failures, `--e2e` adds E2E). The pre-push hook runs `typecheck`.

## Production-like stack on your machine

Optional. `compose.prod.yml` runs the real production images (MySQL + API + Next + Caddy + daily backups) so you can test a release locally. Only Caddy is published: open [http://localhost](http://localhost), not `:3000`. It reads the same root `.env` (`MYSQL_*`, `JWT_*`); set `WEB_ORIGIN_PROD` / `NEXT_PUBLIC_SITE_URL_PROD` if you serve it on a different origin.

```bash
pnpm prod:up                 # build images and start (API runs migrate deploy on boot)
pnpm prod:seed               # one-off: SEED_PROFILE=baseline, node dist/seed.js
pnpm prod:backup             # one-shot mysqldump + uploads tarball
scripts/backup/restore.sh    # load the newest dump into MYSQL_DATABASE (fresh DB)
pnpm prod:down               # stop; named volumes keep the data
```

Images are multi-stage, run as a non-root user with a read-only root filesystem. Caddy adds HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. Next sets a per-request CSP nonce in `proxy.ts` for `/admin` and draft mode. Restore: [docs/runbooks/restore.md](./docs/runbooks/restore.md).

## What is in git

Commit source, config, and migrations. Everything a tool can regenerate, and every secret, is ignored (see `.gitignore`):

| Ignored                                                                             | Recreated by                                                    |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.env`, `.env.*` (except `.env.example`)                                            | You, from `.env.example` (local) or the dashboards (production) |
| `node_modules/`                                                                     | `pnpm install`                                                  |
| `packages/contracts/dist/`, `apps/*/dist/`                                          | `pnpm --filter @portfolio/contracts build`, `pnpm build`        |
| `apps/api/src/generated/` (Prisma client)                                           | `pnpm install` (postinstall) or `pnpm typecheck`                |
| `apps/web/next-env.d.ts`, `.next/`                                                  | `pnpm dev`, `pnpm build`, or `pnpm typecheck` (`next typegen`)  |
| `coverage/`, `test-results/`, `playwright-report/`, `storybook-static/`, `uploads/` | Test, Storybook, and runtime output                             |
| `.vercel/`, `.DS_Store`, `*.log`                                                    | Local tooling                                                   |

When you add a new secret, add the key with a placeholder to `.env.example` and the real value to the dashboards.

## Commands

```bash
pnpm dev                     # web :3000 + api :4000 + contracts watch
pnpm check:all [--e2e]           # all pre-PR checks, failures only
pnpm lint | typecheck | test | build
pnpm format | format:check   # Prettier (format:check also runs in CI)
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:placeholders      # DATABASE_URL: no seed placeholders in live rows (T60)
pnpm check:deps              # no paid Tiptap packages; every @tiptap/* and @dnd-kit/* is MIT

pnpm db:up | db:down | db:logs   # local MySQL :3306 + Adminer :8080 (127.0.0.1)
pnpm db:test:up              # throwaway test MySQL on :3307 (API e2e)
pnpm db:migrate              # local only: create + apply migrations
pnpm db:seed                 # local only: replace content with the demo (or baseline) profile + admin
pnpm db:seed:admin           # local only: create/update the admin from ADMIN_*; content untouched
pnpm db:reset                # local only: drop + re-apply all migrations (no seed)
pnpm db:studio               # Prisma Studio GUI

pnpm prod:up | prod:seed | prod:backup | prod:down   # production-like stack
```

## Git hooks

`pnpm install` sets up [Husky](https://typicode.github.io/husky/) (v9):

- **pre-commit** — formats and lint-fixes only the files you staged
- **commit-msg** — messages must look like `chore: add hooks` or `feat(web): …` (same as PR titles)
- **pre-push** — runs `pnpm typecheck`

Beginner walkthrough: [STRUCTURE.md § Git hooks](./STRUCTURE.md#git-hooks-husky).

## Background notes

Written for a first pass at backend. Glossary: spec [§1.6](./docs/design/portfolio-design-system.md#s-1-6).

1. **Image vs container.** `mysql:8.4` is the packaged program; `docker compose up` starts a running copy of it. Tags are pinned so everyone runs the same version.
2. **Port mapping.** `127.0.0.1:3306:3306` means "port 3306 on my laptop, reachable only from my laptop, goes to port 3306 in the container". Binding to `127.0.0.1` keeps the DB off your Wi-Fi network.
3. **Volume.** `db-data` is a folder Docker keeps outside the container. `docker compose down` keeps it; `docker compose down -v` deletes it (a full reset).
4. **Init scripts.** Files in `infra/mysql/init/` run **only when the volume is first created**. `01-dev-grants.sh` lets `MYSQL_USER` create and drop databases, which Prisma's shadow database needs for `migrate dev`. That is why changing `MYSQL_*` later needs `down -v`.
5. **Healthcheck.** Compose pings MySQL until it answers; `docker compose ps` shows `healthy` when it does.
6. **ORM.** Prisma turns `schema.prisma` into SQL tables and a typed client: `prisma.profile.findUnique({ where: { id: 1 } })` instead of SQL.
7. **`migrate dev` vs `migrate deploy`.** `dev` (local) diffs the schema, writes a new migration, and may reset the DB. `deploy` (production) only applies committed migrations and never resets data.
8. **Seed.** `upsert` on unique keys makes the local seed safe to run twice. Profiles: `demo` (dev/CI) and `baseline` (production first boot).
9. **Multi-stage builds.** One stage installs and builds; the final stage copies only what runs, so images stay small.
10. **Service names as hostnames.** Inside compose, the web reaches the API at `http://api:4000`; only Caddy is exposed.
11. **Read-only root + backups.** Containers write only to volumes and `tmpfs`. `backup` runs `mysqldump | gzip` daily and keeps 7 days. A backup only counts after `scripts/backup/restore.sh` has loaded it into an empty database.
