<!-- Archived verbatim from docs/PLAN.md (6. Task overview); links re-pointed. Index: ../../PLAN.md -->

## 6. Task overview

Paths: **web** = `apps/web`, **api** = `apps/api`, **ui** = `packages/ui`, **ct** = `packages/contracts`.

| ID | Task | Roadmap | Depends | Size | Main location |
| --- | --- | --- | --- | --- | --- |
| **M0** | **Groundwork** | | | | |
| T01 | Monorepo scaffold, toolchain, minimal CI | p01 | none | S | root |
| T01a | Prettier, Husky, lint-staged, commitlint | — (Parker, D27) | T01 | S | root |
| T02 | Docker Compose: MySQL 8.4 + Adminer | p02 | T01 | S | `docker-compose.yml`, `infra/mysql/` |
| T03 | SQL by hand notes (Parker) | p03 | T02 | S | `docs/sql-notes.sql` |
| T04 | Design tokens + shadcn theme in `packages/ui` | p04 | T01 | M | ui `styles/`, `lib/` |
| T05 | Next.js shell: fonts, theme toggle, type specimen | p04 | T04 | M | web `app/`, `src/modules/core/` |
| T06 | Storybook + Foundations stories | p04 | T04 | S | ui `.storybook/`, `src/stories/` |
| **M1** | **First API** | | | | |
| T07 | NestJS app + health + validated config | p05 | T01 | M | api `src/main.ts`, `config/`, `modules/health/` |
| T08 | Prisma: site layout models, first migration, seed profiles | p06 | T02, T07 | L | api `prisma/`, `src/prisma/` |
| T09 | Contracts package + `GET /api/public/site` | p07 | T08 | L | ct `src/`, api `modules/public-site/`, `i18n/` |
| T10 | Validation pipe, error filter, request id, logging | p08 | T09 | M | api `src/common/` |
| T10a | Block registry contracts + `GET /api/public/pages/:key` | p08 | T10 | M | ct `src/blocks/`, `src/pages/`, api `modules/pages/` |
| T11 | Web data layer + next-intl + locale layout | p09 | T05, T09 | L | web `app/[locale]/`, `i18n/`, `core/services/` |
| T12 | UI primitives matching Figma component sets | p09 | T06 | M | ui `components/ui/`, `components/[Name]/` |
| T13 | States + atmosphere components | p09 | T12 | M | ui `components/[Name]/`, `hooks/` |
| T14 | Site shell + home hero/CTA from the API + content check | p09 | T10a, T11, T13 | L | web `core/`, `blocks/`, `scripts/check-content.mjs` |
| **M2** | **Content graph** | | | | |
| T15 | About content models + endpoints | p10 | T10 | M | api `modules/experience/` … |
| T16 | Domains + projects + metrics (one-to-many) | p10 | T15 | L | api `modules/domains/`, `modules/projects/` |
| T17 | Skills (many-to-many) + project filters | p11 | T16 | M | api `modules/skills/` |
| T18 | Posts + tags (markdown, publish lint) | p12 | T17 | M | api `modules/posts/`, `modules/tags/` |
| T19 | List query contract (page, sort, search) | p13 | T18 | M | ct `common/list-params.schema.ts`, api services |
| T20 | Cards: DiffStat, CaseCard, DomainCard, PostCard | p14 | T13, T18 | M | ui `components/` |
| T21 | Rich sections: StatBand, TechMarquee, ProcessFlow, PrincipleList, FeatureCard, SkillGroup | p14 | T13, T17 | M | ui `components/` |
| T22 | MigrationDiagram | p14 | T13, T17 | M | ui `components/MigrationDiagram/` |
| T23 | Markdown pipeline + Prose + CodeBlock + reading aids | p14 | T11, T12 | L | web `modules/content/`, ui `components/` |
| T24 | Home v2 complete | p14 | T14, T19, T20, T21, T22 | L | web `modules/blocks/`, ct `blocks/definitions/` |
| T25 | About page + Timeline | p14 | T23, T24 | L | web `modules/blocks/`, `about/`, ui `Timeline/` |
| T26 | Projects list | p14 | T14, T19, T20 | M | web `modules/projects/` |
| T27 | Project case study | p14 | T23, T26 | L | web `modules/projects/` |
| T28 | Notes list + post | p14 | T19, T20, T23 | L | web `modules/notes/` |
| **M3** | **Write side** | | | | |
| T29 | Admin write API on projects + test DB | p15 | T19 | L | api `modules/projects/admin-*`, `test/` |
| T30 | Write API: posts, experience, education, principles, stats, process | p15 | T29 | M | api `modules/*/admin-*` |
| T31 | Write API: skills, categories, tags, domains | p15 | T29 | M | api `modules/*/admin-*` |
| T32 | Write API: site, profile, nav, social, contact topics | p15 | T29 | M | api `modules/*/admin-*` |
| T32a | Write API: pages and blocks | p15 | T10a, T29 | L | api `modules/pages/`, ct `pages/` |
| T33 | Transactional reorder + tag replace | p16 | T31, T32, T32a | M | api services, `common/utils/` |
| T34 | Indexes + EXPLAIN | p17 | T33 | S | api `prisma/`, `docs/sql-notes.sql` |
| **M4** | **Auth + admin CMS** | | | | |
| T35 | Users, argon2, JWT access + refresh cookies | p18 | T29 | L | api `modules/auth/`, `modules/users/` |
| T36 | Global JWT guard, roles (admin/user), Origin check, throttle | p19 | T35 | M | api `src/common/guards/` |
| T37 | Admin shell, login, ⌘K | p20 | T11, T12, T36 | L | web `modules/admin-core/`, `admin-auth/` |
| T38 | Admin dashboard v1 + stats endpoint | p20 | T37 | M | web `admin-dashboard/`, api `modules/dashboard/` |
| T39 | DataTable + admin projects list | p21 | T37 | L | ui `DataTable/`, web `admin-projects/` |
| T40 | Admin lists: posts, experience | p21 | T30, T39 | M | web `admin-posts/`, `admin-about/` |
| T41 | Admin lists: small entities + icon/hue pickers | p21 | T31, T32, T39 | M | web `admin-taxonomy/`, `admin-about/` |
| T42 | Editor shell + Tiptap MarkdownEditor + autosave | p22 | T39 | L | web `admin-core/`, ui `MarkdownEditor/` |
| T43 | Project editor | p22 | T42 | L | web `admin-projects/` |
| T44 | Post + experience editors | p22 | T42 | M | web `admin-posts/`, `admin-about/` |
| T45 | Site settings + profile admin | p22 | T33, T42 | L | web `admin-site/` |
| T45a | Schema-driven props form (zod → TanStack Form) | p22 | T41, T42 | M | web `admin-core/components/SchemaForm/` |
| T45b | Page builder: blocks, drag and drop, layouts | p22 | T33, T45a | L | web `admin-pages/`, ui `SortableList/` |
| T46 | Users admin (admin only) + change own password | p22 | T37 | M | web `admin-users/`, api `modules/users/` |
| **M5** | **Realtime, media, publishing** | | | | |
| T47 | Contact + inbox API | p23 | T36 | M | api `modules/contact/`, `contact-topics/` |
| T48 | Contact page + Server Action | p23 | T14, T47 | M | web `modules/contact/` |
| T49 | SSE events + inbox UI + NotificationBell | p23 | T39, T47 | M | api `modules/events/`, web `admin-inbox/` |
| T50 | Media API: upload, variants, relations | p24 | T36 | L | api `modules/media/` |
| T51 | Media UI: library, uploader, pickers | p24 | T42, T50 | M | web `admin-media/`, ui `MediaLibrary/` |
| T52 | Publish workflow + revalidate + draft preview | p25 | T27, T28, T43, T44 | L | api `modules/publishing/`, web `app/api/` |
| T52a | Page publish, versions, live preview | p25 | T45b, T52 | L | api `modules/pages/`, web `admin-pages/`, `blocks/` |
| **M6** | **Quality** | | | | |
| T53 | SEO from the CMS | p26 | T24, T25, T27, T28, T52a | M | web `modules/seo/`, `app/sitemap.ts` |
| T54 | Analytics + dashboard charts | p27 | T38, T49 | M | api `modules/analytics/`, web `admin-insights/` |
| T55 | Audit log | p27 | T36, T38 | M | api `modules/audit/`, web `admin-insights/` |
| T56 | Tests + CI e2e | p28 | T52a | M | web `e2e/`, `.github/workflows/` |
| T57 | Accessibility + performance audit | p29 | T53 | M | `docs/audits/` |
| **M7** | **Ship** | | | | |
| T58 | Production Compose | p30 | T56 | M | `compose.prod.yml`, `apps/*/Dockerfile` |
| T59 | Hardening + backups | p31 | T58 | M | `infra/caddy/`, `scripts/backup/` |
| T60 | Production seed cleanup + placeholder check | p32 | T45, T51, T52a | S | api `prisma/seed/`, `scripts/` |
| T61 | Deploy pipeline + launch checklist | p33 | T58, T59, T60 | M | `.github/workflows/deploy.yml`, `docs/` |

Roadmap coverage: every step p01–p33 maps to at least one task. p04 is split into T04–T06, p08 into T10–T10a, p09 into T11–T14, p14 into T20–T28, p15 into T29–T32a, p21 into T39–T41, p22 into T42–T46 (with T45a, T45b) and p25 into T52–T52a. T01a (Parker, D27) adds repo-wide format hooks after T01.

