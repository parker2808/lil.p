# CI static-check throughput — 2026-11-15

## Plan (four steps)

1. Compare recent main CI job and step durations; inspect local gate scripts.
2. Overlap only the independent read-only format and lint checks on one runner.
3. Preserve all seven local checks, CI checks and existing E2E build/shard dependencies.
4. Run non-E2E checks and compare final PR CI timings with main.

## Baseline and scope

Recent successful main CI runs `43618504835`, `43615525305`, `43613575367` lasted **4m50s, 5m02s, 5m47s** from run start to completion. Their `lint-typecheck` jobs each took **1m20s, 1m20s, 1m37s**. On the newest run, setup was 15s, format 12s, lint 19s, typecheck 26s, content/deps under 2s; E2E shard 4 took 3m47s after the build, while shard 1 took 3m17s. The web-E2E shard is the overall critical path; no browser/DB/visual/Docker work or shard rebalancing belongs to this thread. The local `scripts/check-all.mjs` currently runs seven commands sequentially; the web E2E config uses four shards with one Playwright worker each, and the local gate scripts reserve the shared lock.

## Change and acceptance

Run `pnpm format:check` and `pnpm lint` together with a maximum of two subprocesses, waiting for **both** and preserving each independent failure, duration and bounded failure output. Keep typecheck, unit tests, content, dependency, build and optional E2E in their original order after the pair. Reuse the same static checks in CI, without adding a runner or a new dependency. Format and lint ignore generated `dist`/`.next` files and are read-only. CI's `build`, clean `vercel-build`, API E2E, web-E2E build→artifact→four shards→aggregate, `ci-ok`, context and secret scanning remain unchanged. Do not claim a main wall-time reduction from static-only overlap; compare measured timings on the PR and gate any E2E tuning through a lock-holding owner.

Run Node 22 `pnpm check:all` **without** `--e2e`, verify failed checks still return nonzero, and require a green final PR head. Rollback is reverting the static orchestration and CI invocation; no test content or deployment logic changes.
