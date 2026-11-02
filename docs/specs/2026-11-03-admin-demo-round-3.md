# Admin design demo, round 3

## Scope

- Stay on `design/demo-admin-2026-11-02`; change only the isolated admin design fixture and its capture/audit tools. Keep EN/VI, reduced motion, and the existing block editor composition. No backend, database, deployment, PR, or merge.
- Rebuild collection rows through one component using five grid columns: 44px handle, index, minmax text, nowrap pill, 44px actions. Align the panel header and constrain every grid child at 390px.
- Correct media card padding, caption gap, and concentric radii. Audit every admin route for clipping, overflow, pill wraps, and off-grid gaps.
- Add a Pages creation dialog with title, editable auto slug, validation, existing-key uniqueness, EN/VI locale, and template/empty choice. A typed fixture stub returns the created page and opens the mock editor. Mark the backend dependency clearly as `NEEDS_BACKEND: POST /admin/pages`.

## Verification

- Test create validation, uniqueness, slug editing, locale/template choice, handoff, and keyboard use with Playwright. Run the all-route desktop/mobile EN/VI layout and accessibility audit.
- Run `pnpm check:all`, update Graphify, capture from a production build into the existing PNG folder, inspect affected screenshots, and commit with the backend marker in the message.

## Review and handoff

- `pnpm check:all`: all seven gates passed. Production capture: 233 PNGs, zero page failures. Playwright UX sweep: 296 EN/VI route and state views, zero axe, overflow, focus, reduced-motion, or mobile touch-target findings.
- The Pages flow uses a typed in-memory fixture. `NEEDS_BACKEND: POST /admin/pages` must eventually persist title/key/locale/template or blocks, reject duplicate keys with 409, require admin auth, audit creation, and revalidate the public page. No schema change is expected for this fixture; backend contract and integration tests remain outside this demo-only task.
