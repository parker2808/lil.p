# D4 main reconciliation — scratch handoff

This scratch branch reconciles draft #198 with the current `main` ancestry after #201, #197 and #200 (D5 at `43bdf77`). The merge-chain owner retains authority to merge PRs; this branch only prepares and verifies #198. Keep the D4 study flag-gated, B1 goldens unchanged, D5 core APIs and existing admin/contact behavior intact. Do not run production database or deploy.

## Plan

1. Inspect source status, graph and accepted P1/P2 evidence.
2. Merge the latest main into a separate D4 scratch worktree.
3. Preserve both sides of semantic and documentation conflicts.
4. Verify tablet Properties, stale selection and breakpoint tests.
5. Refresh Graphify, context and changelog evidence.
6. Run Node 22 checks and rely on labeled CI for E2E.
7. Push only fast-forwarded #198, await green, report head.

## D5 main follow-up

Merge `43bdf77` into the existing reconciliation branch, preserve both documentation histories, regenerate Graphify rather than hand-merge generated output, and verify that D4's builder and D5's core editing/autosave exports remain independently intact. This PR does not wire D4 commands into D5 autosave; that integration remains separately owned.

## Review boundary

The earlier P1 missing tablet Properties editor is addressed by one host mount inside the ≤1100px sheet. P2 stale-selection delete is addressed by binding confirmation to the focused trigger, with typed rejection and focus restoration. The open-sheet 768→1100→1440→768 transition has a single editor mount, visible focus target and Escape behavior. Preserve these checks after integration rather than replacing them with static screenshots. D5's `BuilderCommand` ↔ `TreeOperation` handoff stays documented; D5 UI integration belongs to its later PR.

## Interim evidence

The isolated branch includes merged `main` (`bb75d89`, containing D3 #197's stable responsive heading levels and visible-span browser assertion). Only `PROJECT_CONTEXT.md`, `docs/LESSONS.md` and generated Graphify conflicted; both documentation histories and the reviewed D3 invariant remain. D4 runtime changes remain confined to the flag-gated builder. Node 22 `pnpm check:all` passed 7/7 after the initial merges. The prior locked D4 full gate passed 11/11; final-head labeled GitHub E2E remains required before #198 merges. The graph is regenerated from the integrated source, never hand-merged.

After the identical D3 source landed on `main`, `graphify update .` and `graphify update . --force` reported no topology change and retained the earlier tree-equivalent provenance hash in their generated report; `graphify cluster-only .` refreshed the report without manually editing generated content. Node 22 `pnpm check:all` passes 7/7 on the merged-main tree. CI remains the final browser gate.

With D5 #200 merged into `main` at `43bdf77`, the follow-up merge adds its framework-neutral `./tree` APIs with no overlap in D4 runtime files. The only merge conflicts are accumulated README/context/lessons text and generated Graphify; preserve both documentation histories and regenerate the graph. D4's controlled local study is not yet connected to D5 autosave.
