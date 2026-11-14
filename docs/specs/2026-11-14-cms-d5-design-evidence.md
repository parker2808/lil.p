# D5 builder design and accessibility evidence

This is D5 editor-only evidence for the D6 release manifest template on `docs/cms-prep-nonE2E`. It does not certify D6 publishing, D2 migration approval, all 20 host definitions, preview/public parity or deployment. The route remains `R3_E2E_STATES=1` gated and tree Publish stays disabled.

## Plan (at most 20 lines)

1. Confirm the current D5 CI head and D6 manifest contract.
2. Add a CI-listed EN/VI browser evidence matrix.
3. Exercise keyboard composition, history and focus restoration.
4. Capture neutral/lil.p responsive and conflict states under the lock.
5. Measure token contrasts, run axe and inspect images.
6. Refresh Graphify, docs and the full locked gate.
7. Push draft PR #204 and verify final CI.

## Acceptance and recording contract

The separate `docs/specs/screenshots/cms-d5-design/manifest.json` records source SHA, page/UI locale, route, brand, theme, exact width, state, modality, screenshot path, axe severity counts and measured token contrast pairs for each capture. The Markdown review records the manifest SHA-256, reviewer, findings/fixes, exact commands and lock isolation. Cover EN/VI × light/dark × 390/768/1440 × neutral/lil.p for the populated canvas and its single Properties mount; compact widths also show the searchable palette sheet, while desktop canvas shows palette, Layers, inspector and history. Capture conflict/retry and saved autosave states without claiming Publish is enabled. Keep neutral core tokens in `@parker2808/cms-core/theme.css`; lil.p branding may override CSS tokens only.

The keyboard run must insert, move and delete a nested component using focus/Space/arrow/Enter/Delete confirmation, restore focus to the surviving selection, and exercise Ctrl/Cmd+Z plus redo. Check a visible focus ring, named mobile/tablet sheets, Escape focus restoration, 44px targets and axe WCAG AA with zero serious/critical violations; report all other violations rather than hiding them. A screenshot alone is not proof of keyboard or screen-reader behavior. D6 owns its own combined journey manifest and must reference this D5 artifact rather than count it as a full release pass.

## Run header and result

Pending the locked visual run and final-head CI. Do not mark a skipped D6 gate PASS.
