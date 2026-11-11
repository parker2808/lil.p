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

An empty tree is valid for `readTree` autosave, but `validateTreeForPublish` returns `HEADING_RULE` until exactly one H1 exists. Multiple H1s also fail; the host must not substitute the draft reader for publication.

D5 adds `applyTreeOperation`, `createTreeHistory`/`commitTreeHistory`/`undoTreeHistory`/`redoTreeHistory` and `DraftAutosave` to `./tree`. Supply a D1 component registry for strict property validation; duplicate operations need a host ID allocator. History coalesces typing on one node/breakpoint/key only within 600ms and retains at most 50 operations by default. Autosave accepts a D2 transport (`save({tree, expectedRevision})` and `read()`) and an injected timer; revisions are decimal strings. `review()` reads the remote draft after a conflict or uncertain save but never overwrites local state. `resolveReviewed('acknowledge')` is allowed only when remote matches the known attempted or acknowledged tree; `resolveReviewed('reload')` explicitly discards local edits, so the host must offer export/confirmation first. There is no browser storage or live UI wiring in this package change; see the [D5 spec](../../docs/specs/2026-11-11-cms-d5-core-logic.md).

Call `endTreeTyping(history)` on blur/explicit commit to close the current coalescing window; editing after that boundary starts a separate undo entry.

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
