# D integration base — B7 + D1

**Status:** draft integration only. Stack D1 `d21c71d` on B7 `68a388a` without changing the public CMS/API, persistence, snapshots or existing visual routes. No merge to main or deployment.

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

**Follow-up integration:** D1 `2b50dbc` now rejects publish of an empty H1-less tree while accepting an empty draft. Merge B7's later design-review head `2307b54` without discarding its axe/44px fixture gates or screenshot provenance. Preserve both documentation histories and regenerate Graphify; no runtime route, database or legacy golden change.
