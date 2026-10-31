# AGENT_RULES: lil.p

Common rules and token flow live in `<private-memory-repo>`: `rules/COMMON_RULES.md`, `rules/TOKEN_FLOW.md`, templates in `templates/` (ask Parker if you lack access). This file only adds repo facts; keep it about 30 lines.

## Start (token flow)

- Read `PROJECT_CONTEXT.md`, then `graphify-out/GRAPH_REPORT.md`. Query by exact names (`graphify explain "Name"`, `graphify path "A" "B"`); open only needed line ranges, each file once. Refresh: `graphify update .` (no model calls; the report is committed, the rest of `graphify-out/` is ignored).
- Small task (copy, style, one file): do it directly. Big task: plan (≤ 20 lines) → small steps with checks → handoff → paid review of plan + diff only.
- Free agents: no work outside the plan, no new dependencies, no merging.

## Stack

- Public pnpm 10 monorepo, Node 22: `apps/web` (Next 16, React 19), `apps/api` (Nest 11, Prisma 7, MySQL 8.4 local / TiDB prod), `packages/contracts` (zod), `packages/ui`. Install: `pnpm install --frozen-lockfile`.

## Checks (run before PR, paste results)

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:content`, `pnpm check:deps`, `pnpm build`.
- E2E as in CI: `pnpm --filter @portfolio/api test:e2e`, `pnpm --filter @portfolio/web test:e2e`. Docs only: prettier check on changed files + `pnpm check:content`.
- CI `ci.yml` (lint-typecheck-unit, api-e2e, web-e2e) uses `.github/actions/setup`; keep timeouts and stale-PR cancel.

## Where things live

- Content in DB/admin CMS, seeds in `apps/api/prisma/seed/`, migrations in `apps/api/prisma/migrations/`. Block definitions in `packages/contracts/src/blocks/definitions/`.

## Forbidden

- Public repo: no secrets, `.env` values, real contact info (`<email>`/`<phone>`), or private repo names.
- Free services and free Tiptap extensions only. R16 (Figma) is dropped. Never merge without Parker's OK.

## PRs

- `<type>/<topic>` branch, one PR, conventional commits (commitlint). Update `PROJECT_CONTEXT.md` §7 and §9 (context-check, `skip-context` only with Parker's OK).
