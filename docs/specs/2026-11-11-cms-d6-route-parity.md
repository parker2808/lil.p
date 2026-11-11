# D6 — guarded tree route parity

**Status:** integration draft stacked on `feat/cms-d-base`, carrying D2 (#199), D3 and contact readiness (#201). #202 must not merge before #199's final gate and Parker's approval. D4/D5 client acceptance and release remain separate; no production migration is authorized here.

## Plan (10 lines)

1. Merge D2 and D3 into this worktree.
2. Preserve both documentation histories and regenerate Graphify.
3. Add guarded tree snapshot dispatch to API routes.
4. Reuse one D3 SSR host for preview/public.
5. Prove route parity with disposable MySQL.
6. Assert public chunks exclude builder code.
7. Run checks and locked browser gate.
8. Reject unrenderable stored trees and require the public scanner in CI.
9. Publish validated tree snapshots transactionally with CAS, then test API/browser parity and restore.
10. Document independent D5 host gates, review dependencies and open draft PR.

## Review gates (2026-11-11)

- **Fail closed:** A `legacy-component` or any unsupported node in a versioned published snapshot must produce 400 `INVALID_BLOCKS` on public and version preview, not a 200 warning. Next must not return a warning page with HTTP 200 if D3 rendering fails for any other reason; add a focused SSR regression. Incomplete drafts may retain legacy nodes losslessly but cannot publish them.
- **CI:** Run `scripts/check-public-builder-bytes.mjs` as a required build job step after the web build, in addition to `check:all`; keep the zero-byte proof across all public route manifests.
- **Host schemas (separate D5 integration gate):** Before D5 UI acceptance, register property schemas for all 20 host block definitions and prove no missing/unknown type falls back to a starter schema. The pure starter tree uses explicitly supported core component types; do not claim 20-definition registration as passing from this D6 route test.
- **Dirty-edit protection (separate D5 integration gate):** The host must require explicit confirmation/export before D5 `reload` can replace a dirty local tree. API revision CAS cannot by itself certify browser autosave/reload safety.
- **Real route journey:** With the server flag enabled and an eligible custom page, activate and save a versioned draft using revision CAS, reject stale/invalid writes, publish only a tree that passes publish and renderability validation, then compare EN/VI version preview/public JSON and Next SSR HTML. A revision-aware historical restore changes the draft (not published pointer), and republish advances the version. Legacy pages and goldens remain unchanged. Keep publish atomic in one host Prisma transaction, including version, pointer, audit and revision CAS; reject future/unknown/lossy versions before writes. Browser tests may drive the builder draft HTTP endpoints until the independently reviewed D5 editor/autosave UI is integrated; do not describe that as D5 client autosave coverage.

## Contract and evidence

Tree mode is opt-in and never silently serves legacy block rows as a substitute. D2 owns validation and revision CAS; D6 adds a version-checked tree publish in one host transaction, with immutable snapshot, published pointer and audit. A versioned tree snapshot must be strictly validated before public display; invalid/unknown content fails closed with the existing typed stored-snapshot error. Authorized draft/version preview and published public tree use the same D3 SSR renderer, component registry and locale; legacy routes and response envelopes remain unchanged. The Next server owns React SSR; Nest supplies validated tree data, never a React element.

Prove EN/VI real HTTP preview/public tree and SEO parity, including VI-only custom-page SEO, for identical published snapshots, ignoring only the admin-only `invalidBlocks: []`; pass both responses through D3 and compare the rendered element structure. An opt-in browser test performs actual HTTP activate/save/publish/restore/republish and compares EN/VI preview/public SSR HTML. This proves the host endpoint journey, **not** D5 client autosave/reload or full editor interaction. Default-off draft preview retains its 409, and unsupported published tree versions fail with 400 `INVALID_BLOCKS`, not an empty legacy shell. Public production chunks must contain zero editor/builder modules. The D6 evidence template's complete mouse/keyboard, D4/D5 autosave, responsive, visual, migration-approval and release gates remain **BLOCKED** until their actual integration and review. No test may mark a skipped gate PASS. Roll back the opt-in route dispatch/publish; retain stored drafts and immutable versions for a compatible reader.

Any snapshot carrying a `tree` key without the required `format` is treated as malformed tree input, not as a recoverable legacy block list. Its preview and public responses return typed 400 `INVALID_BLOCKS` instead of silently presenting an empty legacy page. The initial locked local `check:all --e2e` passed 12/13 checks (API and fixture E2E passed; web E2E had 179 passes, 14 skips and one known intermittent contact-form failure tracked separately in #183). No contact source or tests were changed here; one locked full-gate retry is required before claiming local green.

The one locked retry passed API, web and fixture E2E (including EN/VI route parity); its format stage alone failed because the public-chunk scanner had been widened to all site routes without Prettier before the run. That script was formatted during the run, and a separate `pnpm format:check` passed afterward. The scanner checks 11 public route manifests and 135 referenced chunks with zero builder/editor bytes. The final non-E2E `pnpm check:all` passed all eight stages after this documentation update. Neither earlier run is misreported as a fully green local `--e2e` invocation. The focused contact hydration fix from #201 is now merged into this branch; its pre-hydration input regression makes retries unnecessary as a remedy. With the fix present, a new complete `pnpm check:all --e2e` run passed **13/13** checks (including API, web and fixture E2E) under the shared lock on a disposable tmpfs MySQL; the lock and container were released after the run.
