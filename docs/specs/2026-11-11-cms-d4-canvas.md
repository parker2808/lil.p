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

Review remediation (05:47 ICT): keep the original eight-step plan, with these checkpoints before another approval:

9. Make the shell controlled; dispatch one typed atomic command per edit.
10. Restore focus and announce typed delete outcomes.
11. Fit the host mobile viewport; add palette drag-insert.
12. Test targets, focus and tablet; recapture all affected viewports.
13. Refresh graph and docs, run locked gates, wait for CI.
14. Mount Properties in the 768px modal sheet, not the hidden desktop inspector.
15. Verify the single mount, keyboard focus and bilingual tablet captures.
16. Document the D4-command to D5-operation handoff before integration.
17. Reproduce compact-to-desktop Properties overlap with its sheet open.
18. Close the stale sheet across either workspace breakpoint.
19. Test bidirectional focus, Escape, locale and theme.
20. Run locked visual and full gates, refresh Graphify.

## Contract

Only the public `@parker2808/cms-core/tree` entry owns validation: `readTree` accepts H1-less drafts; publish-only H1 advice never blocks composition. IDs satisfy `treeIdSchema`; root-inclusive depth ≤ `TREE_LIMITS.depth`, count ≤ `TREE_LIMITS.nodes`, payload ≤ `TREE_LIMITS.bytes`, per-breakpoint props ≤ `TREE_LIMITS.propsBytes`. `page.sections` accepts sections; `section.content` accepts components/rows/grids; `row.columns` always has 2–4 columns; `column.content` and `grid.items` accept components. The mobile grid's one-column override stays intact. The local command engine returns a typed rejection and original document unchanged for illegal slot/depth/count/byte/props, duplicate IDs or a cycle. A row is created atomically with two columns and cannot be broken by individual column deletion. Validation is identical for pointer and keyboard targets.

Layers uses one roving treeitem tab stop. Up/Down visit visible items; Right expands or enters the first child; Left collapses or visits the parent; Home/End visit first/last visible; RTL reverses the horizontal keys. Enter selects without moving. Space picks up the selected node; arrows cycle valid destinations while announcing each target; Enter/Space commits, Escape cancels and restores focus to the source. Alt+Up/Down reorders within a slot; Delete opens an explicit confirm/cancel dialog. Invalid items remain named/focusable with `aria-disabled` and a localized visible reason. On successful mutation selection follows the moved/inserted node; deleted selection falls back to its parent. Keyboard and pointer dispatch the same immutable command functions.

On mobile, the canvas owns the viewport beneath a 44px-minimum bottom bar. Components, Layers and Properties triggers open named modal sheets with focus containment, Escape dismissal and focus restoration. A selected-item strip remains reachable without scrolling the whole canvas. The Components sheet can choose a valid slot before closing; Layers shows 20px-per-depth elbow guides and invalid destinations. Desktop uses adjacent palette, Layers, canvas and D5's future inspector slot. The desktop preview on a 390px viewport must either scale and label its design width honestly or default to mobile. Use core `theme.css` once and override lil.p tokens only. The palette has Section, Columns, Grid, Heading, Paragraph, Image, Button, Divider and Spacer, grouped and searchable with ≥4.5:1 placeholder contrast.

D5 owns one `{document, selectedId}` state and passes it to controlled `BuilderShell` with synchronous `onDispatch(command): CompositionResult`. `reduceBuilderCommand(state, command)` validates insert/move/delete/reorder/select/replace atomically and returns the unchanged input on rejection; D5 wraps successful commands as individual history/autosave events. The shell never keeps a second document or hands Properties a raw setter. Its Properties mount receives `{state, onDispatch}` and appears exactly once: in the desktop inspector above 1100px or the compact mobile/tablet sheet, never both. The flag-gated standalone study uses an in-memory host wrapper for the same interface. D4 does not own autosave, persistence, history or property editing. Local changes are only provisional until D2/D5 connect. No legacy editor or public renderer changes. EN/VI labels and live announcements, AA contrast, reduced motion, ≥44px targets, focus ring and light/dark at 1440/768/390 are acceptance gates. Browser/e2e/visual and disposable-DB checks require the shared lock; pure unit tests do not.

## Design and interaction review

The [56-capture manifest](./assets/cms-d4/manifest.json) covers EN/VI × light/dark × neutral/lil.p × 1440/768/390: empty and nested canvas at 1440/768; empty canvas, selected canvas and Layers sheet at 390. Reviewed EN light neutral empty and populated states at each width plus VI dark lil.p empty/populated mobile and tablet states. The mobile/768 shell fills the admin main content height rather than the full window, so its bar stays above the host navigation; empty pages no longer push it below the viewport. Tablet preview uses a visible 768px frame scaled to 84%, with its in-frame button sizes compensated to keep effective ≥44px targets. The 390 viewport defaults to a real 390px mobile frame. Section/column guides remain legible in the narrow sheet, the selected strip stays above the bottom navigation, and the placeholder search label is always visible. The empty page names its insertion target; unavailable palette tiles say “Add a section first” / “Thêm một phần trước.” No unresolved visual defects were found in these captures.

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

Independent review follow-up (November 11, 2026, ICT): the shell is controlled by a single in-memory study host; `BuilderCommand` has insert, move, remove, reorder, select and validated replace variants. D5 must supply its own one-owner state and wrap this synchronous dispatch with history and autosave, not write directly into the shell. A required row-column delete returns `REQUIRED_COLUMN` without changing the document or selection; the alert dialog announces the localized reason and restores its trigger on rejection, while success focuses the surviving parent and announces deletion. The palette's pointer drag-insert and keyboard/click insertion use the same validated command. Test the host's 390/768 bottom-bar geometry, effective 44px targets, focus outline, tablet preview and Properties single mount; browser captures require the lock.

Review verification (November 11, 2026, ICT): refreshed the 56-file manifest after the tablet target-size correction; inspected neutral EN at 390/768/1440 and dark lil.p VI at mobile/tablet widths. The D4-specific browser suite passed 8/8 (capture-only case skipped on the verification rerun) after the 56 captures were recorded. The first full 11-gate run passed 10 checks but found an unformatted test; Prettier fixed that isolated file before the final full rerun. No servers or database were used without the shared E2E lock.

Final gate (November 11, 2026, ICT): the locked disposable-MySQL `bash scripts/r3-12-e2e-gate.sh` passed all 11 `check:all --e2e` checks, including web visual/a11y and fixture coverage. The lock was released immediately after the run.

Tablet review (November 11, 2026, ICT): at 768px the responsive stylesheet hides the desktop inspector and exposes the modal Properties trigger; the host mount must move into that sheet rather than disappear. Desktop (above 1100px) keeps one inspector mount; mobile and tablet mount the editor only while their named Properties sheet is open. Escape, Tab containment and trigger focus restoration continue to apply, including EN/VI and both themes. A flag-gated `properties-preview` study key supplies a read-only localized host-mount fixture solely for 768px browser/visual evidence; it is not D5's editor or persistence.

**D4 → D5 adapter note:** `BuilderCommand` is the synchronous validated shell intent; D5 translates `insert`, `move`, `remove` and `reorder` into the corresponding `TreeOperation` (`reorder` becomes a same-parent `move`, adjusting the index after removal) and commits exactly once through `commitTreeHistory`. Return the resulting document and selection as D4's synchronous `CompositionResult`; never commit D4's provisional reducer document and then apply the operation again. `select` updates selection without history, while `replace` is an explicitly validated whole-document boundary for undo/redo or server reload, not a tree operation. Reject a failed command without enqueuing an operation or dropping unsaved work. D5 owns revision CAS/reload confirmation and must not create a second document setter inside D4.

Gate follow-up: the reviewed tablet capture passed. The keyboard delete gate revealed that confirmation can observe a previously selected node rather than the focused trigger's node; the trigger now pins the node ID before confirmation and validates/removes precisely that node, preserving typed rejection and surviving-node focus. A dedicated regression covers 1100px compact and 1101px desktop boundaries alongside 768px keyboard sheet behavior.

Breakpoint-transition follow-up (November 11, 2026): the prior test closed the tablet sheet before moving to desktop, so it did not cover an open Properties dialog crossing 1100px. A stale dialog and desktop inspector must never coexist; when the workspace changes mode, dismiss the dialog and restore focus to a visible control. Reopen Properties on compact re-entry rather than retaining a hidden modal. Test 768→1100→1440→768 with the sheet open at each boundary, keyboard Escape and localized labels in both themes. This is D4-only; the D5 operation adapter remains unchanged.

Transition gate: the old shell kept a Properties dialog open alongside the desktop inspector after a compact-to-desktop resize, reproduced by the new failing unit test. The rendered modal now disappears immediately above 1100px, and the resize handler dismisses its state and focuses the inspector; returning to compact moves inspector focus to the visible Properties trigger. The focused Chromium case passed across EN/VI and light/dark at 768→1100→1440→1100→768, including one host editor, Escape and focus restoration. The first browser fixtures exposed hidden topbar language/theme controls at compact width; their setup now changes those controls at desktop width. Under the shared lock, the final disposable-MySQL `check:all --e2e` passed **11/11** (including web, API, fixture and contrast gates); the container and lock were removed. No D5 operation or legacy/API contract changed.

Review evidence: the 768px Properties sheet shows the localized host input in all eight EN/VI × light/dark × neutral/lil.p captures; the manifest has 64 captures total. The first post-review full gate hit the previously tracked intermittent public-contact case (#201); a subsequent visual gate exposed the stale selection on keyboard delete, fixed by pinning the target at the trigger. After that fix, the disposable-MySQL locked `check:all --e2e` passed all 11 checks, including the keyboard and web suites. Non-E2E `check:all` passed 7/7. No other worktree's lock or processes were touched.
