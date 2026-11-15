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

Self review, November 15, 2026 ICT: the CI-listed focused Chromium suite passed 2/2 against disposable local MySQL under `~/.t3/locks/lilp-e2e.lock`; the lock was released immediately. I read representative EN/VI light/dark neutral/lil.p desktop, tablet and mobile canvas, palette, Layers, Properties, saving and conflict captures. The 1440 keyboard-focus image initially used Playwright's 1280 default viewport; the test now sets 1440×900 before capture, and the recaptured image was reviewed at its actual 1440×900 dimensions. No remaining visual finding in this D5 scope.

The [99-entry manifest](./screenshots/cms-d5-design/manifest.json) has SHA-256 `d69eeb5fc03ff1e6119f8f6ad88c9b455893da20779e8580d372d2976a892f8e`, source `b1b9d37bb1c1dcf2333dc051fc2ec418753e5e81`, 24 saved canvases, 16 each palette/Layers/Properties, 24 conflicts, two saving states and one keyboard focus state. All 99 axe WCAG 2/2.1/2.2 A/AA audits report zero violations of any severity. Minimum measured text contrasts are 13.58:1 text/surface, 5.44:1 muted/surface, 5.21:1 accent/soft, 6:1 accent button and 5.56:1 success/surface; selection and focus are 4.8:1 and 6:1. The keyboard test confirms nested add/move/delete, screen-reader status and surviving-node focus, undo/redo, plus compact-sheet Escape focus restoration. Compact navigation targets measure at least 44×44px. Neutral colors come from core theme.css; the lil.p variant changes CSS tokens only.

D5 design/a11y evidence: **PASS for the gated draft editor only**. D6 release: **BLOCKED pending** its own combined journey, all 20 host definitions, preview/public parity, publishing, migration/deployment approvals and its independent manifest. The final fresh-database `pnpm check:all --e2e` passed 11/11, including web E2E and the fixture. An earlier run against a reused test database exposed duplicate test records and missing local API test variables; neither recurred with the disposable database and explicit test environment. Browser-written PNGs that triggered byte-pattern content false positives were losslessly recompressed (zero pixel differences), and `pnpm check:content` passed afterward. The shared lock was released on gate exit. Final-head PR CI is recorded after the push.
