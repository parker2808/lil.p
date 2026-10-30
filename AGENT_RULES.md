# Agent rules for lil.p

## Common rules

Source: `ai-memory/rules/COMMON_RULES.md` (copied verbatim below).

<!-- prettier-ignore-start -->

# COMMON_RULES — Parker's flow (all agents, all repos)

Source of truth for every agent (T3, Codex, Cursor, OpenCode, Grok Bot) working on `parker2808` repos.
Built only from what the repos, PR history, CI and bot exports actually show (rebuilt 2026-10-31). Project rule files (`AGENT_RULES.md` in each repo) add to these, never relax them.

## 1. Before you start
- Read the repo's `AGENTS.md` and `PROJECT_CONTEXT.md` in full first. They hold confirmed facts, forbidden items and status.
- Read this file. If a project rule and this file disagree, the stricter one wins; ask Parker if unsure.
- Check `git status` and the open PRs first; preserve other people's work.

## 2. Branches, commits, PRs
- One task = one branch (or git worktree) = one PR to `main`. Never push or commit to `main` directly.
- Branch names: `<type>/<short-kebab-topic>` with type `feat|fix|chore|docs|content|plan` (e.g. `fix/desktop-chapter-drawer`, `chore/project-context`). Cloud agents may add a short suffix (`cursor/<topic>-<4hex>`).
- One agent per branch/worktree. Never commit to another agent's branch, never share a working tree.
- Stay in your task's scope. Write anything out of scope into PROJECT_CONTEXT open items instead of doing it.
- PR title: short, plain, says what changed. lil.p uses conventional commits (enforced by commitlint); the other repos use a plain sentence title ("Fix …", "Add …", "Plan: …", "content: …"). PR number is appended on squash merge (`(#57)`).
- PR body: what's in it, constraints respected, checks run (commands + result), and what Parker still needs to decide. Say clearly if it must not be merged yet.
- Stacked PRs are OK. Multi-PR work can go to an integration/preview branch first.
- Monitor CI until every check is green; fix failures yourself and report the check status.

## 3. Merging (absolute)
- **Never merge, deploy, or close a PR without Parker's explicit OK ("merge").** Open the PR and stop. One PR at a time.
- Only exception: `parker2808/ai-memory` may be auto-merged after a secrets/PII scan passes.
- **Never touch PR #27 in `interview-senior-fe`** (GitHub OAuth, in development).

## 4. PROJECT_CONTEXT.md + context-check CI
- Every PR to `main` that changes files outside the exempt paths must update `PROJECT_CONTEXT.md` (status/open items + changelog sections) in the same PR.
- CI `context-check` fails if `PROJECT_CONTEXT.md` is missing at HEAD or not in the diff for non-exempt changes. Exempt: `docs/` (plus content folders in interview-fe-data).
- The `skip-context` label bypasses the check; use only when Parker agrees.
- Record new decisions from Parker (with date) in PROJECT_CONTEXT.md in your PR. Never invent rules.

## 5. Privacy and secrets (absolute)
- Never commit, paste, print or log secrets: `.env` values, tokens, passcodes, API keys, deploy hook URLs, auth codes. Not in code, PRs, logs or chat.
- Never commit Parker's phone number or personal email. Use `<email>` and `<phone>` placeholders.
- Public repos: `lil.p`, `lil.j`, `interview-senior-fe`. Never name or link private repos there (write `<private-content-repo>`).
- Private: `interview-fe-data`, `ai-memory`.

## 6. Facts and content
- Never invent facts, dates, metrics, memories, places, captions or confirmations. Mark unknowns as **(uncertain)** or leave blank and list them as open items.
- No hard-coded content where the project keeps it in data (DB/CMS in lil.p, `site/content.json` in lil.j, JSON data repo for interview-senior-fe).
- Bilingual EN + VI where the project is bilingual. Vietnamese must read naturally, never a literal translation.
- Free services only ($0 hosting: Vercel, Render free, TiDB, Cloudinary); no paid packages/extensions.

## 7. Talking to Parker
- Reply in plain, natural Vietnamese, short and concrete (he is often on his iPhone). No stiff literal translation, no em dashes.
- Give short options when a decision is needed; send results for review first (screenshots for UI work).
- If facts are missing, stop and ask; don't guess.
- Parker tests UI on iPhone 14 Pro Max (430×932) first.

## 8. Checks before opening a PR
- Run the repo's own checks (listed in its project rules) and paste the results in the PR body.
- Run a secrets/PII grep on the diff (tokens, `@` emails, phone numbers) before pushing.
- Package managers: lil.p uses pnpm (workspace, husky + commitlint); interview-senior-fe uses npm (`package-lock.json`); lil.j and interview-fe-data have no package manager (static site / JSON + node scripts).

<!-- prettier-ignore-end -->

## Project rules for lil.p

### Stack and package manager

- Public portfolio with a Next.js 16.4.3 / React 19.3 web app, NestJS 11 API, Prisma 7, and MySQL 8.4 locally; production uses TiDB Cloud Serverless. The site has an admin CMS, VI/EN content, and light/dark mode.
- Node.js 22 or newer and pnpm 10 (`packageManager: pnpm@10.34.9`); use the root `pnpm-lock.yaml` and `pnpm install --frozen-lockfile` for CI-equivalent installs. The workspace contains `apps/web`, `apps/api`, `packages/contracts`, and `packages/ui`.
- Root tooling includes Prettier, Husky, and commitlint with conventional commits.

### Checks

- Root package scripts: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check:content`, `pnpm check:deps`, and `pnpm build`. Run these for a code change.
- CI also runs `pnpm --filter @portfolio/ui build-storybook`.
- API e2e CI builds contracts with `pnpm --filter @portfolio/contracts build`, then runs `pnpm --filter @portfolio/api test:e2e` against its MySQL service.
- Web e2e CI builds contracts, API, and web; applies Prisma migrations; installs Playwright Chromium with `pnpm --filter @portfolio/web exec playwright install --with-deps chromium`; then runs `pnpm --filter @portfolio/web test:e2e`. The root `pnpm test:e2e` targets the web package.
- For a documentation-only change, check formatting with `pnpm exec prettier --check AGENTS.md AGENT_RULES.md PROJECT_CONTEXT.md`, run `pnpm check:content`, and run `bash .github/scripts/context-check.sh origin/main HEAD` after committing.

### CI workflows and context

- `.github/workflows/ci.yml` runs `lint-typecheck-unit`, `api-e2e`, and `web-e2e` on pull requests and pushes to `main`.
- `.github/workflows/context-check.yml` runs for pull requests to `main`; its script requires `PROJECT_CONTEXT.md` at HEAD and an update in the diff when files outside `docs/` change. Update §7 Open items and §9 Changelog. The `skip-context` label bypasses this job only with Parker's agreement.

### Content and data

- Personal content belongs in the database/admin CMS, not hardcoded web components. API seed data and profiles are in `apps/api/prisma/seed/data/` and `apps/api/prisma/seed/profiles/`; database migrations are in `apps/api/prisma/migrations/`.
- Web page rendering and CMS code live under `apps/web/src/modules/blocks/` and `apps/web/src/modules/admin-pages/`; project and note views live under `apps/web/src/modules/projects/` and `apps/web/src/modules/notes/`. Shared block definitions live in `packages/contracts/src/blocks/definitions/`.
- Check content with `pnpm check:content`. Keep VI and EN content natural and factual; leave unknown personal details unresolved.

### Forbidden items and PR style

- This repository is public. Do not commit secrets, `.env` values, real contact information, or names or links to private data repositories. Use `<email>` and `<phone>` placeholders.
- Use free services and free Tiptap extensions only. R16 (Figma) was dropped; do not implement it. Do not merge without Parker's explicit OK.
- Use one branch/worktree and one PR per task. Branches use `<type>/<short-kebab-topic>`; this task uses `chore/agent-rules`. Use conventional commits. Recent lil.p PR titles follow conventional commit style; use `chore: add agent rules` for this PR.
