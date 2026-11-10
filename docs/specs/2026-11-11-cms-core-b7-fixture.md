# B7 — standalone neutral CMS core fixture

**Status: implementation and visual review complete 2026-11-11 ICT; stacked draft PR/CI pending.** Accepted B6 #191 `9e356db`, B5 #190 `71e9ce4` (strict snapshot reader), and B6b `e12774e` (neutral theme) are merged into this branch without editing sibling worktrees. The B7 draft on `docs/cms-prep-nonE2E`, the ADR on `docs/cms-core-adr`, and approved U3 on `feat/cms-u3-builder-design` define the acceptance gate.

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

`./react/server` is the public server-safe block dispatcher; `./react` is the client-marked form/widget contract. There is **no exported `BlockRenderer` symbol**. The merged minified gzip totals are contracts+engine **2,433/61,440 bytes** and client React **1,621 bytes**, server React **447 bytes** (combined **2,068/35,840 bytes**). B6b's separate `./theme.css` export is **1,596 bytes gzip**; CSS is not counted against JS caps.

## Integration and blocking decision

The first merge resolved adjacent B5/B6 edits in `PROJECT_CONTEXT.md`, the root/core READMEs, `docs/LESSONS.md`, and `packages/cms-core/test/exports.test.mjs` by retaining both branches' statements/assertions. `graphify update .` regenerated the report to remove graph conflict markers; Node 22 `pnpm install --frozen-lockfile` required **no lockfile change**. B5's current `readSnapshot` calls a Zod object parser that silently strips unknown block-level fields on a successful read, so the required lossless-or-typed-rejection fixture must not be weakened to pass this head. Await the B5 P1 correction and re-merge its newer head before finalizing.

**Core-theme handoff complete:** B6b's `package.json` exports `@parker2808/cms-core/theme.css`. The fixture imports it once, applies `.cms-core` around its chrome, and uses an independent `override.css` with only `--builder-*` orange/green values scoped to `[data-brand='lilp']`. Neutral defaults remain in core; fixture CSS is layout, not a replacement palette. Light/dark mode is inherited from the root `data-theme` attribute.

**Merge record:** B6 merge `7eba316` and B5 merge `83fe7e5` retain both branches' README, lessons, and §7/§9 notes. `packages/cms-core/test/exports.test.mjs` and the lockfile merge cleanly; the generated Graphify report is kept temporarily from B7 and must be regenerated after integration. Node 22 frozen install verifies the importer resolution before the gate.

## Implementation and review

- B6b merge `345320a` required no source or lockfile conflict. Shared edits are exactly the `examples/*` workspace inclusion and its lockfile importer; no existing application or B1 golden changes. The fixture uses built package subpaths only, host-defined registry/renderer/widgets, required locale-specific labels, deterministic media/capability ports and in-memory editing. Its four routes are `/en|vi/`, `/components`, `/editor`, `/unknown`; the invalid route renders localized not-found with `noindex`. Nothing saves or publishes.
- Frozen raw snapshots cover legacy missing SEO (typed `INVALID_SNAPSHOT`, with Nest legacy compatibility owned by B5b), current accepted, future root/block versions, unknown block type and unknown block fields. An extra unknown nested prop is retained losslessly. The test asserts original JSON is unchanged after repeated rejection/acceptance; B1 goldens remain untouched.
- Public `render.tsx` imports only `./react/server`; `Editor.tsx` imports client `./react` through a lazy editor island. The Vite output places `SchemaForm`, `widgetKinds` and localized editor code only in `Editor-*.js`, not `index-*.js`. Built ESM and CJS both resolve all four JS subpaths; server files have no client directive or hooks while both client formats retain their first-line directive. The CSS export is loaded separately.
- Self-review: inspected EN neutral light desktop editor, VI lil.p dark mobile editor, VI lil.p dark mobile home and EN neutral light mobile gallery/focus captures. The first editor capture caught the lazy loading fallback instead of real panels; route readiness assertions fixed it and the matrix was recaptured. Mobile navigation previously cut off the last tab; a two-column grid now exposes all four destinations at 390px. The gallery displays focused, disabled, error, long-text and unknown states. Remaining mobile editor is a **Phase B block-list example**, not the Phase D builder; no nested tree/drag/persistence claim.
- `FIXTURE_CAPTURE=1 pnpm --filter @parker2808/cms-core-fixture test:e2e` passes four Chromium tests; axe WCAG 2/2.1 AA checks EN/VI × neutral/lil.p × light/dark × 1440/390 editor with no violations or horizontal overflow. The 80-image manifest (`examples/cms-core-fixture/e2e/__screenshots__/manifest.json`) covers four routes plus focused gallery at every locale/theme/brand/width tuple. Build, typecheck and eight unit tests pass. `graphify update .` refreshed the report from code commit `f9735d0` (7,062 nodes, 22,205 edges). Under `~/.t3/locks/lilp-e2e.lock` with disposable tmpfs MySQL, `env -u DATABASE_URL -u DATABASE_URL_TEST bash scripts/r3-12-e2e-gate.sh` passes **9/9** including API and web E2E; lock and container were released. The first full attempt had a false email match in compressed PNG bytes (losslessly recompressed; ImageMagick pixel difference zero) and one transient pre-existing contact-form hydration failure (179 web cases passed); the unchanged form passed on the complete rerun. No app or test workaround was introduced.
