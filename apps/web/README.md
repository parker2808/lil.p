# Web host (`@portfolio/web`)

Next.js App Router host for the EN/VI public site and role-guarded admin CMS. Public pages render CMS content through the API; admin routes own editing, mutations, preview and publishing. Shared controls and admin table chrome come from [`@portfolio/ui`](../../packages/ui/README.md); schemas and routes come from `@portfolio/contracts`.

## U3 design study

`/en/cms-u3-study` and `/vi/cms-u3-study` are **static-content design samples**, not a working builder. They return not found unless the server has `R3_E2E_STATES=1`. The route also gates localized, noindex EN/VI metadata. The sample shows empty, nested and responsive compositions, with a desktop palette/Layers/inspector and a mobile canvas with bottom sheets; its theme, scene, viewport and status choices only change the sample presentation. No editor logic, persistence, API call, save or publish operation is provided. Do not enable the fixture flag in production.

## D4 composition canvas

The legacy page editor continues to own live block editing and publication.

The D4 builder at `/admin/builder/[key]` is a provisional, authenticated composition surface only when `R3_E2E_STATES=1`. A single in-memory host owns its tree and selection, dispatching atomic commands validated by the built `@parker2808/cms-core/tree` package; the route cannot save, publish, restore or change public pages. Components and Layers have mobile sheets and desktop rails; drag-insert and keyboard insertion share validation. The Properties region mounts once as a D5 callback, not a working inspector yet. Without the flag, the builder URL returns not found. Its neutral styling comes from `@parker2808/cms-core/theme.css`, and lil.p branding changes token values only.

See the [D4 interaction and verification spec](../../docs/specs/2026-11-11-cms-d4-canvas.md). Browser coverage is in the standalone D4 Playwright config; D6 owns registration in the shared CI shards.

## Local checks

Run `pnpm --filter @portfolio/web test` and `pnpm --filter @portfolio/web typecheck` from the repo root. The full integration gate is `pnpm check:all --e2e` against a **disposable local MySQL**, using the guarded script documented in the [root README](../../README.md#round-3-integrated-audit). Coordinate the shared e2e lock before any browser/DB run. See the [U3 spec](../../docs/specs/2026-11-10-cms-u3-builder-design.md) for screenshot evidence, keyboard contract and contrast measurements.
