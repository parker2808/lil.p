# D6 integrated editor and host-route gate

**Scope:** D6 scratch → #202, with D2 and D5 UI already in the stack. This is test evidence, not release, database-deploy or merge approval.

## Plan

1. Record the exact scratch and #202 heads and existing CI evidence.
2. Exercise each of the 20 host block definitions through authenticated live API activation, CAS save/read, publish, EN/VI version preview and public JSON.
3. In a separate browser journey, create an eligible custom page, activate its real editor, edit an H1 in Properties, wait for server autosave, inspect draft preview, publish through the real API and compare EN/VI version-preview/public JSON and Next SSR.
4. Retain the existing all-20 browser gate for real mounted host components, ordered nodes and effective-props hashes in both locales.
5. Run non-browser checks, regenerate Graphify, push the isolated task branch as a draft PR stacked on #202 and run exact-head ready-e2e CI. The merge chain owns all topic-branch integration.

The earlier route and SSR matrix inserted trees directly through API, so it did **not** prove all-20 Properties editor coverage. The four editor-origin groups below add that distinct gate; it remains pending until exact-head CI passes. Notes/projects browsers expose numeric/toggle Properties but no editable localized text. Visual/a11y, D2 migration/drain and deployment remain independently gated.

The first exact-head API E2E failed because the generated custom pages had only English SEO: the existing locale-group fallback correctly returned `lang: en` for a Vietnamese request. The matrix now sets Vietnamese SEO through the authenticated page update before activation, so its `lang: vi` assertion tests a genuinely bilingual snapshot rather than changing the fallback contract. Re-run exact-head CI before accepting this gate.

## Editor-origin 20-type extension

1. Wire host definitions into the builder palette, composition validation, history/autosave registry and Properties descriptors without changing the neutral core or B1 golden contracts.
2. Render nested localized fields as distinct EN/VI inputs, preserve schema validation and expose a valid optional heading for definitions whose default props are empty.
3. Add four file-sharded browser groups: each creates a real page, adds one host type from the palette, edits available Properties, waits for API autosave, publishes, then compares EN/VI API and Next public/preview SSR.
4. Keep existing shard assignments unchanged and run Node 22 non-browser checks before ready-e2e exact-head CI. Distinguish host definitions with no localized editable fields (notes/projects browsers) rather than claiming edits they cannot support.

The four `cms-editor-host-{1,2,3,4}.spec.ts` files pin five definitions each to distinct shards without changing existing file assignments. Each creates a bilingual custom page, activates its draft through the real editor, inserts a Section, a level-1 heading when the host is not H1, and the host tile from the palette. Properties edits both EN and VI text where defined (or `showFeatured` for the two browser types); the test waits for the real draft API to read the changed value, checks draft preview, publishes at its observed revision, and compares version-preview/public JSON plus mounted-host prop hashes and Next HTML in EN and VI. The existing all-20 API test remains independent. No local visual, database or production release evidence is inferred from source-only tests.
