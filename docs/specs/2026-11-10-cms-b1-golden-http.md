# CMS B1 — golden HTTP contracts

Status: test-only proposal · 2026-11-10 · base `d0d474b` · ADR PR #172 and U0 PR #175.

## Plan

1. Inventory actual Nest route methods and existing U0/API fixtures.
2. Seed a clean disposable database for isolated golden cases.
3. Assert page/block/custom CRUD, publish, preview, versions, restore, discard and failures.
4. Assert settings, media, auth, role and public EN/VI boundaries.
5. Freeze semantic JSON shapes/codes, never timestamps, IDs, cookies or unstable ordering.
6. Run Graphify, document findings, then run guarded full E2E.
7. Open draft PR with `ready-e2e`; await green CI and coordinator review.

B1 is **test-only and API-level** and may run alongside U2/U3; B2–B7 still wait for the U design gate. No production behavior, schema, migration, deployment or merge is authorized. Use explicit keys, isolated table resets and structural assertions rather than committed response snapshots. Record observed bugs, do not fix them here. `BLOCK_LIMIT` duplication applies only after PR #174 lands; until then record the missing duplicate guard as an upstream dependency and keep its assertion conditional on the merged base.

## Observed baseline discrepancies

- Custom page created with `locale: vi` and a VI-only title publishes, but `GET /api/public/pages/:key?locale=vi` responds with `seo: { title: null, lang: "en" }`. The golden records this current response rather than changing the locale resolver in B1; resolve separately after coordinator review. The body blocks still render VI content.
- On base `d0d474b`, `POST /api/admin/pages/home/blocks/:heroId/duplicate` has no max-per-page guard; PR #174 adds `409 BLOCK_LIMIT`. B1 asserts creation limit now and defers duplication-limit golden until #174 merges rather than locking in an invalid 201.

The `R3_E2E_STATES` loading/error fixture flag lives in the Next route layer, not a CMS API endpoint; U0's browser coverage owns that flag. B1 asserts the API locale query validation instead of inventing an API flag contract.
