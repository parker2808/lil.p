# B6b — neutral CMS core theme

**Status:** implementation draft, stacked on B6 (`7e3b317`); no host UI or database changes. The ADR (#172) and approved U3 design (#178) define the token contract. B7 consumes this theme in a standalone neutral fixture.

## Plan

1. Read B6 exports, U3 token samples, Graphify and rules.
2. Specify opt-in neutral light/dark tokens and styling hooks.
3. Export a single built `./theme.css` with preserved side effects.
4. Style core surface, text, controls, feedback and focus hooks.
5. Test actual tokens, computed contrast, targets and motion.
6. Prove React server/client exports and existing caps unchanged.
7. Refresh Graphify and documentation; run local gates.
8. Run locked disposable-DB E2E and visual; review CI.

## Contract and boundaries

`@parker2808/cms-core/theme.css` is an explicit CSS import, emitted to `dist/theme.css` and marked side-effectful. Consumers import it once and put `class="cms-core"` on the CMS root; `data-theme="dark"` on that root (or an ancestor) selects the dark defaults. U3's `--builder-*` families are defined on the scoped root. The CSS never styles the document root or an unscoped host element. Host branding is an optional token-only override on its own scope, e.g. `.cms-core[data-brand="lilp"] { --builder-accent: ... }`; lil.p does not yet import this CSS or alter existing visuals. No app-specific color, font, copy, widget or component is packaged. Future B7/D renderer/widget wrappers opt into the documented `cms-core__*` classes; B6's headless functions stay unchanged.

Token families: chrome, canvas, surface, raised, text, muted, border, accent/foreground/soft, focus, selection/drop, success/warning, body/display/mono typography, 4–48px spacing, 8–18px radii, shadow, fast/normal motion. The neutral palette follows U3; CSS supplies system-font fallbacks without relying on Next fonts. Test computed sRGB ratios for text and feedback on every supported surface (≥4.5:1), accent text on accent/soft (≥4.5:1), focus/selection/drop against adjacent surfaces (≥3:1). Opt-in controls have ≥44px hit areas and a 2px visible focus outline with 2px offset. `prefers-reduced-motion: reduce` removes transitions/animations. Disabled controls remain legible.

No raw CSS/HTML from the DB; no dependency, migration, HTTP contract or B1 golden changes. CSS builds alongside tsup's JS entries without changing ESM/CJS `use client` boundaries or existing 60/35 KiB JS gzip caps. Report CSS gzip independently, without silently including it in the JS totals. The U3 design samples remain the visual reference; B7 owns component/assembled-page visual review. Rollback: remove the opt-in CSS export and file; no runtime consumer currently loads it.

## Neutral review and coverage

The opt-in fixture uses only neutral copy and the same markup at 1440/390, light/dark. Reviewed samples: [light desktop](./assets/cms-b6b-theme/neutral-light-1440.png), [dark desktop](./assets/cms-b6b-theme/neutral-dark-1440.png), [light mobile](./assets/cms-b6b-theme/neutral-light-390.png), [dark mobile](./assets/cms-b6b-theme/neutral-dark-390.png). These are **core-token examples**, not new lil.p route baselines. Browser-computed styles check text/accent contrast, focus, 44px button/input heights, token-only override and reduced motion. The Node unit test additionally computes every named color pairing across both actual CSS palettes. A host override is responsible for retaining AA contrast.

| Review finding                                                                                | Resolution                                                                                    |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Desktop canvas stretched the sample panel across the whole screen.                            | Opt-in `cms-core__panel--narrow` caps reading panels at 880px; wide panels remain possible.   |
| Screenshots taken during CSS transitions made the primary button look disabled.               | Capture with Playwright animations disabled and assert the final computed primary background. |
| The drop target's dashed border touched the focused action in the mobile and desktop samples. | Add an opt-in 16px action gap; assert the rendered distance at both widths and modes.         |

Graphify's code-only graph does not model CSS declarations; the stylesheet, exported file, side effects and computed palette are checked directly by the package tests. Its report can list the preceding commit even when the code graph includes the newly extracted symbols; verify the diff and these tests rather than interpreting the commit stamp as CSS coverage.

## Verification

- `@parker2808/cms-core/theme.css`: 1,596 B gzip, separate from browser (864 B) and React (1,621 B, including 447 B `./react/server`) JS caps. No lockfile, migration or golden-contract changes.
- Neutral fixture: 4/4 Node and computed Chromium tests passed; reviewed the four linked desktop/mobile, light/dark captures after fixing the focus/action spacing. This fixture is not a host page baseline.
- `pnpm check:all --e2e` on disposable local MySQL: 9/9 passed, including API and web E2E. An earlier run passed the first seven checks and API E2E but failed the existing web contact hydration-value assertion and admin independent-scroll assertion (178 passed, 2 failed); no host code was changed or baseline loosened. The final complete run passed unchanged. The contact fix is in separate PR #183 and is not on this B6 stack.
