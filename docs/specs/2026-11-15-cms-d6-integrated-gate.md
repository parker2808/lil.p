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

The first #215 `ready-e2e` run 43683804671 passed API E2E but failed all four web shards in the new journey: optional `heading.eyebrow` is not a safe field to edit with an empty title; several dynamic hosts render streaming HTML that cannot be compared byte-for-byte across requests. It also exposed raw type slugs in the Vietnamese palette. The follow-up uses existing `admin.pages.types` labels for palette/tree/search, visits the builder in VI, and edits a valid localized title or a browser toggle. Branch workflow 43685884874 exposed a Node JSON-import-attribute failure at Playwright discovery; it did not execute browser assertions. These are corrections pending a new exact-head CI run, not passing evidence.

## Editor-origin 20-type extension

1. Wire host definitions into the builder palette, composition validation, history/autosave registry and Properties descriptors without changing the neutral core or B1 golden contracts.
2. Render nested localized fields as distinct EN/VI inputs, preserve schema validation and expose a valid optional heading for definitions whose default props are empty.
3. Add four file-sharded browser groups: each creates a real page, adds one host type from the palette, edits available Properties, waits for API autosave, publishes, then compares EN/VI API and Next public/preview SSR.
4. Keep existing shard assignments unchanged and run Node 22 non-browser checks before ready-e2e exact-head CI. Distinguish host definitions with no localized editable fields (notes/projects browsers) rather than claiming edits they cannot support.

The four `cms-editor-host-{1,2,3,4}.spec.ts` files pin five definitions each to distinct shards without changing existing file assignments. Each creates a bilingual custom page, activates its draft through the real VI builder, inserts a Section, a level-1 heading when the host is not H1, searches the localized host tile and inserts it. Properties edits valid EN and VI text where defined (or `showFeatured` for the two browser types without localized defaults); the test waits for the real draft API to read the changed value, opens the Next draft SSR route in EN and VI **before publish**, verifies the host wrapper/hash and visible localized text where the host always renders it, then publishes at its observed revision. It compares draft/public/version-preview hashes and preview/public API JSON, plus Next HTML for static hosts. Dynamic hosts compare stable props and JSON, not transient streaming DOM. Some data-backed/empty-default hosts cannot establish nonblank semantic text from this gate alone. The existing all-20 API test remains independent. No local visual, database or production release evidence is inferred from source-only tests.
