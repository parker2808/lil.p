# R3-05 public shell and indexes

## Scope

Keep the existing CMS block pipeline, public API reads, URL filters, and contact action. Adapt the approved demo's shell, page headings, card media, and craft study to the real EN/VI public routes. Use route scoped CSS so detail and admin screens keep their own layout.

## Acceptance

- EN/VI home, projects, notes, about, contact, and craft use the approved round 3 visual system at 1440 and 390 pixels in light and dark themes. Card media padding, glyph placement, caption gaps, and concentric radii match the design; no overflow or badge wrapping occurs.
- Real API content, navigation, URL search and filters, contact submission, and cache behavior continue to work. Projects and notes filters survive reloads.
- Keyboard navigation and focus, 44px touch targets, AA contrast, and reduced motion meet the public feedback requirements. Applicable empty, loading, error, and success states remain usable.
- Production browser and server diagnostics are clean on the affected real routes, including the cause of the reported development issue badge. Every public route/state capture follows a passing assertion and covers EN/VI, light/dark, and 1440/390 pixels.

## Tests

Run `pnpm check:all`. In a production Next build with a disposable local MySQL and the real API, exercise navigation, project and note filters across reloads, and contact submission in both locales. Check focus, mobile targets, card geometry, overflow, reduced motion, and browser diagnostics. Save each asserted route/state in both themes at 1440 and 390 pixels under the public capture folder with a tuple manifest. Diagnose the reported development issue badge before capture.

## Constraints

No hardcoded personal content or mock project data. No production or persistent database migrations. Do not alter detail or admin route ownership.
