# D4 — accessible tree composition

Status: implementation review. Base: `feat/cms-d-base` at `3bbd1b2` (reviewed B7 + D1 empty-publish policy). The U3 approved study is the visual reference, not functional evidence.

## Plan

1. Pin D1 slots, IDs, limits and draft validation.
2. Test immutable insert, move and delete commands.
3. Integrate the D base without resolving its docs conflicts.
4. Build desktop and mobile composition surfaces.
5. Verify keyboard, pointer, locales and themes.
6. Capture and review the visual matrix under lock.
7. Refresh Graphify, docs and full gates.
8. Open a draft PR and wait for green CI.

## Contract

Only the public `@parker2808/cms-core/tree` entry owns validation: `readTree` accepts H1-less drafts; publish-only H1 advice never blocks composition. IDs satisfy `treeIdSchema`; root-inclusive depth ≤ `TREE_LIMITS.depth`, count ≤ `TREE_LIMITS.nodes`, payload ≤ `TREE_LIMITS.bytes`, per-breakpoint props ≤ `TREE_LIMITS.propsBytes`. `page.sections` accepts sections; `section.content` accepts components/rows/grids; `row.columns` always has 2–4 columns; `column.content` and `grid.items` accept components. The mobile grid's one-column override stays intact. The local command engine returns a typed rejection and original document unchanged for illegal slot/depth/count/byte/props, duplicate IDs or a cycle. A row is created atomically with two columns and cannot be broken by individual column deletion. Validation is identical for pointer and keyboard targets.

Layers uses one roving treeitem tab stop. Up/Down visit visible items; Right expands or enters the first child; Left collapses or visits the parent; Home/End visit first/last visible; RTL reverses the horizontal keys. Enter selects without moving. Space picks up the selected node; arrows cycle valid destinations while announcing each target; Enter/Space commits, Escape cancels and restores focus to the source. Alt+Up/Down reorders within a slot; Delete opens an explicit confirm/cancel dialog. Invalid items remain named/focusable with `aria-disabled` and a localized visible reason. On successful mutation selection follows the moved/inserted node; deleted selection falls back to its parent. Keyboard and pointer dispatch the same immutable command functions.

On mobile, the canvas owns the viewport beneath a 44px-minimum bottom bar. Components, Layers and Properties triggers open named modal sheets with focus containment, Escape dismissal and focus restoration. A selected-item strip remains reachable without scrolling the whole canvas. The Components sheet can choose a valid slot before closing; Layers shows 20px-per-depth elbow guides and invalid destinations. Desktop uses adjacent palette, Layers, canvas and D5's future inspector slot. The desktop preview on a 390px viewport must either scale and label its design width honestly or default to mobile. Use core `theme.css` once and override lil.p tokens only. The palette has Section, Columns, Grid, Heading, Paragraph, Image, Button, Divider and Spacer, grouped and searchable with ≥4.5:1 placeholder contrast.

D5 receives `{document, selectedId, onDocumentChange, onSelect}` through the shell's explicitly typed mount callback; D4 does not own autosave, persistence, history or property editing. Local changes are only provisional until D2/D5 connect. No legacy editor or public renderer changes. EN/VI labels and live announcements, AA contrast, reduced motion, ≥44px targets, focus ring and light/dark at 1440/390 are acceptance gates. Browser/e2e/visual and disposable-DB checks require the shared lock; pure unit tests do not.

## Design and interaction review

The [40-capture manifest](./assets/cms-d4/manifest.json) covers EN/VI × light/dark × neutral/lil.p × 1440/390: empty and nested canvas at 1440; empty canvas, selected canvas and Layers sheet at 390. Reviewed the EN and VI desktop pages, both themes' mobile sheets, and the VI dark lil.p canvas. The 1440 tablet preview now occupies 84% of its 768px design width and says so; the 390 viewport defaults to a real 390px mobile frame. Section/column guides remain legible in the narrow sheet, the selected strip stays above the bottom navigation, and the placeholder search label is always visible. The empty page names its insertion target; unavailable palette tiles say “Add a section first” / “Thêm một phần trước.” No unresolved visual defects were found in these captures.

Contrast ratios below use the core stylesheet's actual sRGB tokens and WCAG relative luminance; the lil.p mode changes accent tokens only. Every sampled text pair exceeds 4.5:1. The disabled Publish label is measured for legibility even though a disabled control does not require the same contrast under WCAG.

| Mode          | Search placeholder / raised | Muted label / surface | Selected accent / soft | Disabled Publish / raised |
| ------------- | --------------------------: | --------------------: | ---------------------: | ------------------------: |
| Neutral light |                      4.98:1 |                5.44:1 |                 5.21:1 |                    4.98:1 |
| Neutral dark  |                      6.74:1 |                7.84:1 |                 5.69:1 |                    6.74:1 |
| lil.p light   |                      4.98:1 |                5.44:1 |                 5.47:1 |                    4.98:1 |
| lil.p dark    |                      6.74:1 |                7.84:1 |                 6.61:1 |                    6.74:1 |

Pointer dragging and keyboard-only insertion, pickup, nested placement, cancellation, tree traversal, and responsive sheet dismissal use the same validated composition commands. D4-only Playwright runs with a disposable database and the shared E2E lock; D6 will register the journey in the shared shards. The flag-off route returns 404 through `notFound()`; neither the UI nor the tests persist a draft or call publish.

Verification (November 11, 2026, ICT): 7 focused unit tests passed; `D4_CAPTURE=1 R3_E2E_STATES=1 bash scripts/r3-12-e2e-gate.sh --config src/modules/admin-pages/builder/playwright.config.ts` passed 6/6 and wrote the 40-file manifest. A second focused run passed 5/5 with the capture-only case skipped; its axe checks covered EN/VI × light/dark × 1440/390 plus the mobile Layers dialogs. The disposable-MySQL `bash scripts/r3-12-e2e-gate.sh` passed all 9 `check:all --e2e` gates, including default web visual/a11y coverage. The shared lock was removed after each run. Graphify was refreshed against the D4 worktree; generated report commit metadata refers to the last committed integration base until this branch is committed.

Base sync (November 11, 2026, ICT): D base `3bbd1b2` integrates D1's publish-only empty-page H1 requirement and the reviewed B7 fixture/contrast gate. D4 still composes H1-less drafts via `readTree`; its disabled Publish affordance does not call the publish validator or persist changes. The merge preserves both D4 and base documentation; the generated graph report is refreshed from the combined tree.
