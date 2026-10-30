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
- Hosting: Vercel (web), Render free (API), TiDB Cloud Serverless (DB), Cloudinary (images).

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

- Owner/baseline projects are still DRAFT (demo seed publishes projects) → publish migration pending (idempotent, TiDB-safe DRAFT→PUBLISHED, set `publishedAt` when null; update seed data).
- Render P3009: run `npx prisma migrate resolve --rolled-back 20261027150000_portfolio_content` once, then redeploy.
- Review follow-ups: 4px radius step, squircle coverage, About avatar placeholder, mobile stat band, `/projects` gap, page-specific skeletons (admin tables too), slow pages.

## 8. Deferred

- R13, R14, R7, R8, R6 (after priority list). R15 unranked.

## 9. Changelog

- 2026-10-30: Corrected local JWT setup and seed-status scope; clarified file-level CI enforcement and rejected missing/deleted context files.

- 2026-10-30: Added PROJECT_CONTEXT.md, AGENTS.md, context-check CI (T3 Code setup).
