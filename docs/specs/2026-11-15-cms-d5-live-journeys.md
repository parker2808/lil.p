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

Graphify `update .` was rerun after code commit `19742517`; its report retains `9345e3d4` as the topology source because no code-graph topology changed. Browser assertions and the header target minimum require exact-head CI proof rather than inference from that source label.

## D4 sheet integration regression

After D5 mounted `BuilderHost` on the gated study route, #204 head `6a48a4cc` run `43712324642` failed shard 5/5 in two D4 canvas tests. The old `Selected item ID` textbox existed only in `BuilderStudy`, not the live `PropertiesPanel`: the CI error context showed the real Breakpoint group and no editable properties on the selected page. The isolated test fix composes a real heading, edits its EN/VI Text field, and checks the same value stays single-mounted across 768/1100/1440 and light/dark while preserving Escape/trigger focus assertions. The optional serialized visual capture checks the real breakpoint control and page helper instead of the removed fixture-only textbox. This is a test integration correction, not a product change or proof of V15/V16 release signoff; exact-head ready-e2e CI is required.
