# Vercel CMS-core build graph hotfix

## Failure and contract

On `main` `89b9312`, Vercel's documented build command
`pnpm --filter @portfolio/contracts build && pnpm --filter @portfolio/web build`
fails from a fresh frozen install: contracts' ESM/CJS bundles pass, but its DTS
step cannot resolve `@parker2808/cms-core/contracts`, whose `types` export
points to an unbuilt `dist/contracts.d.ts`. Reproduced on Node 22.21.1 with
no package `dist` directories. CI's `pnpm build` traverses the dependency graph
first, so it does not reproduce the isolated Vercel command.

## Plan (at most 20 lines)

1. Pin a topological Vercel build command in repository config.
2. Add a clean-install CI job executing that exact configured command.
3. Document the build graph and run local/CI checks.
4. Merge only on green checks and confirm a READY production deployment.
5. Gate web-E2E shards on completion of their build artifact upload.

## Acceptance

- The configured Vercel build builds cms-core before contracts' DTS and then web.
- CI executes the repository's Vercel build command on a clean checkout before
  any other package build, with an explicit assertion that core's DTS is absent.
- Existing package exports, gzip budgets, golden contracts and routes remain unchanged.
- No migrations, secrets or production DB operations.

## Evidence and limits

- Clean frozen install + the previous documented Vercel command: exit 1,
  `TS2307` from contracts' DTS pass with no core declarations.
- Clean frozen install + `node scripts/check-vercel-build.mjs`: exit 0;
  `pnpm check:all`: 7/7 locally on Node 22.21.1.
- Graphify was regenerated from the integrated branch. Code-only graph extraction
  omits SQL without `tree_sitter_sql` and does not replace manual review of the
  Vercel config, workflow, README and deployment docs.
- Production READY status and the three endpoint checks are post-merge gates.

## CI artifact race found on the first hotfix run

Run `42961208393` passed the new `vercel-build` job but three web-E2E shards
failed before tests: `download-artifact` could not find `e2e-build` even though
the REST listing had just reported it. The build uploaded and finalized the
artifact at 04:45:40Z; shard 1 began its download at that instant and shards
2/4 also failed within two seconds. This is an ordering bug in the pre-existing
parallel shard setup, not a Vercel DTS regression. Make shards depend on
completion of `build-e2e` instead of using an artifact-listing poll that can
observe the upload before downloads are ready. This trades some startup
parallelism for a real completed-job dependency; test retries remain unchanged.
