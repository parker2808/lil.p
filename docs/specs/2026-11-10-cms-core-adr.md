# ADR: extract a reusable CMS core from lil.p

Status: **Proposed for Parker's approval** · 2026-11-10 · Base: `d0d474b` (`main`)

## Plan

1. Inventory the block registry, API/page routes, editor widgets, roles, DB models, and deploy paths on `main`.
2. Decide the core, lil.p adapter, and portfolio boundary for v1; define exports and budgets.
3. Specify the visual page builder as a separate Phase D with its storage, UX, security, and release gates.
4. Record Phase B/C gates, rollback, and distribution preview; run docs checks and request ADR approval.

## Decision

Build `@parker2808/cms-core` first as `packages/cms-core` in the pnpm monorepo. Extract reusable contracts, pure page/block policy, and host-configurable React rendering/editing. Keep Nest, Prisma, authentication, deployment, and all twenty existing block definitions in `lil.p` for v1. The package is a library loaded by `lil.p`, not a microservice. Preserve EN/VI and current `LayoutPreset`/`BlockSurface` values. Do not change the DB schema or apply migrations in Phase B. A separate private repository and package distribution are Phase C, each requiring Parker's separate approval.

Phase B preserves the current block-list behavior and contracts. The product goal is **fully dynamic page composition**: Phase D adds a visual builder in which users drag registered components into their own page layout, edit their properties, and publish without writing code. The core supplies the initial component set; host apps can register more components and provide themes. Arbitrary runtime code upload, untrusted JSX, CSS, or schema editing is outside the builder's trust model. Phase D starts only after B7 and Parker's approval of this ADR; it does not change the Phase B promise of zero migrations.

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

## Visual page builder — Phase D decision

The builder is the CMS differentiator, not a prerequisite for extracting the existing engine. Phase D introduces a **typed, versioned layout tree** and a core-owned starter component library. “Fully dynamic” means users can assemble and configure any page that the registered tree slots and component schemas allow, without a code change per page; host developers still control executable components, permissions, and design tokens.

### Model, conversion, and persistence

- The document is `{ schemaVersion, root }`. The root is a `page` node with stable opaque node IDs and ordered `section` children. A section accepts direct components or `row`/`grid`; a row accepts `column` nodes; columns and grids accept registered components. Each node has `type`, validated props, optional responsive overrides keyed by `mobile`/`tablet`/`desktop`, and declared child slots. Zod discriminated unions validate shape; the registry validates component props, allowed parent/child pairs, IDs, depth, node count, visibility, and host page policies. IDs persist through reorder, preview, publish, and restore; duplicate/copy generates fresh IDs. `schemaVersion` migrators are pure, ordered, and tested against old fixtures; unsupported future versions are rejected without rewriting data.
- **Choose an additive nullable `Page.draftTree Json?` column in Phase D**, rather than forcing a tree into one `PageBlock.props` record or introducing a node table. `PageVersion.snapshot` is already JSON: retain the legacy `{ seo, blocks }` shape and add a discriminated, versioned tree snapshot for builder pages. The existing `PageBlock` rows remain the source for legacy/fixed pages; a builder page uses `draftTree` as its draft source. One explicit page-mode rule selects the source, so API reads and publish never combine both. No migration or data rewrite occurs in Phase B. Adding `draftTree` is a **Phase D Prisma migration requiring Parker's separate approval**; test it only on disposable local MySQL, including old rows, rollback-read compatibility, and TiDB compatibility before any deployment decision.
- Provide a pure block-list-to-tree converter for previews and opt-in adoption: wrap each old block as one section with a registered legacy-component node, preserving order, key, type, props, visibility, layout, surface, and block schema version. Use stable IDs derived from the existing block IDs/keys. Do not silently persist the converted tree or delete `PageBlock` rows; unknown block types remain lossless data with an editor warning. Portfolio Home/Hero and other fixed-page rules remain host policies and continue on the legacy path. Builder-made dynamic pages coexist with them. Reverting D2 must leave old pages readable; once a tree page is published, rollback to a pre-D binary requires an explicitly tested compatibility/recovery plan, not an assumed single-PR revert.
- Save drafts with an optimistic revision check (the existing `Page.updatedAt` can serve as the initial compare-and-swap token); stale writes return a conflict rather than overwriting another editor. Publish validates the entire tree and creates the version snapshot plus published pointer in the existing single transaction. Restore returns a tree snapshot to the draft tree or a legacy snapshot to `PageBlock`, according to its format. Retain old routes and golden responses for legacy pages; add explicit builder routes/contracts with independently tested auth and error codes.

### Components, editing, and rendering

- Core starter library: section/container, row/column, and grid primitives; heading, paragraph/rich text, image, button/CTA, divider, and spacer content components. Each has a Zod prop schema, defaults, allowed slots, accessible renderer, and schema-driven property controls. Host apps supply design tokens/theme, locale messages, media resolution, and optional component registrations; portfolio collections, Hero-on-Home, and project/domain widgets remain in `lil.p`. Responsive props override a shared base at `mobile`/`tablet`/`desktop`, with explicit merge rules and bounded token choices. Avoid arbitrary CSS or script fields.
- Editor flow: drag from a categorized palette, reorder or nest only into valid slots, select a node inline, edit it in a properties panel, copy/duplicate with fresh IDs and limits, undo/redo local transactions, autosave the draft with debounce and revision conflict handling, preview, then publish through the existing snapshot/version workflow. Undo history resets only after a confirmed save/version boundary; failed autosaves retain the editable state and expose retry. Empty canvas gives a keyboard-accessible insertion action. Persisted order comes from the tree, not DOM position.
- Use the existing `@dnd-kit/*` dependency in `packages/ui` for mouse and keyboard sensors; confirm the installed MIT licenses before moving any dependency into core, and obtain Parker's approval for any new dependency. Announce picked-up node, valid destination, move, and cancellation to screen readers; provide a keyboard-only palette/insertion/reorder path, visible focus rings, 44px editor targets, and EN/VI labels. Test WCAG AA contrast and semantic heading order in both editor and published output.
- Share one registered tree renderer between authenticated preview and public output. Public pages render server-side through RSC, resolve only approved components/assets, and hydrate only components needing interaction. Lazy-load canvas, drag/drop, and property controls on admin routes. At D3 measure a standalone starter-page baseline and set a public JS budget of **zero builder/editor bytes**; keep the B3 core subpath budgets for existing consumers and record any approved revision before shipping. Compare preview and SSR output at 1440/390, light/dark, EN/VI.
- Reject unregistered types, illegal nesting, oversized/deep trees, invalid responsive values, unsafe URLs, and unsanitized rich text on the server at save **and** publish. Never execute JS/HTML from DB JSON. Check authorization for create, read draft, mutate, preview, publish, and restore separately using host capabilities; sanitize rich text and restrict media to the host resolver. Log validation failures without leaking content or credentials.

### Phase D sequence and acceptance

1. **D1** contracts, tree migrators, block-list converter, fixtures, and limits; no persistence change.
2. **D2** separately approved additive draft storage, builder API, server validation, transactional publish/restore, and disposable-MySQL migration tests. Do not start the migration without Parker's explicit approval.
3. **D3** shared tree renderer in server/public preview paths, component starter set, tokens, and Linux visual baselines.
4. **D4** admin canvas, palette, valid-slot drag/drop, keyboard path, announcements, and a11y tests.
5. **D5** properties panel, responsive props, copy/duplicate limits, undo/redo, autosave, and conflict recovery.
6. **D6** end-to-end creation from an empty canvas by mouse **and** keyboard in EN/VI; publish, SSR/preview visual parity, invalid-tree rejection, restore, and legacy golden regression.

Each D item is one branch/worktree/PR with a spec before coding, ≤20-line plan, Graphify update after code, root/scoped README and EN/VI help parity where affected, `PROJECT_CONTEXT.md` §7/§9, lessons, `pnpm check:all --e2e` for UI/API, and Parker's separate merge approval. The release gate is a complete empty-canvas → drag/drop and properties → preview → publish → public SSR → restore journey with mouse and keyboard, EN/VI and responsive visual baselines; existing fixed pages and golden contracts must remain unchanged. No paid service is required. Migration, new dependency, secrets, deployment, and production rollback are separate approval points.

## Phases and gates

1. **A (independent):** A0 narrow private-repo naming exception; this ADR (A1); A2 duplicate-block limit 409 `BLOCK_LIMIT`; A3 localized EN/VI widget labels and accessibility. A2/A3 get their own code PRs and `pnpm check:all --e2e`.
2. **B (after Parker approves this ADR):** B1 golden HTTP contracts → B2 one allowance source → B3 package skeleton/exports/bundle measurement → B4 contracts/registry → B5 pure engine and ports; B6 React extraction can run alongside B5 after B4 → B7 standalone neutral fixture. Each is a separate branch/PR, preserves goldens, runs `pnpm check:all` plus `--e2e` for UI/API changes, updates root/scoped README, `PROJECT_CONTEXT.md` §7/§9 and lessons, then waits for Parker's merge approval.
3. **C (each step separately approved):** C1 distribution ADR selects GitHub Packages (preferred preview) or a Git dependency pinned by SHA and documents per-environment auth; C2 creates the private repo from `packages/cms-core` with history, CI, changelog and `v0.1.0`; C3 replaces `workspace:*` with a pinned package and lockfile. No repo creation, secret setup, merge or deployment is authorized by this ADR.
4. **D (after B7 and ADR approval):** D1 tree contract/converter → D2 separately approved storage/API → D3 renderer → D4 canvas/drag/drop → D5 properties/autosave → D6 end-to-end journey. C may choose distribution independently; D must not require the private repository to exist first.

### Deployment checks for C3

CI must authenticate before frozen install for trusted jobs; fork PR jobs receive no credential and may fail. GitHub Packages avoids requiring `git` in the current `node:22-alpine` Docker image. The API Docker deps stage must copy the package manifest, and `pnpm --filter @portfolio/api deploy --prod --legacy` must include the core and boot without credentials. Vercel's private registry config belongs in its secret environment configuration, and `scripts/vercel-ignore-build.sh` must rebuild on package or lockfile-only changes. Render needs the same trusted package access, and its build filters must include package/manifest/lockfile changes. Keep any secret file out of the Docker build context. Confirm `apps/api/docker-entrypoint.sh` would run `prisma migrate deploy` and that C3 adds zero migrations before any deploy. These are design checks, not verified deployment results.

## Rollback and evidence

Each Phase B PR can be reverted independently because it changes no DB schema or public API contract; the golden suite and visual/e2e baselines detect drift. C3 can revert the pinned package to `workspace:*` with its lockfile in a separate PR. D1/D3–D6 are gated by the legacy regression suite; D2 has a separately approved additive migration and a tested legacy read path, while published tree content needs its own rollback/recovery review. Production rollback, migration rollback, or deployment remains a separately approved action. This ADR inventories `d0d474b`; Graphify was regenerated in code-only mode because no semantic-extraction API key was available, so docs/images were inspected directly rather than indexed.
