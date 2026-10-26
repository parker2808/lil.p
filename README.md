# lil.p

Portfolio monorepo: Next.js public site + admin (`apps/web`), NestJS API (`apps/api`), design system (`packages/ui`), and shared zod contracts (`packages/contracts`).

Layout and naming: [STRUCTURE.md](./STRUCTURE.md). Build plan: [docs/PLAN.md](./docs/PLAN.md).

## Prerequisites

- Node 22 (`.nvmrc`; `nvm use`)
- pnpm via [corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) so it matches `packageManager` in `package.json`
- Docker Desktop
- git

## Commands

```bash
pnpm install                 # all workspaces (also installs git hooks via Husky)
pnpm dev                     # web :3000 + api :4000 in parallel (MySQL via docker compose)
pnpm lint | typecheck | test | build
pnpm format | format:check   # Prettier (one root config; format:check also runs in CI)
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:placeholders      # DATABASE_URL: no seed placeholders in live rows (T60)
pnpm check:deps              # no paid Tiptap packages or private Tiptap registry; every @tiptap/* and @dnd-kit/* is MIT
pnpm db:up                   # MySQL :3306 + Adminer :8080 (127.0.0.1)
pnpm db:down                 # stop containers; named volume `db-data` keeps the data
pnpm db:logs                 # follow db + adminer logs
pnpm db:migrate              # create / apply Prisma migrations (apps/api)
pnpm db:reset                # drop + recreate + seed
pnpm db:seed                 # re-run the seed (idempotent upserts)
pnpm db:studio               # Prisma Studio GUI
pnpm prod:up                 # production stack on http://localhost (Caddy :80)
pnpm prod:seed               # one-off baseline seed inside the API image
pnpm prod:backup             # one-shot mysqldump + uploads tarball
pnpm prod:down               # stop the production stack (named volumes keep data)
docker compose up -d db adminer
```

## Database

Local MySQL 8.4 plus [Adminer](https://www.adminer.org/) (a browser UI to look inside it). Only these two run in Docker in development; the API and web apps come later and use `pnpm dev`. Copy `.env.example` to `.env` once, then start with one command:

```bash
cp .env.example .env         # real passwords live here; `.env` is git-ignored
pnpm db:up                   # or: docker compose up -d db adminer
docker compose ps            # wait until `db` is `healthy`
```

Adminer: [http://localhost:8080](http://localhost:8080). System **MySQL**, server **`db`** (the Compose service name — Adminer is also in Docker, so `localhost` would mean Adminer's own container), username **`app`**, password and database from `.env` (`MYSQL_PASSWORD`, `MYSQL_DATABASE=portfolio`).

`pnpm db:down` stops the containers. Data stays. `docker compose down -v` deletes the `db-data` volume too (a full reset). If you already had a volume before `infra/mysql/init/01-dev-grants.sql` existed, run that GRANT in Adminer or reset with `down -v`.

### Prisma (schema, migrate, seed)

The API owns the schema in `apps/api/prisma/schema.prisma`. After MySQL is healthy:

```bash
pnpm db:migrate              # first run: `--name init-site` (already committed)
pnpm db:seed                 # fills SiteSettings, Profile, nav, social, pages
pnpm db:studio               # browse rows; Adminer works too
```

`SEED_PROFILE=demo` (default) or `baseline` chooses the seed profile (PLAN D13). Values are placeholders; contact fields are `<email>` / `<phone>`.

7. **ORM.** Prisma turns `schema.prisma` into SQL tables and a typed client. You write `prisma.profile.findUnique({ where: { id: 1 } })` instead of SQL.
8. **Migration.** `migrate dev --name init-site` writes a SQL file in `prisma/migrations/`. That file is committed and never edited.
9. **Seed.** `upsert` on unique keys makes the script safe to run twice. Two profiles: `demo` (dev/CI) and `baseline` (production first boot).

### Backend steps, explained

Written for a first pass at backend. Glossary: spec [§1.6](./docs/design/portfolio-design-system.md#s-1-6).

1. **Image vs container** (glossary §1.6). `mysql:8.4` is the packaged program; `docker compose up` starts a running copy of it. Pin the tag so everyone runs the same version. `adminer:5.4.2` is pinned the same way.
2. **Port mapping.** `127.0.0.1:3306:3306` means "port 3306 on my laptop, reachable only from my laptop, goes to port 3306 in the container". Binding to `127.0.0.1` keeps the DB off your Wi-Fi network. Adminer is `127.0.0.1:8080:8080` for the same reason. If a local MySQL already uses 3306, stop it or the new container will fail to bind.
3. **Volume.** `db-data` is a folder Docker keeps outside the container. `docker compose down` deletes the container but not the volume, so data survives. `docker compose down -v` deletes the volume too (a full reset).
4. **Environment variables.** Passwords live in `.env`, never in git. `.env.example` shows which keys exist, with fake values. Compose reads `.env` and passes `MYSQL_*` into the `db` container. The API (later) will use `DATABASE_URL`.
5. **Init scripts.** Files in `/docker-entrypoint-initdb.d` (`infra/mysql/init/`) run **only the first time** the volume is created. `01-dev-grants.sql` lets the `app` user create and drop databases, which Prisma's shadow database needs for `migrate dev` (avoids error P3014). If you already had a volume, run the grant from `01-dev-grants.sql` by hand in Adminer, or reset with `down -v`.
6. **Healthcheck.** Compose pings MySQL (`mysqladmin ping -h localhost`) until it answers, so other services (Adminer now, the API in T58) start only when the DB is ready. `docker compose ps` shows `healthy` when that succeeds.

## Production compose

The whole stack (MySQL + API + Next + Caddy + daily backups) runs from `compose.prod.yml`. Nothing but Caddy is published — open [http://localhost](http://localhost). Images are multi-stage and run as a non-root user with a read-only root filesystem. Media still goes to Cloudinary (T50); the `uploads` volume is snapshotted with the database.

```bash
# JWT secrets must be set (32+ chars, different from each other):
#   openssl rand -base64 48
pnpm prod:up                 # docker compose -f compose.prod.yml up --build
pnpm prod:seed               # SEED_PROFILE=baseline; node dist/seed.js
pnpm prod:backup             # one-shot dump onto the backups volume
scripts/backup/restore.sh    # load the newest dump into MYSQL_DATABASE (fresh DB)
```

The API entrypoint runs `prisma migrate deploy` (only committed migrations) before it starts. `pnpm prod:seed` is a one-off — it is not part of every boot. Use `http://localhost`, not `:3000`; Caddy is the origin the browser and `WEB_ORIGIN` share.

Caddy adds HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. Next sets a per-request CSP nonce in `proxy.ts` (`frame-ancestors 'self'` so the page builder can iframe the public site). Auth cookies are `Secure` when `NODE_ENV=production`. See [docs/runbooks/secrets.md](./docs/runbooks/secrets.md) and [docs/runbooks/restore.md](./docs/runbooks/restore.md).

The web image stays near the 300 MB target. The API image is larger because Prisma 7's CLI (required for `migrate deploy`) ships engines and Studio on top of the Node 22 alpine base.

10. **Multi-stage builds.** One stage installs and builds; the final stage copies only what runs, so images stay small.
11. **`migrate deploy` vs `migrate dev`.** `deploy` only applies committed migrations, never creates new ones and never resets data. It is the only migrate command for production.
12. **Service names as hostnames.** Inside compose, the web reaches the API at `http://api:4000`; nothing but Caddy is exposed.
13. **Read-only root + backups.** Containers cannot write to their image; only volumes (`db-data`, `uploads`, `backups`, Caddy state) and `tmpfs` are writable. `backup` runs `mysqldump | gzip` daily and keeps 7 days. A backup only counts after `scripts/backup/restore.sh` has loaded it into an empty database.

## Git hooks

`pnpm install` sets up [Husky](https://typicode.github.io/husky/) (v9). After that:

- **pre-commit** — formats and lint-fixes only the files you staged
- **commit-msg** — commit messages must look like `chore: add hooks` or `feat(web): …` (same as PR titles)
- **pre-push** — runs `pnpm typecheck`

Beginner walkthrough: [STRUCTURE.md § Git hooks](./STRUCTURE.md#git-hooks-husky).
