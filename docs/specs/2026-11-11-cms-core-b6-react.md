# B6 — host-configurable React extraction

**Status: implementation approved; B6 owns server topology and web dependency (2026-11-11 ICT).** Baseline: accepted B4 `8c448ea2`, alongside the B6 draft (`docs/specs/2026-11-10-cms-core-b6-react-draft.md` on `docs/cms-prep-nonE2E`), the CMS-core ADR on `docs/cms-core-adr`, and accepted U3 design on `feat/cms-u3-builder-design`. This branch does not implement a builder, persist changes, or change the database.

## Plan

1. Verify B4 exports and source renderer boundaries.
2. Resolve server-safe and client-only entry topology.
3. Freeze server and client behavior with tests.
4. Extract generic rendering with host-supplied adapters.
5. Extract schema fields and widget contracts.
6. Verify localized keyboard and accessible behaviors.
7. Recheck neutral tokens, SSR, and bundle caps.
8. Refresh Graphify and required project documentation.
9. Run locked E2E and visual gates.
10. Push a draft PR after all gates pass.

## Verified B4 surface and blocking decision

At `8c448ea2`, `packages/cms-core/package.json` exports exactly `./contracts`, `./engine`, and `./react`. `tsup.config.ts` builds exactly those three entries. `src/react.ts` begins with `'use client'` and exports no values; `src/contracts.ts` contains generic Zod schemas, `BlockDefinition`, `defineBlock`, `createRegistry`, and `isBlockAllowedOnPage`. The host retains its 20 portfolio definitions. No server-safe core React subpath exists.

`apps/web/src/modules/blocks/views/BlocksPage.tsx` is a server component: it resolves async block content before rendering the public `BlockRenderer`, including a complete no-JavaScript initial document. Making that renderer import `@parker2808/cms-core/react` would cross the client boundary and risk hydration, streamed fallback, and public-chunk regressions. Importing the source by a private filesystem path would bypass the published package's exports and would not give a standalone consumer a server entry. Exporting the renderer from `./contracts` would mix React into the portable contracts entry. A server-safe React entry therefore needs a separate public export and build entry, while `./react` keeps its literal built `'use client'` directive for interactive form/widget exports.

**Approved resolution:** B6 adds `./react/server` to the package exports (types, import and require) and the tsup build entries. B5 will not edit these files. The measuring script includes the new entry within the existing combined 35 KiB React cap, without changing either existing cap. The built ESM and CJS `./react` entries retain a top-level `'use client'` directive; neither built server entry contains one, imports client hooks or pulls in inspector, widgets, or SchemaForm. B6 extracts host-configurable renderer dispatch into the server-only entry and schema/widget mechanics into `./react`, with no core dependency on Next, next-intl, `@portfolio/ui`, or app aliases. The host continues to supply its wrappers, block map, localized names, capabilities, and orange/green token overrides; the core default is neutral.

**Host dependency decision (2026-11-11 ICT):** coordinator authorized B6 to add `@parker2808/cms-core: workspace:*` to `apps/web/package.json`, update only the `apps/web` importer in `pnpm-lock.yaml` with Node 22 pnpm install, and change only the stale empty-React assertion in `packages/cms-core/test/exports.test.mjs`. The resulting lockfile diff is one three-line web importer addition. Sibling B5 PR #189 (`2de602e`, later `acfb18c` on `feat/cms-b5-engine`) adds the same dependency to the API importer and edits the same export test; **integration must rerun pnpm install to reconcile the two importer hunks and the test overlap**. B6 does not edit B5's engine assertion. `apps/web/Dockerfile` had no core manifest before its frozen install and built only contracts before web; B6 copies the core manifest and builds `@portfolio/web^...` (verified to select contracts, UI and CMS core) before web. Root `pnpm build` and the CI setup/build jobs already build the dependency closure; `vercel.json` does not define its own install/build override. The B6-specific export tests remain in a new file.

## Boundary evidence (Node 22)

- `packages/cms-core/test/react-exports.test.mjs` imports and requires all four built subpaths. It asserts that ESM and CJS client outputs start with `use client`, while both `./react/server` outputs lack that directive, `SchemaForm`, widget imports and client hooks; server dispatch and locale-supplied form controls are exercised independently.
- The public `apps/web/src/modules/blocks/components/BlockRenderer/BlockRenderer.tsx` imports only `@parker2808/cms-core/react/server`. Its renderers, boundaries, unknown-block notice and translated labels remain host-supplied. After a production web build, searching the public server route directory (`.next/server/app/[locale]`) and static chunk directory (`.next/static/chunks`) for `SchemaFieldControl`, `LocalizedWidget` and `BlockInspector` found **zero** matching files in each; the client form entry remains confined to the admin adapter.
- The combined React output measures **1,645/35,840 bytes gzip** (`./react`: 1,198; `./react/server`: 447). The contracts+engine output measures **864/61,440 bytes gzip**. Neither cap changed. B1 goldens and public route snapshots remain unchanged.
- Local `pnpm check:all` passed 7/7 on Node 22. `bash scripts/r3-12-e2e-gate.sh` passed the full `pnpm check:all --e2e` **9/9** with an isolated tmpfs MySQL 8.4 database while holding `~/.t3/locks/lilp-e2e.lock`; the lock was released on exit. The web E2E suite includes axe/a11y checks and visual tests; pixel baselines intentionally skip on macOS and run in Linux CI. No golden or screenshot was rewritten.

## Gates after integration

Keep public and preview SSR/markup and B1 goldens unchanged; unknown blocks remain draft-only. Verify EN/VI accessible names and keyboard behavior, light/dark at 1440/390, and no editor/widget modules in the server/public import graph. Preserve the built client directive and the combined 35 KiB gzip React cap. Run Graphify, documentation, unit and full `pnpm check:all --e2e` under the shared E2E lock. Draft PR against `feat/cms-b4-contracts-registry`; no merge.
