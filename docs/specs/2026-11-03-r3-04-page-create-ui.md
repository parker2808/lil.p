# R3-04 — Create a page in the real admin

## Scope

Add a create dialog to the real `/admin/pages` header and empty state. Use the typed `POST /api/admin/pages` client from R3-02, then open the returned editor. Change only the admin Pages UI, its EN/VI messages, focused tests, and required project documentation.

## Acceptance

- An admin can enter a title, edit its generated slug, and choose locale and starter or empty template. Vietnamese `Đ/đ` becomes `d`.
- Title and slug have separate live, blur, and submit errors linked with `aria-describedby`; only the invalid field gets `aria-invalid`. Existing, reserved, and HTTP 409 keys appear beside slug.
- An unsuccessful request leaves the dialog and selections intact. A 201 updates list and detail queries, then navigates to `/admin/pages/[key]`; editor GET succeeds. Non-admin users have no create action.
- Keyboard submission, dialog focus return, mobile 44px targets, EN/VI, and light/dark states work.

## Verification

Run component and API-client tests, a focused production-build Playwright flow through real Nest HTTP for validation, 409 recovery, 201 navigation and editor GET, plus EN/VI 1440/390 captures of index, dialog/error and editor in the admin capture folder. Run `pnpm check:all` and update Graphify.
