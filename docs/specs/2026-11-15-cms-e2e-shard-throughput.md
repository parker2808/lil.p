# Web E2E shard throughput — 2026-11-15

## Measured GitHub Actions jobs (UTC, wall time)

| Head/run                      | Shard 1 | Shard 2 | Shard 3 | Shard 4 | Result                                                                                                             |
| ----------------------------- | ------: | ------: | ------: | ------: | ------------------------------------------------------------------------------------------------------------------ |
| #202 `981380e`, `43699751835` |   4m50s |   4m09s |   5m54s |   5m33s | all pass                                                                                                           |
| #217 `cccc228`, `43698675563` |   5m22s |   5m08s |   6m23s |  20m14s | shard 4 cancelled at the 20m limit; its Playwright step ran 19m28s with 71 tests and no reported assertion failure |
| #221 `dc2d5a0`, `43699601029` |   5m16s |   3m08s |   3m15s |   3m40s | shard 4 failed a Core-theme focus-ring contrast assertion, not a timeout                                           |
| #208 `2002fba`, `43700660740` |   6m46s |   4m54s |   4m58s |   6m40s | all pass                                                                                                           |

The measured #217 shard-4 run carries the D6 visual group 4 alongside the ordinary suite. The current four-shard weights predate those visual specs. Five shards retain the same 20-minute per-job limit and the same `web-e2e` required aggregate, distributing existing specs across five runners. The #217 owner must register `cms-d6-visual-4.spec.ts` in `SPECS` **and** move its current `PINNED` entry from shard 4 to shard 5 when restacking. Do not pre-pin a spec that is absent from `SPECS`: the registry assertion rejects missing specs and out-of-range pins, and its unit test protects that boundary. This is not proof that the visual group alone finishes before 20 minutes: require exact-head CI on #217 after reconciliation. No golden contracts, browser assertions, production runtime or paid runners change.

The merged-report provenance gate enumerates five distinct shard manifests; build, secret scan, `ci-ok`, context-check, Vercel build and clean-build remain unchanged. A PR with `ready-e2e` must pass API E2E, each of the five web shards, and the aggregate report before merge review.
