# Monorepo conventions

Build plan and task list: **[docs/PLAN.md](./docs/PLAN.md)** ([Tiếng Việt](./docs/PLAN.vi.md)). Design spec: [docs/design/portfolio-design-system.md](./docs/design/portfolio-design-system.md).

This file covers only where code lives across the workspace and how the parts depend on each other. Each app has its own file:

- Frontend (Next.js): **[apps/web/STRUCTURE.md](./apps/web/STRUCTURE.md)**
- Backend (NestJS + Prisma): **[apps/api/STRUCTURE.md](./apps/api/STRUCTURE.md)**

## Overview

```text
apps/
├── web/                  # Next.js App Router: public site (/en, /vi) + admin CMS (/admin)
└── api/                  # NestJS API (/api/*) + Prisma schema, migrations, seed
packages/
├── ui/                   # design system: tokens CSS, shadcn primitives, pure product components, stories
└── contracts/            # zod schemas + TS types shared by web and api, block registry, query keys, icon allowlist, fixtures
infra/                    # Docker/server config files (mysql init SQL, Caddyfile)
scripts/                  # repo scripts: content/privacy checks, backup restore
docs/                     # PLAN, design snapshot, sql-notes.sql, audit reports
docker-compose.yml        # dev: MySQL + Adminer (+ test DB under the `test` profile)
compose.prod.yml          # production: db, api, web, caddy, backup
```

Content (profile, projects, posts, settings, translations, and each page's blocks: their order, layout and props) lives in MySQL and is edited in `/admin`. It is never committed as code. Code only decides which block _types_ exist (PLAN D26). Seed data in `apps/api/prisma/seed/` holds placeholders only (`<email>`, `<phone>`).

## Dependency direction

```text
apps/web ──► packages/ui ──► packages/contracts (types only)
   │                              ▲
   └──────────────────────────────┤
apps/api ─────────────────────────┘
```

- `packages/contracts` depends on `zod` only. It never imports from an app or from `ui`.
- `packages/ui` imports types and constants from `contracts`, plus React, Radix/shadcn, TanStack Table/Virtual, dnd-kit for `SortableList` only (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`; MIT, PLAN D26) and, for `MarkdownEditor` only, Tiptap (free MIT packages only, PLAN D25). `pnpm check:deps` enforces both licences. It never imports `next/*`, `next-intl` or `next-themes`, and it never fetches.
- `apps/web` and `apps/api` never import each other. They only share `contracts`.

## Package layout: `packages/contracts`

```text
packages/contracts/src/
├── common/                   # locale, error body, list params, publish lint
│   ├── locale.schema.ts
│   ├── api-error.schema.ts
│   ├── list-params.schema.ts
│   ├── markdown-url.util.ts  # isAllowedMarkdownUrl, isAllowedImageSrc (public renderer + admin editor)
│   └── publish-lint.util.ts
├── blocks/                   # the block registry (PLAN D26): which block types exist and their props
│   ├── localized.schema.ts   # localizedText(), localizedMarkdown(), routeHref(), sectionHeadingSchema
│   ├── block-layout.constant.ts # LAYOUT_PRESETS (ONE … SPLIT_7_5, columns per breakpoint), BLOCK_SURFACES
│   ├── define-block.util.ts  # defineBlock({ type, version, props, defaults, pages, layouts, maxPerPage, role, migrate, refs })
│   ├── definitions/          # one file per block type: hero.block.ts, case-grid.block.ts, prose.block.ts, …
│   ├── block-registry.constant.ts # BLOCK_REGISTRY (type → definition), BlockType, blockTypeSchema
│   ├── block.schema.ts       # adminBlockSchema, publicBlockSchema, blockKeySchema
│   ├── block.type.ts
│   └── resolve-block.util.ts # parseBlock (migrate + validate, never throws), resolveBlockLocale (D19 per block)
├── pages/                    # Page DTOs, PageKey / LayoutPreset / BlockSurface enums, block write inputs
├── [domain]/                 # one folder per API domain, same names as apps/api/src/modules
│   ├── [domain].schema.ts    # zod: public DTO, admin DTO, create/update input
│   ├── [domain].type.ts      # z.infer<> types only
│   └── [domain].enum.ts      # zod enums mirrored from Prisma enums
├── constants/
│   ├── icons.constant.ts     # allowlisted lucide icon keys (spec §1.5 iconKey)
│   ├── markdown.constant.ts  # the Markdown allowlist: heading levels, callout kinds, code languages, link protocols
│   ├── routes.constant.ts    # real public routes the admin can pick for NavItem.href
│   └── query-keys.constant.ts# `qk` factory (spec §4.6)
├── fixtures/                 # *.fixture.ts, for stories and tests only, never for real content (incl. markdown-kitchen-sink, markdown-unsafe)
└── index.ts                  # public exports
```

## Package layout: `packages/ui`

```text
packages/ui/src/
├── styles/
│   ├── globals.css           # the spec §3.6–3.7 token block, verbatim; imports the two files below
│   ├── code-syntax.css       # --shiki-token-* aliases of palette tokens (public Shiki + editor highlighting)
│   └── editor.css            # ProseMirror/Tiptap surface + .hljs-* → --shiki-token-*, tokens only
├── components/
│   ├── ui/                   # shadcn primitives, generated by `shadcn add` (kebab-case files, owned by the CLI)
│   └── [ComponentName]/      # pure product components (PascalCase), e.g. BlockLayout (layout presets), SortableList (dnd-kit)
│       ├── [ComponentName].tsx
│       ├── [ComponentName].stories.tsx
│       ├── [ComponentName].test.tsx
│       ├── components/       # optional, complex components only: private parts (EditorToolbar, SlashMenu)
│       └── extensions/       # optional, MarkdownEditor only: Tiptap extensions (*.extension.ts, create-markdown-extensions.ts)
├── hooks/                    # use-*.hook.ts (e.g. use-in-view.hook.ts)
├── utils/                    # *.util.ts
└── lib/utils.ts              # `cn()`; path fixed by shadcn's components.json
```

A component goes in `packages/ui` when it takes props only, has no data fetching, and imports nothing from Next. Examples: `CaseCard`, `StatBand`, `Timeline`, `Prose`, `DataTable`, `SectionBoundary`, `BlockLayout`, `SortableList`. Chrome labels reach it as props (`labels={{ pause: t('marquee.pause') }}`), so the package stays free of i18n.

Imports: `@portfolio/ui/components/CaseCard`, `@portfolio/ui/components/ui/button`, `@portfolio/contracts`.

## Where does it go?

| Thing                                                                 | Location                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A token, color, font size                                             | `packages/ui/src/styles/globals.css` only                                                                                                                                                                                                                                                                                                                                       |
| A shadcn primitive                                                    | `packages/ui/src/components/ui/` via `pnpm --filter @portfolio/ui dlx shadcn@latest add …`                                                                                                                                                                                                                                                                                      |
| A reusable visual component (no fetching)                             | `packages/ui/src/components/[Name]/`                                                                                                                                                                                                                                                                                                                                            |
| A Tiptap extension for the admin editor                               | `packages/ui/src/components/MarkdownEditor/extensions/[name].extension.ts`, allowed only if the construct is in `markdown.constant.ts`                                                                                                                                                                                                                                          |
| A page, section container, or anything using Next/i18n/TanStack Query | `apps/web/src/modules/[module]/`                                                                                                                                                                                                                                                                                                                                                |
| A request/response shape or validation rule                           | `packages/contracts/src/[domain]/[domain].schema.ts`                                                                                                                                                                                                                                                                                                                            |
| A new block type (PLAN D26, ground rule 8)                            | one PR, three registries: `packages/contracts/src/blocks/definitions/[type].block.ts` + `block-registry.constant.ts`; the renderer `apps/web/src/modules/blocks/components/[Name]Block/` + `blocks/constants/block-renderers.constant.ts`; the admin entry in `apps/web/src/modules/admin-pages/constants/block-editor-meta.constant.ts` + `admin.blocks.*` labels in `en.json` |
| A layout preset or its responsive rule                                | `packages/contracts/src/blocks/block-layout.constant.ts` + `packages/ui/src/components/BlockLayout/` (both, same PR)                                                                                                                                                                                                                                                            |
| Which blocks a page shows, their order, layout and text               | the database (`Page`, `PageBlock`, `PageVersion`), edited in `/admin/pages`; never in code                                                                                                                                                                                                                                                                                      |
| A DB table or column                                                  | `apps/api/prisma/schema.prisma` + a new migration                                                                                                                                                                                                                                                                                                                               |
| Business logic or a DB query                                          | `apps/api/src/modules/[domain]/[domain].service.ts`                                                                                                                                                                                                                                                                                                                             |
| Who may call a route (`admin` / `user`)                               | `@Roles()` on the API controller (`apps/api/src/common/decorators/roles.decorator.ts`); the web only hides controls with `RoleGate`                                                                                                                                                                                                                                             |
| Auth tokens                                                           | httpOnly cookies set by the API; never stored or read by web code (`apps/api/STRUCTURE.md`, Auth)                                                                                                                                                                                                                                                                               |
| A fixed UI label ("Copy email", "min read")                           | `apps/web/i18n/locales/{en,vi}.json`                                                                                                                                                                                                                                                                                                                                            |
| Any visible content (names, headings, bios, SEO)                      | the database, edited in `/admin`                                                                                                                                                                                                                                                                                                                                                |

## Naming (whole repo)

- **React components / views**: PascalCase folder + file (`CaseCard/CaseCard.tsx`)
- **Everything else**: kebab-case + suffix (`use-in-view.hook.ts`, `project.schema.ts`, `projects.service.ts`, `case-grid.block.ts` for a block definition)
- **Folders**: kebab-case (`admin-projects/`, `profile-stats/`)
- **Exceptions, owned by tools**: shadcn files in `components/ui/`, Next route files (`page.tsx`, `layout.tsx`, `route.ts`), Prisma files (`schema.prisma`, `migrations/`)
- **Package scope**: `@portfolio/ui`, `@portfolio/contracts`, `@portfolio/web`, `@portfolio/api`

## Root commands

```bash
pnpm install                 # all workspaces (also installs git hooks via Husky)
pnpm dev                     # web :3000 + api :4000 in parallel (MySQL via docker compose)
pnpm lint | typecheck | test | build
pnpm format                  # Prettier --write across the repo (one root config)
pnpm format:check            # Prettier --check (also runs in CI)
pnpm check:content           # no CV strings in UI code, no email/phone anywhere
pnpm check:deps              # no paid Tiptap packages or private Tiptap registry; every @tiptap/* and @dnd-kit/* is MIT
docker compose up -d db adminer
```

## Git hooks (Husky)

These run automatically after `pnpm install`. There is one root Prettier + ESLint config; `apps/web`, `apps/api` and `packages/*` do not need their own.

- **pre-commit** (`git commit`) — [lint-staged](https://github.com/lint-staged/lint-staged) formats staged `ts`/`tsx`/`js`/`json`/`md`/`css`/`yml` with Prettier and runs `eslint --fix` on JS/TS.
- **commit-msg** (`git commit`) — [commitlint](https://commitlint.js.org) checks the message is a [conventional commit](https://www.conventionalcommits.org/) (`feat: …`, `chore: …`, `docs: …`, …), the same shape as our PR titles.
- **pre-push** (`git push`) — `pnpm typecheck` (optional safety net; CI still typechecks).

If a hook fails, git stops. Fix the files or the message and try again. To skip hooks in an emergency only: `HUSKY=0 git commit …` or `--no-verify`.
