# Context guard for stacked pull requests

## Finding

PR #178 targets `feat/cms-u2-site-admin-patterns` and changes non-doc files, but its check list has no `context` job. The workflow in `.github/workflows/context-check.yml` used `pull_request.branches: [main]`, which filters on the **base branch**, not the head. `.github/workflows/ci.yml` has no base-branch filter, so its jobs ran on #178; `.github/workflows/ci-ok.yml` also ran. The `skip-context` label was not the cause. This is a real coverage gap: a stacked PR could change code without updating its `PROJECT_CONTEXT.md` relative to the stack base and never get checked until a later main-target PR.

## Minimal change

Remove only `branches: [main]` from the context workflow. Keep `opened`, `synchronize`, `reopened`, `labeled`, `unlabeled`, the `skip-context` label gate, and the existing script's base/head triple-dot diff. All PRs now run the same check; only `docs/`-only diffs remain exempt. A changed root README or workflow is outside `docs/` and therefore requires context. Do not alter full CI's docs-only path filter or the e2e label policy. No database or application behavior changes.

## Acceptance and evidence

1. Local script negative: select a real code-changing commit pair lacking a `PROJECT_CONTEXT.md` change; `.github/scripts/context-check.sh BASE HEAD` must fail with its existing actionable error. Positive: this fix PR, whose diff includes `PROJECT_CONTEXT.md`, must pass. A `docs/`-only historical pair should pass. These checks use git objects only, no DB/e2e/visual tooling.
2. Open a separate PR from `origin/main` for this fix. Its `context` job must appear and pass, proving the unchanged script still works on the fix PR. Record the exact job URL/head SHA in the PR. This **main-target** run does not itself exercise the new non-main trigger; after the fix is available on a stacked PR's workflow base/default branch, require a real non-main-base `context` job before considering stacked coverage empirically verified.
3. The next code-changing stacked PR without a context file update must fail unless Parker explicitly approves `skip-context`. Retargeting a PR to a different base should be reviewed against that base; no extra code or new workflows are needed for this narrow fix.

Status: **DRAFT — pending PR CI and a post-availability stacked-PR trigger observation.** This PR does not merge or deploy, and local work remains non-e2e/non-DB.
