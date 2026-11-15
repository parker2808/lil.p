# Builder publish, history and restore (V10)

Plan (feature branch stacked on D6; no golden or migration changes):

1. Verify D2 revision-aware endpoints and existing legacy actions.
2. Add builder-only EN/VI publish and history controls.
3. Require an acknowledged, unchanged draft before publish/restore.
4. Confirm destructive restore; preserve local recovery on failure.
5. Check keyboard, accessible status and 390/1440 layouts.
6. Run unit/non-browser gates and labeled five-shard CI.

The builder uses `POST /api/admin/pages/:key/builder/publish` and
`POST /api/admin/pages/:key/versions/:version/builder/restore`, both with
`expectedRevision`; it never calls the legacy write endpoints for an active
tree. Versions come from the existing authenticated list endpoint. Publish
increments the draft revision: the client must reread the draft before allowing
further edits. Restore may switch to legacy mode; a successful response resets
local history only after explicit confirmation. Unsaved, uncertain, offline,
recovery-pending or unauthorized states cannot mutate versions. A server CAS
conflict retains the local document and requires review/reload. These controls
remain behind the existing builder route gate; this is not deployment approval.
Restore failures remain inside the focused confirmation dialog as a localized
live alert; the header alone is not visible to keyboard users behind the modal.

Acceptance: real API V10 journey, EN/VI labels and announcements, light/dark,
390/1440 responsive controls, WCAG AA focus/keyboard confirmation, no lost
edits, forward-only D2 schema, unchanged golden contracts. Browser and visual
evidence require exact-head ready-e2e CI; production drain remains a separate
release gate.
