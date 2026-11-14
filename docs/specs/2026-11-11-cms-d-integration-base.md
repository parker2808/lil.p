# D integration base — B7 + D1

**Status:** integrated B7 and D1; merge to main only under the approved per-final-head CI and production health gates. This branch changes no public CMS/API, persistence, snapshots or existing visual routes.

## Contract

- Keep B7's neutral theme `./theme.css`, example app and fixture coverage alongside D1's `./tree` ESM/CJS/types, draft/publish validation, migrations and tests.
- Resolve overlapping README, `PROJECT_CONTEXT.md` §7/§9 and `docs/LESSONS.md` by retaining both stories. Rebuild the generated Graphify report instead of resolving text conflicts manually. No new dependencies or migrations.
- Verify frozen install and all seven non-E2E gates on Node 22. The B7 visual and D1 HTTP/DB contracts remain untouched; the stacked PR's ready-e2e CI provides the full integration gate.

## Plan

1. Merge D1 into the B7 branch.
2. Preserve both docs and package exports.
3. Regenerate Graphify and run frozen install.
4. Run non-E2E checks and review diff.
5. Publish a draft stacked PR; verify CI.

**Rollback:** revert the integration merge on this branch; B7 and D1 source PRs stay unchanged.

**Follow-up integration (2026-11-15):** D1 `2b50dbc` rejects publish of an empty H1-less tree while accepting an empty draft. B7's restacked head `d1cd402` now includes current `main`, B6b and the D1 entry, so the D base merges that head rather than replaying older ancestors. Preserve its axe/44px fixture gates, screenshot provenance, package-local checks and D-only documentation; regenerate Graphify. No runtime route, database or legacy golden change.
