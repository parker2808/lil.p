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

## Rollback and measurement

Revert the B4 commit to restore the B3 empty subpath and host-local contract definitions; no persistence or wire format changes. Measured B4 build: **864 bytes contracts+engine / 61,440-byte cap**, with `./contracts` 864 bytes, `./engine` 0 bytes; `./react` remains 34 / 35,840 bytes. Zod and React peers are external to the minified ESM browser artifact. The host specializes the generic `publicBlockSchema.type` to its existing 20-value enum; unknown types remain rejected by that host HTTP schema. The package provides `typesVersions` for the API's existing TypeScript Node resolution; otherwise its generated declarations lose core subpath types. The Nest CJS host also needs a `./contracts` require condition to resolve the same API from its compiled output. The pre-B4 scaffold test expecting every entry to be empty is updated to require only the new contracts exports.
