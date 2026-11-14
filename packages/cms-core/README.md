# CMS core

`@parker2808/cms-core` exports independently built ESM/CJS subpaths:
`./contracts`, `./engine`, `./react`, and `./react/server`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy, stable ordering,
strict snapshots and version migrations. The Nest adapter remains host-owned.
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

Build and check the browser gzip budgets with `pnpm build` from this package (or
`pnpm --filter @parker2808/cms-core build` from the monorepo).
Run `pnpm check:deps` in either location to reject workspace/host dependencies
and imports from outside this package; CI runs this package-local gate after
the monorepo static checks. Its focused tests cover static imports, re-exports,
type imports, literal dynamic imports and CommonJS imports. Nonliteral computed
imports still require manual review during extraction.
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB combined `./react` + `./react/server`. These are **minified ESM artifact gzip sums**
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
