# D2 → D5 UI → D6 integrated verification preparation

**Status (2026-11-15 ICT): preparation only; no integrated final head, PR push, production database access or release approval.** The D6 scratch head `e960c117` contains main `98f045f` and D2's schema, but not the D5 UI head `4e527c70`. Do not use its passing checks to claim the combined #199 → #204 → #202 journey is green. Do not remove the D2 migration while retaining live D6 draft/publish routes: they use `Page.draftTree` and `Page.draftTreeRevision` for revision-checked writes.

## Evidence already available

- `pnpm install --frozen-lockfile` and `pnpm check:all`: **PASS 8/8** on D6-only scratch `e960c117` after merging main. This does not cover the D5 UI integration.
- `LILP_MIGRATION_ONLY=1 bash apps/api/prisma/seed/migration-gate.sh`: **PASS** on the same scratch schema on fresh disposable tmpfs MySQL 8.4, with load below 25 and the shared lock held. The script compared five old-schema rows before/after applying migrations, checked key/default/nullability constraints and found no Prisma schema drift. It does **not** test binary rollback readers or D5 UI. The outer zsh command failed when trying to assign its read-only `status` variable _after_ the gate printed PASS; the lock was released and the scratch worktree is clean.
- Prior #202 CI run `43618589182` passed 14/14 at `b0077d0`; earlier D4+D5+D6 rehearsal in `2026-11-14-cms-d6-live-route-evidence.md` passed an all-20 route case and three editor cases on a different scratch head. Neither proves the final combined head or complete visual/accessibility, rollback or J01–J09 gates.

## Commands for a reviewed final integrated head

Use Node 22, a **clean, approved integration worktree** with #199, #204 and #202 in the chosen order, and no preexisting database URL. Check `uptime` before heavy runs; proceed only if the first load average is below 25. Acquire `~/.t3/locks/lilp-e2e.lock` atomically using `mkdir`, wait if held, and remove only your own lock on exit. Never kill another thread's process or touch production DB. Inside the held lock:

1. `LILP_MIGRATION_ONLY=1 bash apps/api/prisma/seed/migration-gate.sh` — additive old-row preservation and `prisma migrate diff` drift on disposable MySQL. Separately design and review a disposable old-reader/downgrade replay and explicitly capture data/reader compatibility; this script does **not** perform a destructive down migration or prove rollback.
2. `bash scripts/r3-12-e2e-gate.sh` — fresh disposable tmpfs MySQL with `prisma migrate deploy`, followed by `pnpm check:all --e2e` including API auth, stale/concurrent revision CAS, invalid-tree no-write, publish/restore (`apps/api/test/cms-builder-persistence.e2e-spec.ts`), browser EN/VI SSR parity and all-20 host routes (`apps/web/e2e/cms-tree-journey.spec.ts`, `apps/web/e2e/cms-tree-host-blocks.spec.ts`), and existing visual baselines. Capture the head SHA, PASS/FAIL counts, container cleanup and lock release.
3. For a focused retry only, `bash scripts/r3-12-e2e-gate.sh apps/web/e2e/cms-tree-journey.spec.ts apps/web/e2e/cms-tree-host-blocks.spec.ts apps/web/e2e/cms-builder-d5-ui.spec.ts` — run under the same lock/load guard; do not confuse a focused pass with the complete gate. Linux Chromium pixel review and EN/VI × light/dark × 1440/768/390 manual focus/axe/contrast/reduced-motion evidence remain separate sign-offs, not inferred from generic `visual.spec.ts` snapshots.

**Open:** final integrated head and CI, full J01–J09 mouse/keyboard journeys, D2 rollback-reader compatibility, all-20 editor property interaction, visual/accessibility sign-off and explicit order decision. Keep the opt-in `CMS_TREE_ROUTES` dispatch off until all relevant evidence and approvals are recorded; existing goldens remain unchanged.
