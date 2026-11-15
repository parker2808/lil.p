# Web host (`@portfolio/web`)

Next.js serves the EN/VI public portfolio and the authenticated admin CMS. The legacy page editor continues to own live block editing and publication.

The separate `/en/cms-u3-study` and `/vi/cms-u3-study` routes are flag-gated (`R3_E2E_STATES=1`), noindex static design samples. They have no editing, persistence or publishing behavior; the flag must remain off in production. See the [U3 study spec](../../docs/specs/2026-11-10-cms-u3-builder-design.md).

The builder at `/admin/builder/[key]` remains an authenticated, `R3_E2E_STATES=1`-gated integration route. The D5 host owns the validated tree, one Properties editor, responsive base/tablet/mobile overrides, undo/redo and draft status. Only eligible custom pages can explicitly activate a revision-checked D2 tree draft and autosave it; the built-in `home` route stays a local-only study. Conflict or ambiguous saves keep local edits for review, retry or explicit export/reload, and an unacknowledged local copy can be restored after refresh. **Publishing stays disabled**; the legacy editor and public pages are unchanged. Without the flag the builder URL returns not found. The neutral CSS comes from `@parker2808/cms-core/theme.css`; lil.p branding changes tokens only.

See the [D4 canvas spec](../../docs/specs/2026-11-11-cms-d4-canvas.md) and [D5 UI spec](../../docs/specs/2026-11-11-cms-d5-ui.md). D5 browser coverage runs in the shared CI shards and the standalone builder Playwright config; D6 owns the broader journey.

The separate EN/VI `/en/cms-u3-study` and `/vi/cms-u3-study` routes are flag-gated static design samples, not a persisted builder. Do not enable the fixture flag in production.

## U3 design study

`/en/cms-u3-study` and `/vi/cms-u3-study` are **static-content design samples**, not a working builder. They return not found unless the server has `R3_E2E_STATES=1`. The route also gates localized, noindex EN/VI metadata. The sample shows empty, nested and responsive compositions, with a desktop palette/Layers/inspector and a mobile canvas with bottom sheets; its theme, scene, viewport and status choices only change the sample presentation. No editor logic, persistence, API call, save or publish operation is provided. Do not enable the fixture flag in production.

## D4 canvas and D5 host

The legacy page editor continues to own live block editing and publication.

The builder at `/admin/builder/[key]` remains an authenticated, `R3_E2E_STATES=1`-gated integration route. The D5 host owns the validated tree, one Properties editor, base/tablet/mobile overrides, undo/redo and draft status. Only eligible custom pages explicitly activate a revision-checked D2 tree draft and autosave it; built-in keys stay local-only. Conflicts or ambiguous saves retain local edits for review, retry or explicit export/reload, and an unacknowledged local copy can be restored after refresh. **Publishing stays disabled in this editor**; the legacy editor and public pages are unchanged. Without the flag the builder route returns not found. Neutral CSS comes from `@parker2808/cms-core/theme.css`; lil.p branding changes tokens only.

See the [D4 canvas spec](../../docs/specs/2026-11-11-cms-d4-canvas.md) and [D5 UI spec](../../docs/specs/2026-11-11-cms-d5-ui.md). D5 browser coverage runs in shared CI shards and the standalone builder Playwright config; D6 owns the full journey.

## Local checks

Run `pnpm --filter @portfolio/web test` and `pnpm --filter @portfolio/web typecheck` from the repo root. The full integration gate is `pnpm check:all --e2e` against a **disposable local MySQL**, using the guarded script documented in the [root README](../../README.md#round-3-integrated-audit). Coordinate the shared e2e lock before any browser/DB run. See the [U3 spec](../../docs/specs/2026-11-10-cms-u3-builder-design.md) for screenshot evidence, keyboard contract and contrast measurements.
