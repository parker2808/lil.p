<!-- Archived verbatim from docs/PLAN.vi.md (6. Tổng quan task); links re-pointed. Index: ../../PLAN.vi.md -->

## 6. Tổng quan task

Path: **web** = `apps/web`, **api** = `apps/api`, **ui** = `packages/ui`, **ct** = `packages/contracts`.

| ID | Task | Roadmap | Phụ thuộc | Cỡ | Vị trí chính |
| --- | --- | --- | --- | --- | --- |
| **M0** | **Nền tảng** | | | | |
| T01 | Scaffold monorepo, toolchain, CI tối thiểu | p01 | không có | S | root |
| T01a | Prettier, Husky, lint-staged, commitlint | — (Parker, D27) | T01 | S | root |
| T02 | Docker Compose: MySQL 8.4 + Adminer | p02 | T01 | S | `docker-compose.yml`, `infra/mysql/` |
| T03 | Ghi chú SQL viết tay (Parker) | p03 | T02 | S | `docs/sql-notes.sql` |
| T04 | Design token + shadcn theme trong `packages/ui` | p04 | T01 | M | ui `styles/`, `lib/` |
| T05 | Shell Next.js: font, theme toggle, type specimen | p04 | T04 | M | web `app/`, `src/modules/core/` |
| T06 | Storybook + story Foundations | p04 | T04 | S | ui `.storybook/`, `src/stories/` |
| **M1** | **API đầu tiên** | | | | |
| T07 | App NestJS + health + config có validate | p05 | T01 | M | api `src/main.ts`, `config/`, `modules/health/` |
| T08 | Prisma: model layout site, migration đầu tiên, seed profile | p06 | T02, T07 | L | api `prisma/`, `src/prisma/` |
| T09 | Package contracts + `GET /api/public/site` | p07 | T08 | L | ct `src/`, api `modules/public-site/`, `i18n/` |
| T10 | Validation pipe, error filter, request id, logging | p08 | T09 | M | api `src/common/` |
| T10a | Contracts cho block registry + `GET /api/public/pages/:key` | p08 | T10 | M | ct `src/blocks/`, `src/pages/`, api `modules/pages/` |
| T11 | Data layer của web + next-intl + layout theo locale | p09 | T05, T09 | L | web `app/[locale]/`, `i18n/`, `core/services/` |
| T12 | UI primitive khớp với các component set trong Figma | p09 | T06 | M | ui `components/ui/`, `components/[Name]/` |
| T13 | Component trạng thái + atmosphere | p09 | T12 | M | ui `components/[Name]/`, `hooks/` |
| T14 | Site shell + hero/CTA của home từ API + content check | p09 | T10a, T11, T13 | L | web `core/`, `blocks/`, `scripts/check-content.mjs` |
| **M2** | **Đồ thị nội dung** | | | | |
| T15 | Model + endpoint cho nội dung About | p10 | T10 | M | api `modules/experience/` … |
| T16 | Domain + project + metric (one-to-many) | p10 | T15 | L | api `modules/domains/`, `modules/projects/` |
| T17 | Skill (many-to-many) + filter project | p11 | T16 | M | api `modules/skills/` |
| T18 | Post + tag (markdown, lint khi publish) | p12 | T17 | M | api `modules/posts/`, `modules/tags/` |
| T19 | Contract cho list query (page, sort, search) | p13 | T18 | M | ct `common/list-params.schema.ts`, api services |
| T20 | Card: DiffStat, CaseCard, DomainCard, PostCard | p14 | T13, T18 | M | ui `components/` |
| T21 | Section rich: StatBand, TechMarquee, ProcessFlow, PrincipleList, FeatureCard, SkillGroup | p14 | T13, T17 | M | ui `components/` |
| T22 | MigrationDiagram | p14 | T13, T17 | M | ui `components/MigrationDiagram/` |
| T23 | Markdown pipeline + Prose + CodeBlock + công cụ hỗ trợ đọc | p14 | T11, T12 | L | web `modules/content/`, ui `components/` |
| T24 | Home v2 hoàn chỉnh | p14 | T14, T19, T20, T21, T22 | L | web `modules/blocks/`, ct `blocks/definitions/` |
| T25 | Page About + Timeline | p14 | T23, T24 | L | web `modules/blocks/`, `about/`, ui `Timeline/` |
| T26 | List project | p14 | T14, T19, T20 | M | web `modules/projects/` |
| T27 | Case study của project | p14 | T23, T26 | L | web `modules/projects/` |
| T28 | List notes + post | p14 | T19, T20, T23 | L | web `modules/notes/` |
| **M3** | **Phía ghi** | | | | |
| T29 | Write API admin cho project + test DB | p15 | T19 | L | api `modules/projects/admin-*`, `test/` |
| T30 | Write API: post, experience, education, principle, stat, process | p15 | T29 | M | api `modules/*/admin-*` |
| T31 | Write API: skill, category, tag, domain | p15 | T29 | M | api `modules/*/admin-*` |
| T32 | Write API: site, profile, nav, social, contact topic | p15 | T29 | M | api `modules/*/admin-*` |
| T32a | Write API: page và block | p15 | T10a, T29 | L | api `modules/pages/`, ct `pages/` |
| T33 | Reorder trong transaction + thay tag | p16 | T31, T32, T32a | M | api services, `common/utils/` |
| T34 | Index + EXPLAIN | p17 | T33 | S | api `prisma/`, `docs/sql-notes.sql` |
| **M4** | **Auth + CMS admin** | | | | |
| T35 | User, argon2, cookie JWT access + refresh | p18 | T29 | L | api `modules/auth/`, `modules/users/` |
| T36 | JWT guard global, role (admin/user), check Origin, throttle | p19 | T35 | M | api `src/common/guards/` |
| T37 | Admin shell, login, ⌘K | p20 | T11, T12, T36 | L | web `modules/admin-core/`, `admin-auth/` |
| T38 | Admin dashboard v1 + endpoint stats | p20 | T37 | M | web `admin-dashboard/`, api `modules/dashboard/` |
| T39 | DataTable + list project trong admin | p21 | T37 | L | ui `DataTable/`, web `admin-projects/` |
| T40 | List trong admin: post, experience | p21 | T30, T39 | M | web `admin-posts/`, `admin-about/` |
| T41 | List trong admin: entity nhỏ + picker icon/hue | p21 | T31, T32, T39 | M | web `admin-taxonomy/`, `admin-about/` |
| T42 | Editor shell + Tiptap MarkdownEditor + autosave | p22 | T39 | L | web `admin-core/`, ui `MarkdownEditor/` |
| T43 | Editor project | p22 | T42 | L | web `admin-projects/` |
| T44 | Editor post + experience | p22 | T42 | M | web `admin-posts/`, `admin-about/` |
| T45 | Admin cho site settings + profile | p22 | T33, T42 | L | web `admin-site/` |
| T45a | Form props sinh từ schema (zod → TanStack Form) | p22 | T41, T42 | M | web `admin-core/components/SchemaForm/` |
| T45b | Page builder: block, drag and drop, layout | p22 | T33, T45a | L | web `admin-pages/`, ui `SortableList/` |
| T46 | Admin user (chỉ admin) + tự đổi password | p22 | T37 | M | web `admin-users/`, api `modules/users/` |
| **M5** | **Realtime, media, publish** | | | | |
| T47 | API contact + inbox | p23 | T36 | M | api `modules/contact/`, `contact-topics/` |
| T48 | Page Contact + Server Action | p23 | T14, T47 | M | web `modules/contact/` |
| T49 | SSE event + UI inbox + NotificationBell | p23 | T39, T47 | M | api `modules/events/`, web `admin-inbox/` |
| T50 | Media API: upload, variant, relation | p24 | T36 | L | api `modules/media/` |
| T51 | Media UI: library, uploader, picker | p24 | T42, T50 | M | web `admin-media/`, ui `MediaLibrary/` |
| T52 | Workflow publish + revalidate + draft preview | p25 | T27, T28, T43, T44 | L | api `modules/publishing/`, web `app/api/` |
| T52a | Publish page, version, live preview | p25 | T45b, T52 | L | api `modules/pages/`, web `admin-pages/`, `blocks/` |
| **M6** | **Chất lượng** | | | | |
| T53 | SEO từ CMS | p26 | T24, T25, T27, T28, T52a | M | web `modules/seo/`, `app/sitemap.ts` |
| T54 | Analytics + chart trên dashboard | p27 | T38, T49 | M | api `modules/analytics/`, web `admin-insights/` |
| T55 | Audit log | p27 | T36, T38 | M | api `modules/audit/`, web `admin-insights/` |
| T56 | Test + e2e trên CI | p28 | T52a | M | web `e2e/`, `.github/workflows/` |
| T57 | Audit accessibility + performance | p29 | T53 | M | `docs/audits/` |
| **M7** | **Ship** | | | | |
| T58 | Compose cho production | p30 | T56 | M | `compose.prod.yml`, `apps/*/Dockerfile` |
| T59 | Hardening + backup | p31 | T58 | M | `infra/caddy/`, `scripts/backup/` |
| T60 | Dọn seed production + check placeholder | p32 | T45, T51, T52a | S | api `prisma/seed/`, `scripts/` |
| T61 | Pipeline deploy + checklist launch | p33 | T58, T59, T60 | M | `.github/workflows/deploy.yml`, `docs/` |

Độ phủ roadmap: mọi bước p01–p33 đều map tới ít nhất một task. p04 được tách thành T04–T06, p08 thành T10–T10a, p09 thành T11–T14, p14 thành T20–T28, p15 thành T29–T32a, p21 thành T39–T41, p22 thành T42–T46 (cùng T45a, T45b) và p25 thành T52–T52a. T01a (Parker, D27) thêm hook format cho cả repo sau T01.

<a id="7-tasks"></a>

