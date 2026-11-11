# Web application

Next.js serves the EN/VI public portfolio and the authenticated admin CMS. The legacy page editor continues to own live block editing and publication.

The builder at `/admin/builder/[key]` remains an authenticated, `R3_E2E_STATES=1`-gated integration route. The D5 host owns the validated tree, one Properties editor, responsive base/tablet/mobile overrides, undo/redo and draft status. Only eligible custom pages can explicitly activate a revision-checked D2 tree draft and autosave it; the built-in `home` route stays a local-only study. Conflict or ambiguous saves keep local edits for review, retry or explicit export/reload, and an unacknowledged local copy can be restored after refresh. **Publishing stays disabled**; the legacy editor and public pages are unchanged. Without the flag the builder URL returns not found. The neutral CSS comes from `@parker2808/cms-core/theme.css`; lil.p branding changes tokens only.

See the [D4 canvas spec](../../docs/specs/2026-11-11-cms-d4-canvas.md) and [D5 UI spec](../../docs/specs/2026-11-11-cms-d5-ui.md). D5 browser coverage runs in the shared CI shards and the standalone builder Playwright config; D6 owns the broader journey.
