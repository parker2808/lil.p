# CMS B2 — one block page-allowance source

Status: implementation proposal · 2026-11-10 · stacked on CMS B1 `02405d9` · ADR PR #172.

## Plan

1. Freeze the existing built-in/custom allowance matrix from B1 and the ADR.
2. Add an explicit `customPage` flag and shared allowance predicate to block definitions.
3. Mark only page-header, prose and cta-band as custom-page eligible.
4. Route Nest allowance checks and the web add-block dialog through that predicate.
5. Test the full contract matrix, HTTP error parity and EN/VI dialog behavior.
6. Refresh Graphify and docs, run guarded disposable-MySQL E2E, open a stacked draft PR.

## Decision and invariants

Parker's 2026-11-10 20:46 ICT sequencing amendment permits backend B2–B5 in parallel with the U gate: pure policy and contracts do not freeze UI controls into core. B6 React extraction still waits for U2/U3 acceptance; D still waits for U3 design approval. B1's HTTP goldens and all statuses/error codes remain unchanged. No migrations, dependencies, new API fields or UI redesign. Built-in keys continue to use each definition's `pages` list; custom keys permit exactly page-header, prose and cta-band. The predicate is shared by the Nest service and the EN/VI web dialog, with no fallback list in either consumer. The `/help` content is unchanged: this is a permission-source refactor, not a user-visible command or workflow.

`createRegistry` construction and duplicate-type rejection belong to ADR B4 (contracts/registry) rather than B2's existing static registry. Do not add a second registry API just to validate the current object literal. B4 must reject duplicate `type` values when that constructor is introduced.

## Acceptance

- A contracts unit matrix covers all built-in keys, custom keys and every registered type, including the three explicitly enabled definitions.
- Nest tests preserve `BLOCK_NOT_ALLOWED` for disallowed custom and built-in types; EN/VI dialog tests expose the same eligible types and preserve max-per-page disable behavior.
- B1 goldens, `pnpm check:all --e2e` on locked disposable MySQL and full stacked PR CI pass. No production DB, deploy or merge.
