# CMS core

The package has no root `"."` export; import documented subpaths instead.

`@parker2808/cms-core` exports independently built ESM/CJS subpaths:
`./contracts`, `./engine`, `./react`, and `./react/server`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy, stable ordering,
strict snapshots, version migrations and typed host ports. The Nest adapter
remains host-owned; B5b wires it through a direct API production dependency.
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

D1's opt-in `./tree` ESM/CJS/types subpath exports bounded versioned tree
schemas, `readTree` for incomplete drafts, `validateTreeForPublish` for H1 and
required content, migration and lossless legacy conversion helpers, responsive
resolution and typed registry/errors. Depth, size and node limits are checked
before recursive parsing; mobile grids may have one column. Hosts own persistence
and must validate drafts separately from publication. See the
[D1 spec](../../docs/specs/2026-11-11-cms-d1-versioned-tree.md).

An empty tree is valid for `readTree` autosave, but `validateTreeForPublish` returns `HEADING_RULE` until exactly one H1 exists at every breakpoint. The host must not substitute the draft reader for publication.

D5 adds `applyTreeOperation`, `createTreeHistory`/`commitTreeHistory`/`undoTreeHistory`/`redoTreeHistory` and `DraftAutosave` to `./tree`. Supply an explicit D1 component registry to operations, history and autosave for strict property validation; duplicate operations need a host ID allocator. History coalesces typing on one node/breakpoint/key only within 600ms and retains at most 50 operations by default. Autosave accepts a D2 transport (`save({tree, expectedRevision})` and `read()`) and an injected timer; revisions are decimal strings. `review()` reads the remote draft after a conflict or uncertain save but never overwrites local state. A valid legacy-mode `{tree: null}` response enters `legacy` review status and blocks further saves, retaining the local tree for host export/recovery. `resolveReviewed('acknowledge')` requires a matching builder tree; `resolveReviewed('reload', { discardLocalEdits: true })` requires explicit host confirmation and cannot load a null tree. There is no browser storage or live UI wiring in this package change; see the [D5 spec](../../docs/specs/2026-11-11-cms-d5-core-logic.md). D6 must supply all 20 host block schemas and test each type; the neutral core does not import portfolio definitions.

Call `endTreeTyping(history)` on blur/explicit commit to close the current coalescing window; editing afterward starts a separate undo entry.
D3's opt-in `renderTree({ input, createElement, labels, registry?, components?, resolveMedia? })` is exported from `./react/server`. Pass the host's React `createElement`; the returned `{ ok, content }` is suitable for both authorized draft preview and public SSR. On failure, it also returns the typed error code and original input, and renders only the host-localized safe warning rather than a partial tree. `INVALID_PROPS` covers invalid resolved media; thrown host renderer/resolver failures return `RENDER_FAILED`. The same draft reader handles both views; call `validateTreeForPublish` separately in the host's publish path. Core supports nested sections, rows, columns and grids (mobile single-column unless explicitly overridden), validated starter components and explicitly registered host components. Responsive row spans apply at mobile/tablet/desktop and a responsive heading emits one semantic heading element. The server entry imports no editor/client module; `theme.css` styles the opt-in `.cms-core .cms-tree` markup with neutral tokens and responsive breakpoints. `CMS_TREE_BROWSER=1 node --test packages/cms-core/test/tree-renderer.test.mjs` runs the computed-layout matrix under the E2E lock; production host snapshot dispatch remains with D2 and route parity with D6. Legacy `renderBlocks` remains the default. See [D3 spec](../../docs/specs/2026-11-11-cms-d3-shared-ssr-renderer.md).
An empty tree is valid for `readTree` autosave, but `validateTreeForPublish` returns `HEADING_RULE` until exactly one H1 exists. Multiple H1s also fail; the host must not substitute the draft reader for publication.
The semantic `heading` renderer is core-owned: do not pass `components.heading`. A host override returns `RENDER_FAILED` and a safe warning instead of duplicating responsive heading tags.
D5 adds `applyTreeOperation`, `createTreeHistory`/`commitTreeHistory`/`undoTreeHistory`/`redoTreeHistory` and `DraftAutosave` to `./tree`. Supply the host's explicit D1 component registry for edits, history and autosave; core never imports host definitions. Autosave uses decimal-string D2 revisions, keeps local edits through 409 and uncertain saves, and treats a legacy-mode `tree: null` as blocked review rather than an empty builder. Remote reload requires explicit `discardLocalEdits: true`. D6's 20-definition gate is described in [the D6 spec](../../docs/specs/2026-11-11-cms-d6-route-parity.md); see also [D5 core logic](../../docs/specs/2026-11-11-cms-d5-core-logic.md).

D3 adds opt-in `renderTree({ input, createElement, labels, registry?, components?, resolveMedia? })` to `./react/server`. Both draft preview and public SSR use the same bounded draft reader; hosts separately call `validateTreeForPublish` when publishing. Invalid trees produce a localized typed fallback without partial output, while thrown host renderers return `RENDER_FAILED`. Core owns semantic headings: `components.heading` is rejected to prevent duplicate H1 elements. Heading level changes across breakpoints are allowed while editing drafts, but publishing or SSR rejects them with `HEADING_RULE` because each node has one semantic heading tag. Responsive rows and columns are covered by the `CMS_TREE_BROWSER=1` browser matrix; legacy block rendering remains the default until D2 dispatch and D6 route parity. See the [D3 spec](../../docs/specs/2026-11-11-cms-d3-shared-ssr-renderer.md).

Build and check the browser gzip budgets with `pnpm build` from this package (or
`pnpm --filter @parker2808/cms-core build` from the monorepo).
Run `pnpm check:deps` in either location to reject workspace/host dependencies
and imports from outside this package; CI runs this package-local gate after
the monorepo static checks. Its focused tests cover static imports, re-exports,
type imports, literal dynamic imports and CommonJS imports. Nonliteral computed
imports still require manual review during extraction.
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine+tree or 35 KiB combined `./react` + `./react/server`. These are **minified ESM artifact gzip sums**
(excluding only declared React/React DOM/Zod peer imports), not a claim about
downstream app tree-shaking. The package is private and `UNLICENSED`; only
`dist/**`, this README, the license notice and the manifest belong in its archive.
All block definitions, host policy, API routes and EN/VI UI remain in lil.p.
See the [B4 spec](../../docs/specs/2026-11-10-cms-b4-contracts-registry.md)
for the measured extraction baseline and rollback and the
[B6 spec](../../docs/specs/2026-11-11-cms-core-b6-react.md) for the React split and tests.

For a standalone extraction, run `pnpm install --lockfile-only` once with pnpm
10.34.9, commit the resulting package-root `pnpm-lock.yaml` in the private
repository, then require `pnpm install --frozen-lockfile` in CI. The monorepo
uses its root lockfile instead; do not copy that workspace lockfile into this
package or add a second lockfile to the public monorepo.

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
