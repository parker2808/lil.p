# Context guard for stacked pull requests

## Finding

PR #178 targets `feat/cms-u2-site-admin-patterns` and changes non-doc files, but its check list has no `context` job. The workflow in `.github/workflows/context-check.yml` used `pull_request.branches: [main]`, which filters on the **base branch**, not the head. `.github/workflows/ci.yml` has no base-branch filter, so its jobs ran on #178; `.github/workflows/ci-ok.yml` also ran. The `skip-context` label was not the cause. This is a real coverage gap: a stacked PR could change code without updating its `PROJECT_CONTEXT.md` relative to the stack base and never get checked until a later main-target PR.

## Minimal change

Remove only `branches: [main]` from the context workflow. Keep `opened`, `synchronize`, `reopened`, `labeled`, `unlabeled`, the `skip-context` label gate, and the existing script's base/head triple-dot diff. All PRs now run the same check; only `docs/`-only diffs remain exempt. A changed root README or workflow is outside `docs/` and therefore requires context. Do not alter full CI's docs-only path filter or the e2e label policy. No database or application behavior changes.

## Acceptance and evidence

1. Local script negative: select a real code-changing commit pair lacking a `PROJECT_CONTEXT.md` change; `.github/scripts/context-check.sh BASE HEAD` must fail with its existing actionable error. Positive: this fix PR, whose diff includes `PROJECT_CONTEXT.md`, must pass. A `docs/`-only historical pair should pass. These checks use git objects only, no DB/e2e/visual tooling.
2. Open a separate PR from `origin/main` for this fix. Its `context` job must appear and pass, proving the unchanged script still works on the fix PR. This **main-target** run alone does not exercise the non-main trigger; verify it with a disposable PR whose base is `fix/context-check-stacked` (see evidence below).
3. The next code-changing stacked PR without a context file update must fail unless Parker explicitly approves `skip-context`. Retargeting a PR to a different base should be reviewed against that base; no extra code or new workflows are needed for this narrow fix.

## Stacked-base proof (throwaway PR #187)

Base: `fix/context-check-stacked` (PR #184 head `7ad7ca8`); no `skip-context` label. The first commit changed only `apps/api/src/i18n/pick-locale.util.ts` with a behavior-neutral expression; the second added `PROJECT_CONTEXT.md` §7 and §9. These disposable changes are **not** part of PR #184.

| Head                                       | Exact `context` job                                                                                                | Result                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `ec91dcecc2c9b98547de50b1bb0b29a85cc71589` | [run 42854166729, job 129962535597](https://github.com/parker2808/lil.p/actions/runs/42854166729/job/129962535597) | Failed as expected: non-docs change without `PROJECT_CONTEXT.md`; exit 1. |
| `16e9f97b2777bf5ef6e1591ad256c6b189662222` | [run 42855321398, job 129966652906](https://github.com/parker2808/lil.p/actions/runs/42855321398/job/129966652906) | Passed after adding `PROJECT_CONTEXT.md` against the same non-main base.  |

The remote `context` job ran on both heads, so the trigger and the unchanged triple-dot guard are empirically verified for a non-main base. This does not retrospectively supply a job for PR #178. Status: **DRAFT — stacked-base proof verified; no merge or deploy.** Local work remains non-e2e/non-DB.
