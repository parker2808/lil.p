# Web host (`@portfolio/web`)

Next.js App Router host for the EN/VI public site and role-guarded admin CMS. Public pages render CMS content through the API; admin routes own editing, mutations, preview and publishing. Shared controls and admin table chrome come from [`@portfolio/ui`](../../packages/ui/README.md); schemas and routes come from `@portfolio/contracts`.

## U3 design study

`/en/cms-u3-study` and `/vi/cms-u3-study` are **static-content design samples**, not a working builder. They return not found unless the server has `R3_E2E_STATES=1`. The route also gates localized, noindex EN/VI metadata. The sample shows empty, nested and responsive compositions, with a desktop palette/Layers/inspector and a mobile canvas with bottom sheets; its theme, scene, viewport and status choices only change the sample presentation. No editor logic, persistence, API call, save or publish operation is provided. Do not enable the fixture flag in production.

## Local checks

Run `pnpm --filter @portfolio/web test` and `pnpm --filter @portfolio/web typecheck` from the repo root. The full integration gate is `pnpm check:all --e2e` against a **disposable local MySQL**, using the guarded script documented in the [root README](../../README.md#round-3-integrated-audit). Coordinate the shared e2e lock before any browser/DB run. See the [U3 spec](../../docs/specs/2026-11-10-cms-u3-builder-design.md) for screenshot evidence, keyboard contract and contrast measurements.
