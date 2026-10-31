<!-- Archived verbatim from docs/PLAN.vi.md (4. Kiến trúc tổng quan); links re-pointed. Index: ../../PLAN.vi.md -->

## 4. Kiến trúc tổng quan

```text
Browser ──► Next.js apps/web :3000 ──/api/* rewrite──► NestJS apps/api :4000 ──Prisma──► MySQL 8.4 :3306 (Docker)
               RSC + ISR (public)                         guards → pipe → controller → service
               TanStack Query (admin)                     → mapper → JSON
               app/api/revalidate, app/api/draft ◄──────── publishing module (secret header)
```

| Service | Dev | Port | Ghi chú |
| --- | --- | --- | --- |
| `web` | `pnpm dev` | 3000 | Public `/en/*`, `/vi/*`; admin `/admin/*` |
| `api` | `pnpm dev` | 4000 | Prefix `/api`, bind vào `127.0.0.1` |
| `db` | `docker compose up -d db` | 3306 (127.0.0.1) | MySQL 8.4, utf8mb4, named volume `db-data` |
| `adminer` | `docker compose up -d adminer` | 8080 (127.0.0.1) | Web UI để nhìn vào DB |
| `db-test` | `docker compose --profile test up -d db-test` | 3307 (127.0.0.1) | Từ T29, tmpfs, reset mỗi lần chạy test |

**Environment (`.env.example`, lớn dần theo từng task).** `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE=portfolio`, `MYSQL_USER=app`, `MYSQL_PASSWORD`, `DATABASE_URL`, `DATABASE_URL_TEST` (T29), `API_PORT=4000`, `API_HOST=127.0.0.1`, `WEB_ORIGIN=http://localhost:3000`, `API_URL=http://127.0.0.1:4000` (web → api), `WEB_INTERNAL_URL=http://127.0.0.1:3000` (api → web revalidate, T52), `REVALIDATE_SECRET` (T52), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (T35, mỗi cái 32+ ký tự random, khác nhau), `JWT_ACCESS_TTL_SECONDS=900`, `JWT_REFRESH_TTL_SECONDS=604800` (T35), `ADMIN_EMAIL="<email>"`, `ADMIN_NAME`, `ADMIN_PASSWORD` (T35), `ANALYTICS_SALT_SECRET` (T54), `UPLOAD_DIR=./uploads` (T50), `SEED_PROFILE=demo`, `NEXT_PUBLIC_BUILD_SHA` (hash deploy ở footer).

**Rendering (spec [§4.6](../../design/portfolio-design-system.vi.md#s-4-6)).** Public page là React Server Component gọi `apiServer()` kèm cache tag (`site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`). Khi publish, API gọi `POST /api/revalidate` trên web app, endpoint này chạy `revalidateTag`. Client island (search notes, contact form, pause marquee, ⌘K) là các file `'use client'` nhỏ. Admin prefetch trên server, hydrate bằng `HydrationBoundary`, và đọc bằng `useSuspenseQuery` với key từ `qk`.

**Page và block (D26).** Mỗi page trong năm route page là một `Page` với một list có thứ tự gồm các row `PageBlock`. `GET /api/public/pages/:key?locale` trả về `{ key, seo, blocks }`, mỗi block là `{ id, type, key, layout, surface, props, lang }` với text đã ở sẵn một ngôn ngữ (D19 theo từng block). Web tra `type` trong `blocks/constants/block-renderers.constant.ts` và render container của block đó; container tự fetch data của nó (project, post, skill) với cache tag riêng, bên trong `SectionBoundary` riêng. Block lưu setting và tham chiếu, không bao giờ lưu bản copy của content: một `case-grid` nói *những* project nào được hiện, còn project vẫn nằm trong table của nó.

```text
Page(home) ─┬─ PageBlock key=hero   type=hero       layout=SPLIT_7_5  props={ primaryCta, secondaryCta, showDiagram }
            ├─ PageBlock key=stats  type=stat-band  surface=BAND      props={ heading, variant: "default" }
            ├─ PageBlock key=work   type=case-grid  layout=THREE      props={ heading, source: "latest", limit: 3 }
            └─ PageBlock key=cta    type=cta-band                     props={ title, intro, showEmail, showSocial }
PageVersion(home, v3) = một JSON snapshot của các row đó; visitor đọc snapshot đã publish (T52a)
```

**Catalog block.** Được định nghĩa trong `packages/contracts/src/blocks/definitions/`, render bởi `apps/web/src/modules/blocks/`. Block "H1" đứng đầu, visible và không bao giờ bị xóa; block "required" không bao giờ bị xóa hay ẩn. `heading` là nhóm `SectionHeader` dùng chung (`eyebrow`, `title`, `intro`, `iconKey`, `link` optional). Mọi text prop là một cặp `{ en, vi }`.

| Type | Component của design system | Page | Layout (mặc định đứng đầu) | Props chính | Task |
| --- | --- | --- | --- | --- | --- |
| `hero` | `KickerPill`, `AccentHeadline`, `Atmosphere`, `MigrationDiagram`, `Button` | HOME (H1) | `SPLIT_7_5`, `ONE` | `primaryCta`, `secondaryCta` (label + route), `showDiagram`, `showAvailability`; headline và kicker lấy từ `Profile` | T10a, T14, T24 |
| `page-header` | `Eyebrow`, H1, intro | PROJECTS, NOTES (H1) | `ONE` | `eyebrow`, `title`, `intro` | T10a, T14 |
| `cta-band` | `CtaBand`, `CopyEmailButton` | mọi page, tối đa 1 | `ONE` | `title`, `intro`, `showEmail`, `showSocial` (`SocialLink.showInCta`) | T10a, T14 |
| `stat-band` | `StatBand` | HOME, ABOUT | `ONE` | `heading`, `variant` (`default` / `compact`), `statIds` (trống = tất cả) | T24 |
| `tech-marquee` | `TechMarquee` | HOME, ABOUT | `ONE` | `heading` | T24 |
| `featured-case` | `CaseCard` (`featured`) | HOME | `ONE` | `heading`, `projectId` (trống = project featured đầu tiên) | T24 |
| `domain-grid` | `DomainCard` | HOME, PROJECTS | `FOUR`, `TWO` | `heading` | T24 |
| `case-grid` | `CaseCard` | HOME, ABOUT | `THREE`, `TWO`, `ONE` | `heading`, `source` (`latest` / `featured` / `manual`), `projectIds`, `domainSlug`, `limit` 1–6 | T24 |
| `process` | `FeatureCard`, `ProcessFlow` | HOME, ABOUT | `TWO`, `SPLIT_7_5` | `heading`, `showPrinciples` | T24 |
| `skill-groups` | `SkillGroup` | HOME, ABOUT | `THREE`, `ONE` | `heading` | T24 |
| `post-list` | `PostCard` | HOME, ABOUT, PROJECTS, CONTACT | `ONE`, `TWO`, `THREE` | `heading`, `limit` 1–6, `tag` | T24 |
| `about-intro` | card avatar, bio `Markdown`, `Badge` availability | ABOUT (H1) | `SPLIT_4_8` | `eyebrow`, `showCity`, `showAvailability`; tên và bio lấy từ `Profile` | T25 |
| `timeline` | `Timeline` | ABOUT | `ONE` | `heading` | T25 |
| `principle-list` | `PrincipleList` | ABOUT, HOME | `TWO`, `ONE` | `heading` | T25 |
| `education-list` | list `card` | ABOUT | `ONE`, `TWO` | `heading` | T25 |
| `cv-download` | card CV | ABOUT, CONTACT | `ONE` | `heading`, `intro` | T25 |
| `prose` | `Markdown` → `Prose`, `Callout`, `CodeBlock` | mọi page | `ONE`, `SPLIT_8_4` | `heading`, `body`, `aside` (Markdown, D3) | T25 |
| `projects-browser` | `DomainFilter`, `TechFilter`, grid `CaseCard`, `pagination` | PROJECTS (required) | `TWO`, `THREE` | `showFeatured`, `pageSize` | T26 |
| `notes-browser` | `NotesSearch`, pill tag, các row `PostCard` | NOTES (required) | `ONE` | `showFeatured`, `pageSize` | T28 |
| `contact-form` | `ContactForm`, card kênh liên hệ | CONTACT (H1) | `TWO`, `ONE` | `eyebrow`, `title`, `intro` | T48 |

**Layout preset.** Một block chọn một trong các preset được phép của nó; không có grid tự do (D26, Q13). Preset nằm trên grid 4 / 8 / 12 cột của spec với gutter 16 / 24 / 32px (§4.4); breakpoint là `--breakpoint-md` (768px) và `--breakpoint-lg` (1024px).

| Preset | Dưới 768px | 768–1023px | Từ 1024px | Dùng cho |
| --- | --- | --- | --- | --- |
| `ONE` | 1 cột | 1 | 1 | list, prose ở 66ch, band |
| `TWO` | 1 | 2 | 2 | grid card; contact (thông tin, form) |
| `THREE` | 1 | 2 | 3 | grid case và skill (mockup `.work-grid`) |
| `FOUR` | 1 | 2 | 4 | grid domain (mockup `.domain-grid`) |
| `SPLIT_8_4`, `SPLIT_4_8` | xếp chồng | xếp chồng | 8 + 4 hoặc 4 + 8 trên 12 | main + aside (prose có aside, intro của About) |
| `SPLIT_7_5` | xếp chồng | xếp chồng | 7 + 5 trên 12 | text hero + diagram, process (mockup `.hero-grid`, `.featured-card`) |

Luật responsive cho mọi preset:
- Các cột render từ trái sang phải theo thứ tự DOM và xếp chồng theo đúng thứ tự đó. Không có CSS đổi thứ tự, nên thứ tự focus khớp với thứ bạn nhìn thấy.
- Một grid có ít item hơn số cột vẫn giữ nguyên độ rộng cột.
- Các block `BAND` liền nhau dùng chung một `Band`, nên hai band không bao giờ chạm nhau (spec §4.4).
- Atmosphere chỉ xuất hiện trên `hero` và `cta-band`.

**Luật của page.** API check các luật này ở mọi lần ghi và khi publish:
- mỗi page có đúng một block H1, luôn đứng đầu và visible;
- block required không bao giờ bị xóa hay ẩn;
- `maxPerPage` là 1 cho block H1, các browser và `cta-band`;
- một type chỉ được thêm vào các page có trong danh sách của nó;
- `key` của block là kebab-case và unique trên page của nó, và nó chính là anchor (`/#work`).

**Locale.** `en` (mặc định) và `vi`, URL có prefix (`/en/…`, `/vi/…`) qua next-intl. Public API call truyền `?locale=`; API chọn cột (D19). Admin có chrome tiếng Anh và edit cả hai cột cạnh nhau (`LocaleTabs`).

<a id="5-design-map"></a>

