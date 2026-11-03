# R3-03 — Published custom pages

## Scope

- Add one-segment custom CMS reads to the real locale catch-all route using the existing block renderer, page metadata, and preview flow.
- Permit safe custom paths through draft-mode redirects. Include published custom pages in the sitemap and retain cache invalidation.
- Keep static routes, built-in pages, and nested unknown paths unchanged.

## Acceptance

- Published custom snapshots render at `/en/{key}` and `/vi/{key}` with localized SEO and canonical/alternate URLs.
- Unpublished custom pages and unknown/nested paths return 404 to public visitors. An authenticated draft session can preview current content and saved versions.
- Static and reserved paths cannot be resolved as custom pages. Publishing expires page and sitemap data.

## Tests and captures

- Unit tests cover path classification, safe preview redirect, published snapshot/404, sitemap, and metadata.
- Production-build Playwright uses disposable in-memory API state (`e2e/custom-pages.playwright.config.ts`) to check EN/VI published routes, draft denial, authorized preview/version, nested 404, cache invalidation, and built-in regressions. Save assertion-bound light/dark PNGs at 1440/390 in the assigned public folder and record every tuple in a manifest.
- Run `pnpm check:all` and `graphify update .`.
