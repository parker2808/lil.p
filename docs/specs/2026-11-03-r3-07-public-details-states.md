# R3-07: Public details and states

## Scope

Style the live project and note detail routes without replacing CMS content or preview behavior. Match each public loading boundary to its route, including craft. Give site and locale errors and 404 a consistent localized recovery layout. Keep changes within the public detail/state tree, related public styles, focused browser tests, and required documentation.

## Acceptance

- EN/VI project and note detail pages show real CMS titles, body content, and SEO metadata at 1440px and 390px in light and dark themes.
- Authorized draft preview renders unpublished detail; a public visit to the same slug returns 404.
- Route loading skeletons reflect the final layout and use `aria-busy`; site and locale errors offer a keyboard operable retry and home link; 404 offers search and useful links.
- No horizontal overflow, trapped focus, hidden primary controls, or uncaught browser diagnostics.
- Each verified route/state/theme/locale/width tuple has one fresh PNG in the public Desktop folder and a manifest entry.

## Checks

Run focused production-build Playwright navigation, CMS/metadata, preview and denial, loading/error/404, keyboard/contrast/overflow and capture checks. Run `pnpm check:all`; update Graphify report after code changes. Never run tests against a persistent database.
