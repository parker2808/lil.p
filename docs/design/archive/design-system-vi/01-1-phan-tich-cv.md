<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (1. Phân tích CV); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-1">1. Phân tích CV</h2>

> **Trong chương này:** các mục đánh số bên dưới.

| § | Mục |
| --- | --- |
| 1.1 | Định vị |
| 1.2 | Câu chuyện portfolio kể |
| 1.3 | Case study đưa lên (theo thứ tự) |
| 1.4 | Gap cần bổ sung (hỏi Parker, hoặc đánh TODO trong CMS) |
| 1.5 | Content model (DB/CMS) |
| 1.6 | Lộ trình backend cho backend beginner (một cách làm cho mỗi thứ) |


 

<h3 id="s-1-1">1.1 Định vị</h3>

**Headline (en):** Senior Frontend Engineer. 5 years shipping data-dense product UIs in Vue, Nuxt and TypeScript, now building with Next.js.
**Headline (vi):** Senior Frontend Engineer. 5 năm xây dựng giao diện sản phẩm nhiều dữ liệu với Vue, Nuxt và TypeScript, hiện phát triển với Next.js.

**Sub-line:** Fintech (Web3/ReFi) · enterprise (Samsung SDS) · e-commerce tooling. Hà Nội, làm việc với team Hàn, Mỹ và Anh.

Tên hiển thị: **Parker Vu**, kèm tên pháp lý *Vu Van Hung* (`Vũ Văn H…ng`: confirm dấu với Parker trước khi seed) trên About và trong JSON-LD. GitHub: `parker2808`.

 

<h3 id="s-1-2">1.2 Câu chuyện portfolio kể</h3>

Mỗi role trên CV đều là một **migration**: chuyển cart giữa Shopify/BigCommerce/WooCommerce/Magento (LitGroup), chuyển logic MSP App sang MSP Advanced mới (Samsung SDS), lead Particula từ v1 (Vue 2) sang v2 (Nuxt 3, Vue 3, PrimeVue, TanStack Query). Sợi dây xuyên suốt là:

> "Mình đẩy product tiến lên mà không làm gãy chúng."

Ba hồi:
1. **Gốc backend** (2021): API và data integrity cho migration xuyên 4+ platform e-commerce; nói chuyện với khách US/UK khi data gãy.
2. **Frontend enterprise** (2022–2024): platform Samsung SDS với team Hàn, 5–15 người, độ tin cậy nhờ test và bug triage.
3. **Ownership** (2024–nay): main frontend developer tại Particula, lead rewrite v1→v2, build core component, đưa Playwright spec vào.

Bản thân portfolio là hồi 4, đồng thời là câu trả lời cho dòng yếu nhất trên CV ("React/Next JS (a bit)", "Backend (basic)"): một app production Next.js + NestJS có CMS, build công khai.

 

<h3 id="s-1-3">1.3 Case study đưa lên (theo thứ tự)</h3>

| # | Case study | Vì sao đứng đầu | Góc tiếp cận |
| --- | --- | --- | --- |
| 1 | **Particula v2: Vue 2 → Nuxt 3 migration** (Kobizo, 2024–nay) | Signal seniority mạnh nhất: ownership, chiến lược migration, quyết định stack (Axios → TanStack Query), testing | Quyết định strangler vs big-bang, component library trên PrimeVue, server-state cache, Playwright spec. Domain: rating RWA trên 20+ asset class |
| 2 | **Cart migration tool** (LitGroup, 2021–2022) | Phủ full-stack: API Flask/Laravel, rồi frontend Vue 2 + TS + Pinia cho cùng product | State dataset lớn, UX progress/error cho job dài, xử lý lỗi hướng tới khách |
| 3 | **Samsung SDS MSP Advanced + App Expansion** (CMC Global, 2022–2024) | Scale enterprise và delivery xuyên văn hóa (team Hàn, team 15 người) | Re-platform logic sang design mới, UI quản lý issue theo Jira, unit test. **An toàn NDA:** không screenshot, dùng diagram vẽ lại |
| 4 | **Portfolio này** (2026) | Bằng chứng React/Next.js, NestJS, MySQL, auth, realtime | Architecture, lựa chọn rendering theo từng route, thiết kế CMS, đạt budget a11y/perf |

 

<h3 id="s-1-4">1.4 Gap cần bổ sung (hỏi Parker, hoặc đánh TODO trong CMS)</h3>

1. **Không có metric nào.** Thu thập ít nhất một con số cho mỗi case study: số page/route đã migrate, số component trong library v2, LCP hoặc bundle size trước/sau, số Playwright spec và thời gian CI, xu hướng số bug, số record hoặc store migrate mỗi tháng, tỉ lệ migration thành công, số support ticket đã resolve.
2. **Số năm và title đã cũ.** "4+" → "5 years"; Objective → một câu định vị (1.1). Chỉ dùng "Senior Frontend Engineer" nếu Parker ổn với cách gọi đó; không thì "Frontend Engineer (5 yrs)".
3. **Date chồng nhau.** CMC Global kết thúc tháng 6/2024, Kobizo bắt đầu tháng 2/2024, và Particula ghi "main frontend since July 2024". Confirm ngày thật; timeline hiện theo tháng nên overlap sẽ nhìn thấy.
4. **Typo và naming.** "Particular" vs "Particula"; "we also using", "specifictly", "sometime". Giải thích tên nội bộ ("Lego framework" = UI framework nội bộ của Samsung; "MSP").
5. **Skills list phẳng.** Đổi thành skill nhóm theo độ sâu: *Daily* (Vue 3, Nuxt 3, TypeScript, Pinia, TanStack Query, Tailwind, PrimeVue, Playwright), *Shipped before* (Vue 2/Vuex, Vitest, REST/GraphQL/OAuth, Flask, Laravel, MySQL), *Growing* (React, Next.js, NestJS). Bỏ GPA và boilerplate "Version control".
6. **Thiếu bằng chứng seniority:** mentoring, code review, quyết định design, RFC. Xin 2 câu chuyện cụ thể (cũng feed lab Day 25–27).
7. **Không có link.** URL product live (site public của Particula), GitHub repo, và sau này là blog. Thêm `<email>` và LinkedIn làm placeholder.
8. **Trách nhiệm, không phải outcome.** Viết lại bullet theo *verb + what + result* ("Led the Vue 2 → Nuxt 3 rewrite of Particula's investor app; shipped N core components; replaced Axios with TanStack Query, cutting duplicate requests by X%").

 

<h3 id="s-1-5">1.5 Content model (DB/CMS)</h3>

**Quy tắc: nếu visitor đọc được, và nội dung đó nói về Parker hoặc site, thì nó là một row trong database và edit được trong admin.** Chỉ những thứ này ở lại trong code: design token, chuỗi UI chrome (label button và form, validation và empty/error message generic, aria label, "min read", format date và number) trong `apps/web/messages/{en,vi}.json`, và danh sách route. Mục 4.5 giải thích UI enforce rule này thế nào.

**Quy ước (cố ý làm đơn giản).** Một table cho mỗi thứ trên page; không dùng pattern khôn lỏi.

| Quy ước | Nghĩa là gì | Vì sao (góc nhìn beginner) |
| --- | --- | --- |
| `id Int @id @default(autoincrement())` | Mỗi row nhận 1, 2, 3… | Dễ đọc trong DB GUI và trong URL kiểu `/admin/projects/3` |
| `createdAt`, `updatedAt` trên mọi table | Prisma tự điền | History miễn phí để sort và hiện "Updated 2d ago" |
| Hai cột cho mỗi text dịch: `titleEn`, `titleVi` | English bắt buộc mới publish, Vietnamese thì optional | Chỉ 2 ngôn ngữ, nên không cần table dịch phụ hay join thêm. Nhìn cả hai giá trị cạnh nhau trong Adminer. Ngôn ngữ thứ 3 sẽ cần một migration, chấp nhận được |
| `sortOrder Int`, `isVisible Boolean` | Admin reorder và ẩn row được | Một pattern cho mọi list (nav, skill, section, project) |
| `status` enum `DRAFT \| PUBLISHED \| ARCHIVED` + `publishedAt` | Chỉ trên project và post | Public API chỉ trả `PUBLISHED`; "delete" trên UI nghĩa là archive, nên không mất gì |
| Foreign key `projectId Int` + `@relation` | Một project có nhiều metric (1-to-many) | DB từ chối metric trỏ tới project không tồn tại |
| `skills Skill[]` ở cả hai phía | Many-to-many; Prisma tạo join table ẩn | Không phải tự viết join table |
| `slug String @unique` | Tên URL kiểu `particula-v2` | DB đảm bảo hai project không dùng chung một URL |
| Text dài là `@db.Text` | Markdown được lưu dạng plain text | Render ra HTML trên Next server, không bao giờ lưu HTML |
| Singleton (`SiteSettings`, `Profile`) là table đúng một row, `id = 1` | Seed tạo ra | Cùng tool với mọi table khác; không file config đặc biệt |

Shorthand field bên dưới: `title{En,Vi}` nghĩa là hai cột `titleEn` và `titleVi`. `?` = optional. Mọi table còn có `id`, `createdAt`, `updatedAt`.

| Nhóm | Entity | Fields | Ghi chú |
| --- | --- | --- | --- |
| Site | `SiteSettings` (1 row) | `siteName`, `domain`, `defaultLocale`, `seoTitle{En,Vi}`, `seoDescription{En,Vi}`, `ogImageId?`, `footerNote{En,Vi}`, `contactIntro{En,Vi}`, `replyTimeNote{En,Vi}`, `contactEmail` (`<email>`), `availability` (`OPEN \| NOT_LOOKING \| FREELANCE`), `availabilityNote{En,Vi}`, `analyticsEnabled` | SEO mặc định cho page không có SEO riêng |
| Site | `NavItem` | `location` (`HEADER \| FOOTER`), `label{En,Vi}`, `href` (route nội bộ kiểu `/projects`, hoặc URL đầy đủ), `sortOrder`, `isVisible` | Admin chọn `href` từ list route thật, hoặc gõ một URL |
| Site | `SocialLink` | `kind` (`GITHUB \| LINKEDIN \| EMAIL \| RSS \| OTHER`), `label{En,Vi}`, `url`, `showInHeader`, `sortOrder`, `isVisible` | GitHub `parker2808`; email là `mailto:<email>` |
| Site | `PageSection` | `page` (`HOME \| ABOUT \| PROJECTS \| NOTES \| CONTACT`), `key` (ví dụ `hero`, `featured`, `work`, `skills`, `notes`, `cta`), `title{En,Vi}?`, `intro{En,Vi}?`, `ctaLabel{En,Vi}?`, `sortOrder`, `isVisible`; unique trên (`page`, `key`) | Được seed. Admin reorder, ẩn và đổi title section được; mỗi `key` map tới một component trong code, nên admin không invent được loại section mới |
| About | `Profile` (1 row) | `displayName`, `legalName`, `city`, `country`, `timezone`, `careerStartDate`, `headline{En,Vi}`, `subheadline{En,Vi}`, `bio{En,Vi}` (md), `languages{En,Vi}`, `avatarId?`, `resumeEnId?`, `resumeViId?`, `phone?` (`<phone>`, private) | "Years of experience" được compute từ `careerStartDate`, nên không bao giờ cũ như "4+" trên CV. Public API không bao giờ trả `phone` |
| About | `Experience` | `company`, `companyUrl?`, `location`, `employmentType` (`FULL_TIME \| CONTRACT \| FREELANCE`), `role{En,Vi}`, `summary{En,Vi}`, `highlights{En,Vi}` (md bullet list), `startDate`, `endDate?` (trống = hiện tại), `sortOrder`, `isVisible`, `skills Skill[]` | LitGroup là 2 row (Backend 2021, Frontend 2022); timeline group row theo `company` |
| About | `Education` | `school`, `degree{En,Vi}`, `major{En,Vi}`, `startDate`, `endDate`, `isVisible` | Không có cột GPA |
| About | `Principle` | `title{En,Vi}`, `body{En,Vi}`, `sortOrder`, `isVisible` | Card "How I work" |
| About | `SkillCategory` | `name{En,Vi}`, `sortOrder` | Frontend, Testing, Backend, Data, Workflow |
| About | `Skill` | `name`, `slug @unique`, `categoryId`, `depth` (`DAILY \| SHIPPED \| GROWING`), `sortOrder`, `isVisible` | Link tới project và experience |
| Work | `Project` | `slug @unique`, `title{En,Vi}`, `tagline{En,Vi}`, `client`, `role{En,Vi}`, `teamSize?`, `startDate`, `endDate?`, `versionFrom?`, `versionTo?` (ví dụ `v1`, `v2` cho version tag), `isFeatured`, `isConfidential`, `liveUrl?`, `repoUrl?`, `coverId?`, `problem{En,Vi}`, `constraints{En,Vi}`, `approach{En,Vi}`, `decisions{En,Vi}`, `outcome{En,Vi}`, `lessons{En,Vi}` (tất cả md), `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`, `status`, `publishedAt?`, `sortOrder`, `experienceId?`, `skills Skill[]` | Một cột cho mỗi section của case study, editor giữ dạng form đơn giản |
| Work | `ProjectMetric` | `projectId`, `label{En,Vi}`, `before?`, `after?`, `value`, `sortOrder` | Drive stat before → after |
| Work | `ProjectImage` | `projectId`, `mediaId`, `caption{En,Vi}?`, `sortOrder` | Ẩn khi `isConfidential` |
| Writing | `Post` | `slug @unique`, `title{En,Vi}`, `excerpt{En,Vi}`, `body{En,Vi}` (md), `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`, `coverId?`, `readingMinutes` (compute lúc save), `isFeatured`, `status`, `publishedAt?`, `tags Tag[]` | Post không có `bodyVi` vẫn list trên `/vi` với badge "EN" |
| Writing | `Tag` | `slug @unique`, `name{En,Vi}` | |
| System | `Media` | `fileName` (tên lưu), `originalName`, `mimeType`, `sizeBytes`, `width?`, `height?`, `alt{En,Vi}`, `uploadedById` | File trên disk, metadata trong DB. Alt text bắt buộc trước khi bất cứ thứ gì dùng image đó được publish |
| System | `ContactTopic` | `label{En,Vi}`, `sortOrder`, `isVisible` | Option của select Topic trên contact form |
| System | `ContactMessage` | `name`, `email`, `topicId?`, `message` (Text), `locale`, `status` (`NEW \| READ \| REPLIED \| SPAM`), `ipHash` | Không bao giờ public |
| System | `User` | `email @unique`, `name`, `passwordHash`, `role` (`OWNER \| EDITOR \| VIEWER`), `isActive`, `lastLoginAt?` | Seed tạo owner từ env var |
| System | `Session` | `tokenHash @unique`, `userId`, `expiresAt`, `userAgent?` | Một row cho mỗi browser đang login; logout xóa row |
| System | `AuditLog` | `userId`, `action` (`CREATE \| UPDATE \| PUBLISH \| ARCHIVE \| LOGIN`), `entityType`, `entityId`, `summary` | Append-only, API ghi |
| System | `PageView` | `path`, `locale`, `referrerHost?`, `device`, `visitorHash` | Không cookie; hash dùng salt đổi mỗi ngày |

**Bổ sung v2 (lớp rich).** Mọi thứ section mới hiện ra vẫn là một row; không có gì decorative mang content. Table mới theo cùng quy ước (`sortOrder`, `isVisible`, cặp `En`/`Vi`).

| Nhóm | Entity / field | Fields | Ghi chú |
| --- | --- | --- | --- |
| About | `ProfileStat` (mới) | `label{En,Vi}`, `value String?`, `suffix?` (ví dụ `+`, `%`), `source` (`MANUAL \| YEARS_COMPUTED \| PROJECT_COUNT`), `iconKey`, `sortOrder`, `isVisible` | Stats band trên Home. `YEARS_COMPUTED` đọc `Profile.careerStartDate`, `PROJECT_COUNT` đếm project đã publish, nên số không bao giờ cũ. Seed: số năm, 4 product đã ship, 2 framework migration, 1 enterprise (Samsung SDS) |
| Work | `Domain` (mới) | `slug @unique`, `name{En,Vi}`, `description{En,Vi}`, `hue` (`JADE \| AMBER \| BLUE \| VIOLET \| ROSE`), `iconKey`, `sortOrder`, `isVisible` | Card "Domains" trên Home, pill filter trên list project, pill trên case study. Seed: Fintech / Web3 ReFi (amber), Enterprise platforms (blue), E-commerce tooling (violet), Developer experience & testing (jade) |
| Work | `Project.domainId?` (FK mới) | `Domain 1──* Project` | Một domain mỗi project để filter đơn giản |
| Work | `Project.keyFacts{En,Vi}` | Text, một fact mỗi dòng, 2–4 dòng | Grid 2×2 `KeyFacts` trên case study |
| Work | `Project.factChips{En,Vi}` | Text, cách nhau bằng dấu phẩy, ≤ 6 | `FactChips` trên case study (ví dụ "Vue 2 → Nuxt 3, 0 downtime, 6 months") |
| About | `ProcessStep` (mới) | `title{En,Vi}`, `caption{En,Vi}`, `iconKey`, `sortOrder`, `isVisible` | Flow "How I migrate a frontend" trên Home. Seed (5): Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over |
| About | `Profile.heroKicker{En,Vi}?`, `Profile.headlineAccent{En,Vi}?` | Chuỗi ngắn | Pill kicker phía trên H1; accent phải là substring của `headline` (validate lúc save) |
| About | `Principle.iconKey?` | | Ô icon trên card principle |
| About | `Skill.showInMarquee` | Boolean, mặc định `false` | Tech marquee trên home |
| Writing | `Post.takeaways{En,Vi}?` | Text, một dòng một ý, ≤ 5 | Card "Key takeaways" ở cuối post |
| Site | `SocialLink.showInCta` | Boolean | Button outline trong CTA band (tối đa 2) |
| Site | `SiteSettings.ambientEffects`, `SiteSettings.marqueeEnabled` | Boolean, mặc định `true` | Kill switch cho grid/orb/glow và animation marquee (marquee lúc đó render thành một hàng tĩnh) |
| Site | `PageSection.key` (giá trị mới) | `stats`, `marquee`, `domains`, `process`, `principles` | Seed kèm title; vẫn một component cho mỗi key |
| Site | `iconKey` (tất cả mục trên) | String từ allowlist cố định ~40 tên lucide trong `packages/contracts/icons.ts` | zod reject key lạ; admin hiện icon picker. Không upload SVG, nên icon luôn khớp theme |

Quan hệ nhìn nhanh:

```
SiteSettings(1) Profile(1) NavItem* SocialLink* PageSection* Principle* Education*
ProfileStat* ProcessStep* (v2)
SkillCategory 1──* Skill *──* Project 1──* ProjectMetric
 Domain 1──* Project (v2)
 *──* Experience 1──* Project (optional link)
 Project 1──* ProjectImage *──1 Media
Post *──* Tag ContactTopic 1──* ContactMessage
User 1──* Session User 1──* AuditLog User 1──* Media (uploadedBy)
```

Ví dụ quy ước trong `apps/api/prisma/schema.prisma`:

```prisma
model Project {
 id Int @id @default(autoincrement())
 slug String @unique
 titleEn String
 titleVi String?
 taglineEn String
 taglineVi String?
 problemEn String @db.Text
 problemVi String? @db.Text
 status ContentStatus @default(DRAFT)
 publishedAt DateTime?
 sortOrder Int @default(0)
 metrics ProjectMetric[]
 skills Skill[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 @@index([status, sortOrder])
 @@map("project")
}
```

**Hai shape API.** Public endpoint (`GET /public/...?locale=vi`) chọn ngôn ngữ trên server và trả field phẳng (`title`, không phải `titleEn`/`titleVi`), fallback sang English với `lang: "en"` trên nhóm field để UI set `lang` trên element đó. Admin endpoint trả cả hai cột để edit. Component vì thế không chứa logic locale.

Seed (`prisma/seed.ts`) load content từ CV: site settings, profile (placeholder cho `<email>` / `<phone>`), nav, social link, page section, 4 row experience, education, ~25 skill trong 5 category, 4 project ở `DRAFT`, 3 principle, contact topic, user owner. 0 post. v2 thêm 4 domain (mỗi project được link), 4 profile stat, 5 process step, `showInMarquee` trên ~10 skill, `keyFacts`/`factChips` nháp cho Particula, và các `PageSection` key mới.

 

<h3 id="s-1-6">1.6 Lộ trình backend cho backend beginner (một cách làm cho mỗi thứ)</h3>

Các mảnh nói chuyện với nhau thế nào:

```
Browser ──► Next.js (apps/web, :3000) ──/api/* rewrite──► NestJS (apps/api, :4000) ──Prisma──► MySQL (:3306, Docker)
 Server Components fetch controllers → services data on a Docker volume
```

Khi dev, chỉ MySQL và Adminer (web UI để nhìn vào DB) chạy trong Docker; Next và Nest chạy với `pnpm dev` để restart và debug vẫn nhanh. Day 21 cả ba chạy trong Compose, đúng cách chúng sẽ chạy trên production.

| Lựa chọn | Chọn | Vì sao chọn cái này | Không chọn, và vì sao |
| --- | --- | --- | --- |
| ORM | **Prisma** | Một file `schema.prisma` đọc được là source of truth; `prisma migrate dev` viết SQL giúp bạn và bạn đọc được; generated client autocomplete mọi query; Prisma Studio hiện data; NestJS docs có Prisma recipe chính thức | TypeORM: class decorator và shortcut `synchronize: true` có thể sửa table thầm lặng. Drizzle: rất tốt, nhưng giả định bạn đã quen SQL |
| Validation | Schema **zod** trong `packages/contracts`, dùng bởi Next form và bởi `ZodValidationPipe` nhỏ trên Nest | Một schema validate contact form trên browser rồi validate lại trên API | DTO `class-validator`: chỉ Nest, nên rule sẽ viết hai lần |
| Auth | **Email + password, server-side session trong MySQL**, password hash bằng `argon2`, session id trong cookie `httpOnly`, `Secure`, `SameSite=Lax`. `AuthGuard` load session; `@Roles('OWNER')` + `RolesGuard` check `user.role` | Model dễ suy nhất: đã login = tồn tại một row `Session`; logout hoặc "sign out everywhere" = xóa row. Next rewrite `/api/*` sang Nest, nên browser thấy một origin: không phải setup CORS và cookie là first-party | JWT access + refresh token: refresh rotation và revocation là concept thêm, không lợi gì với 1–3 user admin. Auth.js/NextAuth: nhét auth vào Next trong khi rule data nằm ở Nest. Hosted auth (Clerk, Auth0): bỏ qua mục tiêu học |
| CSRF | Cookie `SameSite=Lax` + API reject request mutating có `Origin` không phải site | Hai dòng middleware, không token phải quản | Double-submit CSRF token: không cần khi same-origin + Lax |
| Realtime | **Server-Sent Events** (`@Sse()` trong Nest), proxy qua Next | Một chiều server → browser là đủ cho notification; HTTP thuần, cookie auth chạy tự động, browser tự reconnect | WebSockets/Socket.IO: protocol hai chiều, handshake auth riêng |
| Upload | Nest `FileInterceptor` (multer) → file trên Docker volume `uploads/`, một row `Media` mỗi file, Nest serve | Không cần tài khoản cloud; sau này đổi sang storage tương thích S3 phía sau cùng `MediaService` | Upload presigned thẳng lên S3: nhiều moving part ngay ngày đầu |
| Rate limit | `@nestjs/throttler` trên login và contact | Làm cho Nest, một decorator | n/a |

Glossary backend (dùng trong các ngày lab):

| Thuật ngữ | Nghĩa thông thường |
| --- | --- |
| Image / container | Image là chương trình đã đóng gói (MySQL 8); container là bản đang chạy của nó |
| Volume | Folder Docker giữ bên ngoài container, nên data sống sót sau `docker compose down` |
| Port mapping `3306:3306` | Port máy bạn → port của container |
| Environment variable | Config nằm ngoài code (`DATABASE_URL`, password); sống trong `.env`, không bao giờ commit |
| Migration | File SQL có version, thay đổi table; chạy theo thứ tự, commit vào git |
| Seed | Script đổ data khởi đầu vào DB |
| Primary key / foreign key | id của row / cột trỏ tới id của table khác |
| Index | Cấu trúc lookup giúp `WHERE` và `ORDER BY` trên cột đó nhanh |
| Transaction | Nhiều write thành công hoặc fail cùng nhau |
| Module / controller / service (Nest) | Folder của một feature / class map URL sang method / class chứa logic thật và lời gọi DB |
| Pipe / guard (Nest) | Chạy trước controller: pipe validate hoặc transform input, guard nói yes/no (đã login? đúng role?) |
| Session / cookie | Row phía server "browser này đang login là X" / giá trị nhỏ browser gửi lại mỗi request |

Thang backend (mỗi bậc chỉ cần các bậc dưới nó; số ngày nằm ở mục 6):

1. Docker: chạy MySQL + Adminer, hiểu volume, port, `.env`.
2. SQL bằng tay: tạo một table, insert, select, join, rồi bỏ đi.
3. Nest cơ bản: một module, controller và service, `GET /health`.
4. Prisma: model đầu, một migration, một seed; đọc SQL được generate.
5. Read API: Nest + Prisma, public `GET` endpoint, error handling, validation.
6. Relation: 1-to-many và many-to-many, `include` vs `select`.
7. Write API: create, update, archive, reorder trong một transaction; lỗi unique-constraint → `409`.
8. Performance cơ bản: index, `EXPLAIN`, tránh N+1 query.
9. Auth: user, password hashing, session, guard, role.
10. Feature: contact + rate limit, upload, publish → revalidate, SSE, audit log, analytics.
11. Ops: mọi thứ trong Compose, health check, `prisma migrate deploy`, backup bằng `mysqldump`.

---

 
