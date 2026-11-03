# Round 3 stack integration PR

## Goal

Present the verified Round 3 stack as one reviewable PR to `main`, using the exact PR #169 head as the integration base. Do not merge PRs, deploy, or access production.

## Acceptance criteria

1. **AC1:** All eleven earlier Round 3 branch tips are ancestors of PR #169's head. Verify with `git merge-base --is-ancestor` for each branch.
2. **AC2:** The integration branch descends from PR #169's head, and its PR targets `main`. Verify with `git merge-base --is-ancestor` and the PR metadata.
3. **AC3:** The integration branch changes only handoff documentation beyond PR #169's head. Verify with `git diff --name-only`.
4. **AC4:** Report the checks and any remaining release decisions in the PR. Do not merge or deploy.

## Plan

1. Confirm branch ancestry and PR #169 checks (AC1).
2. Branch from the PR #169 tip and record this integration handoff in the README and project context (AC2, AC3).
3. Run documentation and diff checks, open the PR to `main`, and report its link (AC4).

## Release note

The existing stack PRs remain open. Parker decides how to close them and whether to merge the integration PR. Any database migration or deployment is a separate approved action.
