# V05 editor → revision → render evidence

The new `cms-d6-v05-revision-chain.spec.ts` creates a disposable custom page, inserts a page-header from the real builder palette and changes two localized nested Properties (`title` and `eyebrow`) for EN and VI. Every change must appear in the real draft GET before the next edit. The final draft revision must advance; UI Publish must return version 1, and its immutable snapshot tree must equal that exact saved tree.

For EN and VI, the published API tree and authenticated version-preview API must match the saved tree. The 22 browser captures at 390, 768 and 1440 include the selected Properties inspector (top and scrolled title field on mobile/tablet) and paired public/version-preview H1 and eyebrow. The public and preview main markup must agree at each width. CI attachments include the draft revision, published version, source head and screenshot digests.

This focused subset proves V05's edited values reach a saved version and both render paths. It does **not** certify all 20 schemas, every validation/error state, dark-theme design approval, or production rollout. Retain those as GAP until their own reviewed evidence is available. Run with `ready-e2e` and inspect the exact-head CI attachments before claiming PASS.

Graphify provenance: an incremental V05 report was rebuilt from `d4d5575d`, then the later D6 restore merge retained the base's Graphify report built from `5681e939`. The committed report describes that base, **not** the final combined topology; refresh it when local load permits. The browser manifest independently records the exact CI source head. This restack preserves the V05 fixture and both D6 contrast assertions without claiming full 20-schema V05 acceptance.
