<!-- Archived verbatim from docs/PLAN.md (7. Tasks); links re-pointed. Index: ../../PLAN.md -->

## 7. Tasks

Each task uses the same template: **Roadmap · Spec · Depends · Size**, then Goal, Scope, Out of scope, Files, Design, Backend steps explained (backend tasks only), Acceptance, PR title.

### M0 — Groundwork

#### T01 · Monorepo scaffold, toolchain, minimal CI

**Roadmap** p01 · **Spec** [§1.6](../../design/portfolio-design-system.md#s-1-6), [§6](../../design/portfolio-design-system.md#s-6) · **Depends** none · **Size** S

**Goal.** One pnpm workspace with a fixed layout, shared lint/format/TypeScript config, and a CI job that every later PR must pass.

**Scope.**
- Root `package.json`: `"private": true`, `"packageManager": "pnpm@<pinned>"` (enable with `corepack enable`), `"engines": { "node": ">=22" }`, scripts `dev`, `lint`, `typecheck`, `test`, `build`, `format` that run across workspaces with `pnpm -r` (use `--if-present` so empty packages pass).
- `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (`22`), `.editorconfig` (utf-8, lf, 2 spaces), `.gitignore` (`node_modules`, `.env`, `.next`, `dist`, `coverage`, `uploads`, `storybook-static`), `.npmrc` if needed.
- `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`), `eslint.config.mjs` (flat config, typescript-eslint, import sorting), Prettier config.
- `README.md`: prerequisites (Node 22, pnpm via corepack, Docker Desktop, git) and the root commands from [STRUCTURE.md](../../../STRUCTURE.md#root-commands).
- `.github/workflows/ci.yml`: checkout, `pnpm/action-setup`, `setup-node` 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (D16).

**Out of scope.** Creating the apps or packages (T04, T05, T07, T09). Docker (T02).

**Files.** Root only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `README.md`, `.github/workflows/ci.yml`. Keep the existing `STRUCTURE.md`, `apps/*/STRUCTURE.md` and `docs/`.

**Design.** None.

**Acceptance.**
- [ ] `node -v` prints 22.x; `pnpm -v` and `docker compose version` work (roadmap p01).
- [ ] `pnpm install`, `pnpm lint`, `pnpm typecheck` exit 0 on a fresh clone.
- [ ] CI runs on the PR and is green.
- [ ] The squash-merge commit message is `chore: init portfolio monorepo` (roadmap p01).

**PR title:** `chore: init portfolio monorepo`

#### T01a · Prettier, Husky, lint-staged, commitlint

**Roadmap** — (Parker, D27) · **Spec** — · **Depends** T01 · **Size** S

**Goal.** One root format and git-hook toolchain that covers future `apps/web`, `apps/api` and `packages/*` without per-app config.

**Scope.**
- Keep T01's root `.prettierrc` and `eslint.config.mjs`. Add `prettier-plugin-tailwindcss` so Tailwind classes sort when T04 adds them.
- `.prettierignore` for lockfiles, build output, uploads, Storybook static, Husky internals, and the frozen design snapshot.
- Root scripts `format` (`prettier --write .`) and `format:check` (`prettier --check .`) — one command for the whole tree, not `pnpm -r`.
- Husky v9 + `prepare` script. **pre-commit** → lint-staged (Prettier `--write` on staged `ts`/`tsx`/`js`/`json`/`md`/`css`/`yml`; ESLint `--fix` on JS/TS). **commit-msg** → commitlint (conventional commits, same shape as PR titles like `chore: …`). **pre-push** → `pnpm typecheck` (optional safety net).
- CI: add `pnpm format:check`.
- README + STRUCTURE.md: a short beginner section on the hooks.

**Out of scope.** Per-app Prettier/ESLint. Docker (T02). Creating apps or packages (T04, T05, T07, T09).

**Files.** Root: `package.json`, `pnpm-lock.yaml`, `.prettierrc`, `.prettierignore`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.github/workflows/ci.yml`, `README.md`, `STRUCTURE.md`, `docs/PLAN.md`, `docs/PLAN.vi.md`.

**Design.** None.

**Acceptance.**
- [ ] `pnpm format:check` exits 0.
- [ ] `pnpm lint` and `pnpm typecheck` still exit 0.
- [ ] CI includes `pnpm format:check` and is green.
- [ ] A commit message that is not conventional is rejected by the commit-msg hook.
- [ ] No `apps/*` or `packages/*` Prettier/ESLint config.

**PR title:** `chore: add prettier, husky and commitlint`

#### T02 · Docker Compose: MySQL 8.4 + Adminer

**Roadmap** p02 · **Spec** §1.6 · **Depends** T01 · **Size** S

**Goal.** A local MySQL that survives restarts, plus Adminer to look inside it, started with one command.

**Scope.**
- `docker-compose.yml` with:
  - `db`: `mysql:8.4` (pinned tag), `command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci`, env from `.env`, `ports: ["127.0.0.1:3306:3306"]`, named volume `db-data:/var/lib/mysql`, `./infra/mysql/init:/docker-entrypoint-initdb.d:ro`, healthcheck `mysqladmin ping -h localhost`.
  - `adminer`: pinned tag, `127.0.0.1:8080:8080`, `depends_on: db: condition: service_healthy`.
- `infra/mysql/init/01-dev-grants.sql`: lets the app user create and drop databases, which Prisma's shadow database needs for `migrate dev` (avoids error P3014). Dev only.
- `.env.example` with the `MYSQL_*` and `DATABASE_URL` lines from §4 (placeholder passwords). `.env` stays git-ignored.
- Root scripts `db:up`, `db:down`, `db:logs`. README section "Database".

**Out of scope.** Test DB (T29), production compose (T58).

**Files.** `docker-compose.yml`, `infra/mysql/init/01-dev-grants.sql`, `.env.example`, `package.json` (scripts), `README.md`.

**Design.** None.

**Backend steps, explained.**
1. **Image vs container** (glossary §1.6). `mysql:8.4` is the packaged program; `docker compose up` starts a running copy of it. Pin the tag so everyone runs the same version.
2. **Port mapping.** `127.0.0.1:3306:3306` means "port 3306 on my laptop, reachable only from my laptop, goes to port 3306 in the container". Binding to `127.0.0.1` keeps the DB off your Wi-Fi network.
3. **Volume.** `db-data` is a folder Docker keeps outside the container. `docker compose down` deletes the container but not the volume, so data survives. `docker compose down -v` deletes the volume too (a full reset).
4. **Environment variables.** Passwords live in `.env`, never in git. `.env.example` shows which keys exist, with fake values.
5. **Init scripts.** Files in `/docker-entrypoint-initdb.d` run **only the first time** the volume is created. If you already had a volume, run the grant from `01-dev-grants.sql` by hand in Adminer, or reset with `down -v`.
6. **Healthcheck.** Compose pings MySQL until it answers, so other services (Adminer now, the API in T58) start only when the DB is ready.

**Acceptance.**
- [ ] `docker compose up -d db` reaches `healthy` in `docker compose ps` (roadmap p02).
- [ ] Create a scratch table in Adminer, run `docker compose down` then `up`: the table is still there (roadmap p02). Drop it afterwards.
- [ ] Adminer at `http://localhost:8080` logs in with the `.env` user.
- [ ] `docker compose ps` shows ports bound to `127.0.0.1`.
- [ ] `SHOW VARIABLES LIKE 'character_set_server'` returns `utf8mb4`.

**PR title:** `chore(infra): mysql via docker compose`

#### T03 · SQL by hand notes (Parker)

**Roadmap** p03 · **Spec** §1.5, §1.6 · **Depends** T02 · **Size** S · **Owner:** Parker (an agent may draft the outline only)

**Goal.** Learn tables, keys and joins by typing SQL before Prisma writes it for you.

**Scope.**
- Open a MySQL shell: `docker compose exec db mysql -u app -p portfolio`.
- Create scratch tables `profile` and `experience` (with `profile_id` foreign key), insert rows, `SELECT … JOIN`, `UPDATE`, `DELETE`.
- Try deleting a profile that has experiences: see the foreign key block it (`RESTRICT`), then recreate with `ON DELETE CASCADE` and explain in a comment which one you would pick and why.
- Drop the scratch tables at the end so Prisma (T08) starts from an empty database.

**Files.** `docs/sql-notes.sql` (also used by T34 for EXPLAIN notes).

**Design.** None.

**Acceptance.**
- [ ] A JOIN query returns the experiences for one profile (roadmap p03).
- [ ] The FK behavior (blocked or cascades) is explained in `docs/sql-notes.sql` (roadmap p03).
- [ ] The database has no scratch tables left.

**PR title:** `docs: sql fundamentals notes`

#### T04 · Design tokens + shadcn theme in `packages/ui`

**Roadmap** p04 · **Spec** [§3](../../design/portfolio-design-system.md#s-3), [§3.6](../../design/portfolio-design-system.md#s-3-6), [§3.7](../../design/portfolio-design-system.md#s-3-7), §4.0 · **Depends** T01 · **Size** M

**Goal.** The single source of every color, font size, radius, shadow and motion value, wired into shadcn and Tailwind v4, with a test that fails if a token drifts from the design.

**Scope.**
- Create `packages/ui` (`@portfolio/ui`): `package.json` with an `exports` map (`./styles/globals.css`, `./components/*`, `./hooks/*`, `./utils/*`, `./lib/utils`), `tsconfig.json`, Vitest config.
- `src/styles/globals.css`: copy the spec §3.6 block (light `:root` + `.dark`) and the §3.7 `@theme inline` mapping **verbatim**, including v2 tokens (`--band`, `--border-strong`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), the 11 text sizes with their line-heights, radius, shadows, motion easings, z-index scale, `--container`, `--measure`, and the reduced-motion rules (§3.4). Add `@custom-variant dark (&:where(.dark, .dark *));`.
- `components.json` for shadcn: style `new-york`, `rsc: true`, `tsx: true`, `baseColor: neutral`, `cssVariables: true`, css path `src/styles/globals.css`, aliases `@portfolio/ui/components`, `@portfolio/ui/components/ui`, `@portfolio/ui/lib/utils`, `@portfolio/ui/hooks`.
- `src/lib/utils.ts`: `cn()` with `clsx` + `tailwind-merge`. Extend tailwind-merge's `font-size` group with the 11 custom sizes, otherwise `cn('text-title', 'text-primary')` drops one of them.
- `src/styles/globals.test.ts`: parse `:root` and `.dark` from `globals.css` and compare every key in `docs/design/colors.json` (58 tokens × 2 modes); assert the 11 text-size tokens exist.

**Out of scope.** Fonts and the web app (T05). Components (T12+). Storybook (T06).

**Files.** `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/components.json`, `packages/ui/src/styles/globals.css`, `packages/ui/src/styles/globals.test.ts`, `packages/ui/src/lib/utils.ts`, `packages/ui/src/lib/utils.test.ts` ([root STRUCTURE: packages/ui](../../../STRUCTURE.md#package-layout-packagesui)).

**Design.** Figma page `0:1` (Cover & Foundations), variables Color Light/Dark, Spacing, Radius. Mockup `foundations.html`. Tokens: all of §3.6–3.7.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/ui test` passes; changing any hex in `globals.css` makes it fail.
- [ ] `cn('text-title', 'text-primary')` keeps both classes (unit test).
- [ ] `globals.css` diff against the spec block shows only formatting differences.

**PR title:** `feat(ui): design tokens and shadcn theme`

#### T05 · Next.js shell: fonts, theme toggle, type specimen

**Roadmap** p04 · **Spec** §3.1, §3.2, §3.4, §4.2 (`ThemeToggle`) · **Depends** T04 · **Size** M

**Goal.** A running Next.js app that loads the three fonts, switches light/dark/system without a flash, and shows a temporary specimen page to check tokens and Vietnamese rendering.

**Scope.**
- Scaffold with `create-next-app` (TypeScript, App Router, ESLint, Tailwind v4, **no** `src/app`, import alias `@/*` → `src/*`) into a temp folder, then move the files into `apps/web`. The tool refuses a non-empty folder and `apps/web/STRUCTURE.md` must stay.
- `package.json` name `@portfolio/web`; depend on `@portfolio/ui` (`workspace:*`); `next.config.ts` with `transpilePackages: ['@portfolio/ui', '@portfolio/contracts']`.
- `app/globals.css`: `@import "@portfolio/ui/styles/globals.css";` plus `@source "../src";` and `@source "../../../packages/ui/src";` (Tailwind v4 does not scan workspace packages on its own).
- `apps/web/components.json` pointing shadcn at `packages/ui` (monorepo setup).
- Fonts in `src/modules/core/utils/fonts.util.ts` via `next/font/google`: Be Vietnam Pro 600/700, Inter (variable), JetBrains Mono 400/600; `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`; CSS variables `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` (the token file maps them to `--font-heading`, `--font-sans`, `--font-mono`). Mono ligatures off.
- `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange`) and `ThemeToggle` (light / dark / system menu, `aria-pressed`). Adds shadcn `dropdown-menu` (D21).
- Temporary `app/layout.tsx` + `app/page.tsx` rendering `CoreSpecimen`: the 11 text sizes with the QA string `Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`, color swatches, a band stripe, hue swatches, eyebrows. T11 deletes these three files.
- Vitest + Testing Library in `apps/web`; a test for `ThemeToggle`.

**Out of scope.** next-intl, data fetching, locale layouts (T11). Real components (T12+).

**Files.** `apps/web/app/layout.tsx` (temporary), `apps/web/app/page.tsx` (temporary), `apps/web/app/globals.css`, `apps/web/next.config.ts`, `apps/web/components.json`, `apps/web/vitest.config.mts`, `apps/web/src/modules/core/utils/fonts.util.ts`, `apps/web/src/modules/core/components/Providers/ThemeProvider.tsx`, `apps/web/src/modules/core/components/ThemeToggle/ThemeToggle.tsx` (+ `.test.tsx`), `apps/web/src/modules/core/views/CoreSpecimen.tsx` (temporary), `packages/ui/src/components/ui/dropdown-menu.tsx` ([web STRUCTURE](../../../apps/web/STRUCTURE.md)).

**Design.** Figma page `0:1`; text styles `Public/*` and `Admin/*`. Mockup `foundations.html`. Tokens: `--font-*`, all text sizes, `--background`, `--foreground`, `--band`, `--hue-*`, `--primary`.

**Acceptance.**
- [ ] The `/` specimen renders in light and dark with AA contrast checked in DevTools (roadmap p04).
- [ ] Font sizes match the spec scale (`text-title`, `text-prose`, …) and Vietnamese marks on the QA string are not clipped (roadmap p04).
- [ ] Reloading in dark mode shows no light flash.
- [ ] The network panel shows at most 5 font files.
- [ ] Under `prefers-reduced-motion`, the theme switch has no transition.

**PR title:** `feat(web): next shell, tokens, theme`

#### T06 · Storybook + Foundations stories

**Roadmap** p04 (follow-up) · **Spec** §3, §3.2, §6 (Days 1–6) · **Depends** T04 · **Size** S

**Goal.** A Storybook in `packages/ui` where every component is built and checked in isolation, in both themes, with an accessibility panel (D15).

**Scope.**
- `@storybook/react-vite` in `packages/ui`, `@storybook/addon-a11y`, `@storybook/addon-themes` (`withThemeByClassName`, light/dark).
- `.storybook/preview.tsx` imports `globals.css` and a Storybook-only `fonts.css` that loads the same three families from `@fontsource` packages with the `vietnamese` subset (next/font does not run in Storybook) and sets the `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` variables.
- Foundations stories: Colors (every token, both modes, with contrast ratio of the pairs listed in §3.1), Typography (each of the 11 sizes next to its Figma text style name, e.g. `Public/title · 48`, with the QA string), Spacing & Radius & Shadows, Motion (easings, reduced-motion demo).
- CI step `pnpm --filter @portfolio/ui build-storybook`.
- Add `src/stories/foundations/` to the `packages/ui` tree in the root `STRUCTURE.md` (rule 5).

**Files.** `packages/ui/.storybook/main.ts`, `packages/ui/.storybook/preview.tsx`, `packages/ui/.storybook/fonts.css`, `packages/ui/src/stories/foundations/{Colors,Typography,Spacing,Motion}.stories.tsx`, `.github/workflows/ci.yml`, `STRUCTURE.md`.

**Design.** Figma page `0:1`; mockup `foundations.html`.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/ui storybook` starts; every Foundations story renders in light and dark.
- [ ] The a11y panel shows 0 violations on the Foundations stories.
- [ ] Storybook builds in CI.

**PR title:** `chore(ui): storybook + foundations stories`

### M1 — First API

#### T07 · NestJS app + health + validated config

**Roadmap** p05 · **Spec** §1.6 · **Depends** T01 · **Size** M

**Goal.** A NestJS app at `:4000` with the `/api` prefix, config that fails fast on bad env values, and `GET /api/health`.

**Scope.**
- Scaffold with `nest new` (pnpm, strict) into a temp folder, then move into `apps/api` (keep `apps/api/STRUCTURE.md`). Package name `@portfolio/api`.
- `src/main.ts`: `setGlobalPrefix('api')`, `enableShutdownHooks()`, listen on `API_PORT` / `API_HOST` (`127.0.0.1`, D9). **No** `enableCors()` (D9).
- `src/config/`: `env.schema.ts` (zod: `NODE_ENV`, `API_PORT`, `API_HOST`, `WEB_ORIGIN`), `app-config.service.ts` (typed getters), `config.module.ts` (`@nestjs/config`, global, `validate: (raw) => envSchema.parse(raw)`, reads the root `.env`).
- `src/modules/health/`: `health.module.ts`, `health.controller.ts` (`GET /health` → `{ status: "ok" }`).
- Replace Jest with Vitest + `unplugin-swc` (Nest decorators need SWC's metadata), first test `health.controller.spec.ts`.
- `apps/api/api.http` with the health request. Root `pnpm dev` now runs web and api in parallel.

**Out of scope.** Prisma (T08), error filter (T10).

**Files.** `apps/api/package.json`, `apps/api/nest-cli.json`, `apps/api/tsconfig*.json`, `apps/api/vitest.config.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts,config.module.ts}`, `apps/api/src/modules/health/{health.module.ts,health.controller.ts,health.controller.spec.ts}`, `apps/api/api.http`, `.env.example` ([api STRUCTURE](../../../apps/api/STRUCTURE.md)).

**Design.** None.

**Backend steps, explained.**
1. **What Nest gives you.** A *module* groups one feature. A *controller* maps a URL to a method. A *service* holds the logic. Nest creates these classes and hands them to each other (*dependency injection*): you ask for `AppConfigService` in a constructor and Nest passes it in.
2. **Bootstrap (`main.ts`).** Creates the app from `AppModule`, sets `/api` in front of every route, and starts listening. `127.0.0.1` means only your machine can call it until guards exist (T36).
3. **Config.** `.env` values are strings. The zod schema turns `API_PORT="4000"` into the number 4000 and stops the app at start-up if a value is missing or wrong, so you never debug a half-configured server.
4. **Health module.** `@Controller('health')` + `@Get()` = `GET /api/health`. Health checks are what Docker and uptime monitors call later (T58, T61).
5. **Try it.** `curl localhost:4000/api/health`, or click "Send Request" in `api.http`.
6. **Test it.** The spec file creates the controller and checks the return value. Vitest needs SWC because Nest reads TypeScript type metadata at runtime.

**Acceptance.**
- [ ] `curl localhost:4000/api/health` returns `{"status":"ok"}` (roadmap p05).
- [ ] Setting `API_PORT=abc` stops the app at start-up with a readable zod error.
- [ ] The API is not reachable on the machine's LAN IP.
- [ ] `pnpm --filter @portfolio/api test` is green in CI.

**PR title:** `feat(api): nest app + health`

#### T08 · Prisma: site layout models, first migration, seed profiles

**Roadmap** p06 · **Spec** [§1.5](../../design/portfolio-design-system.md#s-1-5), §1.6 · **Depends** T02, T07 (T03 recommended) · **Size** L

**Goal.** The first five tables from the spec, created by a migration you can read, filled by an idempotent seed, and available to every service through `PrismaService`.

**Scope.**
- Install Prisma (pin the version). If Prisma 7+, add `prisma.config.ts` and the MariaDB driver adapter (it supports MySQL) as the Prisma docs describe for that version.
- `prisma/schema.prisma` with the §1.5 conventions (autoincrement `id`, `createdAt`/`updatedAt`, `En`/`Vi` column pairs, `sortOrder`/`isVisible`, `@@map` to snake_case, `@db.Text` for markdown):
  - `SiteSettings` (1 row): all §1.5 fields including `ambientEffects`, `marqueeEnabled`; `ogImageId` as a plain `Int?` until media exists (T50 adds the relation).
  - `Profile` (1 row): all §1.5 fields including `heroKicker{En,Vi}`, `headlineAccent{En,Vi}`, private `phone`; `avatarId`, `resumeEnId`, `resumeViId` as plain `Int?` for now.
  - `NavItem`, `SocialLink` (with `showInHeader`, `showInCta`).
  - The page pair (D26): `Page` (`key` enum `PageKey` `@unique`; `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`) and `PageBlock` (`pageId` → `Page` with `onDelete: Cascade`, `type` `VarChar(48)`, `key` `VarChar(48)`, `schemaVersion Int @default(1)`, `props Json`, `layout` enum `LayoutPreset`, `surface` enum `BlockSurface` (`PLAIN` | `BAND`), `sortOrder`, `isVisible`; `@@unique([pageId, key])`, `@@index([pageId, sortOrder])`). `type` is a plain string, not a DB enum, so a new block type later needs no migration; T10a checks it against the registry.
  - Enums `Availability`, `NavLocation`, `SocialKind`, `PageKey`, `LayoutPreset`, `BlockSurface`.
- First migration `pnpm prisma migrate dev --name init-site`.
- Seed (D13): `prisma/seed/seed.ts` reads `SEED_PROFILE` (`demo` | `baseline`) and runs `profiles/demo.seed.ts` or `profiles/baseline.seed.ts`; rows come from `prisma/seed/data/site.data.ts`. Placeholder values only: copy from the wireframes/mockups, `contactEmail: '<email>'`, `phone: '<phone>'`. Seed the five `Page` rows and their default blocks from D18 (`prisma/seed/data/pages.data.ts`: `type`, `key`, `layout`, `surface`, placeholder `props` with `{ en, vi }` text). Upsert on unique keys so running twice changes nothing.
- `src/prisma/prisma.module.ts` (`@Global`) and `prisma.service.ts` (extends `PrismaClient`, connects on module init).
- `GET /api/health` also returns `db: "ok"` after `SELECT 1`.
- Scripts `db:migrate`, `db:reset`, `db:seed`, `db:studio`.

**Out of scope.** Content tables (T15+), public endpoints (T09).

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_init_site/`, `apps/api/prisma/seed/seed.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/prisma/seed/data/{site,pages}.data.ts`, `apps/api/prisma.config.ts` (Prisma 7+), `apps/api/src/prisma/{prisma.module.ts,prisma.service.ts}`, `apps/api/src/modules/health/health.controller.ts`.

**Design.** Spec §1.5 tables "Site" and "About · Profile"; D18 default blocks, D26.

**Backend steps, explained.**
1. **ORM.** Prisma turns `schema.prisma` into SQL tables and a typed client. You write `prisma.profile.findUnique({ where: { id: 1 } })` instead of SQL, and TypeScript knows every column.
2. **Schema conventions.** Read the §1.5 conventions table first. Two columns per translated text (`headlineEn`, `headlineVi`) keeps things visible in Adminer; singletons are a table with one row, `id = 1`.
3. **Migration.** `migrate dev --name init-site` compares the schema with the DB and writes a SQL file in `prisma/migrations/`. **Open it and read it**: you will see `CREATE TABLE`, the unique index on `(page, key)`, and `utf8mb4`. That file is committed and never edited (rule 6). If you see error P3014, the shadow-database grant from T02 is missing.
4. **Seed.** A script that fills an empty DB. `upsert` (update-or-insert) makes it safe to run again. Two profiles: `demo` gives dev and CI a full site, `baseline` is what production starts with (D13).
5. **PrismaService.** One shared connection, registered as a global Nest provider, so any service can ask for it in its constructor instead of opening its own connection.
6. **Look at the data.** `pnpm db:studio` opens Prisma Studio; Adminer works too.
7. **A JSON column.** `PageBlock.props` is MySQL `JSON`: each row may have its own shape. Open one in Adminer to see it. MySQL does not check what is inside; T10a adds that check in code.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/api prisma migrate reset` recreates the tables and seeds them (roadmap p06).
- [ ] Prisma Studio shows rows in SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock (roadmap p06, adjusted by D12).
- [ ] Running the seed twice leaves the same row counts.
- [ ] The PR description summarizes the generated SQL.
- [ ] `rg` for email/phone patterns in `apps/api/prisma` finds only `<email>` and `<phone>`.
- [ ] `GET /api/health` returns `{"status":"ok","db":"ok"}`.

**PR title:** `feat(api): prisma schema + seed`

#### T09 · Contracts package + `GET /api/public/site`

**Roadmap** p07 · **Spec** §1.5 ("Two API shapes"), §4.5 ("Critical data"), §5.0 (Layout row) · **Depends** T08 · **Size** L

**Goal.** One public endpoint that returns everything the layout needs, already in the requested language, typed by a shared contracts package.

**Scope.**
- Create `packages/contracts` (`@portfolio/contracts`, depends on `zod` only; zod 4, because blocks use `.meta()` and `z.toJSONSchema`, D26). Build with `tsup` to `dist/` (ESM + CJS + types) so Nest can consume it; root `pnpm dev` runs `tsup --watch`.
- Contracts: `common/locale.schema.ts`, `common/api-error.schema.ts`, and public DTO schemas in `site-settings/`, `profile/`, `navigation/`, `social-links/`, `public-site/` (`[domain].schema.ts` + `[domain].type.ts` + `[domain].enum.ts`), `constants/routes.constant.ts` (real public routes for `NavItem.href`).
- API `src/i18n/`: `locale.decorator.ts` (`@Locale()` reads `?locale`, default `en`), `pick-locale.util.ts` implementing D19 (`pickGroup(row, ['headline', 'subheadline'], locale)` → `{ headline, subheadline, lang }`), with `pick-locale.util.spec.ts`.
- Owning modules (service + entity + mapper, no controllers yet): `site-settings`, `profile`, `navigation`, `social-links`. The profile mapper never outputs `phone`. Page blocks get their own module and endpoint in T10a.
- `modules/public-site/`: `public-site.controller.ts` (`GET /public/site`), `public-site.service.ts` (calls the four services in parallel; visible rows only, ordered by `sortOrder`). Response: `{ settings, profile, nav: { header, footer }, socialLinks }`. `profileStats` is added by T15.
- A missing singleton returns 404 `{ code: "NOT_SEEDED", message }`. T10 makes this the full error body.
- `api.http` request with `?locale=en` and `?locale=vi`.

**Out of scope.** Global validation and the error filter (T10). Web consumption (T11).

**Files.** `packages/contracts/{package.json,tsconfig.json,tsup.config.ts}`, `packages/contracts/src/index.ts`, `packages/contracts/src/common/{locale.schema.ts,api-error.schema.ts}`, `packages/contracts/src/{site-settings,profile,navigation,social-links,public-site}/*`, `packages/contracts/src/constants/routes.constant.ts`, `apps/api/src/i18n/{locale.decorator.ts,pick-locale.util.ts,pick-locale.util.spec.ts}`, `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{[domain].module.ts,[domain].service.ts,entities/*}`, `apps/api/src/modules/public-site/{public-site.module.ts,public-site.controller.ts,public-site.service.ts}`, `apps/api/api.http` ([root STRUCTURE: contracts](../../../STRUCTURE.md#package-layout-packagescontracts), [api module layout](../../../apps/api/STRUCTURE.md#module-layout)).

**Design.** Spec §5.0 "Layout: header, footer" row; §1.5 "Two API shapes".

**Backend steps, explained.**
1. **Contracts.** A zod schema describes a JSON shape once. The API uses it to check its output in tests, the web uses the inferred type, and later the admin form uses the same schema to validate input.
2. **One module per table.** `profile` owns the `Profile` table: only `ProfileService` queries it. `public-site` owns no table; it asks the four services and combines the results. This rule keeps queries in one place per table.
3. **Entity and mapper.** The entity file fixes which columns we load. The mapper turns the DB row into the public DTO: it picks `headlineVi` or `headlineEn` and drops private fields like `phone`.
4. **Locale fallback (D19).** If Vietnamese is missing for any field in a group, the whole group is English and carries `lang: "en"` so the page can mark it for screen readers and fonts.
5. **Parallel reads.** `Promise.all` runs the four queries at the same time instead of one after another.

**Acceptance.**
- [ ] `GET /api/public/site?locale=vi` returns flat fields (`headline`, not `headlineVi`) from the seed (roadmap p07).
- [ ] Clearing `Profile.subheadlineVi` in Adminer makes the profile group English with `lang: "en"`.
- [ ] Hidden nav items are not returned; order follows `sortOrder`.
- [ ] `phone` never appears in the response (mapper unit test).
- [ ] With an empty DB (`migrate reset --skip-seed`), the endpoint returns 404 with `code` + `message` (roadmap p07).

**PR title:** `feat(api): public read endpoints`

