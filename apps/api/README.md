# API image and CMS core

The Nest API compiles to CommonJS and consumes `@parker2808/cms-core` directly in B5, alongside `@portfolio/contracts`. The local Docker build installs all workspace manifests with a frozen lockfile, builds core before contracts and API, and prunes production dependencies with `pnpm deploy --prod --legacy`.

The final image runs `scripts/smoke-cms-core.mjs` during its build against `/app/package.json`. This resolves and loads the `./contracts` and `./engine` `require` exports from the production dependency layout; it does not start the server, connect to MySQL or read deployment credentials. `render.yaml` includes `packages/cms-core/**` so a core-only change can rebuild the image. See the [integration spec](../../docs/specs/2026-11-11-api-docker-cms-core.md).
