# CMS core

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
