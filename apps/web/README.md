# Web application

Next.js serves the EN/VI public portfolio and the authenticated admin CMS. The legacy page editor continues to own live block editing and publication.

The D4 builder at `/admin/builder/[key]` is a provisional, authenticated composition surface only when `R3_E2E_STATES=1`. A single in-memory host owns its tree and selection, dispatching atomic commands validated by the built `@parker2808/cms-core/tree` package; the route cannot save, publish, restore or change public pages. Components and Layers have mobile sheets and desktop rails; drag-insert and keyboard insertion share validation. The Properties region mounts once as a D5 callback, not a working inspector yet. Without the flag, the builder URL returns not found. Its neutral styling comes from `@parker2808/cms-core/theme.css`, and lil.p branding changes token values only.

See the [D4 interaction and verification spec](../../docs/specs/2026-11-11-cms-d4-canvas.md). Browser coverage is in the standalone D4 Playwright config; D6 owns registration in the shared CI shards.
