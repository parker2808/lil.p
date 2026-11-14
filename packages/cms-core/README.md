# CMS core

`@parker2808/cms-core` exports three independently built ESM subpaths:
`./contracts`, `./engine`, and `./react`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy findings, stable ordering,
strict snapshots and version migrations, plus typed host ports; it does not
start transactions or call ports. The Nest adapter remains host-owned and is
wired by B5b through the direct API production dependency provided by #189.
`./react` remains empty until B6 and preserves the `"use client"` directive.
All three subpaths publish CommonJS and legacy TypeScript subpath resolution.
React 19, React DOM 19 and Zod 4 are peers (also local development dependencies for package tests).

Build and check the browser gzip budgets with `pnpm build` from this package (or
`pnpm --filter @parker2808/cms-core build` from the monorepo).
Run `pnpm check:deps` in either location to reject workspace/host dependencies
and imports from outside this package; CI runs this package-local gate after
the monorepo static checks. Its focused tests cover static imports, re-exports,
type imports, literal dynamic imports and CommonJS imports. Nonliteral computed
imports still require manual review during extraction.
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB React. These are **minified ESM artifact gzip sums**
(excluding only declared React/React DOM/Zod peer imports), not a claim about
downstream app tree-shaking. The package is private and `UNLICENSED`; only
`dist/**`, this README, the license notice and the manifest belong in its archive.
All block definitions, host policy, API routes and EN/VI UI remain in lil.p.

For a standalone extraction, run `pnpm install --lockfile-only` once with pnpm
10.34.9, commit the resulting package-root `pnpm-lock.yaml` in the private
repository, then require `pnpm install --frozen-lockfile` in CI. The monorepo
uses its root lockfile instead; do not copy that workspace lockfile into this
package or add a second lockfile to the public monorepo.
