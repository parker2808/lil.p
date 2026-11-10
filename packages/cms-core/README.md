# CMS core package scaffold

`@parker2808/cms-core` exports independently built ESM/CJS subpaths:
`./contracts`, `./engine`, `./react`, and `./react/server`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy findings, stable ordering,
strict snapshots and version migrations, plus typed host ports; it does not
start transactions or call ports. Nest integration remains host-owned (B5b).
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

Build and check the browser gzip budgets with `pnpm --filter @parker2808/cms-core test` (which builds and checks the D1 combined cap).
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB combined `./react` + `./react/server`. These are **minified ESM artifact gzip sums**
(excluding only declared React/React DOM/Zod peer imports), not a claim about
downstream app tree-shaking. See the [B4 spec](../../docs/specs/2026-11-10-cms-b4-contracts-registry.md)
for the measured extraction baseline and rollback. All block definitions, host
policy, API routes and EN/VI UI remain in lil.p.
See the [B6 spec](../../docs/specs/2026-11-11-cms-core-b6-react.md) for the split and tests.
