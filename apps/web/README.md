# Web application

Next.js serves the EN/VI public portfolio and the authenticated admin CMS. The legacy page editor continues to own live block editing and publication.

The separate `/en/cms-u3-study` and `/vi/cms-u3-study` routes are flag-gated (`R3_E2E_STATES=1`), noindex static design samples. They have no editing, persistence or publishing behavior; the flag must remain off in production. See the [U3 study spec](../../docs/specs/2026-11-10-cms-u3-builder-design.md).

The integrated D6 builder at `/admin/builder/[key]` remains an authenticated, `R3_E2E_STATES=1`-gated route. Eligible custom pages can activate a revision-checked tree draft, edit Properties with responsive overrides and undo/redo, and autosave without discarding unacknowledged local changes on conflict. An admin can publish a verified saved draft, inspect version history and restore a published version to the draft with confirmation; restoring does not replace the public version until a separate publish. The built-in `home` route remains a local-only study, and without the flag the builder URL returns not found. The neutral CSS comes from `@parker2808/cms-core/theme.css`; lil.p branding changes tokens only.

See the [D4 canvas spec](../../docs/specs/2026-11-11-cms-d4-canvas.md) and [D5 UI spec](../../docs/specs/2026-11-11-cms-d5-ui.md). D5 browser coverage runs in the shared CI shards and the standalone builder Playwright config; D6 owns the broader journey.

The separate EN/VI `/en/cms-u3-study` and `/vi/cms-u3-study` routes are flag-gated static design samples, not a persisted builder. Do not enable the fixture flag in production.

## U3 design study

`/en/cms-u3-study` and `/vi/cms-u3-study` are **static-content design samples**, not a working builder. They return not found unless the server has `R3_E2E_STATES=1`. The route also gates localized, noindex EN/VI metadata. The sample shows empty, nested and responsive compositions, with a desktop palette/Layers/inspector and a mobile canvas with bottom sheets; its theme, scene, viewport and status choices only change the sample presentation. No editor logic, persistence, API call, save or publish operation is provided. Do not enable the fixture flag in production.

## D5 builder host

The builder at `/admin/builder/[key]` remains an authenticated, `R3_E2E_STATES=1`-gated integration route. The D5 host owns the validated tree, one Properties editor, responsive base/tablet/mobile overrides, undo/redo and draft status. Only eligible custom pages can explicitly activate a revision-checked D2 tree draft and autosave it; the built-in `home` route stays a local-only study. Conflict or ambiguous saves keep local edits for review, retry or explicit export/reload, and an unacknowledged local copy can be restored after refresh. **Publishing stays disabled**; the legacy editor and public pages are unchanged. Without the flag the builder URL returns not found. The neutral CSS comes from `@parker2808/cms-core/theme.css`; lil.p branding changes tokens only.

See the [D4 canvas spec](../../docs/specs/2026-11-11-cms-d4-canvas.md) and [D5 UI spec](../../docs/specs/2026-11-11-cms-d5-ui.md). D5 browser coverage runs in the shared CI shards and the standalone builder Playwright config; D6 owns the broader journey.
Run `pnpm --filter @portfolio/web test` and `pnpm --filter @portfolio/web typecheck` from the root. Browser and DB checks require the shared E2E lock and disposable local MySQL.
