<!-- Archived verbatim from docs/plans/ui-redesign.md (5. Grid and breakpoints); links re-pointed. Index: ../../plans/ui-redesign.md -->

## 5. Grid and breakpoints

- **Public:**
  - Container `1320px` plus fluid margins `clamp(20px, 5vw, 72px)`.
  - 12 columns with a `clamp(16px, 2vw, 24px)` gutter.
  - A **rail** of three columns for the `§` index and sticky TOC; content takes columns 4–12.
  - Breakpoints: 560 (single column), 760, 860 (nav → menu), 960 (rail collapses), 1024 (split-pane reader), 1280.
- **Admin:**
  - The app grid is `16rem | 1fr`; with an aside it is `16rem | 1fr | 18rem`. At ≥ 1280 it widens to 18/20rem, like the KB `w-64 xl:w-72`.
  - Data pages cap at `80rem`; the editor canvas caps at **`48rem`** (the KB `max-w-prose`).
  - Below 1100 the aside folds into the main column; below 860 the sidebar becomes the drawer `w-[min(100%,20rem)]`.
  - Tables become cards below 640.
- **Block layout presets** (`packages/contracts/src/blocks/block-layout.constant.ts`, unchanged) map onto the grid: `ONE` → 12, `TWO` → 6 + 6, `THREE` → 4 × 3, `FOUR` → 3 × 4, `SPLIT_8_4` → 8 + 4, `SPLIT_4_8` → 4 + 8, `SPLIT_7_5` → 7 + 5.
- **Surfaces:** `PLAIN` → paper, `BAND` → sunken. The `cta-band` block always renders the inverse surface: a block-type style, not a new surface value.

---

