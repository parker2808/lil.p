# CMS B4 — host-composed contracts and registry

Status: implementation proposal · 2026-11-10 · stacked on accepted B3 `814afcf` · ADR PR #172.

## Plan

1. Inventory host schemas, definition inference and registry consumers.
2. Extract generic block/page/locale/snapshot contracts to core.
3. Compose host definitions with duplicate-rejecting `createRegistry`.
4. Preserve host schema exports, allowance and route behavior.
5. Enforce package boundaries and test registry edge cases.
6. Measure gzip size, refresh Graphify and docs.
7. Run locked disposable-MySQL gates; open draft stacked PR.

## Boundary and compatibility

The coordinator accepted B3 PR #182 at `814afcf`, without merge authorization. B2–B5 may proceed alongside U because they do not freeze UI controls; B6 React extraction waits for U2/U3 and D waits for U3 design approval. B4 exports **generic** `BlockDefinition`, `defineBlock`, `createRegistry`, locale/page/block/snapshot Zod schemas and types, `LayoutPreset`, `BlockSurface`, and allowance from `@parker2808/cms-core/contracts`. The host supplies page keys for distinguishing built-in from custom pages; no portfolio-specific routes, copy, types or twenty definitions are bundled by importing core. The host's existing `@portfolio/contracts` paths and exact HTTP schemas (including finite block-type enum and uppercase/lowercase page-key mapping) stay compatible: host files re-export generic schemas when identical and specialize any host-only schemas. All twenty definitions compose one host registry from a list; duplicates throw during construction, unknown lookups stay undefined and are rejected by the existing API mapper. Role, pages, customPage, layouts, limits, defaults and locale fallback remain unchanged. B5 still owns pure engine extraction; B4 does not alter Nest/Prisma/Next behavior, DB schema, migrations or EN/VI `/help`.

## Validation and budget

Unit tests cover default migrate/refs, generic registry construction/duplicate and unknown type handling, allowed built-in/custom page matrix, and schema acceptance/rejection. Existing B1 golden HTTP tests and `pnpm check:all --e2e` run only on disposable MySQL with the shared E2E lock. `no-restricted-imports` and `scripts/check-deps.mjs` reject `@portfolio/*` and `@/modules/*` from core; React 19 and Zod 4 are peers (no new external packages). The committed B3 gzip gate enforces ≤61,440 bytes for contracts+engine, ≤35,840 bytes for React excluding peers. Record the real B4 result below; do not raise caps without coordinator approval. No visual or `/help` content change; existing EN/VI contracts remain the verification surface.

Coordination audit: explicitly declare `react`, `react-dom` (19) and `zod` (4) as both peer dependencies and local development dependencies for tests. The `tsup` build must externalize all three, and the browser measurement must reject imports not backed by a declared peer (including undeclared React DOM). Amend the B3 spec's exclusion wording to match this enforced rule. Keep the same caps and remeasure; these are manifest/measurement corrections, not new runtime dependencies or API behavior.

## Rollback and measurement

Revert the B4 commit to restore the B3 empty subpath and host-local contract definitions; no persistence or wire format changes. Measured B4 build: **864 bytes contracts+engine / 61,440-byte cap**, with `./contracts` 864 bytes, `./engine` 0 bytes; `./react` remains 34 / 35,840 bytes. Zod and React peers are external to the minified ESM browser artifact. The host specializes the generic `publicBlockSchema.type` to its existing 20-value enum; unknown types remain rejected by that host HTTP schema. The package provides `typesVersions` for the API's existing TypeScript Node resolution; otherwise its generated declarations lose core subpath types. The Nest CJS host also needs a `./contracts` require condition to resolve the same API from its compiled output. The pre-B4 scaffold test expecting every entry to be empty is updated to require only the new contracts exports.

CI's prior standalone host-contract build lacked the fresh core declarations. Build the host with its workspace dependencies (`pnpm --filter @portfolio/contracts... build`) in root typecheck and CI unit/API/web jobs so a clean checkout builds core before the host; run unit tests in dependency order so the core test's clean build cannot race with the host test's imports. No bypass or committed dist artifacts.

The sharded web E2E jobs download a tarball, not built packages from the build runner's workspace. Include `packages/cms-core/dist` alongside host contracts and app output in that existing archive; without it, all shards fail to resolve the CJS contract subpath despite a successful build job.

Local disposable-MySQL verification (macOS, Node 22, shared lock): `pnpm check:all --e2e` passed format, lint, typecheck, test, content, deps, build and API E2E; web E2E failed `public-shell-indexes.spec.ts:55` at the VI public route's axe color-contrast assertion. Axe measured foreground `#414248` on `#ff8f74` at **4.49:1**, below the 4.5:1 threshold, on three pre-existing UI controls. This visual accessibility defect is outside B4's generic contract boundary; no styles or test assertions are altered here. Full Linux PR CI must still pass and is tracked separately; do not claim the local gate passed.

Peer-audit verification: on Node 22.21.1 the package test and all seven non-E2E `check:all` stages passed; the browser sizes stayed **864 / 61,440** bytes (contracts+engine) and **34 / 35,840** bytes (React). A separate locked `check:all --e2e` attempt on isolated tmpfs MySQL passed the seven non-E2E stages but was misconfigured without `API_PORT` and `WEB_ORIGIN`: API E2E failed config validation and web E2E reported absent draft preview elements (two tests), plus the known macOS public-shell contrast issue (one test). After supplying the missing environment variables, a locked isolated API E2E rerun passed **23 files / 113 tests**. Do not attribute the preview failures to product behavior from the misconfigured run or claim the full local gate passed; Linux CI provides the complete check.
