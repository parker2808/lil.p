# B7 — standalone neutral CMS core fixture

**Status: blocked before fixture implementation (2026-11-11 ICT).** B6 draft PR #191 at `7e3b317` passed all 15 checks in CI run `42873734546`. This branch merged B5 `acfb18c` into B6, without changing either sibling worktree. The P1 snapshot-strip fix is still pending on B5 and must be merged again before final verification. The B7 draft on `docs/cms-prep-nonE2E`, the ADR on `docs/cms-core-adr`, and approved U3 on `feat/cms-u3-builder-design` define the acceptance gate.

## Plan

1. Pin built-package symbols and boundary evidence.
2. Resolve B5/B6 stack and snapshot behavior.
3. Decide ownership of core default theme.
4. Build isolated bilingual fixture from public exports.
5. Add lossless snapshot and keyboard tests.
6. Capture and review responsive theme matrix.
7. Re-merge B5 fix and run locked gates.
8. Refresh Graphify and project documentation.
9. Open draft stacked PR after approval.

## Verified built exports

Building the merged core on Node 22 and importing its _built package_ from the package workspace yields these runtime exports:

| Subpath          | Runtime exports                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `./contracts`    | `createRegistry`, `defineBlock`, `isBlockAllowedOnPage`, `adminBlockSchema`, `blockKeySchema`, `blockSurfaceSchema`, `invalidPreviewBlockSchema`, `layoutPresetSchema`, `localeQuerySchema`, `localeSchema`, `pageKeySchema`, `pageSnapshotBlockSchema`, `pageSnapshotSchema`, `pageSnapshotSeoSchema`, `publicBlockSchema`, `publicPagePreviewSchema`, `publicPageSchema`, `publicPageSeoSchema` |
| `./engine`       | `buildSnapshot`, `checkBlockLayout`, `checkBlockLimit`, `checkBlockRole`, `checkH1Insert`, `checkPageAllowance`, `findBlock`, `insertSortOrder`, `migrateSnapshot`, `nextBlockKey`, `orderBlocks`, `readSnapshot`                                                                                                                                                                                 |
| `./react`        | `SchemaFieldControl`, `SchemaForm`, `createEditorMetadata`, `fieldMessage`, `schemaToFields`                                                                                                                                                                                                                                                                                                      |
| `./react/server` | `renderBlocks`                                                                                                                                                                                                                                                                                                                                                                                    |

`./react/server` is the public server-safe block dispatcher; `./react` is the client-marked form/widget contract. There is **no exported `BlockRenderer` symbol**. The merged minified gzip totals are contracts+engine **2,278/61,440 bytes** and combined React **1,645/35,840 bytes** (server 447 bytes). These are artifact sizes before the fixture, not a proof of fixture isolation.

## Integration and blocking decision

The first merge resolved adjacent B5/B6 edits in `PROJECT_CONTEXT.md`, the root/core READMEs, `docs/LESSONS.md`, and `packages/cms-core/test/exports.test.mjs` by retaining both branches' statements/assertions. `graphify update .` regenerated the report to remove graph conflict markers; Node 22 `pnpm install --frozen-lockfile` required **no lockfile change**. B5's current `readSnapshot` calls a Zod object parser that silently strips unknown block-level fields on a successful read, so the required lossless-or-typed-rejection fixture must not be weakened to pass this head. Await the B5 P1 correction and re-merge its newer head before finalizing.

**Core-theme blocker:** The package exports only the four JavaScript subpaths above and contains **no stylesheet, neutral token defaults, or CSS/theme export**. Styling a neutral sample solely inside `examples/cms-core-fixture` would be a host-owned theme; it would not prove the ADR's core-owned polished default theme works without a host theme. B7 ownership excludes `packages/cms-core/src/**` and its export topology. Per coordinator instructions, do not silently substitute fixture styling or edit core. Decide whether an approved core owner will supply an exported default stylesheet/token contract, or explicitly amend B7 acceptance to make the neutral defaults fixture-owned, before implementation proceeds. The separate lil.p-inspired orange/green override remains token-only in either case.
