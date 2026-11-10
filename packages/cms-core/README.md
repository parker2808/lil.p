# CMS core package scaffold

`@parker2808/cms-core` exports three independently built ESM subpaths:
`./contracts`, `./engine`, and `./react`. B4 provides generic Zod
page/block/locale/snapshot contracts, `defineBlock`, `createRegistry`, and the
host-keyed page-allowance predicate through `./contracts`. The host keeps all
20 block definitions and composes its finite block-type schema from them.
`./engine` provides B5's pure registry-injected policy findings, stable ordering,
strict snapshots and version migrations, plus typed host ports; it does not
start transactions or call ports. The Nest adapter remains host-owned and is
not wired by B5 pending approval for the direct API production dependency.
`./react` remains empty until B6 and preserves the `"use client"` directive.
All three subpaths publish CommonJS and legacy TypeScript subpath resolution.
React 19, React DOM 19 and Zod 4 are peers (also local development dependencies for package tests).

Build and check the browser gzip budgets with `pnpm --filter @parker2808/cms-core build`.
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB React. These are **minified ESM artifact gzip sums**
(excluding only declared React/React DOM/Zod peer imports), not a claim about
downstream app tree-shaking. See the [B4 spec](../../docs/specs/2026-11-10-cms-b4-contracts-registry.md)
for the measured extraction baseline and rollback. All block definitions, host
policy, API routes and EN/VI UI remain in lil.p.
