# D6 integrated editor and host-route gate

**Scope:** D6 scratch → #202, with D2 and D5 UI already in the stack. This is test evidence, not release, database-deploy or merge approval.

## Plan

1. Record the exact scratch and #202 heads and existing CI evidence.
2. Exercise each of the 20 host block definitions through authenticated live API activation, CAS save/read, publish, EN/VI version preview and public JSON.
3. In a separate browser journey, create an eligible custom page, activate its real editor, edit an H1 in Properties, wait for server autosave, inspect draft preview, publish through the real API and compare EN/VI version-preview/public JSON and Next SSR.
4. Retain the existing all-20 browser gate for real mounted host components, ordered nodes and effective-props hashes in both locales.
5. Run non-browser checks, regenerate Graphify, merge the validated scratch into the #202 topic branch without rewriting history and run exact-head ready-e2e CI.

The browser palette currently exposes starter components, not all 20 host definitions. Therefore the per-type route and SSR matrix must **not** be described as all-20 Properties editor coverage. An editor-origin H1 journey plus the independent 20-type API/browser matrix are separate, explicit claims. J01–J09, all-20 Properties, visual/a11y, D2 migration/drain and deployment remain independently gated.

The first exact-head API E2E failed because the generated custom pages had only English SEO: the existing locale-group fallback correctly returned `lang: en` for a Vietnamese request. The matrix sets Vietnamese SEO through the authenticated page update before activation, so its `lang: vi` assertion tests a genuinely bilingual snapshot rather than changing the fallback contract. That legacy page update also increments the builder's CAS revision. The combined-head API E2E exposed a fixture that activated with the stale revision `0` and received the correct 409; the fixture now reads the current draft revision and passes each returned revision to the next write, asserting the expected progression. Re-run exact-head CI before accepting this gate.
