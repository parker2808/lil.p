<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T14 · Site shell + hero/CTA của home từ API + kiểm tra content); links re-pointed. Index: ../../PLAN.vi.md -->

#### T14 · Site shell + hero/CTA của home từ API + kiểm tra content

**Roadmap** p09 · **Spec** [§4.2](../../design/portfolio-design-system.vi.md#s-4-2), §4.5, [§5.1](../../design/portfolio-design-system.vi.md#s-5-1), §7.1 · **Phụ thuộc** T11, T13 · **Cỡ** L

**Mục tiêu.** Public layout thật (header, footer, skip link, switch locale và theme, mobile menu, ⌘K) lấy từ `GET /public/site`, block renderer, và các block đầu tiên của home (hero, CTA band) lấy từ `GET /public/pages/home`, cộng một script giữ content và dữ liệu cá nhân nằm ngoài code.

**Phạm vi.**
- Component `core`: `SiteShell`, `SiteHeader` (sticky, `--background` 80% + blur, `--shadow-1` sau khi scroll; header `NavItem` qua `NavLink`; button ⌘K; `LocaleSwitch`; `ThemeToggle`; `Sheet` cho mobile), `SiteFooter` (một dòng mono: tên, footer nav, social icon, `NEXT_PUBLIC_BUILD_SHA`), `SkipLink`, `LocaleSwitch` (`toggle-group` VI/EN, link tới cùng path ở locale còn lại, `hreflang`), `CommandPalette` public (nav, theme, locale; search post thêm ở T28), `CopyEmailButton` (copy `settings.contactEmail`, toast `sonner`), `LocaleSuggestBanner` (mặc định theo Q5). shadcn: `sheet`, `navigation-menu`, `toggle-group`, `command`, `dialog`, `sonner`.
- Route: `app/[locale]/(site)/layout.tsx` → `SiteShell`; `app/[locale]/error.tsx` (page chrome-only, Retry, request id; không hard-code tên), `app/[locale]/(site)/error.tsx`, `app/[locale]/(site)/not-found.tsx`.
- Module `blocks` (D26):
  - `services/pages.service.ts`: `getPage(key, locale)`, tag `page:{key}`, bọc trong React `cache()`; `qk.public.page(key, locale)` trong contracts.
  - `components/BlockRenderer/BlockRenderer.tsx` (server). Nó:
    - bỏ qua block có `type` không có renderer;
    - đặt các block `BAND` liền nhau vào cùng một `Band`;
    - bọc mỗi block trong `BlockLayout` và trong `SectionBoundary` với skeleton của renderer đó;
    - set `id={block.key}` cho anchor;
    - truyền cho mỗi block một `BlockContext` (`{ locale, searchParams, draft }`).
  - `constants/block-renderers.constant.ts`: registry phía web, `type` → `{ component, skeleton }`, `satisfies Record<BlockType, BlockRendererEntry>` (quy tắc 8).
  - `views/BlocksPage.tsx`: fetch page, rồi `BlockRenderer`. `home/views/HomeIndex.tsx` render `BlocksPage` cho `home`.
- `BlockLayout` trong `packages/ui`: các preset của T10a dưới dạng class CSS grid với luật responsive ở §4. Các vùng được truyền vào dưới dạng children, và section được `aria-labelledby` heading của nó.
- Renderer cho ba type của T10a (các block sau không render gì cho tới task của chúng):
  - `HeroBlock`: `Atmosphere variant="hero"` (nếu `ambientEffects`), `KickerPill` (`heroKicker`), `AccentHeadline` ở `text-display`, sub-line ở `text-prose`, badge availability (nếu `showAvailability`), và hai button từ `props.primaryCta` và `props.secondaryCta` (label → route). Layout `ONE` cho tới khi có diagram (T22, T24).
  - `CtaBandBlock`: `CtaBand` với title và intro của block, `CopyEmailButton` (chrome label "Copy email") khi `showEmail`, và tối đa 2 button outline từ `SocialLink.showInCta` khi `showSocial`. Ẩn nếu block không có title.
  - `PageHeaderBlock`: eyebrow, H1 ở `text-title`, intro (PROJECTS và NOTES dùng nó từ T26 và T28).
- `scripts/check-content.mjs` + root script `check:content` + bước CI: (1) fail khi gặp địa chỉ email và số điện thoại đầy đủ (8+ chữ số, có hoặc không có prefix `+84`) ở bất kỳ file nào được track, trừ placeholder `<email>` / `<phone>`; (2) fail khi gặp chuỗi từ CV (denylist build từ seed data: tên, công ty, thành phố) trong `apps/web/**` và `packages/ui/src/components/**`, loại trừ `*.stories.tsx`, `*.test.tsx` và `packages/contracts/src/fixtures/`.

**Ngoài phạm vi.** Các block type khác (T24, T25, T26, T28, T48). Admin (T37).

**File.** `apps/web/app/[locale]/(site)/{layout.tsx,error.tsx,not-found.tsx}`, `apps/web/app/[locale]/error.tsx`, `apps/web/src/modules/core/components/{SiteShell,SiteHeader,SiteFooter,SkipLink,LocaleSwitch,CommandPalette,CopyEmailButton,LocaleSuggestBanner}/*`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `apps/web/src/modules/blocks/{components/{BlockRenderer,HeroBlock,CtaBandBlock,PageHeaderBlock}/*,constants/block-renderers.constant.ts,services/pages.service.ts,types/entities/block-context.type.ts,views/BlocksPage.tsx}`, `packages/ui/src/components/BlockLayout/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/{en,vi}.json`, `packages/ui/src/components/ui/{sheet,navigation-menu,toggle-group,command,dialog,sonner}.tsx`, `scripts/check-content.mjs`, `package.json`, `.github/workflows/ci.yml`.

**Thiết kế.** Figma `2:2`/`3:2` (header, hero, CTA band, footer), `8:2` (mobile header có hamburger, CTA xếp chồng). Mockup `home.html` (+ `?dark=1`, và ở 390px). Token: `text-display`, `text-prose`, `--primary`, `--primary-subtle`, `--glow`, `--grid-line`, `--band`, `--shadow-1`, `--z-header`, `--z-skip`.

**Tiêu chí nghiệm thu.**
- [ ] Đổi một giá trị seed rồi seed lại sẽ làm home page thay đổi (roadmap p09).
- [ ] Khi API dừng, `/en` hiện page lỗi chrome-only có Retry, không crash hay trang trắng (roadmap p09).
- [ ] Set `isVisible = 0` cho block `cta` của home trong Adminer sẽ làm CTA band biến mất; đổi `sortOrder` của nó thì nó đổi chỗ.
- [ ] Test `BlockRenderer`: một type không có renderer không render gì, và một renderer throw lỗi chỉ hiện lỗi inline cho đúng block đó.
- [ ] Locale switch giữ nguyên path hiện tại; bấm Tab từ đầu trang sẽ focus vào skip link trước tiên; mobile sheet giữ focus bên trong (focus trap) và `Esc` đóng nó.
- [ ] `pnpm check:content` fail với một chuỗi có dạng email được cài vào một file tạm (output dán trong PR) và pass trên tree sạch.
- [ ] Screenshot ở 1440/390, light/dark, so với hero và footer của `home.html`.

**Tiêu đề PR:** `feat(web): home from api + states`

### M2 — Đồ thị nội dung

#### T15 · Model nội dung About + endpoint

**Roadmap** p10 (phần 1) · **Spec** §1.5 (nhóm About + bổ sung v2), §5.0 (row About, stats band) · **Phụ thuộc** T10 · **Cỡ** M

**Mục tiêu.** Các table đứng sau trang About và các section stats/process trên home, có public endpoint để đọc và stat được compute nên không bao giờ cũ.

**Phạm vi.**
- Model: `Experience` (mọi field trong §1.5; relation `skills` được thêm ở T17), `Education`, `Principle` (có `iconKey`), `ProfileStat` (`source`: `MANUAL` | `YEARS_COMPUTED` | `PROJECT_COUNT`), `ProcessStep`. Enum `EmploymentType`, `StatSource`. Migration `add-about-content`.
- Contracts: `experience/`, `education/`, `principles/`, `profile-stats/`, `process-steps/` (public DTO; `iconKey` dùng `iconKeySchema`).
- Module (public controller + service + entity/mapper): `experience` (`GET /public/experience`), `education` (`GET /public/education`), `principles` (`GET /public/principles`), `process-steps` (`GET /public/process-steps`), `profile-stats` (không có public route; service của nó resolve giá trị). Chỉ trả row đang hiện, sắp theo `sortOrder` (experience sắp theo `startDate desc` rồi `sortOrder`).
- `GET /public/site` có thêm `profileStats` với giá trị đã resolve: `YEARS_COMPUTED` = số năm tròn tính từ `Profile.careerStartDate`; `PROJECT_COUNT` = số project đã publish (trả 0 cho tới khi T16 thêm project); `MANUAL` = `value`.
- Seed data (`prisma/seed/data/about.data.ts`): 4 row experience (nhóm theo công ty như trong wireframe, có một công ty chiếm 2 row), 1 row education, 3 principle, 4 profile stat, 5 process step. Chỉ dùng placeholder.

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_about_content/`, `apps/api/prisma/seed/data/about.data.ts`, `apps/api/src/modules/{experience,education,principles,profile-stats,process-steps}/*`, `apps/api/src/modules/public-site/public-site.service.ts`, `packages/contracts/src/{experience,education,principles,profile-stats,process-steps}/*`, `apps/api/api.http`.

**Thiết kế.** Spec §5.2 (About), wireframe stats và process ở §5.1.

**Các bước backend, giải thích.**
1. **Thêm table về sau.** Sửa `schema.prisma`, chạy `migrate dev --name add-about-content`, rồi đọc file SQL mới. Migration cũ giữ nguyên; migration là một lịch sử, được apply theo thứ tự.
2. **Giá trị compute.** "Years of experience" không được lưu. Service compute nó từ `careerStartDate` ở mỗi request, nên lúc nào cũng đúng. Số project cũng vậy.
3. **Thứ tự và hiển thị.** List nào cũng có `sortOrder` và `isVisible`. Public query luôn filter `isVisible: true` và `orderBy: { sortOrder: 'asc' }`.
4. **Một module cho mỗi table.** Năm module nhỏ có cùng shape. Dùng lệnh scaffold trong [api STRUCTURE](../../../apps/api/STRUCTURE.md#new-api-module).

**Tiêu chí nghiệm thu.**
- [ ] Mỗi endpoint trả các row đã seed, đã localize, đúng thứ tự; row bị ẩn không có trong kết quả.
- [ ] `profileStats` hiện số năm compute từ `careerStartDate`; đổi date trong Adminer thì giá trị đổi theo (check v2 Day 8 trong spec §6).
- [ ] Có unit test cho stat resolver.

**Tiêu đề PR:** `feat(api): about content models`

#### T16 · Domain + project + metric (one-to-many)

**Roadmap** p10 · **Spec** §1.5 (nhóm Work + v2), §5.0 (row projects, domains), §5.3, §5.4 · **Phụ thuộc** T15 · **Cỡ** L

**Mục tiêu.** Project cùng metric, domain và link experience (optional), đọc được qua public endpoint list/detail, kèm số project của mỗi domain.

**Phạm vi.**
- Model: `Domain` (enum `hue` `JADE|AMBER|BLUE|VIOLET|ROSE`, `iconKey`), `Project` (mọi field trong §1.5, gồm cả `keyFacts{En,Vi}`, `factChips{En,Vi}`, `versionFrom/To`, `isFeatured`, `isConfidential`, `status`, `publishedAt`, `domainId?`, `experienceId?`; `coverId` để dạng `Int?` thường cho tới T50), `ProjectMetric`. Enum `ContentStatus`, `Hue`. Migration `add-projects`. `ProjectImage` chờ `Media` (T50).
- Contracts: `domains/`, `projects/` (DTO list item có domain + metric đầu tiên; DTO detail có metric, tóm tắt experience, domain; `keyFacts` → `string[]` tách theo dòng, `factChips` → `string[]` tách theo dấu phẩy, tối đa 6).
- Module: `domains` (`GET /public/domains` kèm số project đã publish qua `_count`), `projects` (`GET /public/projects?featured&domain`, `GET /public/projects/:slug`; chỉ `PUBLISHED`; slug không tồn tại hoặc chưa publish → 404). Project confidential không bao giờ trả `liveUrl`, `repoUrl` hay image.
- Stat `PROJECT_COUNT` giờ đếm project đã publish.
- Seed (`data/work.data.ts`): 4 domain (seed v2 trong spec §1.5), 4 project link tới domain và experience, metric lấy từ wireframe. `demo` publish chúng; `baseline` giữ chúng ở `DRAFT` (D13).

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_projects/`, `apps/api/prisma/seed/data/work.data.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/src/modules/domains/*`, `apps/api/src/modules/projects/{projects.module.ts,public-projects.controller.ts,projects.service.ts,projects.service.spec.ts,entities/project.entity.ts,entities/project.mapper.ts}`, `apps/api/src/modules/profile-stats/profile-stats.service.ts`, `packages/contracts/src/{domains,projects}/*`, `apps/api/api.http`.

**Thiết kế.** Nhu cầu data ở spec §5.3 và §5.4; Figma `13:2`, `4:2`/`5:2` (các field hiện trên card và case study).

**Các bước backend, giải thích.**
1. **One-to-many.** Một project có nhiều metric. `ProjectMetric.projectId` là một *foreign key*: DB từ chối metric trỏ tới project không tồn tại. Trong Prisma, bạn khai báo relation ở cả hai model.
2. **Đọc SQL.** Migration có `FOREIGN KEY … REFERENCES project(id)` và một index trên `projectId` (MySQL tự thêm index này để join vẫn nhanh).
3. **`include` vs `select`.** `include: { metrics: true }` lấy thêm các row liên quan; `select` chọn đúng từng cột. File entity cố định endpoint nào dùng cái nào, nên mapper luôn nhận cùng một shape.
4. **Đếm bằng `_count`.** `include: { _count: { select: { projects: { where: { status: 'PUBLISHED' } } } } }` lấy số đếm của mọi domain trong một query, thay vì mỗi domain một query (tránh vấn đề "N+1").
5. **Filter theo status.** Public query luôn thêm `status: 'PUBLISHED'`. Một draft phải trông y hệt một row không tồn tại (404), để không ai đoán được slug chưa publish.

**Tiêu chí nghiệm thu.**
- [ ] `GET /api/public/projects/:slug` có kèm experience được link ngay trong một response (roadmap p10).
- [ ] SQL của migration mới có foreign key và một index (roadmap p10); tóm tắt trong PR.
- [ ] `GET /api/public/domains` trả số project qua `_count` (check v2 Day 9 trong spec §6).
- [ ] Với `SEED_PROFILE=baseline`, list rỗng và mọi URL detail trả 404.

**Tiêu đề PR:** `feat(api): projects relation`

#### T17 · Skill (many-to-many) + filter project

**Roadmap** p11 · **Spec** §1.5 (`SkillCategory`, `Skill`, `showInMarquee`), §5.0 (row skills, marquee) · **Phụ thuộc** T16 · **Cỡ** M

**Mục tiêu.** Skill nhóm theo category và độ sâu, link tới project và experience, kèm filter theo skill trên list project.

**Phạm vi.**
- Model: `SkillCategory`, `Skill` (`slug @unique`, enum `depth` `DAILY|SHIPPED|GROWING`, `showInMarquee`, `sortOrder`, `isVisible`); many-to-many ngầm định `Project.skills` ↔ `Skill.projects` và `Experience.skills` ↔ `Skill.experiences` (D10). Migration `add-skills`.
- Contracts `skills/`. Module `skills`: `GET /public/skills` (nhóm theo depth, mỗi skill kèm category), `GET /public/skills?marquee=1` (list phẳng các skill có `showInMarquee`).
- DTO list/detail của project có thêm `skills` (tech chip). `GET /public/projects?skill=<slug>` filter bằng `skills: { some: { slug } }`.
- Seed (`data/skills.data.ts`): ~25 skill trong 5 category (cách nhóm ở spec §1.4 mục 5), ~10 skill có `showInMarquee`, link tới project và experience.

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_skills/`, `apps/api/prisma/seed/data/skills.data.ts`, `apps/api/src/modules/skills/*`, `apps/api/src/modules/projects/{projects.service.ts,entities/*}`, `packages/contracts/src/skills/*`, `packages/contracts/src/projects/projects.schema.ts`.

**Thiết kế.** Spec §5.1 skills và marquee; §5.3 tech combobox.

**Các bước backend, giải thích.**
1. **Many-to-many.** Một project dùng nhiều skill, và một skill xuất hiện trong nhiều project. Viết `skills Skill[]` trên `Project` và `projects Project[]` trên `Skill` thì Prisma tạo một join table ẩn `_ProjectToSkill` với hai foreign key.
2. **Filter qua relation.** `where: { skills: { some: { slug: 'nuxt' } } }` nghĩa là "các project có ít nhất một skill với slug là nuxt".
3. **Tránh N+1.** Load skill cùng project trong cùng một query (`include`), đừng bao giờ query trong vòng lặp cho từng project.

**Tiêu chí nghiệm thu.**
- [ ] `GET /api/public/projects?skill=nuxt` chỉ trả các project khớp (roadmap p11).
- [ ] Thấy được các row join trong Prisma Studio (`_ProjectToSkill`, roadmap p11 điều chỉnh theo D10).
- [ ] `GET /api/public/skills?marquee=1` chỉ trả các skill marquee.

**Tiêu đề PR:** `feat(api): skills m2m + filters`

#### T18 · Post + tag (markdown, publish lint)

**Roadmap** p12 · **Spec** §1.5 (nhóm Writing, `Post.takeaways`), §5.5, §6 Day 10 · **Phụ thuộc** T17 · **Cỡ** M

**Mục tiêu.** Note lưu dạng markdown có tag, chỉ hiện khi đã publish, với các rule publish dùng chung giữa API và admin.

**Phạm vi.**
- Model: `Post` (mọi field trong §1.5 + `takeaways{En,Vi}`; `coverId` để dạng `Int?` thường cho tới T50), `Tag`; quan hệ ngầm định `Post.tags` ↔ `Tag.posts`. Migration `add-posts`.
- Contracts: `posts/` (public list item, detail, và input schema của admin: format slug, `takeaways` ≤ 5 dòng, bắt buộc title/excerpt/body tiếng Anh), `tags/`, `common/publish-lint.util.ts` (từ chối `{{`, `TODO`, `lorem` trong các field tiếng Anh; trả `fieldErrors`).
- `common/utils/reading-time.util.ts` (+ spec): số từ / 220, làm tròn lên; giờ seed dùng, sau này write API ở T30 dùng.
- Module: `posts` (`GET /public/posts?tag`, `GET /public/posts/:slug`; chỉ `PUBLISHED`; với `vi`, post không có `bodyVi` sẽ fallback theo D19 với `lang: "en"`), `tags` (`GET /public/tags` kèm số post đã publish).
- Seed (`data/posts.data.ts`): `demo` = 3 post mẫu đã publish (title lấy từ mockup, body placeholder có một code block và một callout); `baseline` = 0 post. Seed validate row bằng schema trong contracts.

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_posts/`, `apps/api/prisma/seed/data/posts.data.ts`, `apps/api/src/modules/{posts,tags}/*`, `apps/api/src/common/utils/reading-time.util.ts` (+ `.spec.ts`), `packages/contracts/src/{posts,tags}/*`, `packages/contracts/src/common/publish-lint.util.ts` (+ `.test.ts`).

**Thiết kế.** Spec §5.5; mockup `notes.html`, `post.html`.

**Các bước backend, giải thích.**
1. **Markdown trong một cột text (D3).** Body là plain text trong `@db.Text`. Web render nó một cách an toàn (T23). DB không bao giờ lưu HTML.
2. **Validate ở biên.** Cùng một zod schema kiểm tra row seed bây giờ và input của admin về sau. Row sai sẽ dừng lại với một message zod dễ đọc, không phải trang 500.
3. **Publish lint.** Text placeholder (`TODO`, `lorem`, `{{`) không bao giờ được lên live. Rule nằm trong contracts để admin cảnh báo được trước khi API từ chối.

**Tiêu chí nghiệm thu.**
- [ ] Post draft không có trong `GET /api/public/posts`, và `GET /api/public/posts/:slug` trả 404 (roadmap p12).
- [ ] Row post không hợp lệ bị từ chối với lỗi zod lúc seed, không phải 500 (roadmap p12, điều chỉnh theo D3).
- [ ] `GET /api/public/posts?locale=vi` trả tiếng Anh với `lang: "en"` cho post không có `bodyVi` (spec §6 Day 10).
- [ ] Unit test của `publishLint` phủ `TODO`, `lorem`, `{{`.

**Tiêu đề PR:** `feat(api): posts with markdown`

#### T19 · Contract cho list query (page, sort, search)

**Roadmap** p13 · **Spec** §1.6, §4.6 (list điều khiển bằng URL) · **Phụ thuộc** T18 · **Cỡ** M

**Mục tiêu.** Một format list query duy nhất cho mọi list endpoint (D6), validate bằng zod, phân trang ổn định.

**Phạm vi.**
- `packages/contracts/src/common/list-params.schema.ts`: `listParamsSchema` (`page` ≥ 1, `pageSize` 1–100, `sort` lấy từ allowlist riêng cho từng entity, ví dụ `-publishedAt`, `q` ≤ 100 ký tự) và `paginatedSchema(item)` → `{ items, page, pageSize, total }`. Phần mở rộng theo entity: `postListParamsSchema` (`tag`, `q`), `projectListParamsSchema` (`domain`, `skill`, `featured`).
- Áp dụng cho `GET /public/posts` và `GET /public/projects`. Mọi `orderBy` đều kết thúc bằng `id` làm tiêu chí phân xử khi bằng nhau. `q` tìm trong title tiếng Anh và tiếng Việt bằng `contains`. Count và row chạy trong cùng một `$transaction`.
- `common/utils/paginate.util.ts` (skip/take + total).

**File.** `packages/contracts/src/common/list-params.schema.ts` (+ `.test.ts`), `packages/contracts/src/{posts,projects}/*.schema.ts`, `apps/api/src/common/utils/paginate.util.ts`, `apps/api/src/modules/{posts,projects}/{*.service.ts,dto/*-list-query.dto.ts}`, `apps/api/api.http`.

**Thiết kế.** Footer của admin table "1–5 of 5" (Figma `15:2`) cho thấy vì sao list phải trả `total`.

**Các bước backend, giải thích.**
1. **Query param cũng là input.** `?pageSize=500` là input của user. Zod schema giới hạn nó, nên không ai xin DB một triệu row được.
2. **Thứ tự ổn định.** Hai post có cùng `publishedAt` có thể đổi chỗ cho nhau giữa các trang. Thêm `id` làm sort key cuối cùng thì thứ tự là duy nhất, nên các trang không bao giờ lặp hay bỏ sót row.
3. **Count và row đi cùng nhau.** `$transaction([count, findMany])` đọc cả hai từ cùng một snapshot.

**Tiêu chí nghiệm thu.**
- [ ] Lật qua toàn bộ post với `pageSize=1` không có row trùng hay bị hụt, kể cả hai post seed có cùng `publishedAt` (roadmap p13).
- [ ] `pageSize=500` trả 400 với field error trên `pageSize` (roadmap p13, điều chỉnh theo D6).
- [ ] Response có shape `{ items, page, pageSize, total }`.

**Tiêu đề PR:** `feat(api): list query contract`

#### T20 · Card: DiffStat, CaseCard, DomainCard, PostCard

**Roadmap** p14 · **Spec** §4.2 (`DiffStat`), §4.7 (`CaseCard`, `DomainCard`, `PostCard`, `KeyFacts`, `FactChips`), §3.4, §7.1 G5–G6 · **Phụ thuộc** T13, T18 · **Cỡ** M

**Mục tiêu.** Các card mang project, domain và post trên home, các list và admin preview, khớp với set CaseCard trong Figma.

**Phạm vi.**
- `DiffStat` (value + label; variant diff `before → after` bằng font mono, có cột `+`/`−` bên lề; `tabular-nums`).
- `CaseCard` (variant `default` và `featured` (rộng: cover bên trái 7 cột, text bên phải 5 cột trên `lg`); domain pill = `Badge hue` + `Icon`; góc `↗` có `aria-hidden`; title `text-subheading`; tagline 2–3 dòng; dòng `DiffStat` cho metric đầu tiên; tối đa 4 chip mono rồi "+N"; NDA pill khi confidential; slot cover với `CoverPlaceholder` chỉ dùng CSS cho tới khi có media).
- `DomainCard` (ô icon tô theo hue, title, mô tả một dòng, số đếm mono ở góc trên phải, viền trên 2px màu hue khi hover; cả card link tới `/projects?domain=slug`).
- `PostCard` (variant `row` và `featured`; `date · minutes` bằng mono, title + `↗`, excerpt 2 dòng, chip `#tag`, badge "EN" khi `lang` là `en`).
- `KeyFacts` (card 2×2 có chấm hue) và `FactChips` (hàng chip mono).
- Card một link: title là link duy nhất, được kéo giãn bằng `::after`; style hover cũng áp dụng cho `:focus-within`; không nâng card lên khi reduced motion. Link render qua prop `renderLink` để web truyền `Link` của next-intl vào (không import `next/*` trong `packages/ui`).
- Text chrome được truyền vào qua prop (`labels.nda`, `labels.minutes`, `labels.projects`).
- Fixture: `packages/contracts/src/fixtures/{projects,domains,posts}.fixture.ts` (chỉ text placeholder).

**File.** `packages/ui/src/components/{DiffStat,CaseCard,CoverPlaceholder,DomainCard,PostCard,KeyFacts,FactChips}/*`, `packages/contracts/src/fixtures/{projects,domains,posts}.fixture.ts`.

**Thiết kế.** Set CaseCard trong Figma (Default/Hover × Theme); card trong `13:2`, `2:2`/`3:2`, `9:2`. Mockup `projects.html`, `home.html`, `notes.html` (một card ở `.is-hover`). Token: `--card`, `--border`, `--border-strong`, `--shadow-1`, `--shadow-2`, `--hue-*`, `--hue-*-subtle`, `--primary`, `text-subheading`, `text-body`, `text-meta`, `text-eyebrow`, `--ease-out`.

**Tiêu chí nghiệm thu.**
- [ ] Mỗi card chỉ có một điểm dừng Tab và kích hoạt được bằng Enter.
- [ ] Focus-within trông giống hover (check v2 Day 6 trong spec §6).
- [ ] Story của CaseCard khớp set Figma ở cả hai theme; trạng thái tràn "+N" và NDA có story.
- [ ] Text bị clamp có `padding-block: 0.15em` để dấu tiếng Việt không bị cắt.

**Tiêu đề PR:** `feat(ui): case, domain and post cards`

#### T21 · Section rich: StatBand, TechMarquee, ProcessFlow, PrincipleList, FeatureCard, SkillGroup

**Roadmap** p14 · **Spec** §4.7, §4.2 (`SkillGroup`), §3.4 · **Phụ thuộc** T13, T17 · **Cỡ** M

**Mục tiêu.** Các component thuần đứng sau các section stats, marquee, process và skills trên home, và phần principles của About.

**Phạm vi.**
- `StatBand` / `StatItem` (2×2 trên mobile, 4 cột trên desktop; ô icon, số dùng `text-title` font heading `--primary` `tabular-nums`, label mono; count-up optional, giữ giá trị cuối trong accessible name và chừa sẵn độ rộng để không bị layout shift; variant `compact` cho About).
- `TechMarquee` (client: hai track, track thứ hai `aria-hidden`, mask mờ ở hai mép, nút pause có `aria-pressed`; thành hàng tĩnh khi `enabled={false}`, khi có ít hơn 6 item, hoặc khi reduced motion).
- `ProcessFlow` (`<ol>` gồm các card bước nối bằng connector `↓` có `aria-hidden`; bước ở giữa được highlight bằng `--primary-subtle`).
- `PrincipleList` (`<ol>`, 2 cột, số mono `01 —`).
- `FeatureCard` (ô icon + title + body 2 dòng trên `--card-glass`).
- `SkillGroup` (cột theo depth; heading của depth truyền vào dạng label).
- Story dùng fixture; test cho rule fallback của marquee và accessible name của stat.

**File.** `packages/ui/src/components/{StatBand,TechMarquee,ProcessFlow,PrincipleList,FeatureCard,SkillGroup}/*`, `packages/contracts/src/fixtures/{profile-stats,skills,process-steps,principles}.fixture.ts`.

**Thiết kế.** Figma `2:2`/`3:2` (stats band, marquee, process band, skills), `7:2` (principles). Mockup `home.html`, `about.html`. Token: `--band`, `--card-glass`, `--primary`, `--primary-subtle`, `--muted`, `text-title`, `text-eyebrow`, `--ease-in-out`.

**Tiêu chí nghiệm thu.**
- [ ] Khi reduced motion, marquee là một hàng tĩnh và count-up hiện ngay giá trị cuối.
- [ ] Nút pause của marquee bật/tắt `aria-pressed` và dừng animation.
- [ ] Story ở cả hai theme được so với frame home và About.

**Tiêu đề PR:** `feat(ui): rich section components`

#### T22 · MigrationDiagram

**Roadmap** p14 · **Spec** §4.7 (`MigrationDiagram`), §5.1 hero · **Phụ thuộc** T13, T17 · **Cỡ** M

**Mục tiêu.** SVG ở hero thể hiện một migration v1 → v2, dựng từ data của project featured.

**Phạm vi.**
- `MigrationDiagram` (SVG): node trái `versionFrom`, node phải `versionTo`, 3–6 node component (tên skill) nối lại giữa hai bên, label mono. Fallback khi thiếu version: tên các `ProcessStep` xếp thành chuỗi dọc. Label của node dùng nguyên giá trị field (xem Q8).
- `role="img"` với `aria-label` do web truyền vào (dựng từ data bằng một template chrome), cộng thêm text thay thế `sr-only`.
- Tắt animation nối lại khi reduced motion; trên mobile thu nhỏ và nằm dưới các button của hero.
- Story: data đầy đủ, ít skill hơn, chuỗi fallback, cả hai theme.

**File.** `packages/ui/src/components/MigrationDiagram/*`.

**Thiết kế.** Figma `2:2`/`3:2` cột phải của hero, `8:2` (dưới các button). Mockup `home.html` phần hero. Token: `--card`, `--border`, `--primary`, `--primary-subtle`, `--muted-foreground`, `--font-mono`.

**Tiêu chí nghiệm thu.**
- [ ] Screen reader đọc ra một image với label dựng từ data; text `sr-only` liệt kê các node.
- [ ] Không có gì chuyển động khi reduced motion.
- [ ] Ở 390px, diagram vừa khung, không có scroll ngang.

**Tiêu đề PR:** `feat(ui): migration diagram`

