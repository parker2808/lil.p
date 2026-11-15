# D5 Properties: all host block schemas

## Plan (8 lines)

1. Register all host definitions without changing core schemas.
2. Derive accessible controls from each host Zod contract.
3. Edit nested localized, optional and array values losslessly.
4. Support base, mobile, tablet and desktop overrides.
5. Validate every committed edit through the host registry.
6. Test twenty components, locale, keyboard and rejection paths.
7. Refresh Graphify, context, lessons and public documentation.
8. Run local static gates and labeled GitHub browser CI.

## Contract

This stacked draft adds only the host Properties registry and controls to D5 UI. The `BLOCK_REGISTRY` owns the 20 definitions, default values and Zod schemas; compose its `props` and publish roles with the starter schemas in the host, never move portfolio definitions into cms-core. For each host component, expose every schema field, including nested EN/VI copy, optional heading/link groups, enumerations, bounded numbers and repeatable reference ID lists. Host labels are provided in both locales. The tree operation remains top-level `property` or `clear-override`; changing a nested field sends an immutable copy of that top-level value and preserves siblings rather than flattening or discarding them. Invalid partial input stays in the control with feedback and is not autosaved; only valid edits reach the D5 operation and its host-registry validation. Optional groups require an explicit add; removing a base group requires a future D5 delete-property operation (the current operation only clears responsive overrides), so do not pretend it can be removed. Base values are inherited on mobile/tablet/desktop until an explicit override, and clearing an override never removes base content.

The existing D4 dispatch, D5 history/autosave, D2 API and migrations, B1 goldens and public renderer remain unchanged. Editor validation must agree with `readTree(document, builderRegistry)` and the host block schema; no silent coercion, implicit schema defaults or loss of persisted JSON. On an unsupported component or schema, fail closed with an accessible message rather than an unvalidated generic text input. The builder route remains flag-gated. WCAG AA, keyboard and EN/VI × light/dark × mobile/desktop verification use the existing browser CI with `ready-e2e`; no production DB or deployment.

## Evidence

Implemented on this branch: 40 data-driven host-schema editing cases (20 definitions × EN/VI, plus schema registry, localized nested/sibling, responsive, keyboard and invalid-input checks), 46 focused tests total. The Playwright fixture loads all 20 through a mocked active draft and audits the Properties panel in EN/VI × light/dark × 390/1440 via axe WCAG 2.1 AA; CI result pending. The D5 UI owner explicitly delegated the Properties registry/panel and related tests to this branch; their dirty worktrees remain untouched. **Not D6 release evidence:** the D5 base API still calls `readTree` without the host registry, so this isolated browser fixture intentionally mocks draft loading. The separate D6 live-API/Next/public parity gate is not claimed here. Root schema is validated before dispatch; core `readTree` validates the committed operation and host schemas. Empty optional groups are staged until their required EN copy is provided, with no partial autosave.
