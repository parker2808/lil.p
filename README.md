# lil.p

Portfolio monorepo: Next.js public site + admin (`apps/web`), NestJS API (`apps/api`), design system (`packages/ui`), and shared zod contracts (`packages/contracts`).

Layout and naming: [STRUCTURE.md](./STRUCTURE.md). Build plan: [docs/PLAN.md](./docs/PLAN.md).

## Stack

| Layer     | What runs                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo  | pnpm 10, Node 22, TypeScript 5.9, zod 4 contracts in `packages/contracts`                                                                                                 |
| Web       | Next.js 16.4 (App Router, `proxy.ts`), React 19.3, next-intl 4 (`/en`, `/vi`), TanStack Query 5, shadcn UI in `packages/ui`                                               |
| API       | NestJS 11, Prisma 7 with the `@prisma/adapter-mariadb` driver adapter (one shared pool), JWT in httpOnly cookies                                                          |
| Database  | MySQL 8.4 in Docker locally, TiDB Cloud Serverless in production                                                                                                          |
| Hosting   | Vercel for web (functions pinned to `sin1` Singapore in `vercel.json`, next to the API and DB), Render free for the API (Singapore), Cloudinary for media. All free tiers |
| Keep-warm | A cron-job.org job pings `GET /api/health` (`SELECT 1`) every 10 minutes so the Render free instance does not spin down; `ApiWarmup` also pings it on page load           |

### Caching and rendering

- Public pages under `/[locale]` are static and use ISR. Home, about, contact, project and note detail pages, RSS, OG images and the sitemap are prerendered at build when the API answers, otherwise on first visit.
- Public API reads (`apiServer` without `withAuth`) never read cookies or headers. They use `fetch` with `next: { revalidate: 3600, tags }`, and every one carries the shared `public` tag.
- Admin saves expire the cache right away. Every successful admin mutation calls the `revalidatePublicContent` server action (admins only, `updateTag('public')`). The API still posts per-entity tags to `/api/revalidate` for the content it publishes.
- `/notes` and `/projects` filter and paginate by query string, so they render per request, but their API reads still come from the data cache. `/admin` is always dynamic.
- If the API is down at build time, the build still succeeds: nothing is prerendered and ISR fills the pages on first visit.
- CSP: `/admin` keeps a per-request nonce with `'strict-dynamic'`. Public pages share cached HTML, so they use `script-src 'self' 'unsafe-inline'` with every other directive unchanged (see `csp.util.ts`).

## Environments

There are three ways to run this repo. Each has its own setup — do not mix the steps.

|                 | [Local development](#local-development)       | [Production-like (local)](#production-like-stack-on-your-machine) | [Production](#production)              |
| --------------- | --------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------- |
| Purpose         | Day-to-day coding                             | Test the Docker images before deploy                              | The live site                          |
| Web             | `pnpm dev` → http://localhost:3000            | Docker + Caddy → http://localhost                                 | Vercel (`sin1`)                        |
| API             | `pnpm dev` → http://127.0.0.1:4000            | Docker (behind Caddy)                                             | Render (Docker, `render.yaml`)         |
| Database        | Docker MySQL 8.4 (`docker-compose.yml`)       | Docker MySQL 8.4 (`compose.prod.yml`)                             | TiDB Cloud Serverless                  |
| Media           | In-memory fallback (Cloudinary keys optional) | Cloudinary                                                        | Cloudinary                             |
| Config lives in | Root `.env` (from `.env.example`)             | Root `.env`                                                       | Vercel + Render dashboards only        |
| Migrations      | `pnpm db:migrate` (creates + applies)         | Applied on API boot (`migrate deploy`)                            | Applied on API boot (`migrate deploy`) |

The root `.env` is for your machine only. Production secrets never go in `.env` or in git.

## Local development

### Prerequisites

- Node 22 (`.nvmrc`; `nvm use`)
- pnpm via [corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) so it matches `packageManager` in `package.json`
- Docker Desktop (running)
- git

### First-time setup

Run these in order from the repo root. Every step is needed once per fresh clone.

1. **Install dependencies** (also installs the Husky git hooks and generates the Prisma client):

   ```bash
   nvm use && corepack enable
   pnpm install
   ```

2. **Create `.env`** and fill the values the API refuses to boot without:

   ```bash
   cp .env.example .env
   ```

   | Key                                                     | Local value                                                                                  |
   | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
   | `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Anything. Keep `DATABASE_URL` / `DATABASE_URL_TEST` in sync with the same user and password. |
   | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`              | Two **different** values, 32+ chars: `openssl rand -base64 48`                               |
   | `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD`         | Your local admin login. The seed creates this user only when all three are set.              |

   Leave `CLOUDINARY_*`, `REVALIDATE_SECRET`, and `ANALYTICS_SALT_SECRET` blank unless you need them — the API falls back to in-memory media and skips revalidate and analytics.

   > **Decide `MYSQL_*` before step 3.** MySQL creates the user and grants only the first time the Docker volume is created. If you change `MYSQL_USER` or a password later, reset the volume: `docker compose down -v && pnpm db:up` (this deletes local data).

3. **Start MySQL + Adminer** and wait until `db` is `healthy`:

   ```bash
   pnpm db:up
   docker compose ps
   ```

4. **Build the shared contracts.** The API, the seed, and the web app import `packages/contracts/dist/`, which is not in git:

   ```bash
   pnpm --filter @portfolio/contracts build
   ```

5. **Create the tables and the admin user.** `db:migrate` applies every migration, including `20261027150000_portfolio_content`, which loads the real portfolio content (the same data production has):

   ```bash
   pnpm db:migrate
   pnpm db:seed:admin
   ```

   Want placeholder demo data instead (published projects, posts, inbox messages)? Run `pnpm db:seed` after `db:migrate`. It replaces the portfolio content with demo rows — see [Local data: real content vs demo](#local-data-real-content-vs-demo).

6. **Start web + API:**

   ```bash
   pnpm dev
   ```

| URL                                                                    | What                                                                            |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [http://localhost:3000](http://localhost:3000)                         | Public site                                                                     |
| [http://localhost:3000/admin/login](http://localhost:3000/admin/login) | Admin (sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`)                           |
| [http://127.0.0.1:4000/api/health](http://127.0.0.1:4000/api/health)   | API health — expect `{"status":"ok","db":"ok"}`                                 |
| [http://localhost:8080](http://localhost:8080)                         | Adminer — system **MySQL**, server **`db`**, user/password/database from `.env` |

In Adminer the server is `db` (the Compose service name), not `localhost` — Adminer runs inside Docker too.

### Daily workflow

```bash
pnpm db:up        # if Docker was stopped
pnpm dev
pnpm db:down      # when done; data stays in the `db-data` volume
```

After `git pull`, run `pnpm install`, `pnpm --filter @portfolio/contracts build`, and `pnpm db:migrate` if dependencies, contracts, or migrations changed.

### Changing the database schema

1. Edit `apps/api/prisma/schema.prisma`.
2. `pnpm db:migrate --name short_description` — writes a new folder in `apps/api/prisma/migrations/` and applies it locally.
3. Commit the migration folder together with the schema. Never edit a migration that is already on `main`; production applies them in order.

### Local data: real content vs demo

| You want                                                       | Run                                   |
| -------------------------------------------------------------- | ------------------------------------- |
| Real portfolio content, exactly as production (projects DRAFT) | `pnpm db:reset && pnpm db:seed:admin` |
| Demo placeholders (`SEED_PROFILE=demo`)                        | `pnpm db:reset && pnpm db:seed`       |
| Only (re)create the admin login, content untouched             | `pnpm db:seed:admin`                  |

- `pnpm db:reset` drops the local database and re-applies every migration (content included). Prisma 7 does **not** seed on reset. When an AI agent runs it, Prisma asks for your explicit confirmation first.
- Do not re-run the content migration SQL by hand on top of demo data (`prisma db execute --file …portfolio_content/migration.sql`). Demo rows reuse the same slugs with different ids, so the upserts update the wrong rows and fail with `project_domainId_fkey`. Use `pnpm db:reset` instead.
- `pnpm db:seed` profiles (PLAN D13): `demo` (default) or `baseline` (`SEED_PROFILE=baseline`). `demo` rewrites most content tables but upserts some by slug, so it can leave real and demo rows mixed; `baseline` wipes content and reloads the portfolio JSON. Seed contact fields are `<email>` / `<phone>`.

### Troubleshooting

- **`db` container exits on `pnpm db:up`, or `pnpm db:migrate` fails with P3014** (cannot create the shadow database): the volume was created with different `MYSQL_*` values than `.env` now has. Run `docker compose down -v && pnpm db:up`, then redo steps 5–6.
- **`Cannot find module '@portfolio/contracts'`** (seed or API) or **`Could not find a declaration file for module '@portfolio/contracts'`**: run step 4, then restart `pnpm dev`.
- **API exits with an env validation error**: `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are missing, shorter than 32 chars, or equal.
- **http://localhost:3000 does not load, only Nest logs appear**: `pnpm dev` was run inside `apps/api`, which starts the API alone. Run it from the repo root (`cd` to `lil.p/`) so web, API, and contracts start together.
- **Port 3306 already in use**: another MySQL is running on your machine. Stop it, or the container cannot bind.
- **Cannot sign in to `/admin`**: set all three `ADMIN_*` keys and run `pnpm db:seed:admin`.
- **`Cannot add or update a child row … project_domainId_fkey`** when loading content: demo and real content are mixed. Run `pnpm db:reset && pnpm db:seed:admin`.

## Production

Live hosting is **Vercel (web) + Render (API) + TiDB Cloud (MySQL) + Cloudinary (media)**. First-time provisioning, every env var, and the admin bootstrap are in [docs/DEPLOY.md](./docs/DEPLOY.md) ([Tiếng Việt](./docs/DEPLOY.vi.md)). Rollback and secret rotation: [docs/runbooks/deploy.md](./docs/runbooks/deploy.md), [docs/runbooks/secrets.md](./docs/runbooks/secrets.md).

### How a change reaches production

1. Open a PR (or push) to `main`. CI runs format, lint, typecheck, tests, content checks, build, and API e2e.
2. Vercel and Render auto-deploy `main`.
3. On boot, the API image runs `prisma migrate deploy` — it applies committed migrations only, never creates new ones, never resets data.

Nothing else is run by hand on a normal deploy.

### Rules for production

- Env vars and secrets are set **only** in the Vercel and Render dashboards. Never copy them into the repo `.env` or commit them. Never reuse local secrets in production.
- Never run `pnpm db:migrate`, `pnpm db:reset`, or `pnpm db:seed` with `DATABASE_URL` pointing at TiDB. `migrate dev` / `reset` can drop data, and the seed overwrites content rows.
- New migrations are created locally (see [Changing the database schema](#changing-the-database-schema)) and reach production through `main`.
- `infra/mysql/init/` and `docker-compose.yml` are local-only; production never uses them.
- Before pushing: `pnpm lint && pnpm typecheck && pnpm test && pnpm format:check` (the pre-push hook runs `typecheck`).

## Production-like stack on your machine

Optional. `compose.prod.yml` runs the real production images (MySQL + API + Next + Caddy + daily backups) so you can test a release locally. Only Caddy is published: open [http://localhost](http://localhost), not `:3000`. It reads the same root `.env` (`MYSQL_*`, `JWT_*`); set `WEB_ORIGIN_PROD` / `NEXT_PUBLIC_SITE_URL_PROD` if you serve it on a different origin.

```bash
pnpm prod:up                 # build images and start (API runs migrate deploy on boot)
pnpm prod:seed               # one-off: SEED_PROFILE=baseline, node dist/seed.js
pnpm prod:backup             # one-shot mysqldump + uploads tarball
scripts/backup/restore.sh    # load the newest dump into MYSQL_DATABASE (fresh DB)
pnpm prod:down               # stop; named volumes keep the data
```

Images are multi-stage, run as a non-root user with a read-only root filesystem. Caddy adds HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. Next sets a per-request CSP nonce in `proxy.ts`. Restore: [docs/runbooks/restore.md](./docs/runbooks/restore.md).

## What is in git

Commit source, config, and migrations. Everything a tool can regenerate, and every secret, is ignored (see `.gitignore`):

| Ignored                                                                             | Recreated by                                                    |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.env`, `.env.*` (except `.env.example`)                                            | You, from `.env.example` (local) or the dashboards (production) |
| `node_modules/`                                                                     | `pnpm install`                                                  |
| `packages/contracts/dist/`, `apps/*/dist/`                                          | `pnpm --filter @portfolio/contracts build`, `pnpm build`        |
| `apps/api/src/generated/` (Prisma client)                                           | `pnpm install` (postinstall) or `pnpm typecheck`                |
| `apps/web/next-env.d.ts`, `.next/`                                                  | `pnpm dev`, `pnpm build`, or `pnpm typecheck` (`next typegen`)  |
| `coverage/`, `test-results/`, `playwright-report/`, `storybook-static/`, `uploads/` | Test, Storybook, and runtime output                             |
| `.vercel/`, `.DS_Store`, `*.log`                                                    | Local tooling                                                   |

When you add a new secret, add the key with a placeholder to `.env.example` and the real value to the dashboards.

## Commands

```bash
pnpm dev                     # web :3000 + api :4000 + contracts watch
pnpm lint | typecheck | test | build
pnpm format | format:check   # Prettier (format:check also runs in CI)
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:placeholders      # DATABASE_URL: no seed placeholders in live rows (T60)
pnpm check:deps              # no paid Tiptap packages; every @tiptap/* and @dnd-kit/* is MIT

pnpm db:up | db:down | db:logs   # local MySQL :3306 + Adminer :8080 (127.0.0.1)
pnpm db:test:up              # throwaway test MySQL on :3307 (API e2e)
pnpm db:migrate              # local only: create + apply migrations
pnpm db:seed                 # local only: replace content with the demo (or baseline) profile + admin
pnpm db:seed:admin           # local only: create/update the admin from ADMIN_*; content untouched
pnpm db:reset                # local only: drop + re-apply all migrations (no seed)
pnpm db:studio               # Prisma Studio GUI

pnpm prod:up | prod:seed | prod:backup | prod:down   # production-like stack
```

## Git hooks

`pnpm install` sets up [Husky](https://typicode.github.io/husky/) (v9):

- **pre-commit** — formats and lint-fixes only the files you staged
- **commit-msg** — messages must look like `chore: add hooks` or `feat(web): …` (same as PR titles)
- **pre-push** — runs `pnpm typecheck`

Beginner walkthrough: [STRUCTURE.md § Git hooks](./STRUCTURE.md#git-hooks-husky).

## Background notes

Written for a first pass at backend. Glossary: spec [§1.6](./docs/design/portfolio-design-system.md#s-1-6).

1. **Image vs container.** `mysql:8.4` is the packaged program; `docker compose up` starts a running copy of it. Tags are pinned so everyone runs the same version.
2. **Port mapping.** `127.0.0.1:3306:3306` means "port 3306 on my laptop, reachable only from my laptop, goes to port 3306 in the container". Binding to `127.0.0.1` keeps the DB off your Wi-Fi network.
3. **Volume.** `db-data` is a folder Docker keeps outside the container. `docker compose down` keeps it; `docker compose down -v` deletes it (a full reset).
4. **Init scripts.** Files in `infra/mysql/init/` run **only when the volume is first created**. `01-dev-grants.sh` lets `MYSQL_USER` create and drop databases, which Prisma's shadow database needs for `migrate dev`. That is why changing `MYSQL_*` later needs `down -v`.
5. **Healthcheck.** Compose pings MySQL until it answers; `docker compose ps` shows `healthy` when it does.
6. **ORM.** Prisma turns `schema.prisma` into SQL tables and a typed client: `prisma.profile.findUnique({ where: { id: 1 } })` instead of SQL.
7. **`migrate dev` vs `migrate deploy`.** `dev` (local) diffs the schema, writes a new migration, and may reset the DB. `deploy` (production) only applies committed migrations and never resets data.
8. **Seed.** `upsert` on unique keys makes the local seed safe to run twice. Profiles: `demo` (dev/CI) and `baseline` (production first boot).
9. **Multi-stage builds.** One stage installs and builds; the final stage copies only what runs, so images stay small.
10. **Service names as hostnames.** Inside compose, the web reaches the API at `http://api:4000`; only Caddy is exposed.
11. **Read-only root + backups.** Containers write only to volumes and `tmpfs`. `backup` runs `mysqldump | gzip` daily and keeps 7 days. A backup only counts after `scripts/backup/restore.sh` has loaded it into an empty database.
