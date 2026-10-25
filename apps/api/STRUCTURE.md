# API module conventions (NestJS + Prisma)

Monorepo map and package rules: **[../../STRUCTURE.md](../../STRUCTURE.md)**. Build plan: [docs/PLAN.md](../../docs/PLAN.md). Backend glossary: spec [§1.6](../../docs/design/portfolio-design-system.md#s-1-6).

This file covers how `apps/api` is laid out and what each folder is for. It is written for someone new to NestJS: read "How a request flows" once, then use the folder table as a lookup.

## Overview

```text
prisma/                   # the database definition: schema, migrations, seed
src/
├── main.ts               # starts the app: prefix /api, global pipes/filters, listen :4000
├── app.module.ts         # root module: imports every feature module
├── config/               # reads and validates .env once
├── prisma/               # PrismaService: the one DB connection everyone injects
├── common/               # cross-cutting code: guards, pipes, filters, interceptors, decorators
├── i18n/                 # locale query parsing + pick En/Vi columns for public responses
└── modules/              # one folder per domain (projects, posts, auth, …)
test/                     # integration tests against the test DB (supertest)
api.http                  # one request per route, run with VS Code REST Client or curl
prisma.config.ts          # Prisma CLI config (Prisma 7+)
```

## How a request flows

```text
GET /api/public/projects?locale=vi
  │
  ├─ middleware   request-id.middleware.ts   gives the request an id (shown in errors and logs)
  ├─ guard        session.guard.ts           is a session required? (@Public() routes skip it)
  │               roles.guard.ts             does the user's role allow this? (admin routes)
  │               origin.guard.ts            mutating request from our own site? (CSRF)
  ├─ pipe         zod-validation.pipe.ts     parse ?query / body with a contracts schema → 400 if bad
  ├─ controller   public-projects.controller.ts   maps the URL to one service method; no logic
  ├─ service      projects.service.ts        the logic: Prisma queries, transactions, rules
  ├─ entity/mapper project.mapper.ts         DB row → JSON shape (picks vi or en, hides private fields)
  └─ on error     all-exceptions.filter.ts   any thrown error → { statusCode, code, message, requestId, fieldErrors? }
```

Keep that order in mind: guards decide whether a request is allowed, pipes check its input, controllers route it, services do the work.

## Folders, explained

| Folder | What it is, in plain words | What goes in it |
| --- | --- | --- |
| `prisma/` | The database's source of truth. `schema.prisma` lists every table and column; `migrate dev` turns your edits into SQL files in `migrations/` | `schema.prisma`, `migrations/` (committed, never edited after applying), `seed/` |
| `prisma/seed/` | Scripts that fill an empty DB with starting rows | `seed.ts` (entry), `profiles/demo.seed.ts` (dev/CI data), `profiles/baseline.seed.ts` (first production boot), `data/*.data.ts` (placeholder rows, `<email>`/`<phone>` only) |
| `src/config/` | Settings that live outside the code (`.env`). Read once at start-up and validated, so a missing `DATABASE_URL` fails at boot instead of at the first query | `env.schema.ts` (zod), `app-config.service.ts` (typed getters), `config.module.ts` |
| `src/prisma/` | The code side of Prisma: one shared `PrismaClient` wrapped as a Nest provider. Services inject it instead of creating their own connection | `prisma.module.ts` (global), `prisma.service.ts` |
| `src/common/guards/` | A guard runs before the controller and answers yes/no | `session.guard.ts` (loads the session from the cookie), `roles.guard.ts` (`OWNER`/`EDITOR`/`VIEWER`), `origin.guard.ts` |
| `src/common/pipes/` | A pipe checks or transforms input before the controller sees it | `zod-validation.pipe.ts` |
| `src/common/filters/` | A filter catches thrown errors and writes the error response, so every error looks the same | `all-exceptions.filter.ts` (maps Prisma `P2002` → 409, `P2025` → 404) |
| `src/common/interceptors/` | Wraps the controller call, for things that happen around every request | `logging.interceptor.ts` (method, path, status, ms, request id; never bodies or passwords) |
| `src/common/decorators/` | Small labels you put on a route or parameter | `public.decorator.ts` (`@Public()`), `roles.decorator.ts` (`@Roles('OWNER')`), `current-user.decorator.ts` (`@CurrentUser()`) |
| `src/common/middleware/` | Runs first on every request, before guards | `request-id.middleware.ts` |
| `src/common/utils/` | Plain helper functions, no Nest | `slug.util.ts`, `reading-time.util.ts`, `ip-hash.util.ts` |
| `src/i18n/` | The API speaks two content languages. Public routes take `?locale=en\|vi` and return one language; admin routes return both columns | `locale.decorator.ts` (`@Locale()`), `pick-locale.util.ts` (+ `.spec.ts`) |
| `src/modules/` | One folder per domain. A module groups the controller(s), service and DTOs for one thing | see "Module layout" |
| `test/` | Tests that start the whole app and call it over HTTP against a separate test database | `*.e2e-spec.ts`, `helpers/` (app factory, DB reset, login) |

## Module layout

```text
src/modules/[domain]/
├── [domain].module.ts                 # wires controller(s) + service; exports the service if others need it
├── public-[domain].controller.ts      # routes under /api/public/[domain]  (@Public, GET only)
├── admin-[domain].controller.ts       # routes under /api/admin/[domain]   (session + roles)
├── [domain].service.ts                # logic and Prisma calls
├── [domain].service.spec.ts           # unit tests for the service
├── dto/                               # shapes that cross HTTP
│   ├── create-[entity].dto.ts         # re-exports the zod schema + type from @portfolio/contracts
│   ├── update-[entity].dto.ts
│   └── [entity]-list-query.dto.ts
└── entities/
    ├── [entity].entity.ts             # the Prisma `include`/`select` we load + the row type it produces
    └── [entity].mapper.ts             # row → public DTO (one language) / admin DTO (both languages)
```

- **DTO** (data transfer object) is the JSON shape of a request or response. Our DTO files re-export the zod schemas from `@portfolio/contracts`, so the browser form and the API run the same validation.
- **Entity** is what a DB row looks like once loaded. Prisma generates the row types; `*.entity.ts` fixes which relations we always load, so the mapper and service agree.
- **Mapper** turns an entity into a DTO. This is where `phone` and `passwordHash` get dropped and where `titleVi` becomes `title`.
- A module owns its tables. Other modules call its exported service and never query its tables directly.

## Modules

| Module | Tables | Routes (all under `/api`) |
| --- | --- | --- |
| `health` | none | `GET /health` |
| `site-settings` | `SiteSettings` | admin `GET/PATCH /admin/site` |
| `profile` | `Profile` | admin `GET/PATCH /admin/profile` |
| `navigation` | `NavItem` | admin CRUD + order |
| `social-links` | `SocialLink` | admin CRUD + order |
| `page-sections` | `PageSection` | admin list/patch/order (keys are fixed by seed) |
| `public-site` | none (reads the six above + `profile-stats`) | `GET /public/site?locale` |
| `experience`, `education`, `principles`, `profile-stats`, `process-steps` | one table each | public GET + admin CRUD + order |
| `skills` | `SkillCategory`, `Skill` | `GET /public/skills`, admin CRUD + order |
| `domains` | `Domain` | `GET /public/domains`, admin CRUD + order |
| `projects` | `Project`, `ProjectMetric`, `ProjectImage` | public list/detail, admin CRUD + order + publish |
| `tags` | `Tag` | admin CRUD |
| `posts` | `Post` | public list/detail, admin CRUD + publish |
| `contact-topics` | `ContactTopic` | `GET /public/contact-topics`, admin CRUD + order |
| `contact` | `ContactMessage` | `POST /public/contact`, admin inbox list/patch |
| `auth` | `Session` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| `users` | `User` | admin users (owner only) |
| `media` | `Media` | admin upload/list/patch, public file `GET /public/media/:file` |
| `events` | none (in-memory stream) | `GET /admin/events` (SSE) |
| `publishing` | none (calls web `/api/revalidate`) | used by projects/posts services |
| `analytics` | `PageView` | `POST /public/views` |
| `audit` | `AuditLog` | `GET /admin/audit` (cursor) |
| `dashboard` | none (reads counts) | `GET /admin/stats?range`, `GET /admin/health` |

## Naming

Nest's own convention already matches the frontend rule (kebab-case + suffix):

- **Files**: `projects.module.ts`, `projects.service.ts`, `public-projects.controller.ts`, `create-project.dto.ts`, `project.entity.ts`, `project.mapper.ts`, `session.guard.ts`, `zod-validation.pipe.ts`, `all-exceptions.filter.ts`, `public.decorator.ts`
- **Classes**: PascalCase + role (`ProjectsService`, `PublicProjectsController`, `SessionGuard`)
- **Module folders**: kebab-case, plural for collections (`projects/`, `profile-stats/`), singular for singletons (`profile/`)
- **Prisma models**: PascalCase singular (`Project`), tables mapped to snake_case (`@@map("project")`), columns camelCase with `En`/`Vi` pairs (spec §1.5)
- **Migrations**: `pnpm prisma migrate dev --name add-project` (kebab-case verb + noun)
- **Tests**: unit `*.spec.ts` next to the file; integration `test/*.e2e-spec.ts`

## Rules

- Controllers have no logic: read params, call one service method, return.
- Only services touch Prisma. Multi-row writes use `prisma.$transaction(async (tx) => …)` and every query inside uses `tx`.
- Never return a Prisma row; always map it to a DTO.
- Never edit an applied migration; create a new one. Never use `prisma db push` once migrations exist.
- Never log request bodies, passwords, session ids or contact email addresses.
- Every route is protected by the global `SessionGuard` unless marked `@Public()`.

## New API module

```bash
cd apps/api && MODULE_NAME="your-module" && pnpm nest g module "modules/$MODULE_NAME" && pnpm nest g service "modules/$MODULE_NAME" && pnpm nest g controller "modules/$MODULE_NAME" && mkdir -p "src/modules/$MODULE_NAME"/{dto,entities}
```

Then rename the generated controller to `public-…` / `admin-…` as needed, add the zod schemas in `packages/contracts/src/[domain]/`, and add the module's requests to `api.http`.
