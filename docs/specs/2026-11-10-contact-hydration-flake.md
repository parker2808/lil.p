# Contact hydration submission race

## Scope and hypothesis

The delayed-JavaScript contact E2E intermittently submits before hydration. The browser-only API mock observes the hydrated client `fetch`, but an unhydrated form uses its server action and bypasses that mock. Verify the actual request path before changing behavior. Preserve text typed before hydration, optional topic payload, server-action progressive enhancement, and validation.

## Plan

1. Compare the failing full-suite trace with isolated and repeated delayed-JavaScript submissions on a disposable MySQL stack under the shared E2E lock.
2. If reproduced, make the test explicitly exercise the hydrated submission path _after_ asserting pre-hydration value retention; separately cover the unhydrated server-action path where feasible. Never replace a behavior failure with a blind wait.
3. Add a regression capable of catching the timing boundary; keep existing contact assertions and API payload checks.
4. Update Graphify, README, context, lesson and run guarded `pnpm check:all --e2e` and repeated focused checks; report unresolved limitations.

## Acceptance

No lost pre-hydration text, duplicate submit, or silent redirect; each tested submission path asserts its own response and payload. No retries, timeout/threshold increases, skipped assertions, masks or new dependency. Keep the PR draft and stacked on U2, with green required CI.

## Evidence and boundary

- U3 full-suite run failed the delayed-JavaScript contact submission at its success assertion (191 other tests passed); isolated U2 with the same test reproduced once in 20 repetitions. The failed screenshot retained the typed name, email and message, but showed stale field validation errors and no success confirmation. The original browser mock did not record request details on the failing run, so the exact lost-event vs server-action path was not observed.
- The test previously waited for browser `load`, not contact hydration. The fix gates Next client scripts until name/email are filled in server HTML, releases them, and asserts those values still exist after the form itself sets `data-interactive` from a mount effect. Only then does it submit; the browser request log must show exactly one `/api/public/contact` POST (and no Next `/en/contact` action POST), with an unchanged optional-topic and message payload. This probes the intended hydrated client path, not the no-JavaScript server-action fallback; the separate progressive-enhancement behavior is unchanged but is not proved by this mocked test.
- Graphify is code-only here: it does not extract the Markdown spec, CSS semantics or migration SQL. The route, public action fallback and test boundary were reviewed directly; no new route or migration is added.
- On an isolated disposable MySQL, the original delayed-JavaScript test failed **1/20** repetitions; with the controlled script gate and mount marker, the same focused test passed **20/20**. The modified test asserts its single browser API POST and payload, not merely the success text. `pnpm check:all --no-build` and `pnpm check:content` passed; full guarded E2E and CI are pending.
