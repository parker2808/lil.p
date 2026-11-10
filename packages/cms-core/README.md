# CMS core package scaffold

`@parker2808/cms-core` exports independently built ESM/CJS subpaths:
`./contracts`, `./engine`, `./react`, and `./react/server`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy findings, stable ordering,
strict snapshots and version migrations, plus typed host ports; it does not
start transactions or call ports. The Nest adapter remains host-owned and is
not wired by B5 pending approval for the direct API production dependency.
B6's `./react/server` contains headless ordered
block dispatch with host-supplied renderers, grouping, wrappers, and draft-only
unknown notices; it imports no client form/widget code. `./react` exposes Zod
schema field derivation, headless form controls and editor metadata, preserving
the built `"use client"` directive in ESM and CJS. All subpaths publish
CommonJS and legacy TypeScript subpath resolution for the existing hosts.
`schemaToFields(schema, { labelFor, widgetKinds? })` requires the host to
resolve each field path and optional metadata key to a localized label;
missing labels are errors. Core maps only generic widget kinds, while hosts
register domain widgets through `widgetKinds` and supply their own controls.
React 19, React DOM 19 and Zod 4 are peers (also local development dependencies for package tests).

D1's opt-in `./tree` entry exports `treeDocumentSchema`, `legacyTreeDocumentSchema`, `readTree` (autosave-safe draft validation), `validateTreeForPublish` (H1 and required-content gates), `migrateTree`, `convertLegacySnapshot`, `resolveResponsive`, `TREE_LIMITS`, `TREE_VERSION`, `treeIdSchema`, `responsiveSchema`, `starterComponentSchemas` and typed tree/registry/error contracts. Its strict Page → Section → row/column or grid → component slots and 5-depth/500-node/256-KiB bounds reject unknown versions/types/fields and duplicate IDs; tree/props depth and node count are checked iteratively before Zod parsing. Columns and grids contain components only, so every legal layout can hold content within the five-level depth budget. Grid mobile overrides may use a single column; desktop requires at least two. Host components register their own Zod props. The converter preserves unknown legacy block types as opaque `legacy-component` data, separate from SEO; it never writes to the database. D2 must explicitly adopt the tree path after B7 approval, calling the publish validator only at publish time. The new tree test enforces the combined contracts+engine+tree 60-KiB limit without changing the B6 budget script.

D3's opt-in `renderTree({ input, createElement, labels, registry?, components?, resolveMedia? })` is exported from `./react/server`. Pass the host's React `createElement`; the returned `{ ok, content }` is suitable for both authorized draft preview and public SSR. On failure, it also returns the typed error code and original input, and renders only the host-localized safe warning rather than a partial tree. `INVALID_PROPS` covers invalid resolved media; thrown host renderer/resolver failures return `RENDER_FAILED`. The same draft reader handles both views; call `validateTreeForPublish` separately in the host's publish path. Core supports nested sections, rows, columns and grids (mobile single-column unless explicitly overridden), validated starter components and explicitly registered host components. Responsive row spans apply at mobile/tablet/desktop and a responsive heading emits one semantic heading element. The server entry imports no editor/client module; `theme.css` styles the opt-in `.cms-core .cms-tree` markup with neutral tokens and responsive breakpoints. `CMS_TREE_BROWSER=1 node --test packages/cms-core/test/tree-renderer.test.mjs` runs the computed-layout matrix under the E2E lock; production host snapshot dispatch remains with D2 and route parity with D6. Legacy `renderBlocks` remains the default. See [D3 spec](../../docs/specs/2026-11-11-cms-d3-shared-ssr-renderer.md).

An empty tree is valid for `readTree` autosave, but `validateTreeForPublish` returns `HEADING_RULE` until exactly one H1 exists. Multiple H1s also fail; the host must not substitute the draft reader for publication.

The semantic `heading` renderer is core-owned: do not pass `components.heading`. A host override returns `RENDER_FAILED` and a safe warning instead of duplicating responsive heading tags.

Build and check the browser gzip budgets with `pnpm --filter @parker2808/cms-core test` (which builds and checks the D1 combined cap).
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB combined `./react` + `./react/server`. These are **minified ESM artifact gzip sums**
(excluding only declared React/React DOM/Zod peer imports), not a claim about
downstream app tree-shaking. See the [B4 spec](../../docs/specs/2026-11-10-cms-b4-contracts-registry.md)
for the measured extraction baseline and rollback. All block definitions, host
policy, API routes and EN/VI UI remain in lil.p.
See the [B6 spec](../../docs/specs/2026-11-11-cms-core-b6-react.md) for the split and tests.

## Neutral default theme

Import `@parker2808/cms-core/theme.css` once in an app stylesheet. Place
`class="cms-core"` around the CMS UI and optionally `data-theme="dark"` on
that element or an ancestor. Without a host theme, the light/dark tokens
provide styled panels, canvas, toolbar, title, field/label/input, button,
status, selection and drop zones via opt-in `cms-core__*` classes. B6's
headless renderer and form contracts emit no DOM classes themselves; hosts
apply the classes to their wrappers/widgets (B7's neutral fixture is the
first independent consumer). Core styles do not affect elements outside
`.cms-core`.

The semantic `--builder-*` tokens cover chrome/canvas/surfaces, foreground,
muted/feedback/accent/focus colors, fonts, spacing, radii, shadows and motion.
Use a **token-only** host adapter: `.cms-core[data-brand="your-host"] {
--builder-accent: <accessible-color>; }` and, if needed, a dark selector.
Never override component markup or copy the portfolio theme into core.
Keep accent/foreground and muted/surface text ≥4.5:1 and focus/selection
≥3:1 when overriding. Core buttons and inputs have 44px minimum targets,
visible keyboard focus and reduced-motion behavior. The stylesheet is a
side-effectful public export, measured independently of the original JS
gzip budgets; see [B6b spec](../../docs/specs/2026-11-11-cms-b6b-core-theme.md).
