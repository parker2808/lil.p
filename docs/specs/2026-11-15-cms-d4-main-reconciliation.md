# D4 main reconciliation — scratch handoff

This scratch branch reconciles draft #198 with the current `main` ancestry after #201 and #197. The merge-chain owner retains authority to merge PRs; this branch only prepares and verifies #198. Keep the D4 study flag-gated, B1 goldens unchanged, and existing admin/contact behavior intact. Do not run production database or deploy.

## Plan

1. Inspect source status, graph and accepted P1/P2 evidence.
2. Merge the latest main into a separate D4 scratch worktree.
3. Preserve both sides of semantic and documentation conflicts.
4. Verify tablet Properties, stale selection and breakpoint tests.
5. Refresh Graphify, context and changelog evidence.
6. Run Node 22 checks and rely on labeled CI for E2E.
7. Push only fast-forwarded #198, await green, report head.

## Review boundary

The earlier P1 missing tablet Properties editor is addressed by one host mount inside the ≤1100px sheet. P2 stale-selection delete is addressed by binding confirmation to the focused trigger, with typed rejection and focus restoration. The open-sheet 768→1100→1440→768 transition has a single editor mount, visible focus target and Escape behavior. Preserve these checks after integration rather than replacing them with static screenshots. D5's `BuilderCommand` ↔ `TreeOperation` handoff stays documented; D5 UI integration belongs to its later PR.

## Interim evidence

Merging D3 #197 `bc2fa14` into the isolated D4 branch produced only documentation/Graphify conflicts. Both D3 and D4 §7/§9 entries and their distinct lessons were preserved; the generated graph is rebuilt from the combined source, never hand-merged. The D4 code diff against the D3 head remains confined to the flag-gated builder and its browser/unit tests. Node 22 `pnpm check:all` passed 7/7 after resolution. The previous locked D4 full gate passed 11/11; final-head GitHub CI is still required. Once #197 is merged, re-integrate the exact new `origin/main` before pushing #198.
