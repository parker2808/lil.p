# CMS core package scaffold

`@parker2808/cms-core` currently exports empty, independently built ESM subpaths:
`./contracts`, `./engine`, and `./react`. `./react` preserves the `"use client"`
directive. No host code imports this package yet; B4 adds contracts/registry, B5
adds pure engine/ports, and B6 (after U2/U3 acceptance) extracts React.

Build and check the browser gzip budgets with `pnpm --filter @parker2808/cms-core build`.
The build runs `scripts/measure-cms-core.mjs` and fails above 60 KiB combined
contracts+engine or 35 KiB React. These are **minified ESM artifact gzip sums**
(excluding only React/Zod peer imports), not a claim about
downstream app tree-shaking. See the [B3 spec](../../docs/specs/2026-11-10-cms-b3-package-skeleton.md)
for the measured scaffold floor and rollback. All block definitions, host policy,
API routes and EN/VI UI remain in lil.p.
