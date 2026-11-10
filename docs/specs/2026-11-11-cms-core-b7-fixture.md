# B7 — standalone neutral CMS core fixture

**Status: resumed 2026-11-11 ICT; theme integration pending B6b publication.** Accepted B6 #191 `9e356db` and B5 #190 `71e9ce4` (strict snapshot reader) are merged into this branch without editing either sibling worktree. B6b is adding the core-owned neutral stylesheet on a separate branch; B7 must import its actual public export once pushed. The B7 draft on `docs/cms-prep-nonE2E`, the ADR on `docs/cms-core-adr`, and approved U3 on `feat/cms-u3-builder-design` define the acceptance gate.

## Plan

1. Merge accepted B5/B6 and verify built exports.
2. Implement standalone routes and host adapters.
3. Test unknowns, snapshots and client boundaries.
4. Import B6b theme through public export.
5. Capture and review responsive theme matrix.
6. Run locked gates and refresh documentation.
7. Open draft stacked PR and watch CI.

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

**Core-theme handoff:** B6b owns the neutral stylesheet and public export. B7 may implement the independent behavior and tests now, but must not substitute fixture-owned visual defaults. Read B6b's package export map before importing the stylesheet; the separate lil.p-inspired orange/green variant changes tokens only.

**Merge record:** B6 merge `7eba316` and B5 merge `83fe7e5` retain both branches' README, lessons, and §7/§9 notes. `packages/cms-core/test/exports.test.mjs` and the lockfile merge cleanly; the generated Graphify report is kept temporarily from B7 and must be regenerated after integration. Node 22 frozen install verifies the importer resolution before the gate.
