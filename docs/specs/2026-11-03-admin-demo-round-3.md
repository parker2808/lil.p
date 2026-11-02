# Admin design demo, round 3

## Scope

- Stay on `design/demo-admin-2026-11-02`; keep EN/VI, reduced motion, and the existing block editor composition. The later 00:03 update authorizes backend and contract changes, but no real database, deployment, PR, or merge.
- Rebuild collection rows through one component using five grid columns: 44px handle, index, minmax text, nowrap pill, 44px actions. Align the panel header and constrain every grid child at 390px.
- Correct media card padding, caption gap, and concentric radii. Audit every admin route for clipping, overflow, pill wraps, and off-grid gaps.
- Add a Pages creation dialog with title, editable auto slug, validation, existing-key uniqueness, EN/VI locale, and template/empty choice; connect the production admin to the real API.

## Verification

- Test create validation, uniqueness, slug editing, locale/template choice, handoff, and keyboard use with Playwright. Run the all-route desktop/mobile EN/VI layout and accessibility audit.
- Run `pnpm check:all`, update Graphify, capture from a production build into the existing PNG folder, inspect affected screenshots, and commit with the backend marker in the message.

## Review and handoff

- `pnpm check:all`: all seven gates passed. Production capture: 233 PNGs, zero page failures. Playwright UX sweep: 296 EN/VI route and state views, zero axe, overflow, focus, reduced-motion, or mobile touch-target findings.
- This was the pre-00:03 handoff: the Pages flow used an in-memory fixture and called for `NEEDS_BACKEND: POST /admin/pages`. The authorized update below supersedes that stub decision.

## BE plan — authorized 2026-11-03 00:03 ICT

1. `POST /admin/pages` accepts `{title, key, locale, template}`. `title` is trimmed, 1–120 chars; `key` is 1–64 lowercase ASCII letters/digits with interior hyphens; `locale` is `en|vi`; `template` is `starter|empty`. Reject malformed data with the shared Zod validation response. A duplicate key returns 409 `PAGE_KEY_TAKEN`, including races caught by the unique index. Return 201 with an `AdminPage` for navigation to `/admin/pages/{key}`.
2. Replace `page.key`'s closed MySQL enum with `VARCHAR(64)` while retaining its unique index and existing uppercase values. Store new keys uppercase as well; map public lowercase keys at the API boundary. Add nullable `title` and `locale` default `en` for existing rows. The migration file is additive except for the enum widening; do not execute it against any real database in this task.
3. In one transaction, create a draft Page, optional starter blocks (`page-header` then `prose`, using the registry's version/default/layout), and a CREATE audit entry. Persist the chosen locale and title; initialize both SEO titles from that title so existing bilingual publish rules can be met after editing. Trigger `page:{key}` revalidation after commit. Creation uses the global JWT/role/origin guards and admin-only default role; editor privileges remain the existing admin policy.
4. Expand the shared page-key contract to a validated slug while retaining the five built-in keys and their paths. Update mappers, page lookup, preview/publish, sitemap, block allow-list, admin list/editor, and a one-segment public route for custom pages. A draft remains absent from the public route until published. Keep built-in route handling unchanged.
5. Replace the fixture stub with a typed API client and hook on the real admin Pages screen. Keep the isolated design demo's mock data for screenshot capture, but remove its dependency on `page-create.stub.ts`; the production admin flow navigates to the real editor after success. Add EN/VI strings and unit tests for contract validation, 409 handling, audit/transaction, and frontend behavior.

### Plan self-review

- Migration safety: `ENUM` to `VARCHAR(64)` preserves existing uppercase values; new nullable/defaulted columns do not require backfilling. The unique index remains authoritative. Migration SQL is a file only; no database or T24 migration is run.
- Backward compatibility: built-in keys, their public paths, block rules, and old rows retain behavior. Custom keys are single-segment and cannot collide with existing rows; the public catch-all checks exactly one segment. Existing unmodified consumers still receive familiar fields plus additive title/locale.
- Future deployment sequencing: an old Prisma client still treats `page.key` as an enum, so it must not read newly created custom keys. Deploy the widened schema and new readers together before enabling page creation; this task performs neither deployment nor migration execution.
- Error cases: validation rejects whitespace-only title, invalid/case-mismatched slug, unsupported locale/template, and overlong values; uniqueness is checked before insert for a clear message and caught at the DB constraint for races. A transaction rollback removes blocks and audit if creation fails. API failure leaves the form open with an error; navigation occurs only after 201.
- Authorization/revalidation: global JWT, role, and origin guards apply to POST; the default role is admin. Revalidation follows a committed write and never makes an unpublished draft visible.

### Implementation evidence

- `pnpm check:all` passed all seven gates, including unit tests and the production build. Contract, API service, and admin form tests cover malformed input, both templates, duplicate keys including a unique-index race, audit recording, and navigation after success. No real database or migration command was run.
- Production build capture overwrote the admin demo folder with 233 EN/VI PNGs at 1440px and 390px, with zero page failures. The screenshot fixture remains mock data; the production admin Pages UI calls `POST /admin/pages`.
