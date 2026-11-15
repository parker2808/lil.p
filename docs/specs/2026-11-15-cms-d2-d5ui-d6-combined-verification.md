# D2 → D5 UI → D6 combined verification (DO NOT MERGE)

**Status: BLOCKED — DO NOT MERGE.** Parker approved the proposed merge order #199 → #204 → #202 at 08:20 ICT on 2026-11-15; only Parker merges, and the rollback-reader safety gate currently fails. The final combined head, CI and reviewed evidence cannot authorize #199 while that gate fails. This document does not authorize a production database operation or deployment.

## Plan

1. Merge reviewed D2, D5 UI and D6 heads in order onto main.
2. Preserve both histories and goldens; regenerate Graphify.
3. Run Node 22 frozen install and non-browser checks.
4. Run disposable migration and rollback-reader checks under the shared lock when load is below 25.
5. Run full E2E and visual/a11y evidence under the same guard.
6. Record J01–J09 and V01–V22 as PASS, FAIL or BLOCKED.
7. Publish a ready-e2e draft verification PR; never merge it.

## Evidence contract

Record the exact combined SHA, each source SHA, baseline, commands, database isolation, lock ownership, job URLs, screenshot manifest and reviewers. D2's prior five-row migration-only pass is historical, not a rollback-reader pass; #204's prior D5 UI runs and #202's all-20 route rehearsal are not final-head proof. Require real D5 remote save/reload, divergent conflict review, interrupted-save recovery, dirty-reload protection, all-20 editor Properties, EN/VI × light/dark × 390/768/1440 keyboard/visual/axe/contrast and public/preview parity. Mark absent evidence BLOCKED. The main deploy after #199 will apply the additive `Page.draftTree` migration; review its rollback-reader compatibility before Parker authorizes that merge. Never run migration against production from this branch.

## Rollback-reader P1 — BLOCKED

The isolated, genuine pre-D2 Prisma-client regression is committed locally at `350ac169d8c22f991a7a53a0a9bcdb18422efd5d` on the collaborator's scratch branch, **not cherry-picked into this branch pending a write-safety fix**. Against disposable post-D2 MySQL under the shared lock (load below 25), the old client read and wrote legacy and tree rows (1 passing focused case). A valid legacy H1 + substantive prose publish-shaped transaction then replaced the published tree version pointer, id 6 → 7, while `draftTree` and its revision remained unchanged (1 deliberate failing safety assertion). The old-client transaction is proven; accepting that transaction through the old HTTP route has **not** been proven. New-code CAS cannot fence an already-running pre-D2 binary's unconditional pointer update. No old-writer rollback, live migration, or release is safe to claim until a protective write fence or separately approved drain/rollback strategy is implemented and verified on disposable MySQL. Leave this isolated failing regression uncherry-picked until the safety fix is ready, then run it as part of the final-head gate; do not turn a red regression into a green claim.

The isolated rollback-policy proposal at local commit `5a81332a` identifies a possible forward-only deployment: freeze page/version writes, drain every pre-D2 API instance (including any instance still running during startup migration), verify the D2-aware API, then resume writes; never roll back to a pre-D2 binary. It has **no executable Render write-free/drain proof** or Parker's approval of its availability cost. MySQL triggers cannot stand in for a production fence because TiDB does not support them, and a CHECK constraint cannot compare the prior row. Until Parker explicitly accepts a concrete no-overlap procedure with proof, or a TiDB-compatible fence passes, #199/#204/#202 remain HOLD. The proposal is not a passing rollback test and is not merged here.

## Open combined-head gates

| Gate                                                      | Status                            | Evidence needed                                                                                                                                                                                          |
| --------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Disposable forward migration / drift                      | PASS on combined merge `292b8360` | Node 22 migration-only gate on disposable MySQL, load 12.76, shared lock held then released: five old rows preserved, constraint checks passed, Prisma diff empty. Not rollback proof.                   |
| Genuine pre-D2 rollback writer                            | **FAIL / BLOCKED**                | Isolated test `350ac169`, 1 pass / 1 deliberate failure; prevention or approved no-old-writer rollback must be demonstrated.                                                                             |
| J01–J09 remote save/conflict/dirty-reload and SSR journey | OPEN                              | Run final-head disposable API and web browser journeys, including all 20 Properties.                                                                                                                     |
| V01–V22 visual, keyboard, axe and public-byte budget      | OPEN                              | Inspect final-head EN/VI, light/dark, 390/768/1440 captures and zero serious/critical axe findings.                                                                                                      |
| Final-head CI and review                                  | OPEN                              | Node 22 frozen install and `pnpm check:all` passed 8/8 on combined merge `292b8360`; ready-e2e shards, visual/a11y and independent P0–P2 review still open. CI green alone cannot clear rollback safety. |
