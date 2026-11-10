# API image prerequisite for CMS core

## Evidence and scope

B4 (`8c448ea`) makes `@parker2808/cms-core` a runtime `workspace:*` dependency of `@portfolio/contracts`. The API Dockerfile's `deps` stage copies the manifests of api/web/ui/contracts but not cms-core before frozen installation; its builder builds contracts before core. `render.yaml` filters `packages/contracts/**` but not `packages/cms-core/**`. The core package publishes `./contracts` and `./engine` under explicit CJS `require` exports, while the API emits CommonJS. B5 will import core directly from the API, so the API must declare the workspace dependency itself. No services, DB or app HTTP behavior change here.

## Plan (five steps)

1. Add the core manifest to the Docker install stage and build core before contracts/API.
2. Declare the API's direct core runtime dependency and refresh only its lockfile importer.
3. Add a CJS smoke check in the final production layout for core contracts and engine.
4. Include core source changes in Render's API image build filter; document the contract.
5. Verify frozen install, non-E2E checks, locked local image build and draft-PR CI.

## Acceptance

- Frozen install and Docker image build succeed using only public/workspace dependencies; final `/app` resolves both CJS subpaths without build credentials or source-tree symlinks.
- The image's production dependency closure contains the core and its peers; the smoke test fails when either subpath cannot be loaded.
- A core-only source change triggers Render's API image rebuild. No migration, live DB, deployment, published image or new external dependency.
- No edits to B5/B6 worktrees; CI reports green on this branch. Docker build is run only under the shared E2E lock.

## Verification evidence

- Frozen workspace install, core build, contracts build and the local CJS subpath smoke test pass with Node 22. The first `check:all` attempt passed 6/7: API lint correctly rejected a raw `require()` in a `.cjs` smoke script. Its replacement `.mjs` harness uses Node `createRequire` from the API production `package.json`, still tests the **CJS** `require` conditions, and passes API lint.
- Two real local `docker build -f apps/api/Dockerfile` runs under the shared lock passed. The final run built image `ef8d340e40fc`: the frozen-install stage, core → contracts → API build, production prune, and `RUN node /tmp/smoke-cms-core.mjs /app` all completed. The smoke script was removed before the final image layer. The runner is non-root `nestjs`; no DB, image push or deployment occurred.
- The final `pnpm check:all` and PR CI results are recorded in the PR body; E2E is provided by CI only.
