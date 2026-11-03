# R3-02 — Custom page creation API

## Scope

- Add the typed create-page request and response fields in `packages/contracts/src/pages/`.
- Widen `Page.key` to a unique slug and add nullable title plus a defaulted page locale through a migration file. Preserve the five built-in pages.
- Add admin-only `POST /admin/pages`, transactionally creating a draft, optional starter blocks, and a CREATE audit record. Update page mappers, preview/publish rules, sitemap conversion, and the key conversions needed by dashboard and web metadata.
- Reserve built-in, static public, and route-system one-segment names, including `craft`.

## Acceptance

- A valid title (trimmed, 1–120 characters), lowercase slug (1–64 characters), `en|vi` locale, and `starter|empty` template returns 201 with an editable `AdminPage`; GET returns the created page.
- Unauthenticated and user-role requests cannot create. Malformed input uses the existing field-error shape. Reserved, built-in, existing, and unique-index race keys return 409 `PAGE_KEY_TAKEN`.
- Starter drafts have a localized H1 and visually blank prose; empty drafts have no blocks. Draft preview works in EN and VI. A failed transaction leaves no page or audit side effect; cache revalidation follows commit.
- Publishing a custom page requires a valid first visible H1 and substantive, visible, non-placeholder prose in the page locale. Untouched, hidden, or deleted starter prose returns stable `PAGE_BODY_REQUIRED` with the `body` field path; real copy can publish. Existing built-in pages keep their behavior.

## Tests and gates

- Contract and route-table tests; service tests for both templates, audit, rollback, duplicate and race handling, draft preview, publish rejection, and success.
- Real Nest HTTP tests with transactional mocked Prisma state for admin 201 and GET, user 403, malformed 400, duplicate/race 409, EN/VI preview, direct publish failures and success.
- Stage pre-PR2 migrations on a guarded random no-volume local MySQL container, record all five old page rows, apply the new SQL, then compare IDs and values, key uniqueness and duplicate rejection, title nullability, locale default, and zero Prisma schema diff. Destroy temporary resources.
- Run `pnpm check:all`. PR 2 changes no web route, so the round 3 PNG capture gate does not apply.
