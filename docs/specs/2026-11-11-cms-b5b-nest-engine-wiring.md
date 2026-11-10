# B5b — Nest page adapters for the pure engine

Status: stacked on accepted B5 draft PR #190 at `acfb18c` (replacement CI run `42869155118`, all 15 checks green). Merge prerequisite: accepted #189 `2de602e` contributes the direct API production dependency, lockfile, Docker/Render build order and CJS smoke. The merge commit `066e12b` retained **both** sides of README and PROJECT_CONTEXT §7/§9 conflicts; `docs/LESSONS.md` merged cleanly. The generated Graphify report was taken from B5 only as a temporary conflict resolution and regenerated with `graphify update .` after adapter changes. #189's Dockerfile/render/lockfile changes belong to that prerequisite, not B5b edits.

## Plan (8 steps)

1. Verify accepted B5 and prerequisite CJS resolution.
2. Freeze existing HTTP and corrupt-snapshot behavior.
3. Delegate Nest block findings and ordering to core.
4. Delegate snapshot construction and safe restore reading.
5. Preserve publish transaction and post-commit effects.
6. Test mapping, rollback, unknown data and CJS image.
7. Run locked disposable-MySQL and Docker gates.
8. Refresh Graphify, docs and stacked PR evidence.

## Contract

`pages-rules.util.ts` maps core policy findings to the **same** Nest statuses, message text, error codes and field paths. Pass the host's five built-in page keys and its 20-definition registry; custom-page decisions remain host-supplied. Use core stable ordering/key helpers without changing sort ties or keys. `page-snapshot.util.ts` delegates snapshot construction and exposes a strict restorable read using the host registry; restore must reject malformed, unknown-type or future-version content _before_ `deleteMany` inside the existing single host-owned Prisma transaction, leaving rows and the published pointer unchanged. Existing read/public rendering continues its logged unknown-block skip for historical published snapshots; do not turn that public path into a 404 or silently rewrite stored JSON. The core's migration helper is **not** applied during restore; existing saved props/schemaVersion stay byte-equivalent. Existing EN/VI locale resolution, SEO, refs, publish lint, role and authorization stay host-owned. The B1 HTTP golden tests are read-only.

## Gate and rollback

Add focused adapter tests for exact exception mapping and restore refusal with unchanged rows/audit, plus published public unknown-block compatibility and one publish transaction. Test built CJS from the compiled API and final pruned Docker image; do not edit core, web, Dockerfile, Render, lockfile or B1 goldens. Run `pnpm check:all --e2e` and real API Docker build only under the shared lock on disposable local MySQL; release the lock and owned container on exit. Report bundle sizes unchanged from B5 where measured (2,272/61,440 B contracts+engine and 34/35,840 B React). Roll back only B5b adapter changes and the separately identified #189 prerequisite if necessary; no migration, published-snapshot rewrite or deployment. Keep stacked PR draft for coordinator review.

## Local verification evidence

Focused page tests: 41/41 pass; API typecheck, lint, build and compiled-adapter CJS smoke pass. Under the shared lock the real API Docker image built successfully (`sha256:b4e27b3269415fc9fb9ef3a4be8109044ed68c29d19b79dc1a20078973873275`), including the final pruned image's compiled-adapter smoke. The first disposable-MySQL `pnpm check:all --e2e` passed format, lint, typecheck, unit, content, deps, build and API E2E, but web E2E failed at `apps/web/e2e/contact.spec.ts:33`, the intermittent public-contact test tracked separately in #183. No contact source or tests were changed here; the owned disposable DB and shared lock were released.

A single full retry on fresh disposable MySQL passed **all nine** `pnpm check:all --e2e` stages, including web E2E (384 s). The retry released its disposable DB and lock; no other thread's services were stopped.
