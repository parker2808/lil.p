# AGENTS.md — lil.p rules

Read `PROJECT_CONTEXT.md` in full and `docs/LESSONS.md` before starting. Append one line to `docs/LESSONS.md` for each new lesson.

## Start and scope

- Work in a T3 worktree on a task branch; never edit or commit on `main` or `master`.
- One task = one branch/worktree = one PR. Stay in scope; do not edit another agent's branch. Record out-of-scope work in `PROJECT_CONTEXT.md` §7.
- Small tasks: skip Graphify; find code with `rg` and open only needed line ranges. Big tasks: read `graphify-out/GRAPH_REPORT.md` (~10k tokens), query `graphify explain "Name"` or `graphify path "A" "B"`, run `graphify update .` after code changes.
- Token budget: never read `pnpm-lock.yaml`, `docs/archive/**`, `docs/design/**`, `*.vi.md` or migration SQL in full; big docs have short indexes (`docs/PLAN.md`, `docs/plans/ui-redesign.md`) linking to pieces. Look up i18n keys (`apps/web/i18n/locales/*.json`) and seed data (`apps/api/prisma/seed/data/*.json`) with `rg` or `jq`, never open them whole. Use `pnpm check:all` instead of raw check output. See `.cursorignore`.
- Do small tasks directly. For big tasks, write a plan of at most 20 lines and a spec in `docs/specs/` before coding; work in checked steps, then hand off the plan and diff for review.
- Run agent work via `~/ai-tools/t3-run.sh` watchdog so model failures or quota limits are reported.
- Agents stay within the plan, add no dependencies without approval, and never merge.

## Stack and content

- Public pnpm 10 monorepo on Node 22: `apps/web` (Next 16, React 19), `apps/api` (Nest 11, Prisma 7), `packages/contracts` (zod), `packages/ui`.
- Local database is MySQL 8.4; production database is TiDB. Install with `pnpm install --frozen-lockfile`.
- Content lives in the database and admin CMS; seeds are in `apps/api/prisma/seed/`, migrations in `apps/api/prisma/migrations/`, block definitions in `packages/contracts/src/blocks/definitions/`.

## Checks and PRs

- Before a code PR, run `pnpm check:all` (format, lint, typecheck, test, content, deps, build; prints only failures). Add `--e2e` to also run API and web E2E as CI does.
- For docs-only work, run Prettier on changed files and `pnpm check:content`. Report check results in the PR.
- CI in `.github/workflows/ci.yml` uses `.github/actions/setup`; keep job timeouts and cancellation of stale PR runs.
- Use a `<type>/<topic>` branch and conventional commits (commitlint). Open one PR and watch CI until green.
- Every PR to `main` updates `PROJECT_CONTEXT.md` §7 and §9; `context-check` enforces a file change for non-docs PRs. Use `skip-context` only with Parker's OK.
- Never merge to `main` without Parker's explicit OK.

## Public repo limits

- No secrets, tokens, `.env` values, or real contact info in the repo, PRs, logs, or chat. Use `<email>` and `<phone>` placeholders.
- Never name or link a private repo; use `<private-content-repo>` or `<private-memory-repo>` placeholders.
- Use free services and free Tiptap extensions only. R16 (Figma) is dropped.
