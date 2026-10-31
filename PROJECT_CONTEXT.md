# PROJECT_CONTEXT — lil.p (portfolio)

Mandatory reading for every agent. Update §7 and §9 in every PR to `main` (docs-only PRs are exempt). CI checks file presence and a file-level update, not individual sections; `skip-context` bypasses CI.

## 1. Requirements

- Personal portfolio: public site (projects, notes, about) + admin CMS.
- All hosting free tier. Content is data-driven; no hardcoded personal content.
- VI/EN bilingual, light/dark mode.

## 2. Stack (confirmed)

- pnpm 10 monorepo, Node 22. Prettier + Husky + commitlint (conventional commits) at root.
- Web: Next.js 16.4.3, React 19.3.
- API: NestJS 11, Prisma 7 (mariadb adapter). JWT auth with `admin` / `user` roles. Swagger at `/api/docs` (off in production).
- DB: MySQL 8.4 (Docker) locally, TiDB Cloud Serverless in production.
- Editor: Tiptap (core + free extensions only), Markdown storage, shadcn toolbar.
- Hosting: Vercel (web, functions in `sin1` via root `vercel.json`), Render free (API), TiDB Cloud Serverless (DB), Cloudinary (images). cron-job.org pings `/api/health` every 10 min.
- Rendering: public `/[locale]` pages static/ISR (1 h, shared `public` cache tag expired by admin saves); `/notes` + `/projects` index render per request on cached data; `/admin` dynamic. Public CSP has no nonce (`'unsafe-inline'` scripts); `/admin` and draft-mode requests get nonce + `'strict-dynamic'`.

## 3. Design (confirmed)

- Redesign plan: `docs/plans/ui-redesign.md`, mockups in `docs/design/redesign/`.
- Shipped as PR #74 ("Ink & Signal") for public + admin.
- Fonts IBM Plex Sans / Mono. Apple-style squircle, concentric radius, 10px base.
- Skeletons / loading states on public and admin routes.
- Priority: R1+R2 → R3+R4+R4b → R5 → R9 → R10+R11 → R12. Later: R13, R14, R7, R8, R6.

## 4. Forbidden

- No secrets, tokens, or `.env` values in the repo, PRs, logs, or chat. Repo is public.
- No real contact info: use `<email>` / `<phone>` placeholders.
- Never name or link any private data repo.
- No paid services or paid Tiptap extensions.
- R16 (Figma) is dropped — do not implement.

## 5. Workflow

- Local: copy `.env.example` to `.env`, then configure two distinct JWT secrets of at least 32 characters each (see [README setup](README.md#local-development)). Run `pnpm install && pnpm db:up && pnpm db:migrate && pnpm db:seed && pnpm dev` (web 3000, API 4000, Adminer 8080).
- Branch off `main`, conventional commits, open a PR, monitor CI until all checks are green.
- Stacked PRs are OK. **Never merge without Parker's explicit OK.**

## 6. Multi-agent rules

- One agent = one branch / worktree = one PR. Never commit to another agent's branch.
- Child agents get only their task prompt; put needed context in this file, not in chat.
- Stay in scope; record anything out of scope in §7.

## 7. Open items

- CI standardization PR (`chore/cicd-standard`) awaits Parker's review; do not merge until Parker explicitly approves.
- ~~Owner/baseline projects are still DRAFT (demo seed publishes projects) → publish migration pending~~ → resolved on `feat/publish-all-content` (pending review): idempotent TiDB-safe migration `20261031120000_publish_all_content` publishes every `project` / `post` DRAFT and backfills `publishedAt`; backup data + owner/baseline seed now seed PUBLISHED with `publishedAt` stamped at seed time.
- Render P3009: before deploying `20261031120000_publish_all_content`, prod on Render may still show P3009 on `20261027150000_portfolio_content`; run `npx prisma migrate resolve --rolled-back 20261027150000_portfolio_content` once, then redeploy.
- `20261027150000_portfolio_content/migration.sql` stays frozen permanently — its bytes are what Render prod replays, so it is never regenerated. `data/portfolio-data.json` is already PUBLISHED; `build-content-migration.ts` `assertCommittedMigrationMatches` and `build-content-migration.spec.ts` permanently normalize (DRAFT→PUBLISHED) when comparing regenerated SQL to the committed file; the publish itself is the idempotent `20261031120000_publish_all_content` migration.
- Review follow-ups: 4px radius step, squircle coverage, About avatar placeholder, mobile stat band, `/projects` gap, page-specific skeletons (admin tables too), slow pages.
- No favicon/app icon yet: browsers still request `/favicon.ico` (now a clean 404, no API call).
- `perf/static-isr-and-api-latency` (pending review, not pushed): after deploy, confirm `x-vercel-id` ends in `::sin1` and public pages return `x-vercel-cache: HIT`/`STALE`; confirm the Vercel Root Directory is still the repo root (that is where `vercel.json` is read).
- Perf follow-ups (uncertain, not done): `render.yaml` has no `region` (Blueprint default is Oregon) while prod was measured in Singapore; region cannot change on an existing service, so only matters for a re-created service. TiDB reports `8.0.11-TiDB`, below the adapter's 8.0.13 relation-JOIN cutoff, so nested `include`s use extra round trips (likely why `/api/public/projects` ~1 s vs ~0.3 s for others). `/notes` and `/projects` could become static if filtering moved client-side. The API `/api/revalidate` webhook covers only pages, posts, projects, domains, skills, profile and site settings; the admin `revalidatePublicContent` action covers the rest. A block that fails to load during ISR regeneration is cached as its inline error state until the next revalidation.

## 8. Deferred

- R13, R14, R7, R8, R6 (after priority list). R15 unranked.

## 9. Changelog

- 2026-10-31: Speed (Parker's task, prod measured from Vietnam: web functions ran in `iad1` while API + DB are in Singapore; every page `private, no-store`). Root `vercel.json` pins functions to `sin1`. Public `/[locale]` pages are now static/ISR: `force-dynamic` removed, the locale layout prerenders only when `/api/health` answers (build passes with the API down), slug pages `generateStaticParams`, home/about/contact read `searchParams` only in draft mode. `apiServer` public reads never touch cookies/headers and always carry the `public` tag; the new admin-only `revalidatePublicContent` server action (`updateTag`) runs after admin mutations that change live content via `usePublicCacheSync` in `AdminShell` (draft-only ones opt out with `meta.publicCache`). A failed sitemap/RSS fetch during `next build` makes the route render per request instead of caching empty output. CSP: nonce + `'strict-dynamic'` on `/admin` and draft-mode requests; public routes use `script-src 'self' 'unsafe-inline'`, other directives unchanged. API pool and health checked, no change needed. README gains a Stack section. Spec with acceptance criteria AC1–AC9, results and before/after timings: `docs/specs/2026-10-31-perf-static-isr.md`. Pending Parker's review.

- 2026-10-31: Publish-all-content (Parker's explicit task): added data-only migration `20261031120000_publish_all_content` (idempotent DRAFT→PUBLISHED for `project` + `post`, backfills `publishedAt`, plain SQL valid on MySQL 8.4 + TiDB, no schema change). Backup `portfolio-data.json` and owner/baseline seed now seed projects as PUBLISHED with `publishedAt` stamped at seed time (no invented dates). `posts.data.ts` keeps one intentional demo DRAFT post. Pending Parker's review.

- 2026-10-31: Added Graphify code map (`graphify-out/GRAPH_REPORT.md` committed, rest of `graphify-out/` gitignored; built with `--code-only`, no model calls) and shortened `AGENT_RULES.md` to ~30 lines pointing to the shared common rules and TOKEN_FLOW in `<private-memory-repo>`. Pending Parker's review.

- 2026-10-31: Standardized CI per the shared front-end CI/CD lessons in Parker's memory repo: `ci.yml` adds `workflow_dispatch`, a `ci-${{ github.ref }}` concurrency group (cancels stale PR runs only), `timeout-minutes` on every job, and the composite action `.github/actions/setup` used by all three jobs. All existing checks kept; no deploy changes. `AGENT_RULES.md` CI section updated. Pending Parker's review.

- 2026-10-31: Added `AGENT_RULES.md` with the shared rules copied verbatim and lil.p project rules; linked it from `AGENTS.md`. Pending Parker's review.

- 2026-10-30: Fixed flaky web-e2e "CMS panes contain scrolling": admin `main` is now the containing block, so Radix Switch hidden inputs rendered before hydration no longer stretch the document. `apiServer` returns notFound() for unsupported locales (e.g. `/favicon.ico` hitting `[locale]`) instead of calling the API.

- 2026-10-30: Corrected local JWT setup and seed-status scope; clarified file-level CI enforcement and rejected missing/deleted context files.

- 2026-10-30: Added PROJECT_CONTEXT.md, AGENTS.md, context-check CI (T3 Code setup).
