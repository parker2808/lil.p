# CMS B3 — package skeleton and measured browser budgets

Status: implementation proposal · 2026-11-10 · stacked on accepted B2 `44e2da4` · ADR PR #172.

## Plan

1. Freeze the B2 baseline and ADR package/import boundary.
2. Create three independently importable, typed build entries.
3. Add reproducible gzip measurements and enforce approved caps.
4. Test exports, browser isolation and over-budget rejection.
5. Refresh Graphify and documentation; run guarded E2E.
6. Open stacked draft PR and wait for green CI.

## Scope and sequencing

Parker accepted B2 PR #181 at `44e2da4` (CI 42832737761) without authorizing merge. The 20:46 ICT amendment allows backend B2–B5 alongside the U gate because packaging and pure contracts do not freeze UI controls. The later coordination update accepts U2/U3 on separate unmerged branches; B6 React extraction follows B4 approval and D follows B7. B3 creates `packages/cms-core` with independent `./contracts`, `./engine`, `./react` entry points, but does **not** move definitions, create a registry, extract logic or React, or connect the host runtime. The React entry retains a client directive for future extraction. No migrations, new external dependencies, API/route change, admin table Shortcuts dialog change, or visual change. Existing EN/VI and B1 HTTP goldens must remain untouched.

## Budget contract

The approved _starting_ caps (ADR line 94) are **60 KiB gzip** for the sum of browser ESM `contracts` and `engine` outputs and **35 KiB gzip** for browser ESM `react` excluding declared React 19, React DOM 19 and Zod 4 peers. A committed Node script builds or reads the production ESM artifacts, gzip-compresses each independently with fixed settings, reports bytes and caps, and exits nonzero on either breach. It runs in `pnpm check:all` and CI, not just on demand. The B4 measurement gate validates all three peer declarations before accepting their externalized imports and rejects host-specific imports; no size reduction via unstated externals or unused source entries. This empty B3 scaffold is a floor, **not** a representative B4–B6 size; rerun against each extraction. Record exact built baseline below after implementation. If a real baseline exceeds a cap, leave the cap unchanged and propose a revision with evidence for coordinator approval.

## Acceptance and rollback

Validate public subpath imports, declarations and ESM builds; check reproducible script and its over-limit failure with synthetic artifacts. `pnpm check:all --e2e` must run on a disposable MySQL under the shared lock; full stacked PR CI must be green. Rollback is reverting this package and its build/budget wiring: no consumer or persisted content depends on it, and B1/B2 behavior remains identical. No merge or B4 until explicitly authorized.

## Measured baseline

Node 22.21.1 / pnpm 10.34.9, `tsup` ESM minified build with splitting disabled, `gzipSync` level 9 and fixed mtime: contracts **20 bytes**, engine **20 bytes**, combined **40 / 61,440 bytes**; React **34 / 35,840 bytes**. Outputs are intentionally empty entry points (React retains `"use client"`), so this is a scaffold floor, not an estimate of extracted B4–B6 code. The ADR's provisional KiB caps are now the coordinator-approved B3 starting budgets, not permission to raise them without review.
