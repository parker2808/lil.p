<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (6. Map ngày Lab (high level)); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-6">6. Map ngày Lab (high level)</h2>

> **Trong chương này:** "Drill" Lab mỗi ngày build một slice, khớp topic ngày đó trong `plans/study-plan-30d-redesign.md` section 3.


"Drill" Lab mỗi ngày build một slice, khớp topic ngày đó trong `plans/study-plan-30d-redesign.md` section 3. Repo: monorepo `portfolio/` (`apps/web` Next.js, `apps/api` NestJS + Prisma, `packages/ui` shadcn + product component, `packages/contracts` zod schema, type, query key, fixture; `docker-compose.yml`).

Hai track khớp nhau thế nào:
- **Backend leo thang ở section 1.6, từng bậc, từ Docker lên.** Không ngày backend nào giả định concept mà ngày sau mới dạy. Mỗi bước backend nêu đúng một concept nó dạy.
- **Frontend Day 1–6 build component trên fixture** (chỉ story/test). Từ Day 7 mọi page đọc từ API; không page nào ship content hard-code.
- Admin endpoint mở trên `localhost` thôi đến Day 16 mới gắn guard (API bind `127.0.0.1` lúc dev cho đến lúc đó).
- Cột "Xong khi" thành Output của callout `intro` trong lab.

| Ngày | Topic trong plan | Frontend slice | Backend / DB step (concept) | Xong khi |
| --- | --- | --- | --- | --- |
| 1 | Inventory hệ thống UI | Monorepo; shadcn init trong `packages/ui`; theme CSS (3.6–3.7); font; page type specimen | **Docker:** `docker compose up` MySQL 8 + Adminer; `.env`, volume, port (rung 1) | Specimen render light/dark với QA string vi; Adminer login được |
| 2 | UI state | Story `skeleton`, `empty`, `alert`, `SectionBoundary`, `StatusPill` | **SQL by hand** trong Adminer: `CREATE TABLE`, `INSERT`, `SELECT`, `JOIN`, primary/foreign key; rồi drop (rung 2) | State story + `day-02.sql` |
| 3 | Form accessible + bàn phím | Contact form: TanStack Form + shadcn `field`, error inline + summary, skip link (fixture topic) | **Nest basics:** `nest new`, module/controller/service, `GET /health` (rung 3) | Check a11y của form pass; `curl /health` → `ok` |
| 4 | UI data-heavy responsive | `DataTable` (TanStack Table + `table`), list row mobile, sticky header (fixture) | **Prisma:** `SiteSettings`, `Profile`, `NavItem`, `SocialLink`, `PageSection`; migration đầu; đọc SQL; seed (rung 4) | Table ở 360/1280px; row đã seed thấy trong Prisma Studio |
| 5 | Overlay, focus, test | Palette `dialog`, `alert-dialog`, `command`, `sonner`; Vitest + Testing Library | **Read API:** `PrismaService`, `GET /public/site?locale` (server chọn language), global exception filter với `requestId` (rung 5) | Test palette xanh; `/public/site` trả JSON đã localize |
| 6 | Component API với TS | `ProjectCard`, `VersionTag`, `DiffStat`, badge variant, typed từ `packages/contracts` | **Validation:** zod schema trong contracts + `ZodValidationPipe`; `PATCH /admin/profile` (rung 5) | PATCH invalid → `400` với `fieldErrors` |
| 7 | Review tuần 1 | Home từ `/public/site` trong RSC: section registry, thứ tự, ẩn section empty, `error.tsx` | **Review:** vẽ ERD từ 1.5; giải thích migration vs seed thành tiếng | Home chỉ render content từ DB; toggle `isVisible` trong Adminer ẩn một section |
| 8 | JS execution model | Post TOC scroll-spy (`IntersectionObserver`), search input debounce (fixture) | **Relations 1-to-many:** `Experience`, `Education`, `Principle`, `SkillCategory` → `Skill`; seed từ CV (rung 6) | Timeline seed data khớp CV |
| 9 | Promises, cancellation | `apiClient` + `ApiError`, TanStack Query provider, factory `qk`, `signal` truyền vào fetch | **Many-to-many:** `Project`, `ProjectMetric`, `ProjectImage`, `Project↔Skill`; `include` vs `select` (rung 6) | Request bị abort thấy trong DevTools; 4 project đã seed |
| 10 | TS cho frontend model | Type response public vs admin; chrome message `next-intl` en/vi | **Posts + tags**; public list endpoint chỉ trả `PUBLISHED`, đã localize (rung 5–6) | `GET /public/posts?locale=vi` fallback sang EN với `lang` |
| 11 | Vue reactivity → hooks | `useDebouncedValue`, `useMediaQuery` vs composable; list admin projects trên API thật (`useSuspenseQuery`) | **Write API pattern** trên projects: create, update, archive; `404`; slug unique → `409` (rung 7) | Create/edit/archive một project từ admin |
| 12 | Nuxt rendering + fetching | Rendering matrix (4.6) vs Nuxt; list projects + case study trong RSC với tag | **Query params:** pagination, sort, filter parse bằng zod (rung 5) | `rendering.md`; `/projects?skill=nuxt` chạy được |
| 13 | State ownership, cache | List state chạy theo URL; toggle status và reorder optimistic | **CRUD còn lại** (posts, experience, skills, nav, sections, social, topics); reorder trong **transaction** (rung 7) | Toggle rollback khi ép `500` |
| 14 | Review tuần 2: performance | Lighthouse budget, `next/image`, font loading, bundle check | **Indexes + `EXPLAIN`**, Prisma query log, sửa một N+1 (rung 8) | Budget report; một query plan trước/sau |
| 15 | React mental model | About + `Timeline` dạng RSC, island `accordion` | **Users + passwords:** model `User`, `argon2`, seed owner từ env, `POST /auth/login` tạo row `Session` + cookie (rung 9) | Login set cookie httpOnly |
| 16 | State, refs, controlled inputs | `MarkdownEditor` (CodeMirror) + TanStack Form autosave + `SaveStatus`; login page | **Guards:** `AuthGuard`, `@Roles` + `RolesGuard`, `GET /auth/me`, logout; admin route giờ được protect; `409` khi `updatedAt` stale (rung 9) | Viewer không publish được (`403`); autosave sống sót qua refresh |
| 17 | Effects, cleanup, boundaries | `EventSource` trong admin layout → toast + invalidate inbox; cleanup lúc unmount; `error.tsx` từng segment | **Contact + SSE:** `POST /public/contact`, `@nestjs/throttler`, event stream `@Sse()` (rung 10) | Message gửi từ public page hiện live trong admin |
| 18 | App Router layouts | Segment `[locale]`, layout `(site)` và `admin`, check session phía server, `loading.tsx`; UI media library với progress + cancel | **Uploads:** `FileInterceptor`, limit size/MIME, row `Media`, file trên volume (rung 10) | Upload + cancel chạy được; locale switch trên mọi page |
| 19 | Next data fetching + cache | Case study + post với `generateStaticParams`; route `POST /api/revalidate`; admin prefetch `HydrationBoundary` | **Publish workflow:** publish set `publishedAt`, API gọi revalidate webhook (rung 10) | Publish cập nhật public page trong vài giây |
| 20 | Server Actions, middleware, SEO | Contact qua mutation Server Action (chạy khi tắt JS); `generateMetadata` từ SEO field; OG image; sitemap; RSS | **SEO data:** endpoint sitemap/slug, default `SiteSettings` (rung 10) | OG preview hiện title từ DB; form chạy khi tắt JS |
| 21 | Review tuần 3: Next slice | Playwright e2e: draft → publish → public page | **Ops:** đủ 3 service trong Compose, health check, `prisma migrate deploy` (rung 11) | `docker compose up` chạy cả site; e2e xanh |
| 22 | Design một admin dashboard | Dashboard card, `chart`, period `toggle-group`, content health | **Analytics:** endpoint beacon `PageView`, aggregate `GROUP BY` theo ngày (rung 10) | Dashboard hiện views thật |
| 23 | Surface data-heavy | Audit log với `useInfiniteQuery` + TanStack Virtual; thanh bulk action | **Audit log** do service ghi; cursor pagination; bulk update trong transaction (rung 10) | 5,000 audit row đã seed scroll mượt |
| 24 | Security, release, resilience | CSP + security header, flag cookie secure lúc prod; CI (lint, test, e2e) | **Hardening:** check `Origin`, session expiry, backup `mysqldump` + test restore (rung 11) | Restore từ backup chạy được; CI xanh |
| 25 | Behavioral: intro, impact | Không code: viết hero, about, profile trong admin dùng 1.1–1.2; nhập metric thật | n/a | Content lưu trong CMS (EN) |
| 26 | Behavioral: project, React gap | Viết case study Particula + "This portfolio" trong editor | n/a | 2 case study đã publish |
| 27 | Leadership + collaboration | Viết case study Samsung SDS (an toàn NDA) + cart-migration; note đầu "Vue → React" | n/a | 2 case study + 1 post đã publish |
| 28 | Mock round 1 | Audit a11y (axe, bàn phím, screen reader trên 3 page); list fix | n/a | Audit report, fix đã merge |
| 29 | Weak spots + company fit | Bản dịch vi nhập trong CMS; page 404/500; launch checklist | n/a | Lighthouse ≥ 95 trên 4 page chính; không còn badge "EN" trên page chính |
| 30 | Full mock + retro | Deploy production; retro post publish qua CMS; walkthrough demo interview | Deploy runbook | Live site + retro note |

Ghi chú cho agent thực thi:
- Ngày review và mock (7, 14, 21, 28, 30) giữ Drill theo agenda có giờ; bước build là một item có giờ trong đó.
- Budget tab Lab (210 words) nghĩa là mỗi Drill chỉ nêu slice và done-check. Spec nằm ở đây; link section, ví dụ "Spec: portfolio-design-system §5.4".
- Bước backend nên link glossary (1.6) lần đầu một term xuất hiện.
- Day 25–27 tái dùng content behavioral: các story Parker rehearsal chính là case study anh ấy publish.

**Phần việc rich-layer v2, gấp vào các ngày sẵn có** (không thêm ngày mới; mỗi item là một step thêm trong Drill ngày đó):

| Ngày | Frontend step thêm | Backend / DB step thêm | Xong khi |
| --- | --- | --- | --- |
| 1 | Token v2: tinted dark, `--band`, `--border-strong`, atmosphere token, domain hue, `text-display`, `text-eyebrow` trên specimen page | n/a | Specimen hiện band, hue pill và eyebrow ở light và dark, tất cả AA |
| 2 | Story `Atmosphere`, `Band`, `Eyebrow`, `SectionHeader`; hook `useInView` + utility reveal với fallback reduced-motion | n/a | Story toggle reduced motion và reduced transparency; không gì chuyển động |
| 6 | `CaseCard` (hover lift, domain pill, `DiffStat`), `DomainCard`, `StatBand`, `KeyFacts`, `FactChips`, `PostCard` | n/a | Card pass parity hover bàn phím (focus-within trông như hover) |
| 7 | Thứ tự section Home v2 từ registry: stats, marquee, domains, process, CTA band | Seed key `PageSection` mới | Ẩn `marquee` trong Adminer thì nó biến mất |
| 8 | `ProcessFlow`, `PrincipleList`, `TechMarquee` (nút pause) | Table `ProfileStat`, `ProcessStep`; `Principle.iconKey`, `Skill.showInMarquee` (ôn 1-to-many) | Stats band hiện số năm computed từ `careerStartDate` |
| 9 | SVG `MigrationDiagram` từ data project featured | Table `Domain` + FK `Project.domainId`; column `keyFacts`, `factChips`; seed 4 domain | `GET /public/domains` trả project count qua `_count` |
| 10 | n/a | `Post.takeaways`; publish validation cho `{{`, `TODO`, `lorem` | Publish post có `TODO` → `400` với `fieldErrors` |
| 13 | List admin Stats/Domains/Process; icon + hue picker | CRUD cho 3 table mới | Reorder domain; thứ tự home cập nhật sau revalidate |
| 14 | Budget motion và paint: hero LCP ≤ 2.0s, orb trên composited layer, CLS 0 từ count-up và reveal | n/a | Lighthouse perf ≥ 95 khi bật ambient effects |
| 28 | Audit reduced-motion và reduced-transparency trên home, case study, post | n/a | Audit note cho thấy fallback của mọi effect đều chạy |

---

 
