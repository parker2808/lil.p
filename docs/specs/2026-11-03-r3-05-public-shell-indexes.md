# R3-05 public shell and indexes

## Scope

Keep the existing CMS block pipeline, public API reads, URL filters, and contact action. Adapt the approved demo's shell, page headings, card media, and craft study to the real EN/VI public routes. Use route scoped CSS so detail and admin screens keep their own layout.

## Checks

Run `pnpm check:all`. In a production Next build with a disposable local MySQL and the real API, exercise navigation, project and note filters across reloads, and contact submission in both locales. Check focus, mobile targets, card geometry, overflow, reduced motion, and browser diagnostics. Save each asserted route/state in both themes at 1440 and 390 pixels under the public capture folder with a tuple manifest. Diagnose the reported development issue badge before capture.

## Constraints

No hardcoded personal content or mock project data. No production or persistent database migrations. Do not alter detail or admin route ownership.
