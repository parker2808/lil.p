# D2 → D5 UI → D6 combined verification (DO NOT MERGE)

**Status:** Verification branch only. Parker approved the future merge order #199 → #204 → #202 at 08:20 ICT on 2026-11-15; only Parker merges. The final combined head must pass CI and reviewed evidence before #199 merges. This document does not authorize a production database operation or deployment.

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
