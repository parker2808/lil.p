# CMS U3 — builder design gate

Status: proposed for coordinator review. Source: CMS-core ADR PR #172, Phase U3 / Phase D. This is a **visual study, not a builder**. No tree storage, drag engine, publish API, migration, or production route is introduced.

## Plan (8 steps)

1. Read U1 baseline, ADR, Graphify and route guards.
2. Specify core tokens, slots, and keyboard path.
3. Build a flag-gated, sample-only composition study.
4. Exercise empty, nested and responsive compositions.
5. Capture EN/VI, light/dark, 1440/390 evidence.
6. Record visual/accessibility findings and applied fixes.
7. Refresh Graphify, docs and disposable-DB checks.
8. Open draft PR, await coordinator approval.

## Boundaries

The study route is available only when `R3_E2E_STATES=1` and otherwise calls `notFound()`. It contains fixed, local sample data; no backend calls, persistence, drag-and-drop, arbitrary HTML/CSS or mutations. Controls in the study illustrate intent only. `packages/ui` shadcn primitives supply controls. The neutral theme is the finished core baseline; the lil.p variant changes semantic token values only, never markup, spacing, or behavior. No new dependency. The U0 route/control baseline remains unaffected.

## Slots and components (D1/D4 proposal, not implementation)

| Parent slot                    | Allowed children                                                              | Sample affordance                         |
| ------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------- |
| `page.sections`                | `section`                                                                     | Empty-page insert or between-section line |
| `section.content`              | `heading`, `paragraph`, `image`, `button`, `divider`, `spacer`, `row`, `grid` | Dashed insertion zone                     |
| `row.columns`                  | `column` (2–4)                                                                | Column boundary                           |
| `column.content`, `grid.cells` | Registered content components                                                 | Inside-cell insertion zone                |

Never offer an illegal destination. The editor must validate registered props, nesting depth, node count, and accessible heading order before publish. Preserve stable IDs on moves; duplicate creates new IDs. All nested zones require a named container and a visible selected path (Page / Section / Column / component). Host components may extend slots only through registered schemas.

## Token contract

Color decisions use semantic CSS custom properties on the fixture root (`--builder-*`), with neutral light/dark values and a `[data-brand="lilp"]` token-only override. The families are canvas, chrome, surface, raised, foreground, muted, border, accent, accent-foreground, accent-soft, success, warning, selection, drop-target, focus, typography (`--builder-font-body`, `--builder-font-display`, `--builder-font-mono`), spacing (4/8/12/16/24/32/48), radius (8/12/18), shadow and motion. The static fixture fixes layout dimensions but exposes the scales for D; **all brand differences consume tokens**, with no lil.p color hardcoded in component selectors. Semantic surface/foreground and accent/foreground pairs must reach WCAG AA (4.5:1 text, 3:1 control/focus outlines). Focus ring is 2px with 2px offset. Minimum interactive hit area: 44×44px; no animation when reduced motion is requested. Core text/shape remains readable without the host override.

## Keyboard and status contract for D4/D5

Tab follows toolbar → palette → canvas → inspector; Shift+Tab reverses. Enter/Space activates insertion, selection and palette items. Arrow keys move within the tree (Up/Down siblings, Right into expanded child, Left to parent); Escape cancels a pickup and restores focus. A keyboard pickup uses Space, arrow keys enumerate **valid** drop targets, Enter/Space commits, Escape cancels; live region announces item, source, destination and result in EN/VI. Alt+Up/Down offers a non-drag reorder path; Delete requests confirmation. Undo/redo use platform shortcuts and explicit named buttons, announce result, and retain unsaved state after autosave errors. Autosave states: unsaved → saving → saved, or conflict/error with Retry; history clears only at a confirmed save/version boundary. Disabled actions remain legible and explain why. Preview tabs switch simulated viewport only; never persist overrides without an explicit edit.

## Review matrix / acceptance

Review empty canvas, nested multi-section page, and mobile/tablet/desktop preview override with 1440×900 and 390×844 browser windows × EN/VI × light/dark, with both neutral and lil.p themes. Capture screenshot evidence, inspect clipping, hierarchy, nested insertion discoverability, selected-state clarity, contrast, screen-reader names and keyboard focus. Screenshot records and findings→fixes belong in the review section below. This gate requires coordinator visual approval **before Phase D**; a green suite alone does not constitute approval.

## Review evidence and fixes

Captured with Chromium in a disposable local-MySQL production build: **82/82 unique screenshots**, comprising empty (16), nested (16), device overrides (48), and feedback states (2), across browser widths 1440×900 and 390×844, EN/VI, light/dark, and neutral/lil.p tokens. The reproducible full matrix and SHA-256 manifest are local at `/tmp/lilp-cms-u3-review/manifest.json`; eight representative screenshots are versioned below. No horizontal document overflow was found. The same DOM/markup renders with either token set.

| Step                | Representative evidence                                                                                                                                                           | Review and applied fix                                                                                                                                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Empty page       | [EN neutral/light · 1440](./assets/cms-u3/empty-desktop-en-light-neutral-1440.png), [VI lil.p/dark · 390](./assets/cms-u3/empty-desktop-vi-dark-lilp-390.png)                     | Initial empty scene incorrectly showed a selected Heading in the inspector. Replaced it with a bilingual no-selection illustration and guidance. The insert affordance remains visually clear without implying a working editor.                |
| 2. Nested page      | [EN neutral/light · 1440](./assets/cms-u3/nested-desktop-en-light-neutral-1440.png), [VI lil.p/dark · 390](./assets/cms-u3/nested-desktop-vi-dark-lilp-390.png)                   | Selection path, section boundaries, nested column slots and between-section target remain distinct at both widths. The mobile palette scrolls; axe exposed its missing keyboard focus, fixed with a named focusable region and visible outline. |
| 3. Device overrides | [EN neutral/dark tablet · 1440](./assets/cms-u3/overrides-tablet-en-dark-neutral-1440.png), [VI lil.p/light mobile · 390](./assets/cms-u3/overrides-mobile-vi-light-lilp-390.png) | The simulated page is a single column on mobile, two on tablet/desktop; inspector marks the active device. Initial mobile device tabs were only 34px wide: increased all preview links and scene/theme controls to at least 44px.               |
| 4. Feedback chrome  | [EN neutral/dark conflict · 1440](./assets/cms-u3/status-conflict-en-dark-neutral-1440.png), [VI lil.p/light undo · 390](./assets/cms-u3/status-undone-vi-light-lilp-390.png)     | Save status, warning and undo confirmation are illustrated as **static sample states**, not live persistence. Warning text is explicit about conflict; publishing and preview actions remain disabled.                                          |

Contrast spot checks by sRGB calculation: neutral muted-on-white 4.98:1, neutral accent-on-white 6.00:1, dark muted-on-surface 7.84:1, lil.p orange-on-white 6.09:1, and lil.p dark orange-on-ink 8.79:1. The original neutral drop-zone foreground failed at 3.82:1 on white; darkening it to `#3461b5` yields **5.17:1 on its actual soft-blue background**. The page now has one top-level heading before palette/canvas headings. These are targeted checks, not a claim of full WCAG certification. Keyboard focus, 44px preview targets and axe scanning have Playwright assertions; the full D4 keyboard drag/announcement journey, true undo history, autosave conflict resolution, and published SSR parity **cannot be validated from a static sample**. Coordinator approval remains outstanding.

Validation: `pnpm check:all --e2e` passed all **9/9 gates** against disposable tmpfs MySQL after the final accessibility fix (186 web tests passed, 16 skipped). An earlier rerun had two intermittent failures in existing `admin-scroll` and pre-hydration `contact` tests under concurrent local suites; neither test nor its route is changed here. The focused study spec passed 2/2 tests, including the screenshot matrix and axe check. A production build served with `R3_E2E_STATES=0` returned HTTP 404 for `/en/cms-u3-study` without leaking sample content.

## Rollback

Remove the gated study route and this spec; no stored content, API or DB state changes. With the flag off, the sample must be unreachable. Legacy U0 pages and goldens remain untouched.
