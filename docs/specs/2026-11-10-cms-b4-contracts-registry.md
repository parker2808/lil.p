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

## Main integration plan (2026-11-11)

1. Retain B4's host-composed registry and B2's exact page-allowance behavior.
2. Keep B3's 60/35 KiB gzip caps; retain B4's stricter peer checks and ESM/CJS exports.
3. Preserve both histories in docs; regenerate Graphify and frozen-install the lockfile.
4. Run export/budget tests and `check:all`; rely on final-head CI for E2E.
5. Record conflict resolutions in this spec and the PR for independent review.

Integration resolution: B3's empty scaffold and B4's extracted contracts overlapped in `packages/cms-core` and the host block utility. Keep B4's generic Zod contracts, duplicate-rejecting registry and adapter so B2's built-in/custom allowance and the 20 host definitions stay intact. Retain the B3 60/35 KiB gzip caps and artifact measurement, layering B4's peer-manifest gate and CJS exports/tests on top. Combine the B3 and B4 documentation histories, regenerate the graph from the merged tree, and resolve the lockfile through pnpm. B1's HTTP golden expectations are not changed by this integration.

## Boundary and compatibility

The coordinator accepted B3 PR #182 at `814afcf`, without merge authorization. U2/U3 are accepted on separate unmerged branches. B2–B5 may proceed alongside U because they do not freeze UI controls; B6 React extraction follows B4 approval and D follows B7. B4 exports **generic** `BlockDefinition`, `defineBlock`, `createRegistry`, locale/page/block/snapshot Zod schemas and types, `LayoutPreset`, `BlockSurface`, and allowance from `@parker2808/cms-core/contracts`. The host supplies page keys for distinguishing built-in from custom pages; no portfolio-specific routes, copy, types or twenty definitions are bundled by importing core. The host's existing `@portfolio/contracts` paths and exact HTTP schemas (including finite block-type enum and uppercase/lowercase page-key mapping) stay compatible: host files re-export generic schemas when identical and specialize any host-only schemas. All twenty definitions compose one host registry from a list; duplicates throw during construction, unknown lookups stay undefined and are rejected by the existing API mapper. Role, pages, customPage, layouts, limits, defaults and locale fallback remain unchanged. B5 still owns pure engine extraction; B4 does not alter Nest/Prisma/Next behavior, DB schema, migrations or the admin table Shortcuts dialog (there is no `/help` route).

## Validation and budget

Pre-review amendment: publish a tested CommonJS `require` condition for every `./contracts`, `./engine` and `./react` subpath (Nest consumes the CJS build). Extend the dependency boundary check to reject side-effect imports and re-exports of host modules as well as named imports, and prove a core-only import does not load the host's twenty block definitions. These are package metadata and test-only boundary hardening; no API or persistence changes. Update documentation to reflect accepted B3 and U2/U3 (on unmerged branches), the separate VI-only SEO fix in PR #186 awaiting its B1 golden update, and B6 after B4 approval/D after B7. There is no `/help` route: the relevant UI is the admin table Shortcuts dialog. Retain the existing ≤60/35 KiB caps, rerun the locked disposable-MySQL gate, and record CI and any local-only failures without altering unrelated behavior.

Unit tests cover default migrate/refs, generic registry construction/duplicate and unknown type handling, allowed built-in/custom page matrix, and schema acceptance/rejection. Existing B1 golden HTTP tests and `pnpm check:all --e2e` run only on disposable MySQL with the shared E2E lock. `no-restricted-imports` and `scripts/check-deps.mjs` reject `@portfolio/*` and `@/modules/*` from core, including side-effect imports and re-exports; React 19, React DOM 19 and Zod 4 are peers (no new external packages). The committed B3 gzip gate enforces ≤61,440 bytes for contracts+engine, ≤35,840 bytes for React excluding peers. Record the real B4 result below; do not raise caps without coordinator approval. No visual or admin table Shortcuts dialog change; existing EN/VI contracts remain the verification surface.

Coordination audit: explicitly declare `react`, `react-dom` (19) and `zod` (4) as both peer dependencies and local development dependencies for tests. The `tsup` build must externalize all three, and the browser measurement must reject imports not backed by a declared peer (including undeclared React DOM). Amend the B3 spec's exclusion wording to match this enforced rule. Keep the same caps and remeasure; these are manifest/measurement corrections, not new runtime dependencies or API behavior.

## Rollback and measurement

Revert the B4 commit to restore the B3 empty subpath and host-local contract definitions; no persistence or wire format changes. Measured B4 build: **864 bytes contracts+engine / 61,440-byte cap**, with `./contracts` 864 bytes, `./engine` 0 bytes; `./react` remains 34 / 35,840 bytes. Zod and React/React DOM peers are external to the minified ESM browser artifact. The host specializes the generic `publicBlockSchema.type` to its existing 20-value enum; unknown types remain rejected by that host HTTP schema. The package provides `typesVersions` for the API's existing TypeScript Node resolution; otherwise its generated declarations lose core subpath types. Each subpath has a tested `require` condition to resolve its CJS build from the compiled Nest host. The pre-B4 scaffold test expecting every entry to be empty is updated to require only the new contracts exports. The VI-only custom-page SEO fallback is fixed separately in PR #186; the B1 golden will change when stacked, not in B4.

CI's prior standalone host-contract build lacked the fresh core declarations. Build the host with its workspace dependencies (`pnpm --filter @portfolio/contracts... build`) in root typecheck and CI unit/API/web jobs so a clean checkout builds core before the host; run unit tests in dependency order so the core test's clean build cannot race with the host test's imports. No bypass or committed dist artifacts.

The sharded web E2E jobs download a tarball, not built packages from the build runner's workspace. Include `packages/cms-core/dist` alongside host contracts and app output in that existing archive; without it, all shards fail to resolve the CJS contract subpath despite a successful build job.

Local disposable-MySQL verification (macOS, Node 22, shared lock): `pnpm check:all --e2e` passed format, lint, typecheck, test, content, deps, build and API E2E; web E2E failed `public-shell-indexes.spec.ts:55` at the VI public route's axe color-contrast assertion. Axe measured foreground `#414248` on `#ff8f74` at **4.49:1**, below the 4.5:1 threshold, on three pre-existing UI controls. This visual accessibility defect is outside B4's generic contract boundary; no styles or test assertions are altered here. Full Linux PR CI must still pass and is tracked separately; do not claim the local gate passed.

Peer-audit verification: on Node 22.21.1 the package test and all seven non-E2E `check:all` stages passed; the browser sizes stayed **864 / 61,440** bytes (contracts+engine) and **34 / 35,840** bytes (React). A separate locked `check:all --e2e` attempt on isolated tmpfs MySQL passed the seven non-E2E stages but was misconfigured without `API_PORT` and `WEB_ORIGIN`: API E2E failed config validation and web E2E reported absent draft preview elements (two tests), plus the known macOS public-shell contrast issue (one test). After supplying the missing environment variables, a locked isolated API E2E rerun passed **23 files / 113 tests**. Do not attribute the preview failures to product behavior from the misconfigured run or claim the full local gate passed; Linux CI provides the complete check.

Pre-review gate (2026-11-11, Node 22, disposable tmpfs MySQL, shared lock, explicit `API_PORT` and `WEB_ORIGIN`): `pnpm check:all --e2e` passed format, lint, typecheck, test, content, deps, build and API E2E. Only web E2E failed at `public-shell-indexes.spec.ts:73` in the existing EN/VI shell color-contrast assertion: axe measured **4.36:1** for `#3f4046` on `#fa896e` versus the required 4.5:1 on three controls. No UI/test changes are in B4; the full local gate is not green. Verify the new PR head independently on Linux CI.
