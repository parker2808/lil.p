# D5 live builder journey evidence (stacked draft)

**Scope:** Browser journeys through the gated Next builder and disposable D2 HTTP API; no mocked draft reads/writes, production DB, golden contract or migration changes. CI `ready-e2e` owns the browser proof. All pages use unique custom keys, assert server revisions and structural content rather than generated IDs.

## Plan (8 lines)

1. Inspect D5 browser controls and D2 HTTP responses.
2. Register a new focused Playwright shard spec.
3. Prove mouse and keyboard nested composition.
4. Prove invalid drop, delete focus and history.
5. Prove draft save, reload and revision conflict.
6. Prove offline recovery and incomplete publish.
7. Extend exact-head design captures and refresh docs/Graphify.
8. Run checks and obtain exact-head CI evidence.

## Gate boundaries

J01/J02/J03/J05 and V01/V02/V06/V07/V08 require actual browser actions and D2 HTTP observations; mark only demonstrated assertions PASS. The existing sharded design spec additionally attaches exact-head EN/VI × neutral/lil.p × light/dark × 390/768/1440 captures for empty, field-error, keyboard-focus, saved, saving and conflict states, plus palette/layers/properties sheets; checks all visible enabled interactive targets (including tree items) against 44 CSS px, dialog/shell horizontal overflow, visible keyboard outline, reduced motion and axe A/AA. The desktop header action previously lacked a 44px minimum; a scoped CSS minimum fixes it. V13/V15 remain partial until the exact-head browser artifact is reviewed; manual VoiceOver/heading-order V16 and public-route review remain OPEN. D5's base intentionally disables tree publish, so a typed incomplete-publish rejection can be tested directly at the API, but successful publish/public parity and full V02/V06 stay GAP until D6 integration. The base's D2 reader lacks the full host registry: avoid claiming live persistence for host component types until D6's host-aware API lands. A validation failure must leave the last saved tree and revision unchanged.

Graphify `update .` was rerun on #204 source head `22b4b1c0`; its report records that source, not the later docs-only commit. Browser assertions and the header target minimum require exact-head CI proof rather than inference from the graph source label.

## D4 sheet integration regression

After D5 mounted `BuilderHost` on the gated study route, #204 head `6a48a4cc` run `43712324642` failed shard 5/5 in two D4 canvas tests. The old `Selected item ID` textbox existed only in `BuilderStudy`, not the live `PropertiesPanel`: the CI error context showed the real Breakpoint group and no editable properties on the selected page. The isolated test fix composes a real heading, edits its EN/VI Text field, and checks the same value stays single-mounted across 768/1100/1440 and light/dark while preserving Escape/trigger focus assertions. The optional serialized visual capture checks the real breakpoint control and page helper instead of the removed fixture-only textbox. This is a test integration correction, not a product change or proof of V15/V16 release signoff. #204 exact head `22b4b1c00fa82bae7c72e1193605a124b416ae50`: CI `43716297284` and ready-e2e `43716429537` succeeded, including API E2E and all five web shards. A later combined #208 run `43717182977` failed V07 because the historical 409 expectation no longer matches D6's successful tree publish; that combined run does not prove a full PASS.

The invalid Properties input buffer in `PropertiesPanel.tsx` is a page/node/breakpoint-scoped in-memory `Map`. It survives a panel/sheet remount while the owning builder remains mounted, but **does not survive a page reload**; reload recovery claims apply only to valid edits handled by draft autosave, not to invalid unsaved input.

## Stale publish revision regression

V07 now writes the saved tree again through the real D2 draft PUT using the captured revision, then sends the prior revision to publish. The API must return typed 409 `CONFLICT` with the current revision, and the current draft, revision and version list must remain unchanged across the rejected request and reload. The earlier equal-revision request could succeed once D6 enabled tree publishing, so it was not a CAS conflict test. The existing offline retry, undo/redo and no-local-edit-loss assertions remain intact. Exact-head CI is required before marking this subset PASS.
