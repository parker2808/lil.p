# B5b — Nest page adapters for the pure engine

Status: stacked on accepted B5 draft PR #190 at `71e9ce4` (14/14 CI green). Merge prerequisite: accepted #189 `2de602e` contributes the direct API production dependency, lockfile, Docker/Render build order and CJS smoke. The merge commits `066e12b` and `dcc1ca9` retained **both** sides of README, PROJECT_CONTEXT §7/§9 and LESSONS conflicts; the generated Graphify report was temporarily taken from B5b and must be regenerated after the adapter changes. #189's Dockerfile/render/lockfile changes belong to that prerequisite, not B5b edits.

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

### P2 legacy compatibility and strict rejection

The previously supported persisted version shape may omit one or more SEO keys. For restoration, fill **only absent** SEO keys with null at the Nest boundary before the strict core reader; keep all supplied root, SEO, block and props fields available to validation. The existing Nest read path remains responsible for version details, preview and historical public reads. Prove one legacy missing-SEO fixture is accessible via version detail, EN/VI version preview and restore, with unchanged props and null SEO defaults. Prove root future-version/unknown-field and block unknown-field typed core failures still map to the same Nest `INVALID_BLOCKS` 400 shape before any delete or audit. Existing B1 goldens remain unchanged.

## Gate and rollback

Add focused adapter tests for exact exception mapping and restore refusal with unchanged rows/audit, plus published public unknown-block compatibility and one publish transaction. Test built CJS from the compiled API and final pruned Docker image; do not edit core, web, Dockerfile, Render, lockfile or B1 goldens. Run `pnpm check:all --e2e` and real API Docker build only under the shared lock on disposable local MySQL; release the lock and owned container on exit. After B5 snapshot hardening the current build measures 2,433/61,440 B contracts+engine and 34/35,840 B React gzip, still under cap. Roll back only B5b adapter changes and the separately identified #189 prerequisite if necessary; no migration, published-snapshot rewrite or deployment. Keep stacked PR draft for coordinator review.

## Local verification evidence

Focused page tests: 41/41 pass; API typecheck, lint, build and compiled-adapter CJS smoke pass. Under the shared lock the real API Docker image built successfully (`sha256:b4e27b3269415fc9fb9ef3a4be8109044ed68c29d19b79dc1a20078973873275`), including the final pruned image's compiled-adapter smoke. The first disposable-MySQL `pnpm check:all --e2e` passed format, lint, typecheck, unit, content, deps, build and API E2E, but web E2E failed at `apps/web/e2e/contact.spec.ts:33`, the intermittent public-contact test tracked separately in #183. No contact source or tests were changed here; the owned disposable DB and shared lock were released.

A single full retry on fresh disposable MySQL passed **all nine** `pnpm check:all --e2e` stages, including web E2E (384 s). The retry released its disposable DB and lock; no other thread's services were stopped.

After restacking on B5 `71e9ce4`, focused Nest version tests pass 23/23, including legacy missing-SEO EN/VI preview, version read and restore, and 400 `INVALID_BLOCKS` mapping for typed root/SEO/block failures before any delete/audit. The locked fresh-MySQL `pnpm check:all --e2e` passed eight stages (format, lint, typecheck, unit, content, deps, build, API E2E) but macOS web E2E failed the existing VI public-shell axe contrast check at `apps/web/e2e/public-shell-indexes.spec.ts:73`, also recorded in PROJECT_CONTEXT §7 from B4. This was **not** the #183 contact-form test; no web code or test was changed and the local full gate is not green. The locked real API Docker build passed final-layer compiled-adapter CJS smoke and produced image `sha256:5697b1d683d93ac75cebdacdceb9086867342463028dd82afec783d87aedb1ff`. Both runs released the lock and owned disposable container; Linux PR CI is the remaining complete gate.
