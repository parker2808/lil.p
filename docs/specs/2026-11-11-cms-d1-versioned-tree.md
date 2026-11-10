# D1 — versioned layout tree contract

**Status:** implementation draft. D1 pure-core work starts early alongside B7; **D1 acceptance waits for B7 approval**. Stack on accepted B6 `9e356db` and carry accepted B5 `71e9ce4` via merge `3303664`. No persistence, host adapter, API, migrations, dependency or legacy golden changes. B6b also changes `package.json` and `tsup.config.ts`; D1 adds only the tree entry/exports and expects a sibling merge conflict.

## Contract

- `TreeDocument` v1 has `schemaVersion: 1`, root `page` and stable opaque IDs. Page has `sections`; section has `content` (components, row or grid); row has `columns`; column has component-only `content`; grid has component-only `items`. The discriminated TypeScript union mirrors these slots. A fresh empty builder page is valid. IDs must be unique throughout; reorder preserves IDs, duplicate operations must allocate new ones.
- Nodes carry `responsive` with required `base` and optional `mobile`, `tablet`, `desktop` object overrides. Override resolution merges shallowly over base. Layout props and starter component props have bounded schemas; host components require an explicitly supplied registry. No arbitrary HTML/JS/CSS, unsafe URLs or unvalidated rich text.
- Hard limits: 5 levels (page→section→row→column→component), 500 nodes, 256 KiB serialized UTF-8, 128 KiB per JSON props value and 64 nested props-object levels; an iterative preflight checks tree/props depth and node count before recursive Zod parsing, including malformed deep/wide inputs. Section→grid→component takes 4 levels; rows/grids cannot nest within columns because they would make a usable component exceed the budget. Strict objects reject unknown fields; JSON values must be serializable. Typed `TreeResult` errors retain the original input unchanged and never rewrite unknown/future schemas or unregistered components. Grid base/tablet/desktop requires 2–4 columns; mobile may override to 1–4.
- `readTree` validates **draft** structure, bounds, slots, props and registry without requiring headings or required components; `validateTreeForPublish` adds the single-H1 and required-component gates to the same validation. D2 must call the latter for publish and the former for autosave; D5 may save an incomplete canvas. Legacy conversion and v0 migration retain draft semantics until explicitly published.
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

**Review follow-up (same D1 scope):** regressions cover 700+ nested nodes, 501+ wide nodes, draft without H1 versus publish, mobile one-column grids, every allowed slot at its deepest usable depth, and compile-time rejection of misplaced child slots. No legacy HTTP/DB or golden change.

**Publish-policy review:** An empty tree must remain a valid draft but cannot publish without exactly one H1. Red-then-green tests cover empty draft/publish (`HEADING_RULE`), one H1 (accepted) and two H1s (rejected). The publish policy changes only the previously ungated empty-tree case; no legacy HTTP, DB or golden response changes.

**Rollback:** revert only the new `./tree` export, implementation, tests and docs; no stored rows or snapshots change. D2 must separately design rollback-read for newly published tree pages.

**Measured follow-up (Node 22, minified ESM, gzip level 9/mTime 0):** contracts 844 B + engine 1,589 B + tree 3,239 B = **5,672/61,440 B**. React 1,174 B + React/server 447 B = **1,621/35,840 B**. The package build still reports the original contracts+engine subset; `tree-contract.test.mjs` additionally fails the 60-KiB combined cap if the new tree entry grows over budget. No cap revision is requested. B5/B6 merge conflict resolution: preserved their separate README/context/lessons and engine+React export assertions, and regenerated the generated Graphify report rather than combining its conflict markers.
