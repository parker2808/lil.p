# ADR: extract a reusable CMS core from lil.p

Status: **Proposed for Parker's approval** · 2026-11-10 · Base: `d0d474b` (`main`)

## Plan

1. Inventory the block registry, API/page routes, editor widgets, roles, DB models, and deploy paths on `main`.
2. Decide the core, lil.p adapter, and portfolio boundary for v1; define exports and budgets.
3. Record Phase B/C gates, rollback, and distribution preview; run docs checks and request ADR approval.

## Decision

Build `@parker2808/cms-core` first as `packages/cms-core` in the pnpm monorepo. Extract reusable contracts, pure page/block policy, and host-configurable React rendering/editing. Keep Nest, Prisma, authentication, deployment, and all twenty existing block definitions in `lil.p` for v1. The package is a library loaded by `lil.p`, not a microservice. Preserve EN/VI and current `LayoutPreset`/`BlockSurface` values. Do not change the DB schema or apply migrations in Phase B. A separate private repository and package distribution are Phase C, each requiring Parker's separate approval.

"Dynamic" means an administrator can compose, order, configure, hide, preview, publish, and restore registered blocks without code edits. A developer can register new components, widgets, page rules, and layouts through code. Arbitrary runtime code upload, untrusted JSX, CSS, or schema editing is outside v1; allowing those would need a separate trust and migration design.

## Current boundary and proposed ownership

| Concern           | Reusable core                                                                                                     | `lil.p` adapter                                                                             | Portfolio-specific data/rules                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Block contract    | `defineBlock`, Zod props/defaults/version, role, layout/surface, limit, `allowedOn(pageKey)`, migration/ref hooks | Compose `createRegistry(defs)` from app definitions                                         | All 20 existing definitions, their default copy, referenced collection types |
| Page engine       | Order/key/limit/H1 checks, validation, snapshot construction, unknown-block preservation                          | Map errors to HTTP, start one Prisma transaction, authorize, audit and invalidate cache     | Home Hero, custom-page prose requirement, built-in page keys/routes          |
| Admin UI          | Headless/host-styled `BlockRenderer`, `SchemaForm`, scalar/array/localized widget contracts                       | `next-intl` messages, `@portfolio/ui` wrappers, route/page editor and preview integration   | Project/stats/domain pickers, editorial labels, brand styles                 |
| Persistence       | `PageRepository`/transaction boundary interfaces and snapshot types                                               | Prisma `Page`, `PageBlock`, `PageVersion`; Nest services/controllers                        | Portfolio collections and seed records                                       |
| Access/operations | `AuthorizationPolicy` interface; optional `MediaResolver`, `AuditWriter`, `CacheInvalidator` ports                | JWT guards, `admin`/`user` mapping, Cloudinary, audit service, Next cache, CI/Vercel/Render | Owner accounts, content workflow and deployment configuration                |

The current `BlockDefinition.pages` is tied to the built-in page keys. B2 makes that policy explicit with `allowedOn(pageKey)` or a `customPage` flag. Both API `pages-rules.util.ts` and web `AddBlockDialog.tsx` currently repeat the custom-page allowlist `page-header`, `prose`, `cta-band`; that duplication ends before extraction. `createRegistry` must reject duplicate `type` values at construction. The package must reject imports of `@portfolio/*` and `@/modules/*`.

## Block inventory (all 20 current definitions)

Every row below is an existing `packages/contracts/src/blocks/definitions/*` definition. "Candidate default" is a future reusable example, **not** a Phase B move; v1 keeps the definition and renderer in `lil.p`. `h1` and `required` are current registry roles, not new authorization roles.

| Type               | Current page keys                             | Role     | v1 owner  | Future default candidate                    |
| ------------------ | --------------------------------------------- | -------- | --------- | ------------------------------------------- |
| `hero`             | home                                          | h1       | Portfolio | Hero section shell                          |
| `page-header`      | projects, notes; custom by separate rule      | h1       | Portfolio | Page heading                                |
| `cta-band`         | home, about, projects, notes, contact; custom | optional | Portfolio | CTA section                                 |
| `stat-band`        | home, about                                   | optional | Portfolio | Numeric band shell                          |
| `tech-marquee`     | home, about                                   | optional | Portfolio | Marquee shell                               |
| `featured-case`    | home                                          | optional | Portfolio | No, case data is domain-specific            |
| `domain-grid`      | home, projects                                | optional | Portfolio | No, domain data is specific                 |
| `case-grid`        | home, about                                   | optional | Portfolio | No, case data is specific                   |
| `process`          | home                                          | optional | Portfolio | Process section shell                       |
| `skill-groups`     | home, about                                   | optional | Portfolio | No, skill data is specific                  |
| `post-list`        | home, about, projects, contact                | optional | Portfolio | No, post collection is specific             |
| `about-intro`      | about                                         | h1       | Portfolio | No, profile semantics are specific          |
| `timeline`         | about                                         | optional | Portfolio | Timeline shell                              |
| `principle-list`   | about, home                                   | optional | Portfolio | List shell                                  |
| `education-list`   | about                                         | optional | Portfolio | No, education data is specific              |
| `cv-download`      | about, contact                                | optional | Portfolio | No, CV action is specific                   |
| `prose`            | home, about, projects, notes, contact; custom | optional | Portfolio | Rich text section                           |
| `projects-browser` | projects                                      | required | Portfolio | No, project collection is specific          |
| `notes-browser`    | notes                                         | required | Portfolio | No, note collection is specific             |
| `contact-form`     | contact                                       | h1       | Portfolio | Form shell only; submission stays app-owned |

The current renderer mapping is in `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`. Phase B moves only its generic dispatch contract; registrations and domain renderers remain in the app. The `maxPerPage` values remain definition data, enforced by core policy and API mapping.

## Routes, widgets, roles

| Surface                 | Current routes                                                                                                                                                                                                 | v1 boundary                                                                                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS pages               | `/admin/pages`, `/admin/pages/[key]`, public `/{locale}/[key]` catch-all, built-in `/{locale}` and about/projects/notes/contact                                                                                | Host routes remain in Next; core handles page/block model and editor primitives only. Preserve reserved slugs and EN/VI behavior.                                      |
| Page API                | `/api/admin/pages`, `/:key`, `/:key/blocks`, `/:key/blocks/order`, `/:key/blocks/:id`, `/:id/duplicate`, `/:key/publish`, `/:key/versions`, `/:version/restore`, `/:key/discard`, and `/api/public/pages/:key` | Controllers and HTTP error/status mapping remain Nest; core receives repository and policy adapters. Contract tests freeze these responses.                            |
| Other admin collections | projects, posts, experience, media, users, inbox, site, profile, stats, skills, domains, education, principles, process, tags, analytics, audit                                                                | Stay in `lil.p`; no generic collection CRUD in v1.                                                                                                                     |
| Editor widgets          | scalar, array, localized EN/VI; project/stats/domain selection within host UI                                                                                                                                  | Generic field model and registration interface in core; domain pickers and `next-intl` in app. Labels and accessible names supplied by host.                           |
| Access                  | `admin`, `user` JWT roles; page reads allow both, page mutations use the controller's stricter guard                                                                                                           | `AuthorizationPolicy` maps host actors/capabilities; package does not own identities or a universal role enum. Keep current routes/scopes/flags and permission checks. |

The route table groups paths for architecture; B1 must capture exact route methods, statuses, error codes, preview behavior, and restore semantics from HTTP tests before any moves. No route or permission change is authorized by this ADR.

## Package API and dependency limits

- `./contracts`: `BlockDefinition`, `defineBlock`, `createRegistry`, registry/locale/page/block/snapshot types, `LayoutPreset`, `BlockSurface` and Zod contracts. The registry is supplied by the host; importing the package alone does not load portfolio definitions.
- `./engine`: pure validation/order/limit/H1/version migration/snapshot functions plus `PageRepository`, `AuthorizationPolicy` and optional side-effect ports. No Nest/Prisma/Next imports and no hidden database calls.
- `./react`: `BlockRenderer`, `SchemaForm`, widget registry and editor metadata contracts. Host passes messages, renderers, capabilities, and style hooks. Preserve `"use client"` in the built client entry. React 19 and Zod 4 are peers; the UI must support keyboard and screen-reader names in both locales.
- Enforce the import boundary with ESLint `no-restricted-imports`, `scripts/check-deps.mjs`, package build/typecheck, and a standalone fixture importing no `@portfolio/*`.
- **Proposed budget:** initial core code at most 60 KiB gzip for the combined `./contracts` + `./engine` browser-importable surface and at most 35 KiB gzip for `./react` before React/Zod peers; measure with a reproducible build script at B3 and record actual baseline. Split subpaths to keep API-only code out of public bundles. Parker may revise these provisional caps before B3.

## FE, BE, DB acceptance

- **FE:** Keep existing EN/VI, light/dark and 1440/390 Linux visual baselines. Unknown block types retain serialized data and show a warning in admin. Host registration can replace renderer/widget presentation without changing saved props; no arbitrary runtime code execution.
- **BE:** B1 golden tests cover admin/public pages, publish, preview, restore and stable error codes. B2 unifies page allowance; B5 extracts pure policy with one Prisma transaction per publish. Authorization, audit, cache invalidation and HTTP adapters stay in Nest. No API contract or permissions drift.
- **DB:** Retain current `Page`, `PageBlock`, `PageVersion` tables and existing enum values. `PageBlock.type` remains a string and `props`/snapshots remain JSON. Schema versions are interpreted by registered migrations; unknown versions/types are preserved or refused safely, never silently discarded. No migration in v1. Any future schema change needs a separate design and disposable local MySQL gate.

## Phases and gates

1. **A (independent):** A0 narrow private-repo naming exception; this ADR (A1); A2 duplicate-block limit 409 `BLOCK_LIMIT`; A3 localized EN/VI widget labels and accessibility. A2/A3 get their own code PRs and `pnpm check:all --e2e`.
2. **B (after Parker approves this ADR):** B1 golden HTTP contracts → B2 one allowance source → B3 package skeleton/exports/bundle measurement → B4 contracts/registry → B5 pure engine and ports; B6 React extraction can run alongside B5 after B4 → B7 standalone neutral fixture. Each is a separate branch/PR, preserves goldens, runs `pnpm check:all` plus `--e2e` for UI/API changes, updates root/scoped README, `PROJECT_CONTEXT.md` §7/§9 and lessons, then waits for Parker's merge approval.
3. **C (each step separately approved):** C1 distribution ADR selects GitHub Packages (preferred preview) or a Git dependency pinned by SHA and documents per-environment auth; C2 creates the private repo from `packages/cms-core` with history, CI, changelog and `v0.1.0`; C3 replaces `workspace:*` with a pinned package and lockfile. No repo creation, secret setup, merge or deployment is authorized by this ADR.

### Deployment checks for C3

CI must authenticate before frozen install for trusted jobs; fork PR jobs receive no credential and may fail. GitHub Packages avoids requiring `git` in the current `node:22-alpine` Docker image. The API Docker deps stage must copy the package manifest, and `pnpm --filter @portfolio/api deploy --prod --legacy` must include the core and boot without credentials. Vercel's private registry config belongs in its secret environment configuration, and `scripts/vercel-ignore-build.sh` must rebuild on package or lockfile-only changes. Render needs the same trusted package access, and its build filters must include package/manifest/lockfile changes. Keep any secret file out of the Docker build context. Confirm `apps/api/docker-entrypoint.sh` would run `prisma migrate deploy` and that C3 adds zero migrations before any deploy. These are design checks, not verified deployment results.

## Rollback and evidence

Each Phase B PR can be reverted independently because it changes no DB schema or public API contract; the golden suite and visual/e2e baselines detect drift. C3 can revert the pinned package to `workspace:*` with its lockfile in a separate PR. Production rollback, migration rollback, or deployment remains a separately approved action. This ADR inventories `d0d474b`; Graphify was regenerated in code-only mode because no semantic-extraction API key was available, so docs/images were inspected directly rather than indexed.
