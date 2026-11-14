# API

The Nest API serves the existing CMS HTTP contracts for admin editing, publishing, previews, saved versions, and public pages. The [root README](../../README.md) covers the monorepo and deployment setup.

PR #186 fixes a custom page with only a Vietnamese SEO title: published and saved-version responses use that title with `lang: vi` for EN and VI requests, matching the draft preview. Built-in and bilingual fallback rules stay unchanged. B1's VI-only golden expectation follows this fix. See the [locale SEO spec](../../docs/specs/2026-11-10-custom-page-locale-seo.md).

## API image and CMS core

The Nest API compiles to CommonJS and consumes `@parker2808/cms-core` directly in B5b, alongside `@portfolio/contracts`. The local Docker build installs all workspace manifests with a frozen lockfile, builds core before contracts and API, and prunes production dependencies with `pnpm deploy --prod --legacy`.

The final image runs `scripts/smoke-cms-core.mjs` during its build against `/app/package.json`. This resolves and loads the `./contracts` and `./engine` `require` exports plus compiled page adapters from the production dependency layout; it does not start the server, connect to MySQL or read deployment credentials. Nest maps engine policy findings to the existing HTTP exceptions and only restores strictly validated snapshots, leaving the published public renderer unchanged. `render.yaml` includes `packages/cms-core/**` so a core-only change can rebuild the image. See the [packaging spec](../../docs/specs/2026-11-11-api-docker-cms-core.md) and [B5b spec](../../docs/specs/2026-11-11-cms-b5b-nest-engine-wiring.md).
