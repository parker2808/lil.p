# D6 — guarded tree route parity

**Status:** integration draft stacked on `feat/cms-d-base`. Merge D2 persistence and D3 server renderer without changing legacy B1 HTTP goldens. D4/D5 and the full D6 journey matrix remain separate acceptance gates; no release or production migration is authorized here.

## Plan (8 lines)

1. Merge D2 and D3 into this worktree.
2. Preserve both documentation histories and regenerate Graphify.
3. Add guarded tree snapshot dispatch to API routes.
4. Reuse one D3 SSR host for preview/public.
5. Prove route parity with disposable MySQL.
6. Assert public chunks exclude builder code.
7. Run checks and locked browser gate.
8. Document blocked journeys and open draft PR.

## Contract and evidence

Tree mode is opt-in and never silently serves legacy block rows as a substitute. D2 owns validation, revision CAS, the transaction and tree publish gate. A versioned tree snapshot must be strictly validated before public display; invalid/unknown content fails closed with the existing typed stored-snapshot error. Authorized draft/version preview and published public tree use the same D3 SSR renderer, component registry and locale; legacy routes and response envelopes remain unchanged. The Next server owns React SSR; Nest supplies validated tree data, never a React element. If publication is still disabled, route-level parity must use an isolated test fixture with a correctly versioned published snapshot, not claim the full publish journey is complete.

Prove EN/VI real HTTP preview/public tree and SEO parity, including VI-only custom-page SEO, for identical published snapshots, ignoring only the admin-only `invalidBlocks: []`; pass both responses through D3 and compare the rendered element structure. The Next server view's EN/VI SSR tests independently compare preview/public HTML and HTML escaping. Full production-browser HTML parity after actual builder publish remains **BLOCKED** while D2 explicitly disables publishing. Default-off draft preview retains its 409, and unsupported published tree versions fail with 400 `INVALID_BLOCKS`, not an empty legacy shell. Public production chunks must contain zero editor/builder modules. The D6 evidence template's complete mouse/keyboard, D4/D5 autosave, responsive, visual, migration-approval and release gates remain **BLOCKED** until their actual integration and review. No test may mark a skipped gate PASS. Roll back the opt-in route dispatch only; retain stored drafts and immutable versions for a compatible reader.

Any snapshot carrying a `tree` key without the required `format` is treated as malformed tree input, not as a recoverable legacy block list. Its preview and public responses return typed 400 `INVALID_BLOCKS` instead of silently presenting an empty legacy page. The initial locked local `check:all --e2e` passed 12/13 checks (API and fixture E2E passed; web E2E had 179 passes, 14 skips and one known intermittent contact-form failure tracked separately in #183). No contact source or tests were changed here; one locked full-gate retry is required before claiming local green.

The one locked retry passed API, web and fixture E2E (including EN/VI route parity); its format stage alone failed because the public-chunk scanner had been widened to all site routes without Prettier before the run. That script was formatted during the run, and a separate `pnpm format:check` passed afterward. The scanner checks 11 public route manifests and 135 referenced chunks with zero builder/editor bytes. The final non-E2E `pnpm check:all` passed all eight stages after this documentation update. Neither run is misreported as a fully green local `--e2e` invocation; CI must pass independently.
