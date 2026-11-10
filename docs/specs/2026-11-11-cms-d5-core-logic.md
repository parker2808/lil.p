# D5 — framework-neutral builder state

## Plan (8 lines)

1. Freeze the D1 draft validation and proposed D2 revision boundary.
2. Implement immutable, atomic tree operations and responsive property edits.
3. Validate every candidate through `readTree` before committing.
4. Implement bounded history with explicit typing coalescence.
5. Implement serialized, revision-checked autosave with conflict recovery.
6. Test malicious inputs, inheritance, history and network transitions.
7. Update package docs, context, lessons and Graphify.
8. Run checks and review the draft stacked PR.

## Scope and boundaries

Pure `@parker2808/cms-core/tree` operations and state helpers only. D4 owns the
controlled canvas dispatch and focus integration; D2 owns HTTP, authentication,
storage and final DTOs. No UI or server route is wired here. `readTree` is the
draft gate; `validateTreeForPublish` remains a distinct server-side gate.
The adapter supplies the component registry, ID allocator, scheduler and D2
transport. No new dependency, database migration, legacy response or golden
change. Proposed D2 CAS uses decimal-string `expectedRevision`; adapt the
transport after D2 freezes the DTO, never guess a numerical revision.

## State contracts

- Insert, move, delete and duplicate operate on D1 slots and stable IDs;
  duplication allocates new IDs for the entire subtree. Invalid candidates
  return the typed D1 error and preserve the original document.
- Property edits modify only `responsive.base` or the selected breakpoint's
  shallow override. Clear removes that key and an empty override object;
  reading an inherited field never writes. D1 registry schemas validate the
  effective props, including safe URLs and mobile grid columns.
- History stores immutable before/after documents and selected IDs. Typing
  coalesces only the same node/breakpoint/property within 600ms; structural
  operations and explicit edits never coalesce. Max 50 entries; undo/redo
  restores snapshots, and a new change after undo discards redo.
- Autosave debounces 500ms and serializes saves. Acknowledgement advances only
  the saved revision and document, never overwrites a newer local edit.
  409 blocks auto-save and publish until explicit review; failures with an
  ambiguous outcome (offline/timeout/5xx) require a fresh GET before retry.
  GET is review-only: no automatic merge, revision substitution or discard.
  The host must expose export/unsaved-change recovery before navigation;
  in-memory state is not durable crash recovery.

## Gate and rollback

Unit tests cover invalid slots/IDs/props, no mutation, single-column mobile,
bounded/coalesced undo, edit-during-save, offline recovery, 409 and
timeout-after-commit. `pnpm check:all` and Graphify gate this pure change;
browser/DB journeys remain gated on D2/D4/D6 and their shared E2E lock.
Rollback reverts this unused core entry without touching stored drafts.
