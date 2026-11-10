# CI label-run deduplication

## Evidence and scope

`ci.yml` runs for both `opened`/`synchronize` and `labeled`, with one PR-number concurrency group and `cancel-in-progress: true`. On #174, the `ready-e2e` label was added at 05:15:21Z between same-head runs 42760841505 (05:14:11Z, cancelled) and 42760975705 (05:15:23Z, passed). On #182 the label was added at 14:49:25Z and two same-head runs 42838015745 (cancelled) and 42838015568 (passed) started at 14:49:29Z. These are event-race examples, not stale commits; cancelled check entries persist alongside successful checks. #186 also has a cancelled same-head run (42851198627) and successful replacement (42851298028), but its label preceded both by a minute, so this pair alone does not prove the precise event order. Preserve cancellation when a new commit supersedes an old one.

## Plan (four steps)

1. Split label-triggered E2E concurrency from code-triggered CI; keep stale-commit cancellation.
2. Run ordinary jobs only for code events; on `ready-e2e` labeling run only API/web E2E, not unrelated labels.
3. Update root documentation, context §§7/9, and lessons; run non-E2E checks.
4. Open a draft PR and inspect its event/check history without starting E2E or DB locally.

## Acceptance

- An opened/synchronized PR still gets format/lint/typecheck/unit/build and its E2E when already labeled.
- Adding `ready-e2e` later runs E2E without cancelling the existing ordinary run or rerunning lint/unit/build; other labels do not run expensive jobs.
- Adding an unrelated label while label-triggered E2E is running must not cancel that E2E run.
- A later code push still cancels stale code runs; label events do not leave cancelled ordinary required checks.
- PR CI is green. No E2E or production resources are started for this hygiene PR.

## Limitations

Opening a PR and adding `ready-e2e` afterward necessarily creates two workflow runs on the same head: the initial code checks and the E2E-only label run. This is intentional rather than two competing full runs. Label-triggered E2E can overlap a later code push; the later push runs E2E again if the label remains, and only its checks describe the new head.
