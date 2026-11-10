# D1 — versioned layout tree contract

**Status:** implementation draft. D1 pure-core work starts early alongside B7; **D1 acceptance waits for B7 approval**. Stack on accepted B6 `9e356db` and carry accepted B5 `71e9ce4` via merge `3303664`. No persistence, host adapter, API, migrations, dependency or legacy golden changes. B6b also changes `package.json` and `tsup.config.ts`; D1 adds only the tree entry/exports and expects a sibling merge conflict.

## Contract

- `TreeDocument` v1 has `schemaVersion: 1`, root `page` and stable opaque IDs. Page has `sections`; section has `content`; row has `columns`; column has `content`; grid has `items`; content accepts registered components or row/grid, grid items components only. No empty root restriction; a fresh builder page is valid. IDs must be unique throughout; reorder preserves IDs, duplicate operations must allocate new ones.
- Nodes carry `responsive` with required `base` and optional `mobile`, `tablet`, `desktop` object overrides. Override resolution merges shallowly over base. Layout props and starter component props have bounded schemas; host components require an explicitly supplied registry. No arbitrary HTML/JS/CSS, unsafe URLs or unvalidated rich text.
- Hard limits: 5 levels (page→section→row→column→component), 500 nodes, 256 KiB serialized UTF-8 and 128 KiB per JSON props value; reject oversize before validation. Strict objects reject unknown fields; JSON values must be serializable. Typed `TreeResult` errors retain the original input unchanged and never rewrite unknown/future schemas or unregistered components.
- `migrateTree` reads v0 (same slots and `props` instead of responsive) and v1, migrates only the known v0→v1 step, and is deterministic/idempotent; future/negative versions reject. `readTree` rejects older versions until explicitly migrated. `convertLegacySnapshot` is opt-in, never persists: it wraps each legacy `PageSnapshotBlock` as a section with one `legacy-component`, carrying every field verbatim including unknown block types and nested props. SEO is kept verbatim in an explicitly separate legacy conversion result; invalid keys, duplicate derived IDs and malformed/oversized snapshots reject without mutation. Unknown legacy types remain opaque data, not executable components.
- Zod v0/v1 schemas and validation functions are exported via `./tree` for D2 server reuse; schema validation and host registry policy must run at both save/publish in D2. D1 does not change B5's block snapshots, Nest codes or B1 goldens. EN/VI locale is a host concern, not baked into this structure.
- Combined minified ESM `./contracts` + `./engine` + `./tree` must fit the existing 60 KiB gzip cap; React surfaces retain 35 KiB. Test the additional combined cap in the new D1 tree test without changing B6's measurement script. ESM, CJS, declarations and no-host-import checks run through package build/check:all.

## Plan (8 lines)

1. Resolve B5/B6 merge, preserving both docs/tests.
2. Define strict versioned tree and slot schemas.
3. Enforce IDs, bounds and registered component policies.
4. Add deterministic v0 migration and responsive resolution.
5. Add lossless opt-in legacy snapshot conversion.
6. Test rejection, round-trips, exports and bundle cap.
7. Refresh Graphify and documentation; run check:all.
8. Publish draft stacked PR, label and verify CI.

**Rollback:** revert only the new `./tree` export, implementation, tests and docs; no stored rows or snapshots change. D2 must separately design rollback-read for newly published tree pages.

**Measured baseline (Node 22, minified ESM, gzip level 9/mTime 0):** contracts 844 B + engine 1,589 B + tree 2,885 B = **5,318/61,440 B**. React 1,174 B + React/server 447 B = **1,621/35,840 B**. The package build still reports the original contracts+engine subset; `tree-contract.test.mjs` additionally fails the 60-KiB combined cap if the new tree entry grows over budget. No cap revision is requested. B5/B6 merge conflict resolution: preserved their separate README/context/lessons and engine+React export assertions, and regenerated the generated Graphify report rather than combining its conflict markers.
