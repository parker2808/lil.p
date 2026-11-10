# D3 — shared server-side tree renderer

**Status:** stacked draft on `feat/cms-d-base`. D1 `./tree` is available; D2 tree snapshot dispatch, persistence, and publish gate are not. No production tree route is enabled in D3.

## Contract and boundaries

- Add `renderTree` to the existing server-safe `@parker2808/cms-core/react/server` entry. It calls public `@parker2808/cms-core/tree` `readTree` for both authorized preview and public SSR; publish is D2's responsibility via `validateTreeForPublish`. The same input, registry, breakpoint-independent HTML, and error result serve both surfaces. The renderer never migrates or normalizes unknown input on read.
- Render Page → Section → Row/Column or Grid → starter components. Resolve responsive properties with `resolveResponsive`: desktop/base, tablet, mobile in descending CSS breakpoints; mobile grid permits one column. Use only bounded, schema-validated props. React escapes rich text as text; external/approved local image URLs remain restricted by D1. No arbitrary DB HTML, CSS, scripts, or host imports in core.
- Rows honor each column's mobile, tablet and desktop `span` override at 390/768/1440; a missing mobile override retains the single-column default. A responsive heading must produce exactly one semantic heading element per node in SSR (responsive text variants are non-heading descendants). Distinguish host renderer/media resolver exceptions (`RENDER_FAILED`) from unsafe or missing resolved media (`INVALID_PROPS`).
- The host supplies localized warning copy, media resolver and optional typed component renderers. Unsupported versions, malformed/over-limit trees, unknown components and opaque legacy nodes produce a typed failure and safe visible warning, retaining the original input in the result; never render a partial page or raw untrusted data. Legacy `renderBlocks` stays the default. Host tree snapshot routing remains a D2 interface/flag handoff, not live wiring here.
- Use core's opt-in `theme.css` and neutral tokens; lil.p brand changes token values only. No new public subpath, dependency, budget or DB migration. Public import graph must not pull `./react` client editor/widgets; standalone fixture covers the tree without Next or Nest.

## Acceptance

- Pure SSR tests cover ordered sections, rows/columns, responsive one-column grid, heading/paragraph/rich text/image/button/divider/spacer, token/theme styling, locale labels, safe URL/media semantics and HTML parity between preview/public calls. Invalid/deep/wide/future/unknown trees fail with an unchanged input and warning, not a `RangeError` or silent drop.
- The unit SSR contract does not claim route-level preview/public parity: D2 dispatch and D6 route parity remain open. Run the 390/768/1440 browser matrix in local `check:all --e2e` and the required shard-1 CI gate; test computed row widths and visible heading text, not only emitted CSS variables.
- Check built ESM/CJS `./react/server` for absence of `"use client"` and editor imports, core budgets (60/35 KiB) and production public chunks for zero builder/editor modules. Browser visual matrix (EN/VI × light/dark × 1440/390, plus tablet) requires the shared E2E lock; no claims of end-to-end route parity before D2 dispatch exists.
- Existing legacy HTTP goldens and public route visuals remain unchanged. D2 must implement explicit snapshot dispatch, authorize preview, and hold publish disabled until transaction and parity evidence is reviewed.

## Visual evidence and limitations

- Reproduce neutral SSR captures with `CMS_TREE_BROWSER=1 CMS_TREE_CAPTURES_DIR=docs/specs/assets/cms-d3 node --test packages/cms-core/test/tree-renderer.test.mjs` after building the package, **while holding the shared E2E lock**. Reviewed captures: [EN light 1440](./assets/cms-d3/en-light-1440.png), [EN dark 1440](./assets/cms-d3/en-dark-1440.png), [VI light 1440](./assets/cms-d3/vi-light-1440.png), [VI dark 1440](./assets/cms-d3/vi-dark-1440.png), [EN light 390](./assets/cms-d3/en-light-390.png), [EN dark 390](./assets/cms-d3/en-dark-390.png), [VI light 390](./assets/cms-d3/vi-light-390.png), [VI dark 390](./assets/cms-d3/vi-dark-390.png). The same browser test verifies the tablet 768 grid, neutral tokens, token-only host override and focus. Findings → fixes: (1) a missing local image in `about:blank` produced broken-image icons → serve an approved fixture SVG through a mocked media resolver; (2) the capture accidentally included a low-contrast demo override → capture neutral before testing the token override. Live lil.p brand/public previews remain **blocked on D2**, not claimed as complete here.
- The local Next production build's public catch-all `page_client-reference-manifest.js` lists 29 client modules and 13 unique client chunks; inspection of those 13 chunk files found **zero** occurrences of `SchemaForm`, `BlockInspector`, `BuilderShell` or `cms-tree__`. This is an import-boundary check for the existing public route, **not** proof of live tree rendering; D2 must make the snapshot format available before host parity can run.
- `graphify update .` refreshed the code graph; its code-only extraction does not establish documentation coverage. The D1 spec, Phase D Lane C brief, verification draft, scoped README and this spec were reviewed manually for D3's D2 handoff.
- Review follow-up: the earlier run `42906568760` belonged to superseded head `a17a329`; head `14bdd01` passed its 14 required checks in run `42913081191`. The next head must separately pass the new mandatory shard-1 browser matrix and all other checks; never infer current-head status from the superseded run. Browser coverage is a renderer contract only; D2/D6 still own actual route parity.

## Plan (7 lines)

1. Read Graphify and lock tree interfaces.
2. Implement bounded server-only tree traversal.
3. Style semantic and breakpoint-aware core output.
4. Exercise SSR, rejection and import boundaries.
5. Document host dispatch and remaining D2 gate.
6. Regenerate Graphify; run local and CI gates.
7. Open stacked draft PR; never merge.

**Rollback:** revert only D3 server renderer and opt-in fixture usage; do not remove a persisted tree or disable legacy rendering. Production dispatch remains untouched.
