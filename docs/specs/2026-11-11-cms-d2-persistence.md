# D2 — versioned builder draft persistence

Parker approved additive DDL at 04:11 ICT on 2026-11-11. D2 is stacked on `feat/cms-d-base`; B7's CI/design acceptance and D1's tree contract remain separate gates. This PR never enables public tree rendering or publication. Database work runs only against disposable local MySQL under the shared e2e lock. No existing block, version or public HTTP golden changes.

## Plan (8 lines)

1. Freeze current B1 and legacy snapshot behavior.
2. Add nullable tree and monotonic revision columns.
3. Add strict tree envelope and draft DTOs.
4. Implement eligible-page revision-checked draft mutations.
5. Guard publishing and restore against tree loss.
6. Test concurrency, malformed data and rollback.
7. Verify migration on disposable MySQL only.
8. Refresh Graphify, docs and CI evidence.

## Contract and safety

- Only custom pages can activate tree mode; SQL NULL is legacy mode and a validated versioned tree, even empty, is tree mode. Retain legacy blocks and published versions unchanged. Tree validation uses `readTree` for incomplete drafts and `validateTreeForPublish` for publish readiness; the latter remains server-disabled pending D3 SSR parity.
- Add `Page.draftTree Json?` and `draftTreeRevision BigInt @default(0)`; zero for existing rows, no backfill or destructive migration. HTTP revisions are canonical nonnegative decimal strings; compare-and-swap on page ID, revision and SQL-nullness prevents lost updates. Explicit JSON null is never a draft. Overflow is rejected. Invalid requests are 400 `VALIDATION_FAILED` with `fieldErrors.tree`, stale/mode mismatch is 409 `CONFLICT` including current mode/revision.
- New `GET /admin/pages/:key/builder/draft` (admin/user), `POST /admin/pages/:key/builder/activate` and `PUT /admin/pages/:key/builder/draft` (admin) accept `{expectedRevision,tree}`; `POST /admin/pages/:key/builder/publish` accepts `{expectedRevision,note?}` but always returns 409 `CONFLICT` until the D3 gate. Legacy routes/roles/response bodies remain unchanged. Existing page metadata/block mutations must not bypass the revision in tree mode.
- A future published tree envelope is `{format:'tree',snapshotVersion:1,seo,tree}` with exact keys; unknown/future input must fail, not strip. Preserve existing legacy `{seo,blocks}` reads, including missing SEO keys. Stored malformed tree restore/version requests return 400 `INVALID_BLOCKS` with `fieldErrors.snapshot`. Existing no-body legacy restore never overwrites an active builder draft; explicit revision-aware tree restore is required. Never expose an unrenderable tree on public routes.
- Revision-aware restore validates the immutable version before mutation. A tree target atomically updates only tree and SEO, leaving legacy block rows and the published pointer untouched; an explicitly selected legacy target clears tree mode and restores historical blocks/SEO. Both bump revision exactly once and audit in the same transaction. Failure leaves tree/revision/blocks/versions/SEO/audit unchanged. Tree-version preview fails closed until D3 can render it. No tree version is created while publishing is gated. Rollback before publication keeps additive columns; never drop columns with drafts or downgrade after tree publication without a compatible reader.
- The stacked D integration base does not yet declare core as an API runtime dependency (B5b is a separate accepted draft). D2 declares the existing workspace package and copies/builds its manifest in the API image before Nest compilation, so a production CJS import of `./tree` resolves. When integrating B5b later, reconcile its overlapping package/lockfile/Docker declarations rather than duplicating them.

## Evidence to collect

Unit/controller tests pin roles, exact status/error envelope, absent/future/unknown tree fields, missing-SEO legacy compatibility, stale revision and no lost updates. Disposable-DB tests pin empty/seeded migration, revision serialization above 2^53, competing writers, invalid tree no-write and restore preservation. `pnpm check:all`, locked `pnpm check:all --e2e`, and B1 goldens must pass; document any untested rollback case explicitly rather than claiming it passed.
