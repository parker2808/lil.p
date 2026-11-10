# B5 — pure page engine and host ports

Status: implementation spec, stacked on accepted B4 `8c448ea` (draft PR #185); no merge or deployment. This supersedes the stale B4 note in the B5 draft (`docs/cms-prep-nonE2E:docs/specs/2026-11-10-cms-core-b5-engine-draft.md`): **all three subpaths already expose tested ESM and CJS**, and B4 measures **864 B contracts+engine / 60 KiB** and **34 B React / 35 KiB**. The ADR (`docs/cms-core-adr:docs/specs/2026-11-10-cms-core-adr.md`) governs the extraction; B2–B5 can proceed alongside the U gate because no UI controls are frozen into core. B6 owns React in parallel, and D waits for B7.

## Plan (8 steps)

1. Confirm accepted B4 registry and B1 HTTP invariants.
2. Freeze policy and legacy snapshot edge cases in fixtures.
3. Extract registry-injected block policy and ordering.
4. Add explicit unknown-safe snapshot and version handling.
5. Define typed host repository, auth and effects ports.
6. Smoke-test built CJS before any Nest adapter wiring.
7. Run package, API, goldens and bundle gates.
8. Refresh Graphify, docs and rollback evidence.

## Boundary and compatibility

`./engine` exports pure, registry-injected policy findings (allowance, layout, limit, role/H1, key and ordering) and immutable snapshot construction/strict reading with explicit unsupported type/version refusal. No implicit side effects, Nest, Prisma, Next, portfolio imports or host definitions. Port interfaces describe transaction-scoped repositories, host authorization and optional media/audit/cache effects; the host still owns exactly one Prisma transaction per publish and post-commit invalidation. Existing API exceptions/statuses (`BLOCK_NOT_ALLOWED`, `BLOCK_LIMIT`, `BLOCK_LOCKED`, `BLOCK_REQUIRED`, `VALIDATION_FAILED`), block-list ordering, snapshots and EN/VI HTTP shapes remain fixed. Do not silently discard unknown blocks or future versions. Old persisted JSON is neither rewritten nor migrated.

B5 owns `packages/cms-core/src/engine/**`, `engine.ts` and named `apps/api/src/modules/pages/**` adapters/tests only. Do not edit B6 React/web files, contracts, manifests, lockfile, measurement script, Dockerfile, migrations or B1 goldens. Direct Nest consumption would require declaring core in `apps/api/package.json`, which is shared-file ownership: **do not wire the runtime adapter without that approved dependency**. The API Docker core build is a separate branch. Built CJS smoke is necessary but not sufficient for a deploy-ready adapter. Unit/HTTP goldens remain the host regression gate, not a reason to change contract expectations.

## Verification and rollback

Test unknown/duplicate type handling, allowance, layout/limits/H1, deterministic ordering and unique keys, immutable strict snapshots, migration chains (including legacy v0) and future-version refusal; verify both ESM and CJS exports. Run `pnpm check:all --e2e` only under `~/.t3/locks/lilp-e2e.lock` with disposable MySQL and release even on failure; do not stop other threads' processes. Re-measure against unchanged 60/35 KiB caps and report actual numbers. Revert only B5 engine/adapter changes to B4 if needed; no down migration, golden update, data rewrite or published pointer change. Record out-of-scope packaging/SEO issues for their owners.

Implementation evidence (Node 22.21.1, tsup 8.5.1): package build and 10 package tests pass, including the built ESM/CJS consumer smoke; B5 contracts+engine measures **2,272 / 61,440 bytes gzip** and React **34 / 35,840 bytes gzip**. `pnpm check:all --e2e` passed all nine stages on disposable tmpfs MySQL with the shared lock and explicit test ports/origin; the container and lock were released after the run. The Nest adapter is intentionally not connected because `apps/api/package.json` lacks a direct production dependency on core; changing it or the lockfile is forbidden in this worktree. The existing API behavior remains untouched; a future approved integration must separately prove deploy-time resolution and HTTP parity.
