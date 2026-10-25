# Hệ thống thiết kế portfolio và UI spec (Parker)

Chỉ design và planning. Doc này là nguồn cho tab LAB của plan 30 ngày (`plans/study-plan-30d-redesign.md`): lab trở thành một project xuyên suốt, portfolio full-stack của Parker.

- Stack: Next.js App Router + TypeScript (`apps/web`) với **shadcn/ui** (Radix + Tailwind v4) và **TanStack** Query, Table, Form và Virtual; NestJS (`apps/api`); MySQL 8 trong Docker Compose; **Prisma** là ORM duy nhất; server-side session cho auth; shared zod schema, type và query key trong `packages/contracts`; component trong `packages/ui`.
- Nguyên tắc: typography first (3.2); không hard-code content, mọi thứ hiện trên UI đều đến từ API/CMS (1.5, 4.5); quyết định backend được giải thích cho backend beginner và build từ dưới lên (1.6, 6).
- Bản sửa v2: sau khi review mockup v1 ("quá trần"), lớp visual được làm dày hơn, lấy [longpham.tech](https://www.longpham.tech/) làm reference: phân tích ở 2.1–2.2, token mới ở 3.1–3.1b, motion ở 3.4, component ở 4.7, wireframe ở 5.1–5.6, phần thêm cho admin ở 5.11, rebuild brief ở 7.
- Source: CV của Parker (đã cũ, ghi "4+ years"; hiện anh có ~5 năm với Vue/Nuxt/TypeScript).
- Privacy: thông tin liên hệ là `<email>` / `<phone>` ở mọi nơi, kể cả seed và fixture. Bản thân file CV không được commit.
- **§ refs:** Heading là `<h2 id="s-N">N. Title</h2>` (chapter) và `<h3 id="s-N-M">N.M Title</h3>` (section; cho phép hậu tố chữ, ví dụ `3.1b`). `§1.5` map tới heading có text bắt đầu bằng `1.5 `, và tới HTML id tường minh `s-1-5` (`s-` + chữ/số, `.` → `-`). Ưu tiên `#s-1-5` hơn GitHub auto-slug, vì auto-slug bỏ dấu chấm (`15-content-model-dbcms`).

---

 

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

 
<h2 id="s-2">2. Hướng design</h2>

> **Trong chương này:** Concept (v2): "Readable release notes, with atmosphere." Interface lấy typography làm trục, Linear-calm, mỗi project đọc như một changelog entry đã edit kỹ: version tag, diff before → after và metadata mono.

| § | Mục |
| --- | --- |
| 2.1 | Phân tích reference: longpham.tech (chụp 1440 và 390, Oct 2026) |
| 2.2 | Cái nào lấy, chỉnh lại, hoặc bỏ cho Parker |


**Concept (v2): "Readable release notes, with atmosphere."** Interface lấy typography làm trục, Linear-calm, mỗi project đọc như một changelog entry đã edit kỹ: version tag, diff before → after và metadata mono. v2 thêm một *lớp atmosphere* nhẹ (surface nhuốm jade, grid có mask, glow mềm, scroll reveal) và loại section giàu hơn (stats, tech marquee, domain card, diagram migration-flow) để page sống mà không hại việc đọc.

- **Typography vẫn là design.** Atmosphere nằm *phía sau* content và không bao giờ nằm dưới body text; page long-form (case study, post) giữ nền trơn phía sau measure 66ch. Recruiter lướt heading và số trong 10 giây; engineer đọc 2.000 từ case study mà không mỏi (mục 3.2).
- **Vì sao release notes:** sợi xuyên suốt của CV là migration (v1 → v2). Motif version và diff biến điều đó thành ngôn ngữ visual, và cùng mức kiềm chế đó scale được sang admin dày đặc.
- **Accent:** jade/teal. Gật đầu với Vue green (gốc của anh) và domain ReFi/carbon của Particula. v2 dùng đậm hơn, nhưng chỉ ở ba chỗ: cụm accent trên hero, số stat, và CTA primary (kèm glow ở dark mode). Mọi chỗ khác giữ tiết chế: link, focus, một highlight mỗi card.
- **Reference:** [longpham.tech](https://www.longpham.tech/) (atmosphere, nhịp section, stats + marquee, domain card, cấu trúc card và page case study; xem 2.1), Linear (mật độ admin, command palette, status pill), Vercel Geist và Stripe docs (type hierarchy, prose, code block), Practical Typography (measure, line-height), changelog Raycast và Linear (entry có version), GitHub diff view.
- **Tone:** tự tin, cụ thể, trầm. Câu ngắn, số thật, không "passionate developer". Motion mang tính functional hoặc ambient-và-chậm, không bao giờ giật mắt, và luôn tắt dưới `prefers-reduced-motion`. Light và dark đều first-class; lớp atmosphere có biến thể light (2.2).

 

<h3 id="s-2-1">2.1 Phân tích reference: longpham.tech (chụp 1440 và 390, Oct 2026)</h3>

**Nó là gì.** Một site Next.js + Tailwind v4 (Geist + Geist Mono), dark-only, nhuốm xanh (`#06110C` background, `#4ADE80` primary), khoảng 5.000px cao trên desktop. Header sticky, rồi: hero → stats band → tech marquee → domain card → principle đánh số → feature split kèm flow diagram → certification card → card case study featured → CTA band → footer tối giản. Page case study và list blog dùng cùng ngôn ngữ card.

**Vì sao nó giàu trong khi bản mình trần (cùng mức kiềm chế, khác mật độ):**

| Thành phần | Reference | Mockup v1 của mình |
| --- | --- | --- |
| Độ sâu surface | Ba surface nhuốm (`background`, `surface`, `surface-2`) + **band** full-width xen kẽ với `border-y` | Một background phẳng, chỉ có card |
| Atmosphere | Pattern grid masked bởi radial gradient dưới hero; 2 **orb** blur lớn nổi (14s / 18s); radial glow sau CTA | Không có |
| Hero | **Kicker pill** kiểu terminal (`>_ Solution Architect · 13+ years`), H1 60px với **cụm accent màu**, button primary có glow, **SVG diagram** animate (node pulse) bên phải | Tên + đoạn văn + card git-log nhỏ |
| Proof nhìn một cái | **Stats band**: 4 số lớn màu primary, ô icon, label mono uppercase | Hai dòng diff trong featured block |
| Độ rộng phủ | **Tech marquee** vô hạn gồm pill mono; **domain card** có ô icon, count ("2 systems"), hue theo domain | Một hàng skill badge |
| Section header | Icon + H2 + subtitle muted một dòng; **eyebrow** mono ("SUMMARY", "SCOPE") trên inner page | H2 trần |
| Card | Category pill theo hue domain, mũi tên góc `↗`, title chuyển primary, lift −2px + border sáng hơn + shadow lúc hover, tech chip mono | Card tĩnh, badge xám |
| Process | Principle đánh số (`01 -` dạng mono); **flow diagram** dọc (Ingest → Core → Guardrails → Action) cạnh feature card 2×2 | Không có |
| Page case study | Back link, pill category + "Confidential", meta grid với label mono, **card key-facts 2×2**, eyebrow mỗi section, bullet ▹ màu primary, requirement card cạnh nhau, **fact chip** mono, "More in <domain>" | Bản cùng cấu trúc nhưng nhạt hơn |
| Motion | `reveal-in` (fade + trượt 16px, 0.5s) mỗi section, orb float, node/ring pulse, icon bob, marquee; tất cả tắt dưới reduced motion | Chỉ hover |
| CTA + footer | CTA band căn giữa, icon sparkle, glow, button primary + outline; footer một dòng mono | Band trần |

**Điểm yếu cần tránh:** dark-only (không có light mode); nhiều text xanh-xám muted 12–14px; placeholder `{{TODO: …}}` hiện trên case study live (cần check lúc publish); animation trang trí (icon bob, ring pulse) chạy mãi; email hiện dạng plain text; page rất dài mà không có in-page navigation; ảnh certification là screenshot PDF.

 

<h3 id="s-2-2">2.2 Cái nào lấy, chỉnh lại, hoặc bỏ cho Parker</h3>

| Ý tưởng | Quyết định | Map sang Parker và constraint của mình thế nào |
| --- | --- | --- |
| Surface nhuốm + band | **Lấy** | Neutral dark nhuốm về jade (3.1); surface `--band` cho section full-width xen kẽ trên Home và About. Light mode có band jade ấm rất nhạt. |
| Grid có mask + orb + glow | **Chỉnh** | Chỉ trên hero home và CTA band, không bao giờ sau prose. Light: grid 6% jade, một orb 10%. Dark: grid 8%, hai orb 18%. Orb nổi chậm (20s / 26s), dừng khi ra khỏi màn và dưới reduced motion. Owner có thể tắt effect (`SiteSettings.ambientEffects`). |
| Kicker pill + cụm accent | **Lấy** | Kicker từ `Profile.heroKicker` (ví dụ `> Senior Frontend · 5 yrs · Vue/Nuxt/TS`); cụm accent từ `Profile.headlineAccent`, `--primary` đặc (không gradient text, để contrast vẫn đo được). |
| Diagram hero | **Chỉnh** | Thay vì architecture graph generic: một **migration diagram** (node `v1 Vue 2` → node `v2 Nuxt 3` với component tree "rewire"), dựng từ `versionFrom`/`versionTo` của project featured + tối đa 6 skill. SVG, CSS-animated, tĩnh dưới reduced motion. |
| Stats band | **Lấy** | Row `ProfileStat`: số năm (compute từ `careerStartDate`), product đã ship (compute từ project đã publish), framework migration, enterprise platform (giá trị seed ở 1.5). Số đếm lên một lần lúc xem lần đầu. |
| Tech marquee | **Chỉnh** | Từ `Skill.showInMarquee`. Pause lúc hover/focus, có button pause nhìn thấy, nửa nhân đôi `aria-hidden`, và trở thành list wrap tĩnh dưới reduced motion. |
| Domain card | **Lấy** | Entity `Domain`: Fintech / Web3 (ReFi), Enterprise platforms (Samsung SDS), E-commerce tooling, Developer experience & testing. Ô icon, hue, số project, mô tả một dòng. |
| Principle đánh số | **Lấy** | Row `Principle` có sẵn, render `01 - Migrate in slices` với số mono. |
| Flow diagram + feature 2×2 | **Chỉnh** | "How I migrate a frontend": row `ProcessStep` (Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over) dạng flow dọc cạnh 4 feature card (từ `Principle`). |
| Certification | **Bỏ** | Parker không có gì để show; slot này thành "Worked with" (team/công ty dạng text chip) chỉ khi có content. |
| Card case study | **Lấy** | Pill theo hue domain, mũi tên `↗`, hover lift, tech chip mono, kèm dòng `DiffStat` của mình (thứ reference thiếu: số). |
| Cấu trúc page case study | **Lấy** | Back link, pill, meta grid, key-facts 2×2, eyebrow, bullet ▹, decision card, fact chip, "More in <domain>". Giữ sticky TOC của mình (reference không có). |
| List blog dạng card | **Chỉnh** | Hàng card với date · minutes mono và chip `#tag`; giữ group theo năm và search. |
| CTA band + footer | **Lấy** | CTA band có glow, button primary "Copy email" (địa chỉ không bao giờ hiện dạng text nhìn thấy) và tối đa 2 button outline từ `SocialLink.showInCta`. Footer giữ một dòng + build hash mono. |
| Dark-only, animation chạy mãi, TODO lọt | **Không lấy** | Light + dark; motion ambient chỉ ở 2 chỗ; validation lúc publish chặn `{{TODO` và field bắt buộc đang trống. |

---

 

<h2 id="s-3">3. Design tokens</h2>

> **Trong chương này:** Token dùng tên biến của shadcn/ui (`--background`, `--primary`, `--muted-foreground`, …) làm lớp semantic, kèm vài extension (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`).

| § | Mục |
| --- | --- |
| 3.1 | Color (semantic, tên shadcn) |
| 3.1b | Atmosphere và hue theo domain (v2) |
| 3.2 | Typography (cốt lõi của design) |
| 3.3 | Spacing, radius, elevation |
| 3.4 | Motion |
| 3.5 | Breakpoints và z-index |
| 3.6 | Theme shadcn: CSS variables (`packages/ui/src/styles/globals.css`) |
| 3.7 | Mapping Tailwind v4 (cùng file, `@theme inline`) |


Token dùng **tên biến của shadcn/ui** (`--background`, `--primary`, `--muted-foreground`, …) làm lớp semantic, kèm vài extension (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`). Một naming scheme nghĩa là component shadcn chạy không sửa, và custom component của mình dùng cùng utility (`bg-primary`, `text-muted-foreground`).

Mọi cặp color bên dưới đã đo bằng công thức relative luminance WCAG 2.x. Text cần ≥ 4.5:1 (normal) và ≥ 3:1 (≥ 24px, hoặc ≥ 18.66px bold). Border input và focus ring cần ≥ 3:1 (SC 1.4.11). Divider trang trí (`--border`) được miễn và không bao giờ là ranh giới duy nhất của một control.

 

<h3 id="s-3-1">3.1 Color (semantic, tên shadcn)</h3>

Thay đổi v2: neutral dark được **nhuốm về jade** (hue ≈ 165°) thay vì gray thuần, cho độ sâu mà không thêm màu. Light giữ warm neutral. Mọi cặp dark đã đo lại.

| Token | Light | Dark (v2) | Dùng cho | Contrast (đã đo, light / dark) |
| --- | --- | --- | --- | --- |
| `--background` / `--foreground` | `#FAFAF9` / `#18181B` | `#0A0F0E` / `#E8EFED` | Page và body text | 16.96 / 16.55 ✅ |
| `--card` / `--card-foreground` | `#FFFFFF` / `#18181B` | `#111817` / `#E8EFED` | Card, input, table | ≥ 16 / ≥ 15 ✅ |
| `--popover` / `--popover-foreground` | `#FFFFFF` / `#18181B` | `#172120` / `#E8EFED` | Menu, dialog, command palette | ≥ 16 / 14.12 ✅ |
| `--band` (ext, v2) | `#F3F5F3` | `#0D1412` | Band section full-width xen kẽ | muted-fg trên band 7.05 / 8.20, subtle 4.82, primary 5.00 ✅ |
| `--muted` | `#F2F2EF` | `#172120` | Code bg, table hover, skeleton base, ô icon | n/a |
| `--muted-foreground` | `#52525B` | `#9DB0AB` | Text phụ | 7.40 bg, 6.89 muted / 8.49 bg, 7.91 card, 7.24 muted ✅ |
| `--subtle-foreground` (ext) | `#6B6B74` | `#809590` | Meta, placeholder, timestamp | 5.05 bg, 4.70 muted / 6.09 bg, 5.67 card, 5.19 muted ✅ |
| `--primary` / `--primary-foreground` | `#0F766E` / `#FFFFFF` | `#2DD4BF` / `#042F2B` | Link, button primary, cụm accent, số stat | primary trên bg 5.24 / 10.37, trên card 5.47 / 9.67; fg trên primary 5.47 / 7.80 ✅ |
| `--primary-hover` (ext) | `#115E59` | `#5EEAD4` | Hover/pressed | white trên nó 7.58 ✅ |
| `--primary-subtle` / `--primary-subtle-foreground` (ext) | `#E3F2EF` / `#115E59` | `#0F2E2B` / `#5EEAD4` | Row selected, tag active, kicker pill | 6.58 / 9.82 ✅ |
| `--secondary`, `--accent` (+ foreground) | `#F2F2EF` / `#18181B` | `#172120` / `#E8EFED` | Button secondary; hover bg của shadcn (không phải brand color) | 15.80 / 14.12 ✅ |
| `--destructive` / `--destructive-foreground` | `#B42318` / `#FFFFFF` | `#F97066` / `#0A0F0E` | Error, action destructive | 6.29 / 6.93; fg trên nó 6.57 / 6.93 ✅ |
| `--success` trên `--success-subtle` (ext) | `#067647` trên `#E6F1EC` | `#47CD89` trên `#1A2F25` | Published, sent | 5.45 bg, 4.92 subtle / 9.53, 7.01 ✅ |
| `--warning` trên `--warning-subtle` (ext) | `#93370D` trên `#F4EBE7` | `#FDB022` trên `#3A2F18` | Warning, thiếu bản dịch | 7.20, 6.40 / 10.49, 7.13 ✅ |
| `--info` trên `--info-subtle` (ext) | `#1D4ED8` trên `#E8EDFB` | `#7AA2F7` trên `#1B2540` | Callout info | 6.42, 5.72 / 7.67, 6.02 ✅ |
| `--destructive-subtle` (ext) | `#F7E9E8` | `#3A1F1F` | Panel error | destructive trên nó 5.56 / 5.40 ✅ |
| `--border` | `#E4E4E0` | `#233230` | Divider, outline card (trang trí) | chỉ trang trí |
| `--border-strong` (ext, v2) | `#CFCFC9` | `#2F4542` | Border card lúc hover, cạnh band | chỉ trang trí (hover còn lift + shadow) |
| `--input` | `#8A8A93` | `#62807A` | Border input, checkbox, switch | 3.42 trên card / 4.19 trên card ✅ |
| `--ring` | `#0F766E` | `#2DD4BF` | Focus ring, 2px + offset 2px | 5.24 / 10.37 ✅ |
| `--chart-1…5` | `#0F766E`, `#1D4ED8`, `#93370D`, `#6B6B74`, `#067647` | `#2DD4BF`, `#7AA2F7`, `#FDB022`, `#809590`, `#47CD89` | Chart, luôn có label | ≥ 3:1 vs bg ✅ |
| Family `--sidebar` | `--sidebar: #F4F4F2`, `--sidebar-accent: #EAEAE6`, `--sidebar-primary: #0F766E`, `--sidebar-border: #E4E4E0` | `--sidebar: #0C1211`, `--sidebar-accent: #172120`, `--sidebar-primary: #2DD4BF`, `--sidebar-border: #233230` | shadcn `Sidebar` (admin) | muted-fg trên sidebar 7.02 / 8.32 ✅ |

Chuyển theme: `next-themes` với `attribute="class"` (mặc định shadcn, `.dark` trên `<html>`), default `system`, `disableTransitionOnChange`. Chọn theme là UI preference, không phải content.

 

<h3 id="s-3-1b">3.1b Atmosphere và hue theo domain (v2)</h3>

**Token atmosphere** (trang trí; không bao giờ mang text, không bao giờ nằm sau body copy):

| Token | Light | Dark | Dùng cho |
| --- | --- | --- | --- |
| `--grid-line` | `rgb(15 118 110 / .06)` | `rgb(45 212 191 / .08)` | Grid 44px trên hero home và CTA band, mask bằng `radial-gradient(80% 60% at 50% 0, #000 40%, transparent)` |
| `--glow` | `rgb(15 118 110 / .10)` | `rgb(45 212 191 / .18)` | Orb (blur 80px) và radial glow sau CTA |
| `--glow-button` | `none` (dùng `--shadow-1`) | `0 0 24px -6px rgb(45 212 191 / .55)` | Button primary trên hero và CTA thôi |
| `--card-glass` | `rgb(255 255 255 / .72)` | `rgb(17 24 23 / .72)` | Card nằm trên grid (+ `backdrop-filter: blur(8px)`); fallback `--card` đặc khi `prefers-reduced-transparency: reduce` hoặc không hỗ trợ `backdrop-filter` |

**Hue theo domain** (cho `Domain.hue`, dùng trên domain card, pill case study và accent cạnh trên của card). Pill luôn hiện icon + text label; hue không bao giờ là cue duy nhất. Tint = hue 10% trên `#FFFFFF` (light) / 14% trên `--card` (dark).

| Hue key | Text / tint light | Text / tint dark | Contrast (text trên tint, light / dark) | Domain gợi ý |
| --- | --- | --- | --- | --- |
| `jade` | `#0F766E` / `#E7F1F1` | `#2DD4BF` / `#15322F` | 4.76 / 7.38 ✅ | Developer experience & testing |
| `amber` | `#8A4B08` / `#F3EDE6` | `#FBBF24` / `#322F19` | 5.85 / 8.08 ✅ | Fintech / Web3 (ReFi) |
| `blue` | `#1D4ED8` / `#E8EDFB` | `#7AA2F7` / `#202B36` | 5.72 / 5.71 ✅ | Enterprise platforms |
| `violet` | `#6D28D9` / `#F0EAFB` | `#C4B5FD` / `#2A2E37` | 6.04 / 7.37 ✅ | E-commerce tooling |
| `rose` | `#B4235A` / `#F8E9EF` | `#FDA4C4` / `#322C2F` | 5.38 / 7.34 ✅ | Dự phòng (ví dụ "This portfolio") |

 

<h3 id="s-3-2">3.2 Typography (cốt lõi của design)</h3>

**Mục tiêu, theo thứ tự:** (1) mọi dấu tiếng Việt render sạch ở mọi size, (2) case study và note long-form đọc thoải mái 10+ phút, (3) hierarchy rõ với ít size, (4) code không mơ hồ.

**Family (3, mỗi cái một việc).**

| Vai trò | Family | Weight được load | Vì sao |
| --- | --- | --- | --- |
| Heading (H1–H3 public) | **Be Vietnam Pro** | 600, 700 | Thiết kế tại Việt Nam cho tiếng Việt: dấu như `ế ộ ữ ẳ` được vẽ như một phần của chữ, không chồng, nên heading vẫn sắc. Hơi rộng hơn Inter, giúp contrast heading/body |
| Body và toàn bộ UI (kể cả admin) | **Inter** | 400, 500, 600 (variable) | Đủ subset `vietnamese`, x-height cao, rất dễ đọc ở 14–18px, tabular figure (`tnum`) cho metric và table, character variant `cv05` (`l` có đuôi) và `cv08` (`I` có serif) để `Il1` không bao giờ giống nhau |
| Code, version tag, kbd | **JetBrains Mono** | 400, 600 | Có subset `vietnamese` (comment code vi render được), x-height cao, `0/O`, `1/l/I` rõ. Ligature **tắt** (`font-variant-ligatures: none`) để `!==` và `=>` trông đúng như lúc gõ |

Load bằng `next/font/google`, `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`, `adjustFontFallback` bật (fallback khớp metric, không layout shift). Expose thành `--font-heading`, `--font-sans`, `--font-mono`. Không load gì khác; tổng ≤ 5 file font.

**Scale: 8 size public (mỗi cái một việc), 3 size admin.** v2 thêm `text-display` (chỉ hero home) và `text-eyebrow` (chỉ label mono). Hierarchy dùng size *và* weight *và* space; đừng thêm size, hãy đổi weight hoặc spacing.

| Token | Size (mobile → desktop) | Line-height | Weight · family | Dùng cho |
| --- | --- | --- | --- | --- |
| `text-display` (v2) | 40px → 64px (`clamp(2.5rem, 1.5rem + 4vw, 4rem)`) | 1.1 en / 1.2 vi | 700 · heading, `-0.02em` | Chỉ H1 hero home (kèm cụm accent) |
| `text-title` | 34px → 48px (`clamp(2.125rem, 1.6rem + 2.2vw, 3rem)`) | 1.2 (1.25 cho vi) | 700 · heading | H1 page, số stat, H2 CTA band |
| `text-heading` | 26px → 30px | 1.3 | 600 · heading | H2 (section, markdown `##`) |
| `text-subheading` | 20px | 1.4 | 600 · heading | H3, title card, markdown `###` |
| `text-prose` | 18px | 1.75 | 400 · sans | Long-form: case study, note, bio, sub-line hero |
| `text-body` | 16px | 1.6 | 400/500 · sans | UI và copy ngắn, mô tả card |
| `text-meta` | 14px | 1.5 | 500 · sans (mono cho date, version, chip) | Meta, caption, tag, chip |
| `text-eyebrow` (v2) | 12px | 1.4 | 500 · mono, uppercase, tracking `0.08em`, `--primary` hoặc `--subtle-foreground` | Eyebrow ("CASE STUDY", "OUTCOME"), label stat. Tối đa 4 từ; không bao giờ thành câu |
| admin `text-ui-title` | 20px | 1.4 | 600 · sans | Title page admin |
| admin `text-ui` | 14px | 1.5 | 400/500 · sans | Toàn bộ UI admin, table, input |
| admin `text-ui-meta` | 12.5px | 1.4 | 500 · sans | Timestamp, count, kbd |

Markdown `####` trở xuống render thành `text-prose` 600 (không size mới). Post và case study bắt đầu từ `##`; title page là H1 duy nhất.

**Rule long-form (component `Prose`).**
- **Measure:** max `66ch` (≈ 680px ở Inter 18px); không bao giờ rộng hơn 75ch, không bao giờ hẹp hơn 45ch trên mobile (padding page 20px).
- **Spacing:** paragraph cách `1.1em`; `##` nhận `2.2em` trên và `0.6em` dưới; `###` `1.6em` / `0.5em`. Space trên heading luôn lớn hơn dưới, để nó dính với content của chính nó.
- **List:** `0.4em` giữa item, bullet treo (`padding-inline-start: 1.25em`).
- **Link:** `--primary`, underline luôn bật trong prose (`text-underline-offset: 0.2em`, `text-decoration-thickness: 1px`, 2px lúc hover). Color không bao giờ là cue duy nhất.
- **Emphasis:** bold 600, italic là italic thật; không paragraph ALL CAPS.
- **Number:** `font-variant-numeric: tabular-nums` trong metric, table và date.
- **Quote và callout:** border trái 3px, cùng size với body, text `--muted-foreground`; không pull quote oversized.
- **Image:** rộng bằng measure, caption `text-meta` phía dưới.

**Code.**
- Block: JetBrains Mono 15px (`0.875em` của prose 17–18px), line-height 1.65, background `--muted`, `rounded-lg` (8px), padding 16px, thanh filename optional, scroll ngang (vùng focusable với `aria-label`), toggle wrap. Max width thiết kế ~80 character. Shiki với theme light và dark chỉnh theo palette (comment dùng `--subtle-foreground`, ≥ 4.5:1).
- Inline: `0.9em`, background `--muted`, padding 0.15em × 0.35em, `rounded-sm` (4px), không đổi màu.

**An toàn tiếng Việt.**
- Line-height không bao giờ dưới 1.2 (heading) hoặc 1.5 (text UI); dấu chồng (`Ỗ`, `ặ`) bị cắt nếu thấp hơn.
- Letter-spacing ≥ `-0.015em` trên heading, `0` trên body; không bao giờ track body text tiếng Việt.
- Mọi container `overflow: hidden` hoặc `line-clamp` nhận `padding-block: 0.15em` để dấu trên và dưới không bị cắt.
- `lang` được set trên `<html>` theo locale, và trên mọi element hiện English fallback trong page vi.
- Chuỗi vi dài hơn ~10–15%: button, nav và table header phải chứa được vi ở 360px mà không truncate.
- Chuỗi QA dùng trong mọi type story: `Hưởng ứng - Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`.

 

<h3 id="s-3-3">3.3 Spacing, radius, elevation</h3>

| Spacing | `0` 0 · `0.5` 2px · `1` 4px · `1.5` 6px · `2` 8px · `3` 12px · `4` 16px · `5` 20px · `6` 24px · `8` 32px · `10` 40px · `12` 48px · `16` 64px · `24` 96px · `32` 128px (base 4px) |
| --- | --- |
| Radius (shadcn, từ `--radius: 0.5rem`) | `rounded-sm` 4px (badge, kbd, inline code) · `rounded-md` 6px (input, button) · `rounded-lg` 8px (card, menu, code block) · `rounded-xl` 12px (dialog, media) · `rounded-full` (avatar, pill) |
| Chiều cao control | public 40px (touch target 44px trên mobile) · admin 32px mặc định, 28px compact; icon button 32/28 với hit area 44px trên touch |

| Elevation | Light | Dark | Dùng cho |
| --- | --- | --- | --- |
| `--shadow-0` | none | none | Phẳng (hầu hết surface; dùng border) |
| `--shadow-1` | `0 1px 2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .06)` | Header sticky, card resting trên band |
| `--shadow-2` | `0 4px 12px -2px rgb(16 24 40 / .10), 0 2px 4px -2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .08), 0 8px 24px rgb(0 0 0 / .5)` | Popover, dropdown, toast, card hover (v2) |
| `--shadow-3` | `0 16px 40px -8px rgb(16 24 40 / .18)` | `0 0 0 1px rgb(255 255 255 / .10), 0 24px 48px rgb(0 0 0 / .6)` | Dialog, command palette |

Dark mode thể hiện elevation bằng surface sáng hơn kèm hairline trong 1px, không phải chỉ bằng shadow.

 

<h3 id="s-3-4">3.4 Motion</h3>

| Token | Value | Dùng cho |
| --- | --- | --- |
| `--dur-instant` | 80ms | Press, tick checkbox |
| `--dur-fast` | 140ms | Hover, color, focus |
| `--dur-base` | 200ms | Menu, tooltip, toast in |
| `--dur-slow` | 320ms | Dialog, sheet, reveal section page |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Leaving (dùng duration 0.75×) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moving/reordering |

Rule (v2):

- Chỉ animate `opacity` và `transform` (kèm `box-shadow`/`border-color` lúc hover). Không scroll-jacking, không parallax gắn vị trí scroll, không effect cursor-follow.
- Mọi effect dưới đây là CSS-only trừ reveal và count-up, dùng một hook `IntersectionObserver` dùng chung (`useInView`, `once: true`). Không animation library.
- Animation ambient chạy **chỉ** trên hero home và CTA band, pause khi ra khỏi màn (`animation-play-state: paused` qua cùng observer) và khi tab bị ẩn.

| Effect | Ở đâu | Spec | Fallback reduced-motion |
| --- | --- | --- | --- |
| Section reveal | Section Home và About, key-facts case study, grid card | `opacity 0 → 1`, `translateY(12px) → 0`, `--dur-slow` (320ms) `--ease-out`, một lần, khi 15% visible. Grid stagger 60ms mỗi item, tối đa 6 item (item sau hiện cùng item thứ 6) | Content hiện ngay, không transform |
| Card hover / focus-within | Card project, domain, post | Border → `--border-strong`, `translateY(-2px)`, `--shadow-2`, title → `--primary`, mũi tên `↗` dịch 2px lên-phải; `--dur-fast` | Chỉ đổi color và border, không lift |
| Button hover | Button primary | Background → `--primary-hover`; ở dark hero/CTA thì `--glow-button` cũng đậm hơn | Giống vậy, không đổi glow |
| Orb | Hero (2), CTA (1) | Hình tròn 320–420px của `--glow`, `filter: blur(80px)`, nổi ±24px trong 20s / 26s `ease-in-out infinite` | Tĩnh, cùng vị trí |
| Migration diagram hero | Hero home | Node fade in theo thứ tự (stagger 60ms), stroke connector vẽ một lần (`stroke-dashoffset`, 900ms), rồi node "pulse" opacity .6 ↔ 1 mỗi 3s chỉ trên node active (`v2`) | Vẽ đủ, không pulse |
| Stat count-up | Stats band | Số đếm từ 0 tới value một lần, 700ms `--ease-out`, `tabular-nums` để width không nhảy; giá trị thật nằm trong DOM từ đầu (`aria-label` = giá trị cuối) | Hiện giá trị cuối |
| Tech marquee | Dưới stats | Hai track giống nhau translate −50% trong 40s linear infinite; pause lúc hover và keyboard focus; button pause/play nhìn thấy (`aria-pressed`); track thứ hai `aria-hidden` | Một list chip tĩnh, wrap |
| Theme switch | Global | Không transition (`disableTransitionOnChange`) | n/a |
| Route transition | List project ↔ case study | View Transitions API: morph ảnh cover, 320ms | Instant |

- Không bao giờ animate: body text, prose, code, table row, UI admin (admin chỉ giữ transition menu/dialog/toast từ shadcn).
- `@media (prefers-reduced-motion: reduce)`: mọi effect trên fallback như đã liệt kê; duration → `0.01ms` trừ fade opacity ở `--dur-fast`; timeline render bung hết.
- `@media (prefers-reduced-transparency: reduce)`: `--card-glass` → `--card` đặc, ẩn orb.

 

<h3 id="s-3-5">3.5 Breakpoints và z-index</h3>

| Breakpoint | Min width | Layout |
| --- | --- | --- |
| `base` | 0 | Grid 4-col, gutter 16px, padding page 20px |
| `sm` | 640px | 4-col, type lớn hơn |
| `md` | 768px | 8-col, gutter 24px; sidebar admin thành rail |
| `lg` | 1024px | 12-col, gutter 32px; sidebar admin full |
| `xl` | 1280px | Container cap 1120px (public) |
| `2xl` | 1536px | Editor admin hiện 3 pane |

| Token z-index | Value | Dùng cho |
| --- | --- | --- |
| `--z-base` | 0 | Content |
| `--z-raised` | 10 | Header table sticky, TOC sticky |
| `--z-header` | 100 | Header site, topbar admin |
| `--z-sidebar` | 200 | Sidebar admin mobile |
| `--z-dropdown` | 300 | Menu, combobox, tooltip |
| `--z-overlay` | 400 | Backdrop dialog/sheet |
| `--z-modal` | 500 | Dialog, sheet, command palette |
| `--z-toast` | 600 | Toast, notification realtime |
| `--z-skip` | 700 | Skip link (khi focus) |

 

<h3 id="s-3-6">3.6 Theme shadcn: CSS variables (`packages/ui/src/styles/globals.css`)</h3>

shadcn/ui (Tailwind v4, style `new-york`, `baseColor: neutral`, `cssVariables: true`) được init trong `packages/ui` với setup monorepo (`components.json` ở cả `packages/ui` và `apps/web`). `globals.css` được generate sẽ bị thay bằng block dưới; component shadcn lúc đó nhận palette của mình mà không sửa màu từng component. Dùng hex thay OKLCH mặc định của shadcn để giá trị khớp đúng bảng contrast.

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
 --radius: 0.5rem;

 --background: #FAFAF9; --foreground: #18181B;
 --card: #FFFFFF; --card-foreground: #18181B;
 --popover: #FFFFFF; --popover-foreground: #18181B;
 --primary: #0F766E; --primary-foreground: #FFFFFF;
 --secondary: #F2F2EF; --secondary-foreground: #18181B;
 --muted: #F2F2EF; --muted-foreground: #52525B;
 --accent: #F2F2EF; --accent-foreground: #18181B;
 --destructive: #B42318; --destructive-foreground: #FFFFFF;
 --border: #E4E4E0; --input: #8A8A93; --ring: #0F766E;
 --chart-1: #0F766E; --chart-2: #1D4ED8; --chart-3: #93370D; --chart-4: #6B6B74; --chart-5: #067647;
 --sidebar: #F4F4F2; --sidebar-foreground: #18181B;
 --sidebar-primary: #0F766E; --sidebar-primary-foreground: #FFFFFF;
 --sidebar-accent: #EAEAE6; --sidebar-accent-foreground: #18181B;
 --sidebar-border: #E4E4E0; --sidebar-ring: #0F766E;

 /* extensions */
 --subtle-foreground: #6B6B74;
 --primary-hover: #115E59;
 --primary-subtle: #E3F2EF; --primary-subtle-foreground: #115E59;
 --success: #067647; --success-subtle: #E6F1EC;
 --warning: #93370D; --warning-subtle: #F4EBE7;
 --info: #1D4ED8; --info-subtle: #E8EDFB;
 --destructive-subtle: #F7E9E8;

 /* v2: bands, atmosphere, domain hues */
 --band: #F3F5F3; --border-strong: #CFCFC9;
 --grid-line: rgb(15 118 110 / .06); --glow: rgb(15 118 110 / .10);
 --glow-button: var(--shadow-1); --card-glass: rgb(255 255 255 / .72);
 --hue-jade: #0F766E; --hue-jade-subtle: #E7F1F1;
 --hue-amber: #8A4B08; --hue-amber-subtle: #F3EDE6;
 --hue-blue: #1D4ED8; --hue-blue-subtle: #E8EDFB;
 --hue-violet: #6D28D9; --hue-violet-subtle: #F0EAFB;
 --hue-rose: #B4235A; --hue-rose-subtle: #F8E9EF;

 --shadow-1: 0 1px 2px rgb(16 24 40 / .06);
 --shadow-2: 0 4px 12px -2px rgb(16 24 40 / .10), 0 2px 4px -2px rgb(16 24 40 / .06);
 --shadow-3: 0 16px 40px -8px rgb(16 24 40 / .18);

 --dur-instant: 80ms; --dur-fast: 140ms; --dur-base: 200ms; --dur-slow: 320ms;
 --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
 --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
 --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

 --z-raised: 10; --z-header: 100; --z-sidebar: 200; --z-dropdown: 300;
 --z-overlay: 400; --z-modal: 500; --z-toast: 600; --z-skip: 700;

 --container: 1120px; --measure: 66ch;
}

.dark {
 --background: #0A0F0E; --foreground: #E8EFED;
 --card: #111817; --card-foreground: #E8EFED;
 --popover: #172120; --popover-foreground: #E8EFED;
 --primary: #2DD4BF; --primary-foreground: #042F2B;
 --secondary: #172120; --secondary-foreground: #E8EFED;
 --muted: #172120; --muted-foreground: #9DB0AB;
 --accent: #172120; --accent-foreground: #E8EFED;
 --destructive: #F97066; --destructive-foreground: #0A0F0E;
 --border: #233230; --input: #62807A; --ring: #2DD4BF;
 --chart-1: #2DD4BF; --chart-2: #7AA2F7; --chart-3: #FDB022; --chart-4: #809590; --chart-5: #47CD89;
 --sidebar: #0C1211; --sidebar-foreground: #E8EFED;
 --sidebar-primary: #2DD4BF; --sidebar-primary-foreground: #042F2B;
 --sidebar-accent: #172120; --sidebar-accent-foreground: #E8EFED;
 --sidebar-border: #233230; --sidebar-ring: #2DD4BF;

 --subtle-foreground: #809590;
 --primary-hover: #5EEAD4;
 --primary-subtle: #0F2E2B; --primary-subtle-foreground: #5EEAD4;
 --success: #47CD89; --success-subtle: #1A2F25;
 --warning: #FDB022; --warning-subtle: #3A2F18;
 --info: #7AA2F7; --info-subtle: #1B2540;
 --destructive-subtle: #3A1F1F;

 --band: #0D1412; --border-strong: #2F4542;
 --grid-line: rgb(45 212 191 / .08); --glow: rgb(45 212 191 / .18);
 --glow-button: 0 0 24px -6px rgb(45 212 191 / .55); --card-glass: rgb(17 24 23 / .72);
 --hue-jade: #2DD4BF; --hue-jade-subtle: #15322F;
 --hue-amber: #FBBF24; --hue-amber-subtle: #322F19;
 --hue-blue: #7AA2F7; --hue-blue-subtle: #202B36;
 --hue-violet: #C4B5FD; --hue-violet-subtle: #2A2E37;
 --hue-rose: #FDA4C4; --hue-rose-subtle: #322C2F;

 --shadow-1: 0 0 0 1px rgb(255 255 255 / .06);
 --shadow-2: 0 0 0 1px rgb(255 255 255 / .08), 0 8px 24px rgb(0 0 0 / .5);
 --shadow-3: 0 0 0 1px rgb(255 255 255 / .10), 0 24px 48px rgb(0 0 0 / .6);
}

@media (prefers-reduced-motion: reduce) {
 :root { --dur-instant: 0.01ms; --dur-base: 0.01ms; --dur-slow: 0.01ms; }
 *, *::before, *::after { scroll-behavior: auto !important; }
 .marquee-track, .orb, .diagram-pulse { animation: none !important; }
}

@media (prefers-reduced-transparency: reduce) {
 :root, .dark { --card-glass: var(--card); }
 .orb { display: none; }
}
```

 

<h3 id="s-3-7">3.7 Mapping Tailwind v4 (cùng file, `@theme inline`)</h3>

`@theme inline` biến mọi variable thành utility theo theme đang active: `bg-background`, `text-muted-foreground`, `text-subtle-foreground`, `bg-primary-subtle`, `border-input`, `ring-ring`, `rounded-lg`, `shadow-2`, `font-heading`, `text-prose`, `bg-band`, `border-border-strong`, `bg-hue-amber-subtle text-hue-amber`, `text-display`, `text-eyebrow`, `z-modal`, `duration-base`, `ease-out`.

```css
@theme inline {
 --color-background: var(--background); --color-foreground: var(--foreground);
 --color-card: var(--card); --color-card-foreground: var(--card-foreground);
 --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
 --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
 --color-primary-hover: var(--primary-hover);
 --color-primary-subtle: var(--primary-subtle);
 --color-primary-subtle-foreground: var(--primary-subtle-foreground);
 --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
 --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
 --color-subtle-foreground: var(--subtle-foreground);
 --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
 --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
 --color-destructive-subtle: var(--destructive-subtle);
 --color-success: var(--success); --color-success-subtle: var(--success-subtle);
 --color-warning: var(--warning); --color-warning-subtle: var(--warning-subtle);
 --color-info: var(--info); --color-info-subtle: var(--info-subtle);
 --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
 --color-band: var(--band); --color-border-strong: var(--border-strong);
 --color-card-glass: var(--card-glass);
 --color-hue-jade: var(--hue-jade); --color-hue-jade-subtle: var(--hue-jade-subtle);
 --color-hue-amber: var(--hue-amber); --color-hue-amber-subtle: var(--hue-amber-subtle);
 --color-hue-blue: var(--hue-blue); --color-hue-blue-subtle: var(--hue-blue-subtle);
 --color-hue-violet: var(--hue-violet); --color-hue-violet-subtle: var(--hue-violet-subtle);
 --color-hue-rose: var(--hue-rose); --color-hue-rose-subtle: var(--hue-rose-subtle);
 --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);
 --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);
 --color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground);
 --color-sidebar-primary: var(--sidebar-primary); --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
 --color-sidebar-accent: var(--sidebar-accent); --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
 --color-sidebar-border: var(--sidebar-border); --color-sidebar-ring: var(--sidebar-ring);

 --radius-sm: calc(var(--radius) - 4px); /* 4px badges, kbd, inline code */
 --radius-md: calc(var(--radius) - 2px); /* 6px buttons, inputs */
 --radius-lg: var(--radius); /* 8px cards, menus, code blocks */
 --radius-xl: calc(var(--radius) + 4px); /* 12px dialogs, media */

 --font-heading: var(--font-be-vietnam-pro), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
 --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
 --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;

 --text-display: clamp(2.5rem, 1.5rem + 4vw, 4rem); --text-display--line-height: 1.1;
 --text-title: clamp(2.125rem, 1.6rem + 2.2vw, 3rem); --text-title--line-height: 1.2;
 --text-heading: clamp(1.625rem, 1.5rem + 0.5vw, 1.875rem); --text-heading--line-height: 1.3;
 --text-subheading: 1.25rem; --text-subheading--line-height: 1.4;
 --text-prose: 1.125rem; --text-prose--line-height: 1.75;
 --text-body: 1rem; --text-body--line-height: 1.6;
 --text-meta: 0.875rem; --text-meta--line-height: 1.5;
 --text-eyebrow: 0.75rem; --text-eyebrow--line-height: 1.4; --text-eyebrow--letter-spacing: 0.08em;
 --text-ui-title: 1.25rem; --text-ui-title--line-height: 1.4;
 --text-ui: 0.875rem; --text-ui--line-height: 1.5;
 --text-ui-meta: 0.78125rem; --text-ui-meta--line-height: 1.4;

 --shadow-1: var(--shadow-1); --shadow-2: var(--shadow-2); --shadow-3: var(--shadow-3);
 --shadow-glow: var(--glow-button);
 --ease-out: var(--ease-out); --ease-in: var(--ease-in); --ease-in-out: var(--ease-in-out);
 --z-index-raised: var(--z-raised); --z-index-header: var(--z-header); --z-index-sidebar: var(--z-sidebar);
 --z-index-dropdown: var(--z-dropdown); --z-index-overlay: var(--z-overlay);
 --z-index-modal: var(--z-modal); --z-index-toast: var(--z-toast); --z-index-skip: var(--z-skip);

 --breakpoint-sm: 40rem; --breakpoint-md: 48rem; --breakpoint-lg: 64rem;
 --breakpoint-xl: 80rem; --breakpoint-2xl: 96rem;
}

@layer base {
 * { @apply border-border outline-ring/50; }
 body { @apply bg-background text-foreground font-sans text-body antialiased; font-feature-settings: "cv05", "cv08"; }
 h1, h2, h3 { @apply font-heading; letter-spacing: -0.015em; }
 :lang(vi) .text-display { line-height: 1.2; }
 code, kbd, pre { font-variant-ligatures: none; }
 :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
}
```

Size mặc định của Tailwind vẫn dùng được vì component shadcn dùng `text-sm` (14px, bằng `text-ui` / `text-meta`) và `text-xs` (12px, badge và kbd). App code và product component chỉ được dùng 11 size có tên (8 public + 3 admin); một lint rule gắn cờ `text-(xs|sm|base|lg|xl|[2-9]xl)` bên ngoài `components/ui/`, nên size public thứ 9 không lọt được. Component không bao giờ dùng class palette thô (`teal-700`); `eslint-plugin-tailwindcss` với allowlist enforce điều này.

---

<h2 id="s-4">4. Components và layout</h2>

> **Trong chương này:** Primitive là shadcn/ui (behavior của Radix, token của mình) như list ở 4.0; product component compose chúng.

| § | Mục |
| --- | --- |
| 4.0 | Base layer: shadcn/ui + TanStack |
| 4.1 | Primitive contract: variant, state, a11y (`packages/ui`) |
| 4.2 | Public site |
| 4.3 | Admin (kiểu Linear) |
| 4.4 | Layout và quy tắc grid |
| 4.5 | UI data-driven: không hard-code content |
| 4.6 | Data fetching: Next App Router + TanStack Query |
| 4.7 | Component rich-layer (v2) |


Primitive là shadcn/ui (behavior của Radix, token của mình) như list ở 4.0; product component compose chúng. Mọi component interactive đều có `default / hover / focus-visible / active / disabled` kèm các state thêm được liệt kê, và một story Storybook hoặc Ladle cho từng state (light + dark).

 

<h3 id="s-4-0">4.0 Base layer: shadcn/ui + TanStack</h3>

Primitive là component **shadcn/ui** (Radix UI + Tailwind), copy vào `packages/ui/src/components/ui/*` bằng `pnpm dlx shadcn@latest add …` và mình chịu trách nhiệm phần source đó. Behavior và a11y lấy từ Radix; styling lấy từ token ở section 3. Product component (`ProjectCard`, `Timeline`, `DataTable`, …) nằm ở `packages/ui/src/components/*` và compose các component shadcn. TanStack lo data layer: **Query** (server state gọi Nest API), **Table** (admin table, headless), **Form** (contact form và admin editor, dùng zod qua Standard Schema), **Virtual** (chỉ list dài).

| shadcn component | Dùng cho | Custom |
| --- | --- | --- |
| `button`, `button-group` | Mọi action | Size `sm 28`, `default 32`, `lg 40`; thêm prop `loading` (giữ width, `aria-busy`, `spinner`); variant `link` gạch chân |
| `input`, `textarea`, `input-group`, `label`, `field` | Mọi form | `field` (không phụ thuộc library) wrap field TanStack Form: `FieldLabel`, `FieldDescription`, `FieldError` wire vào `aria-describedby` / `aria-invalid`. **Không** dùng `form` dựa trên RHF của shadcn |
| `select`, `checkbox`, `radio-group`, `switch`, `toggle-group` | Input, locale switch, period picker (7d/30d/90d) | không |
| `popover` + `command` | Combobox, multi-select tag/skill (recipe combobox của shadcn), palette `⌘K` (`command` trong `dialog`) | Option creatable cho tag |
| `calendar` + `popover` | Date picker (ngày experience, ngày publish) | Mode precision theo tháng cho experience |
| `dialog`, `alert-dialog`, `sheet`, `drawer` | Modal, confirm xóa, mobile nav, admin property trên mobile | `alert-dialog` cho destructive; `drawer` (vaul) chỉ trên mobile |
| `dropdown-menu`, `context-menu` | Row action, user menu, theme menu | Gợi ý shortcut bằng `kbd` |
| `tabs` | Tab locale admin (EN/VI), editor Write/Preview | Dot completeness trên từng tab |
| `table` | Markup nền cho TanStack Table | Density `compact 32` / `default 40`, sticky header |
| `pagination` | List notes public, admin table | Admin dùng prev/next + page size |
| `badge` | Tag, status, base của `VersionTag` | Variant `neutral`, `primary`, `success`, `warning`, `destructive`, `info`; `subtle` / `outline` |
| `card` | Project card, stat card, settings group | Flat (`--shadow-0`), hover `--shadow-1` trên link |
| `skeleton` | Mọi loading state | Tắt shimmer khi reduced motion |
| `empty` | Mọi empty state | Icon + một dòng + action |
| `alert` | Error state inline, NDA callout, warning "missing translation" | Variant `info`, `warning`, `destructive` |
| `sonner` | Toast, realtime notification | Theo theme; `role="status"`; error dùng `role="alert"` |
| `tooltip`, `kbd` | Icon button, gợi ý shortcut | Delay 500ms |
| `sidebar` | Admin shell | Collapse được thành icon rail (`collapsible="icon"`), `[` để toggle |
| `breadcrumb`, `separator`, `avatar`, `scroll-area` | Admin topbar, case-study header, media grid | không |
| `navigation-menu` | Public header (desktop) | Link thường, không mega-menu |
| `accordion`, `collapsible` | Timeline highlight, TOC mobile, settings kiểu FAQ | Mở sẵn khi reduced motion |
| `progress` | Upload progress | Kèm text phần trăm |
| `chart` (Recharts) | Area chart dashboard, sparkline | Dùng `--chart-*`; data table ẩn cho screen reader |
| `resizable` | Split editor admin (write / preview) | Handle resize được bằng bàn phím |
| `spinner` | Loading của button, indicator background refetch | không |

Không lấy từ shadcn (custom, build trên các primitive ở trên): `Prose`, `CodeBlock` (Shiki), `MarkdownEditor` (CodeMirror 6), `Timeline`, `DiffStat`, `VersionTag`, `StatusPill`, `SaveStatus`, `SectionBoundary`, `DataTable` (TanStack Table + shadcn `table`), `MediaLibrary`.

 

<h3 id="s-4-1">4.1 Primitive contract: variant, state, a11y (`packages/ui`)</h3>

| Component | Variant | State thêm | A11y |
| --- | --- | --- | --- |
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `link`; size `sm 28`, `md 32`, `lg 40`; `icon` | `loading` (spinner, giữ width, `aria-busy`) | `<button>` luôn có; icon-only cần `aria-label`; disabled dùng `aria-disabled` khi vẫn phải focus được vì tooltip |
| `Input`, `Textarea` | `md`, `lg`; có icon prefix/suffix | `invalid`, `readOnly` | `<label for>`; error qua `aria-describedby` + `aria-invalid`; không bao giờ lấy placeholder làm label |
| `Select`, `Combobox`, `MultiCombobox` (tag) | single, multi, creatable | `loading`, `empty` | Pattern ARIA combobox, typeahead, `Esc` đóng và trả focus |
| `Checkbox`, `Radio`, `Switch` | sm, md | `indeterminate` (checkbox) | Input native bên dưới; switch dùng `role="switch"` |
| `Badge` / `Tag` | `neutral`, `accent`, `success`, `warning`, `danger`; `solid` / `subtle` / `outline` | removable (tag) | Status không bao giờ chỉ dựa vào màu: luôn có text label |
| `VersionTag` | `from`, `to` (render `v1 → v2`) | n/a | Font mono; mũi tên có `aria-label="to"` |
| `Kbd` | sm | n/a | `<kbd>`; shortcut cũng được list trong help dialog |
| `Tooltip` | top/right/bottom/left | n/a | Chỉ bổ sung, mở cả khi focus, delay 500ms, `Esc` để dismiss |
| `Dialog`, `ConfirmDialog`, `Sheet` | `sm 400`, `md 560`, `lg 720`; sheet right/bottom | `submitting` | Focus trap, trả focus về trigger, `aria-labelledby`; confirm destructive khi xóa phải gõ đúng slug |
| `DropdownMenu`, `ContextMenu` | có icon, shortcut, submenu | item `checked` | Roving tabindex, phím mũi tên, typeahead |
| `Tabs` | `underline`, `pill` | n/a | Pattern `tablist`; sync URL ở admin |
| `Toast` | `info`, `success`, `warning`, `danger`, `action` | stacked, pause khi hover | `role="status"` (polite) / `role="alert"` chỉ cho error; ≥ 5s, pause khi focus |
| `CommandPalette` (`⌘K` / `Ctrl K`) | public (nav, theme, locale, search post) / admin (create, jump, action) | `loading`, `empty` | Dialog + listbox; kết quả announce qua live region |
| `Skeleton`, `EmptyState`, `ErrorState` | inline, block, page | retry | Skeleton `aria-hidden`; container `aria-busy="true"`; error có nút retry và request id |
| `Avatar` | 24/32/40/96 | fallback initials | `alt` = tên, hoặc rỗng khi decorative |
| `Prose` | `prose` (long-form), `compact` (excerpt) | n/a | Áp rule long-form ở 3.2 lên output markdown: heading có anchor link, table scroll trong region focus được |
| `CodeBlock` | có filename, line highlight, diff (`+`/`-`) | copied | Nút copy có confirmation `aria-live`; Shiki lúc build, cả hai theme |

 

<h3 id="s-4-2">4.2 Public site</h3>

| Component | Ghi chú |
| --- | --- |
| `SkipLink` | Focusable đầu tiên, nhảy tới `<main id="content">` |
| `SiteHeader` | Logo wordmark, nav từ row `NavItem` (seed: Work, About, Notes, Contact), nút `⌘K`, `LocaleSwitch`, `ThemeToggle`. Sticky, `--background` mờ 80% + backdrop blur, `--shadow-1` sau khi scroll. Mobile: nút menu mở `Sheet` full-height |
| `LocaleSwitch` | Segmented `VI / EN`; link sang cùng page ở locale kia (hoặc index của locale đó nếu thiếu), set `hreflang` |
| `ThemeToggle` | Menu light / dark / system; `aria-pressed` trên option đang active |
| `Hero` | Tên, headline, sub-line, 2 CTA (View work, Contact), availability badge |
| `MetricStat` / `DiffStat` | Value + label; variant diff hiện `before → after` bằng mono với gutter `+/-` giống một diff row. Số dùng `tnum` |
| `ProjectCard` | Cover (16:10), title, tagline, client, period, `VersionTag`, 3 tech tag; cả card là một link (title là link, card dùng `::after` stretch), hover `--shadow-1` và cover scale 1.02 (không scale khi reduced motion). `confidential` hiện cover dạng diagram + badge NDA |
| `Timeline` / `TimelineItem` | Rail dọc, company, role, dates (`Feb 2024 - now`), phase nested, highlight, tech tag. `<ol>` với `<time datetime>` |
| `SkillGroup` | Group theo `depth` (Daily / Shipped / Growing), không phải progress bar |
| `CaseStudyHeader` | Breadcrumb, title, tagline, meta grid (client, role, team, period, stack), cover |
| `SectionNav` (TOC) | Sticky trên `lg+`, scroll-spy với `aria-current="true"`; collapse thành `<details>` trên mobile |
| `PostCard`, `PostMeta` | Title, excerpt, date, reading time, tag |
| `SearchField` + `TagFilter` | Search là form `role="search"`, debounce 200ms, sync URL (`?q=&tag=`), số kết quả trong live region |
| `Pagination` | Prev/next + số trang, `nav aria-label="Pagination"` |
| `ContactForm` | Name, email, subject (select), message, honeypot, submit; validate inline lúc blur, summary lúc submit; success thì thay form bằng status panel |
| `SiteFooter` | Social link, RSS, "Built with Next.js + NestJS, source on GitHub", hash deploy cuối cùng bằng mono |
| `OgImage` | Template route handler: 1200×630, `--background` dark, title bằng Be Vietnam Pro, `VersionTag`, tên + domain |

 

<h3 id="s-4-3">4.3 Admin (kiểu Linear)</h3>

| Component | Ghi chú |
| --- | --- |
| `AppShell` | Sidebar 240px (collapse được thành rail 56px, `[` để toggle), topbar 48px, content. Mobile: sidebar là `Sheet` |
| `Sidebar` | Workspace switcher (Parker), search (`⌘K`), group: Dashboard, Inbox (số unread); Content: Projects, Posts, Experience, Skills; Site: Site settings (nav, section, social, contact topic), Profile, Media; Insights: Analytics, Audit log; Users (chỉ owner). Build trên shadcn `sidebar`; item active `--sidebar-accent` + thanh trái primary |
| `Topbar` | Breadcrumb, page action, `NotificationBell`, user menu |
| `DataTable` | TanStack Table (headless) trên shadcn `table`. Column sort được, resize được, ẩn được; chọn row có shift-range; thanh bulk action trượt lên; sticky header; density `compact 32 / default 40`; bàn phím: `j/k` di chuyển, `x` chọn, `Enter` mở, `e` edit, `⌫` xóa (confirm). Pagination phía server, filter nằm trong URL. State: loading (skeleton row), empty (kèm CTA create), no results (clear filter), error |
| `FilterBar` | Chip: `Status is Draft`, `Tag is react`; menu add-filter; saved view |
| `StatusPill` | `draft` (neutral, vòng rỗng), `published` (success, vòng đặc), `archived` (subtle, icon archive). Icon + text. Build trên `badge` |
| `PropertyList` | Editor key/value pane phải (status, slug, dates, tag, featured, locale completeness) giống issue property của Linear |
| `LocaleTabs` | `EN ●` / `VI ○` với dot completeness; switch giữ scroll; field required còn thiếu chỉ block publish của locale đó |
| `MarkdownEditor` | CodeMirror 6, toolbar (heading, bold, link, code, image, callout), slash menu, paste/drop image → upload, mode split/preview/write, word count, autosave mỗi 2s idle, `SaveStatus` |
| `SaveStatus` | `Saving…` / `Saved 12s ago` / `Offline, changes kept locally` / `Conflict: newer version` (kèm compare) |
| `MediaUploader`, `MediaLibrary` | Drop zone, progress từng file + cancel (AbortController), grid có warning thiếu alt-text, select dialog |
| `StatCard`, `Sparkline`, `AreaChart` | Value, delta so với period trước (text + mũi tên, không chỉ màu), sparkline với `<title>` và data table ẩn |
| `ActivityFeed` / `AuditRow` | Avatar actor, verb, entity link, relative time với absolute trong tooltip; expander diff |
| `NotificationBell` + realtime toast | SSE (`EventSource`, section 4.6); contact message mới → toast "New message from Ana" với action Open, unread badge tăng. `aria-live="polite"`, không bao giờ cướp focus |
| `RoleGate` | Ẩn hoặc disable action theo role; server vẫn enforce |
| `EmptyState` (admin) | Không illustration: icon, một dòng, primary action, gợi ý bàn phím |

 

<h3 id="s-4-4">4.4 Layout và quy tắc grid</h3>

- **Public container:** `max-width: var(--container)` (1120px), page padding 20px → 32px (`md`) → 40px (`lg`). Prose max `var(--measure)` (66ch). Grid: 4 / 8 / 12 column, gutter 16 / 24 / 32px.
- **Band (v2):** section `Band` full-width (`--band` + `border-y`) xen kẽ với background thường để page dài có nhịp; content bên trong vẫn nằm trong container. Không bao giờ hai band liền nhau; không bao giờ band nằm trong prose. Atmosphere (grid/orb) chỉ ở home hero và CTA band.
- **Vertical rhythm:** gap section 64px mobile, 96px desktop (trong band: padding 64/80px); trong một section, heading → content 24px; gap card grid 24px.
- **Home và list:** project grid 1 col (`base`), 2 col (`md`), project featured span full width trên `lg` (cover trái 7 col, text phải 5).
- **Case study / post:** 12-col trên `lg`: content col 1–8, TOC sticky col 10–12. Media full-bleed được phép tràn ra tới width của container, không bao giờ ra viewport.
- **Admin:** fluid; sidebar 240 + content. List là table full-width. Editor: `lg` = editor + properties pane (320px); `2xl` = editor + live preview + properties. Không bao giờ scroll ngang cả page, chỉ region table (focus được, `aria-label`).
- **Touch:** mọi target ≥ 44×44px trên coarse pointer (`@media (pointer: coarse)` phóng admin control lên 40px và hit area lên 44px).
- **Content width theo locale:** text vi dài hơn ~10–15%; button và nav phải chứa được label vi, không truncate ở 360px.

 

<h3 id="s-4-5">4.5 UI data-driven: không hard-code content</h3>

- **Text lấy từ đâu.** Content (mọi thứ ở section 1.5) lấy từ API. UI chrome lấy từ `apps/web/messages/{en,vi}.json` qua `next-intl` (`t('contact.send')`). Không còn nguồn nào khác. Enforce bằng `react/jsx-no-literals` (allowlist: punctuation, `·`, `→`) trên `apps/web/app/**` và `packages/ui/src/components/**`.
- **Component là pure.** Product component nhận typed props từ `packages/contracts` (`HeroSection({ profile, settings })`) và không bao giờ fetch. Page và section container fetch rồi pass data xuống. Fixture trong `packages/contracts/fixtures/*` chỉ dùng cho story và test; seed data (section 1.5) là nguồn content thật duy nhất.
- **Thứ tự và visibility.** Home và About render `sections.filter(s => s.isVisible).sort(bySortOrder).map(s => <SectionBoundary key={s.key} …>{registry[s.key](s)}</SectionBoundary>)`. `registry` map từng `PageSection.key` sang một container component trong code.
- **Mọi section data-driven có 3 state ngoài happy path**, wrap bởi một component, `SectionBoundary` = `<ErrorBoundary>` (với TanStack `QueryErrorResetBoundary` phía client) + `<Suspense fallback={skeleton}>` + check `isEmpty`:

| State | Public site | Admin |
| --- | --- | --- |
| Loading | `skeleton` đúng shape section, cùng height với section thật (không layout shift). Section server-render stream vào sau `Suspense` | Skeleton row/card; background refetch hiện `spinner` trên header, không bao giờ thay data bằng skeleton |
| Empty | Section optional (featured, notes, skills, principles) bị **ẩn**, kèm cả nav anchor của section. List chính (projects, notes) hiện `empty` với chrome message ("No notes yet") | `empty` với create action và shortcut ("New post · C") |
| Error | Inline `alert` (chrome text "Couldn't load this section" + Retry) trong khung section; phần còn lại của page vẫn render. ISR tiếp tục serve page tốt gần nhất nếu background revalidation fail | `alert` với Retry (`refetch` / `reset`) và request id từ body error của API |
| Partial translation | Page vi hiện field English với `lang="en"` và badge nhỏ "EN" | Tab locale hiện warning dot; chỉ block publish khi thiếu English |

- **Data quan trọng.** `GET /public/site` (settings, profile, nav, social link, section) cấp data cho layout. Nếu fail, `app/[locale]/error.tsx` render page chrome-only tối giản ("Something went wrong", Retry); không có fallback hard-code cho tên hay headline.
- **SEO.** `generateMetadata` đọc `seoTitle`/`seoDescription` của entity, fallback sang `title`/`excerpt`, rồi `SiteSettings`. OG image render từ cùng data đó.

 

<h3 id="s-4-6">4.6 Data fetching: Next App Router + TanStack Query</h3>

**Quy tắc nhanh: public page server-render từ API rồi cache; admin là client app chạy bằng TanStack Query.**

| Surface | Cách render | Fetching | Cache / freshness |
| --- | --- | --- | --- |
| Public layout, home, about, list projects, case study, list notes (trang đầu), post | React Server Components, static hoặc ISR | `apiServer()` = `fetch(API_URL + path, { next: { tags, revalidate: 3600 } })` trong Server Components. Không dùng TanStack trên các render này | Tag theo entity (`site`, `projects`, `project:{slug}`, `posts`, `post:{slug}`). Lúc publish/update, API gọi `POST /api/revalidate` (secret header) → `revalidateTag(...)`. Page cập nhật trong vài giây, không rebuild |
| Notes search + tag filter (client island) | Client component dưới list đã server-render | `useQuery({ queryKey: qk.public.posts({ locale, q, tag, page }), placeholderData: keepPreviousData })`; `initialData` = trang đầu đã server-render khi `q` rỗng | `staleTime: 60s`; input debounce 200ms; request abort qua `signal` mà TanStack truyền vào `queryFn` |
| Contact form | Client component (TanStack Form) | `useMutation({ mutationFn: submitContact })`, trong đó `submitContact` là **Server Action** validate bằng zod schema dùng chung rồi gọi `POST /public/contact` | Không cache. Chạy được khi tắt JS (form `action` = đúng Server Action đó) |
| Page-view beacon | Client | `navigator.sendBeacon('/api/public/views')` | n/a |
| Admin layout | Server Component | Đọc session cookie, gọi `GET /auth/me`; redirect `/admin/login` khi `401` | `cache: 'no-store'` |
| Admin page (list, editor, dashboard) | Server Component prefetch + client component | Server: `queryClient.prefetchQuery(...)` rồi `<HydrationBoundary state={dehydrate(queryClient)}>`. Client: `useSuspenseQuery` cùng key và `queryFn`, nên first paint đã có data, navigation sau là client-side | Default bên dưới |

Default của query client (admin): `staleTime: 30_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: true`, `retry: (n, err) => err.status >= 500 && n < 2` (không bao giờ retry 4xx), mutation `retry: 0`. Một `QueryClient` mỗi request phía server, một cái mỗi tab browser phía client (helper `getQueryClient()` theo guide TanStack Next.js).

Query key (`packages/contracts/src/query-keys.ts`), một factory để invalidation đoán được:

```ts
export const qk = {
 public: {
 site: (locale: Locale) => ['public', 'site', locale] as const,
 posts: (p: PostListParams) => ['public', 'posts', p] as const,
 },
 admin: {
 me: ['admin', 'me'] as const,
 list: (entity: Entity, p: ListParams) => ['admin', entity, 'list', p] as const,
 detail: (entity: Entity, id: number) => ['admin', entity, 'detail', id] as const,
 all: (entity: Entity) => ['admin', entity] as const,
 inbox: { unread: ['admin', 'inbox', 'unread'] as const },
 stats: (range: '7d' | '30d' | '90d') => ['admin', 'stats', range] as const,
 audit: (p: AuditParams) => ['admin', 'audit', p] as const,
 },
};
```

Pattern:

| Pattern | Chỗ nào | Cách làm |
| --- | --- | --- |
| List chạy theo URL | Mọi admin table | Sort, filter, page và page size nằm trong URL (`?status=DRAFT&sort=-updatedAt&page=2`). URL parse bằng zod schema `ListParams` → query key → TanStack Table chạy với `manualPagination`, `manualSorting`, `manualFiltering`; `placeholderData: keepPreviousData` giữ row trong lúc trang kế load |
| Optimistic update | Toggle status (draft ↔ published), reorder (`sortOrder`), mark message đã đọc, toggle `isVisible` | `onMutate`: cancel query của key, snapshot, `setQueryData` với thay đổi. `onError`: restore snapshot, error toast. `onSettled`: `invalidateQueries(qk.admin.all(entity))` |
| Write không optimistic | Create, delete/archive, upload, publish kèm validation | Hiện `loading` trên button; lúc success `setQueryData(detail)` từ response + invalidate list; navigate hoặc toast |
| Autosave | Editor | Listener `onChange` của TanStack Form, debounce 1.5s → `useMutation(PATCH)`; body mang `updatedAt` làm version. API trả `409` nếu row bị đổi chỗ khác → `SaveStatus` hiện "Conflict" với "Load latest / Overwrite". Success ghi response vào `qk.admin.detail` |
| Realtime | Inbox, dashboard | Một `EventSource('/api/admin/events')` trong admin layout. On `contact.created`: `setQueryData(qk.admin.inbox.unread, n => n + 1)`, `invalidateQueries(qk.admin.list('messages', …))`, toast `sonner` với "Open". On `content.published`: invalidate entity đó |
| Infinite + virtual list | Audit log, media library (hàng trăm đến hàng nghìn row) | `useInfiniteQuery` (cursor = last id) + `useVirtualizer` từ **TanStack Virtual**; fetch trang kế khi virtual row cuối visible. Admin table thường phân trang (25/50/100) và **không** virtualise |
| Prefetch on intent | Admin row, sidebar link | `queryClient.prefetchQuery(qk.admin.detail(...))` lúc hover/focus sau 100ms |
| Error shape | Mọi API error | Nest trả `{ statusCode, code, message, requestId, fieldErrors? }`. `apiClient` throw `ApiError`; form map `fieldErrors` lên field TanStack Form; boundary hiện `message` + `requestId` |

Cách dùng TanStack Form: contact form, login, mọi admin editor (profile, settings, project, post, experience, skill), và cell edit inline (nav label, sort). Field array cho row `ProjectMetric` và nav item. Validator là zod schema từ `packages/contracts` (`validators: { onChange: schema, onSubmit: schema }`), đúng bộ mà Nest `ZodValidationPipe` chạy.

 

<h3 id="s-4-7">4.7 Component rich-layer (v2)</h3>

Tất cả là product component trong `packages/ui`, nhận props (section 4.5), mỗi cái có skeleton / empty / error do `SectionBoundary` lo.

| Component | Data | Anatomy | State | A11y |
| --- | --- | --- | --- | --- |
| `Atmosphere` | `SiteSettings.ambientEffects` | Layer absolute: grid `--grid-line` đã mask + 1–2 orb; `variant="hero" \| "cta"` | Off → không render gì | `aria-hidden`, `pointer-events: none`; không bao giờ nằm trong `Prose` |
| `Band` | none | Wrapper section full-width với background `--band` và `border-y` | n/a | Landmark section với `aria-labelledby` trỏ H2 của nó |
| `SectionHeader` | `PageSection.title/intro`, `iconKey` | Icon tile (28px, bg `--muted`, icon `--primary`) + H2 (`text-heading`) + intro một dòng (`text-body`, muted) + link phải optional | Không intro → chỉ title | Icon `aria-hidden` |
| `Eyebrow` | chrome hoặc `PageSection` | Mono, `text-eyebrow`, uppercase, `--primary` | n/a | Plain text, không phải heading |
| `KickerPill` | `Profile.heroKicker` | Glyph prompt mono `>_` + text trong pill `--primary-subtle`, cao 28px | Thiếu → ẩn | Glyph prompt `aria-hidden` |
| `AccentHeadline` | `Profile.headline`, `headlineAccent` | H1 với substring accent wrap trong `<span class="text-primary">` | Accent không tìm thấy trong headline → H1 thường (admin validate) | Một H1 mỗi page |
| `MigrationDiagram` | `Project.versionFrom/To` featured, tối đa 6 `Skill` | SVG: node trái `v1 · Vue 2`, node phải `v2 · Nuxt 3`, 3–6 component node đang rewire giữa chúng, label bằng mono | Thiếu version → hiện tên `ProcessStep` thành chuỗi dọc | `role="img"` + `aria-label` build từ data ("Migration from Vue 2 to Nuxt 3: …"); text alternative bên dưới trong `sr-only` |
| `StatBand` / `StatItem` | `ProfileStat[]` | 2×2 (mobile) / 4-col (desktop): icon tile, số (`text-title`, heading font, `--primary`, `tabular-nums`), label uppercase mono | < 2 stat visible → ẩn section | Số + label trong một element; count-up không đổi `aria-label` |
| `TechMarquee` | `Skill[]` có `showInMarquee` | Chip mono (`--card`, `--border`, 28px), 2 track; mask fade mép; nút pause ở cuối bên phải | < 6 skill → hàng tĩnh | Track hai `aria-hidden`; nút pause `aria-pressed`; tĩnh khi reduced motion |
| `DomainCard` | `Domain` + số project | Icon tile nhuộm hue, title, description một dòng, count mono ("2 projects") góc trên phải, mép trên 2px theo hue lúc hover | 0 project → ẩn card | Cả card link tới `/projects?domain=slug` |
| `PrincipleList` | `Principle[]` | List 2-col: số mono `01 -` + title (600) + body | Ẩn nếu empty | `<ol>` |
| `ProcessFlow` | `ProcessStep[]` | Chuỗi dọc các step card nối bằng connector `↓`; step active (cái giữa) dùng `--primary-subtle` và icon phát sáng | < 3 step → ẩn | `<ol>`, connector `aria-hidden` |
| `FeatureCard` (2×2) | `Principle` hoặc `ProcessStep` | Icon tile + title + body 2 dòng trên `--card-glass` | n/a | Không phải link trừ khi có `href` |
| `CaseCard` | `Project` + `Domain` + metric top | Domain pill (icon + name, nhuộm hue), icon góc `↗`, title (`text-subheading`), tagline 2–3 dòng, dòng `DiffStat` (metric top), tech chip mono (tối đa 4, "+2") | Không metric → chỉ chip; confidential → pill "NDA" | Card là một link (title link + `::after` stretch); `↗` `aria-hidden` |
| `KeyFacts` | `Project.keyFacts` (2–4 dòng) | Grid 2×2 card nhỏ, mỗi cái có hue dot và một câu | < 2 → ẩn | `<ul>` |
| `FactChips` | `Project.factChips` | Hàng chip mono (`text-meta`, bg `--muted`) | Empty → ẩn | `<ul>` |
| `RequirementColumns` | `Project.constraints` tách theo `### Functional` / `### Non-functional` trong md | Hai card cạnh nhau, bullet ▹ màu `--primary` | Một heading → một card | Heading vẫn là `h3` |
| `PostCard` | `Post` | Hàng card: date · minutes bằng mono, title (`text-subheading`) + `↗`, excerpt 2 dòng, chip `#tag` mono | n/a | Title là link |
| `CtaBand` | `PageSection(HOME, cta)` + `SocialLink.showInCta` | Căn giữa: icon tile sparkle, H2, intro, primary button + tối đa 2 outline button; `Atmosphere variant="cta"` phía sau | Không title → ẩn | Email là nút "Copy email" kèm toast; address chỉ nằm trong `mailto:` |
| `ContentProgress` | none | Thanh 2px `--primary` dưới header trên case study và post, width = scroll progress | Ẩn khi reduced motion | `aria-hidden` (TOC mới là navigation accessible) |

---

 
<h2 id="s-5">5. UI spec từng page</h2>

> **Trong chương này:** Route: public dưới `app/[locale]/(site)/…` với `locale ∈ {en, vi}` (default `en`, `vi` gợi ý tự động từ `Accept-Language`, không bao giờ ép); admin dưới `app/admin/(cms)/…` (không localize, UI bằng en; field content edit theo locale).

| § | Mục |
| --- | --- |
| 5.0 | Data, state và component theo từng screen |
| 5.1 | Home `/[locale]` (v2) |
| 5.2 | About + experience timeline `/[locale]/about` (v2) |
| 5.3 | List projects `/[locale]/projects` (v2) |
| 5.4 | Project case study `/[locale]/projects/[slug]` (v2) |
| 5.5 | List blog `/[locale]/notes` và post `/[locale]/notes/[slug]` (v2) |
| 5.6 | Contact `/[locale]/contact` (v2) |
| 5.7 | Admin dashboard `/admin` |
| 5.8 | Admin list/table `/admin/posts` (cùng pattern cho projects, skills, experience, media, inbox, audit) |
| 5.9 | Admin editor `/admin/posts/[id]` (projects dùng cùng shell với field section case-study) |
| 5.10 | Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics) |
| 5.11 | Thay đổi admin cho v2 (nhỏ; admin layout giữ nguyên) |


Route: public dưới `app/[locale]/(site)/…` với `locale ∈ {en, vi}` (default `en`, `vi` gợi ý tự động từ `Accept-Language`, không bao giờ ép); admin dưới `app/admin/(cms)/…` (không localize, UI bằng en; field content edit theo locale).

Mọi public page: pattern `<title>` `{page seoTitle} · {SiteSettings.siteName}`, description từ CMS, canonical, `hreflang` alternate, OG image từ template, JSON-LD (`Person` trên home/about, `CreativeWork` trên case study, `BlogPosting` trên post, `BreadcrumbList` trên page detail). Sitemap và RSS theo locale.

 

<h3 id="s-5-0">5.0 Data, state và component theo từng screen</h3>

Mọi text trong wireframe bên dưới là **seed data** từ CV hoặc chrome string; không cái nào được gõ cứng vào component. "Ẩn" nghĩa là section và anchor của nó bị gỡ khi empty (section 4.5).

| Screen · section | Data (endpoint → props) | Render | Skeleton | Empty | Error | shadcn component |
| --- | --- | --- | --- | --- | --- | --- |
| Layout: header, footer | `GET /public/site?locale` → `nav`, `socialLinks`, `settings` | RSC, tag `site` | n/a (thuộc shell) | Nav 0 item thì chỉ hiện logo | Page chrome `error.tsx` | `navigation-menu`, `sheet`, `toggle-group`, `dropdown-menu`, `button`, `command` + `dialog` |
| Home · hero | `site.profile`, `site.settings.availability*` | RSC | Title + 2 dòng + 2 button | n/a (singleton đã seed) | `error.tsx` (critical) | `badge`, `button` |
| Home · featured | `GET /public/projects?featured=1&limit=1` | RSC, tag `projects` | Cover + 3 dòng + 2 stat | Ẩn | Inline `alert` + Retry | `card`, `badge` |
| Home · selected work | `GET /public/projects?limit=3` | RSC | 3 card skeleton | Ẩn | Inline `alert` | `card`, `badge` |
| Home · hero diagram (v2, thay panel career-log của v1) | project featured `versionFrom/To` + tối đa 6 `Skill` linked | RSC | Block hình diagram | Ẩn diagram, hero text span full width | Ẩn | `card` |
| Home · skills | `GET /public/skills` (group theo depth) | RSC, tag `skills` | 3 hàng chip | Ẩn | Inline `alert` | `badge` |
| Home · latest notes | `GET /public/posts?limit=3` | RSC, tag `posts` | 3 hàng | Ẩn | Inline `alert` | `separator` |
| Home · contact CTA | `PageSection(HOME, cta).title/ctaLabel` | RSC | n/a | Ẩn nếu không có title | n/a | `button` |
| Home · stats band (v2) | `GET /public/site` → `profileStats` (value computed resolve phía server) | RSC, tag `site` | 4 tile (block icon + số + label) | Ẩn nếu < 2 visible | Inline `alert` | không (custom `StatBand`) |
| Home · tech marquee (v2) | `GET /public/skills?marquee=1` | RSC, tag `skills` | 1 hàng 8 block chip | Ẩn nếu 0; hàng tĩnh nếu < 6 | Ẩn (bản decorative trùng skills) | `badge`, `button` (pause) |
| Home · domains (v2) | `GET /public/domains` (kèm count project published) | RSC, tag `domains` | 4 card | Ẩn; card 0 project bị ẩn | Inline `alert` | `card` |
| Home · process (v2) | `GET /public/process-steps` | RSC, tag `site` | 2×2 card + chuỗi 5-step | Ẩn nếu < 3 step | Inline `alert` | `card` |
| Home · CTA band (v2) | `PageSection(HOME, cta)` + `socialLinks.filter(showInCta)` | RSC | n/a | Ẩn nếu không có title | n/a | `button` |
| Case study · key facts + chips (v2) | `project.keyFacts`, `project.factChips`, `project.domain` | RSC (cùng request) | 2×2 block | Ẩn từng cái nếu empty | Thuộc `error.tsx` của page | `badge`, `card` |
| About · intro | `site.profile.bio`, `resumeEnId/ViId` | RSC | Avatar + 3 dòng | n/a | `error.tsx` | `avatar`, `button` |
| About · timeline | `GET /public/experience` | RSC | 3 item | Empty list chính: `empty` | Inline `alert` | `accordion`, `badge` |
| About · skills, education, principles | `GET /public/skills`, `/education`, `/principles` | RSC | Chip / 1 hàng / 3 card | Ẩn | Inline `alert` | `badge`, `card` |
| List projects | `GET /public/projects?tag&skill` | RSC; filter là link (`?skill=nuxt`) re-render phía server | 4 card | `empty` + "Clear filters" | Inline `alert` | `toggle-group`, `popover` + `command`, `card`, `badge` |
| Case study | `GET /public/projects/:slug` | RSC, `generateStaticParams`, tag `project:{slug}` | Header + cover + 2 stat + paragraph | 404 qua `notFound()` | Segment `error.tsx` | `breadcrumb`, `badge`, `alert` (NDA), `collapsible` (TOC mobile) |
| List notes | Trang đầu RSC; search/tag qua TanStack Query | RSC + client island | 5 hàng | `empty` ("No notes yet" / "No results for …" + Clear) | Inline `alert` + Retry (`refetch`) | `input-group`, `toggle-group`, `pagination`, `spinner` |
| Post | `GET /public/posts/:slug` | RSC, tag `post:{slug}` | Title + meta + paragraph | 404 | Segment `error.tsx` | `breadcrumb`, `badge`, `button` (copy), `separator` |
| Contact | `site.settings.contact*`, `GET /public/contact-topics` | Page RSC, form client | n/a | Topic select ẩn nếu 0 topic | Error lúc submit: `alert` phía trên form, giữ input | `field`, `input`, `textarea`, `select`, `button`, `alert` |
| Admin shell | `GET /auth/me`, số unread | RSC guard + client | Sidebar skeleton | n/a | Redirect login khi 401 | `sidebar`, `breadcrumb`, `dropdown-menu`, `avatar`, `sonner`, `command` |
| Admin dashboard | `GET /admin/stats?range`, `/admin/messages?limit=5`, `/admin/audit?limit=8`, `/admin/health` | Prefetch + `useSuspenseQuery` từng card | Skeleton từng card | Từng card: "No views yet", "Inbox zero", … | `alert` + Retry từng card | `card`, `chart`, `toggle-group`, `badge`, `skeleton`, `empty` |
| Admin list | `GET /admin/{entity}?…` | Prefetch + TanStack Table | 10 skeleton row | `empty` + create action | `alert` + Retry | `table`, `checkbox`, `dropdown-menu`, `popover` + `command` (filter), `pagination`, `alert-dialog`, `badge` |
| Admin editor | `GET /admin/{entity}/:id` + Media, Tags, Skills | Prefetch + TanStack Form | Form skeleton | n/a (404 → "Not found" + back) | `alert` + Retry; error lúc save nằm trong `SaveStatus` | `tabs`, `field`, `input`, `textarea`, `select`, `switch`, `calendar`, `popover` + `command`, `resizable`, `sheet`/`drawer` (properties mobile), `progress` |
| Admin site & sections | `GET /admin/site`, `/admin/nav`, `/admin/sections`, `/admin/social`, `/admin/contact-topics` | Prefetch + TanStack Form/Table | Form + row | `empty` từng list | `alert` + Retry | `tabs`, `table`, `switch`, `field`, `button` (move up/down) |

 

<h3 id="s-5-1">5.1 Home `/[locale]` (v2)</h3>

Mục đích: trong 10 giây, anh ấy là ai, ship cái gì, proof bằng số, và một cách để act. Thứ tự section mặc định (từ `PageSection`, admin có thể reorder/ẩn): **hero → stats → marquee → featured case study → domains → selected work → how I migrate (process) → skills by depth → latest notes → CTA band**. Band (`--band`) xen kẽ: stats+marquee, domains, process. Chú giải: `░` = grid đã mask, `◌` = orb/glow, `[ ]` = button, `‹›` = pill.

Desktop (1440, container 1120):
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ◆ parker.dev Work About Notes Contact [Search ⌘K] ‹EN|VI› ◐ │ sticky, blur
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Atmosphere hero
│░ ‹>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS› ┌──────────────────────────┐ ░│
│░ │ ┌────┐ ┌────┐ │ ░│
│░ I move products forward │ │ v1 │──┐ ┌──▶│ v2 │ │ ░│ MigrationDiagram
│░ without breaking them. ← accent in --primary │ │Vue2│ ├─┤ │Nuxt│ │ ░│ (nodes pulse on v2)
│░ (text-display 64px) │ └────┘ │ │ └────┘ │ ░│
│░ │ ○Pinia ○Query ○PrimeVue │ ░│
│░ Parker Vu · Senior Frontend Engineer. 5 years │ ○Tailwind ○Playwright │ ░│
│░ shipping data-dense product UIs… (text-prose) └──────────────────────────┘ ░│
│░ ● Open to senior roles · Hanoi, GMT+7 ░│
│░ [ View case studies → ]glow [ Download CV ] ░│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │
│ │▣ │ 5+ │▣ │ 4 │▣ │ 3 │▣ │ 20+ │ StatBand
│ └──┘ YEARS └──┘ PRODUCTS └──┘ CLIENT └──┘ ASSET CLASSES │ numbers --primary
│ SHIPPING SHIPPED COUNTRIES RATED (PARTICULA) │ labels eyebrow
│ ───────────────────────────────────────────────────────────────────────────────── │
│ ‹Vue 3›‹Nuxt 3›‹TypeScript›‹Pinia›‹TanStack Query›‹PrimeVue›‹Playwright›‹Vitest› ⏸ │ TechMarquee (fades)
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Featured case study All work → │ SectionHeader
│ ┌───────────────────────────────────────────┐ ‹▣ Fintech / Web3› v1 → v2 │
│ │ cover 16:10 (project image or diagram) │ Particula v2 │
│ │ │ Rewriting an RWA ratings app │
│ │ │ without stopping delivery. │
│ └───────────────────────────────────────────┘ − bundle 412kB → 255kB │
│ + e2e specs 0 → 120 │
│ ‹Nuxt 3›‹TanStack›‹Playwright› │
│ Read case study ↗ │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ▣ Domains Products I've shipped, grouped by the problem they solve │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ │
│ │ ▣amber 1 project │ │ ▣blue 2 projects │ │ ▣violet 1 project │ │ DomainCard ×4
│ │ Fintech / Web3 (ReFi) │ │ Enterprise platforms │ │ E-commerce tooling │ │ (3+1 or 4-col)
│ │ RWA ratings, carbon… │ │ Samsung SDS ops tools… │ │ Cart migrations across │ │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Selected work All projects → │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────┐│
│ │‹▣ Fintech› ↗ │ │‹▣ E-commerce› ↗ │ │‹▣ Enterprise› ‹NDA› ↗││ CaseCard ×3
│ │ Particula v2 │ │ Cart migration tool │ │ MSP Advanced ││ hover: lift, title
│ │ Nuxt 3 rewrite of… │ │ Flask APIs + Vue 2 UI… │ │ Re-platformed MSP… ││ → primary
│ │ − bundle 412→255kB │ │ + carts 4 platforms │ │ + team 15 · KR ││
│ │ ‹Nuxt 3›‹TanStack›‹+2› │ │ ‹Flask›‹Vue 2›‹Pinia› │ │ ‹Vue 2›‹Vuex› ││
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────┘│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PROCESS› │
│ How I migrate a frontend ┌────────────────────────────┐ │
│ Short intro (text-prose, muted, 2 lines) │ 01 Audit · tokens, states │ │ ProcessFlow
│ ┌───────────────────┐ ┌───────────────────┐ └─────────────┬──────────────┘ │
│ │▣ Migrate in slices│ │▣ Test the contract│ ┌─────────────▼──────────────┐ │
│ │ 2-line body │ │ 2-line body │ │ 03 Strangler routes ◉glow │ │ active step
│ └───────────────────┘ └───────────────────┘ └─────────────┬──────────────┘ │
│ ┌───────────────────┐ ┌───────────────────┐ ┌─────────────▼──────────────┐ │
│ │▣ Server state ≠ UI│ │▣ Write it down │ │ 05 Cut over · delete v1 │ │
│ └───────────────────┘ └───────────────────┘ └────────────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ What I work with Daily ‹…› · Shipped before ‹…› · Growing ‹…› │ 3 columns
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Latest notes All notes → │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12 · 6 MIN Vue → React: what transfers, what doesn't ↗ #react #vue │ │ PostCard rows ×3
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ CtaBand (glow)
│ ✦ │
│ Have a product that needs to move forward? │
│ Senior frontend roles or a migration done right. │
│ [ ✉ Copy email ]glow [ in LinkedIn ] [ ⌥ GitHub ] │
├────────────────────────────────────────────────────────────────────────────────────┤
│ © 2026 Parker Vu · Hung Vu Van - Senior Frontend Work Notes CV ⌥ in ✉ · a1b2c3 │ mono footer
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (390):
```
┌──────────────────────────────┐
│ ◆ parker.dev ⌘K ◐ ☰ │
├──────────────────────────────┤
│░‹>_ Senior Frontend · 5 yrs›░│ atmosphere (1 orb)
│░ I move products ░│
│░ forward without ░│ text-display 40px
│░ breaking them. ░│ accent line in primary
│░ Parker Vu · Senior FE… ░│
│░ [ View case studies → ] ░│ full width
│░ [ Download CV ] ░│
│░ ┌─────────────────────────┐░│ MigrationDiagram
│░ │ v1 Vue2 ──▶ v2 Nuxt3 │░│ (compact, horizontal)
│░ └─────────────────────────┘░│
├══════════════════════════════┤ band
│ 5+ YEARS │ 4 PRODUCTS │ StatBand 2×2
│ 3 COUNTRIES │ 20+ CLASSES │
│ ‹Vue 3›‹Nuxt 3›‹TS›‹Pinia› ⏸ │ marquee
├══════════════════════════════┤
│ ▣ Featured case study │
│ [cover] │
│ ‹Fintech› Particula v2 v1→v2 │
│ − bundle 412kB → 255kB │
│ Read case study ↗ │
├══════════════════════════════┤ band
│ ▣ Domains │
│ [DomainCard] (stacked ×4) │
├──────────────────────────────┤
│ ▣ Selected work │
│ [CaseCard] (stacked ×3) │
├══════════════════════════════┤ band
│ PROCESS · How I migrate │
│ 01 → 02 → 03◉ → 04 → 05 │ vertical flow
│ [Feature] [Feature] (1 col) │
├──────────────────────────────┤
│ Skills · Notes (cards) │
├──────────────────────────────┤
│░ ✦ Have a product…? ░│ CTA band
│░ [ Copy email ] [in] [⌥] ░│
│ footer (2 lines, mono) │
└──────────────────────────────┘
```
Giá trị metric là placeholder đến khi Parker cung cấp số thật (1.4 item 1). Stat không có số thật thì giữ ẩn (`isVisible=false`), không bịa.

 

<h3 id="s-5-2">5.2 About + experience timeline `/[locale]/about` (v2)</h3>

Section: intro tách (avatar card + bio) → stats strip (tái dùng `StatBand`, compact) → **timeline** với year rail → principles (list `01 -`) → skills theo depth → education → card download CV.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: ABOUT› │
│ ┌─────────────────────┐ Hi, I'm Parker (Hung Vu Van). (text-title H1) │
│ │ avatar 1:1 │ Bio, 2–3 paragraphs, text-prose, 66ch. │
│ │ rounded-xl │ │
│ │ Hanoi · GMT+7 │ ‹Vietnamese› ‹English› ‹Works with KR · US · UK teams› │
│ │ [Download CV ↓] │ │
│ └─────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ 5+ YEARS · 4 PRODUCTS · 3 COUNTRIES · 20+ ASSET CLASSES (compact StatBand) │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Experience │
│ 2024 ─ NOW ●━━ Kobizo · Frontend Developer ‹▣ Fintech› Case study ↗ │
│ (sticky) ┃ Particula: main frontend, led v1 → v2. │
│ ┃ ▹ highlight ▹ highlight ▹ highlight │
│ ┃ ‹Vue 3›‹Nuxt 3›‹PrimeVue›‹TanStack›‹Playwright› │
│ 2022 ─ 2024 ●━━ CMC Global · Frontend Developer ‹▣ Enterprise› ‹NDA› │
│ ┃ Samsung SDS: MSP Advanced, MSP App Expansion │
│ 2021 ─ 2022 ●━━ LitGroup · Fullstack Developer ‹▣ E-commerce› │
│ ┣ Frontend · 2022 · Vue 2, TS, Pinia │
│ ┗ Backend · 2021 · Flask, Laravel, store APIs │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PRINCIPLES› How I work │
│ 01 - Migrate in slices 02 - Test the contract, not the pixels │
│ 03 - Server state is not UI state 04 - Write the decision down │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Skills DAILY ‹…› SHIPPED BEFORE ‹…› GROWING ‹…› │
│ ▣ Education Hanoi University of Industry · Computer Science · 2017–2021 │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile:
```
┌──────────────────────────────┐
│ ABOUT │
│ [avatar 96] Hi, I'm Parker │
│ Bio (prose) │
│ ‹VI›‹EN›‹KR·US·UK teams› │
│ [ Download CV ↓ ] │
├══════════════════════════════┤
│ StatBand 2×2 │
├══════════════════════════════┤
│ ● 2024 - now │ year on top of each item
│ ┃ Kobizo · Frontend Dev │
│ ┃ ▹ … ▹ … ‹chips› │ highlights in accordion
│ ● 2022 - 2024 CMC Global │
│ ● 2021 - 2022 LitGroup │
├══════════════════════════════┤
│ 01 - … 02 - … (1 col) │
│ Skills · Education │
└──────────────────────────────┘
```

 

<h3 id="s-5-3">5.3 List projects `/[locale]/projects` (v2)</h3>

Header với eyebrow + H1 + intro, một **hàng filter domain** (domain pill kèm count, URL `?domain=`) và một tech combobox; rồi một `CaseCard` featured rộng, rồi grid 2-col (desktop). Mỗi card hiện domain pill, `↗`, `DiffStat` top, chip.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: WORK› │
│ Case studies (text-title) │
│ Four products I moved forward, 2021 - now. (text-prose) │
│ ‹All 4› ‹▣ Fintech 1› ‹▣ Enterprise 2› ‹▣ E-commerce 1› [Tech: any ▾] │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐ ‹▣ Fintech / Web3› v1 → v2 ↗ │ │ featured, wide
│ │ │ cover 16:10 │ Particula v2 │ │
│ │ └───────────────────────────────┘ Tagline (2 lines) · Kobizo · 2024 - now │ │
│ │ − bundle 412→255kB + specs 0→120 │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ │
│ │‹▣ E-commerce› ↗ │ │‹▣ Enterprise› ‹NDA› ↗ │ │
│ │ Cart migration tool │ │ MSP Advanced (Samsung SDS) │ │
│ │ Flask APIs + Vue 2 UI for… │ │ Re-platformed MSP App logic… │ │
│ │ + platforms 4 · LitGroup · 2021–22 │ │ team 15 · CMC Global · 2022–24 │ │
│ │ ‹Flask›‹Laravel›‹Vue 2›‹Pinia› │ │ ‹Vue 2›‹Vuex› │ │
│ └───────────────────────────────────────┘ └───────────────────────────────────────┘ │
│ Empty filter: empty state "No case studies for Svelte" + [Clear filters] │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: filter pill scroll ngang (có fade mép), tech combobox bên dưới, card xếp chồng, featured card = card thường với cover ở trên.

 

<h3 id="s-5-4">5.4 Project case study `/[locale]/projects/[slug]` (v2)</h3>

Thứ tự: back link → pill (domain, NDA) → H1 + tagline → meta grid (label eyebrow mono) → cover → **key facts 2×2** → Outcome stats → từng section có eyebrow (`SUMMARY` Problem, `LIMITS` Constraints, `SCOPE` Requirements thành hai card, `HOW` Approach + diagram, `TRADE-OFFS` Key decisions thành card, `RESULT` Outcome, `RETRO` What I'd do differently) → fact chips → card "More in <domain>" → prev/next. TOC sticky + reading progress bar. Vùng hero có thể dùng grid mờ (không orb); vùng prose là `--background` thường.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (2px reading progress) │
├────────────────────────────────────────────────────────────────────────────────────┤
│░ ← All case studies ░│ faint grid
│░ ‹▣ Fintech / Web3› ‹v1 → v2› ░│
│░ Particula v2: Vue 2 → Nuxt 3 (text-title) ░│
│░ Rewriting an RWA ratings app without stopping delivery. (text-prose) ░│
│░ CLIENT ROLE TEAM PERIOD STACK ░│ eyebrow labels
│░ Particula Main frontend 6 Feb 2024 - now Nuxt 3 · TanStack · … ░│
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────── cover 21:9 (rounded-xl) ─────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┬────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │ ON THIS PAGE │
│ │● Strangler migration: │ │● TanStack Query replaced│ │ ▌Key facts │ KeyFacts 2×2
│ │ Nuxt 3 beside Vue 2 │ │ Axios as server state │ │ Outcome │
│ └─────────────────────────┘ └─────────────────────────┘ │ Problem │
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │ Requirements │
│ │● Core component library │ │● 120 Playwright specs │ │ Approach │
│ └─────────────────────────┘ └─────────────────────────┘ │ Decisions │
│ RESULT │ Retro │
│ ## Outcome ┌ − bundle 412→255kB ┐ ┌ + specs 0→120 ┐ │ │
│ SUMMARY │ STACK │
│ ## Problem prose 18px/1.75, 66ch, ▹ bullets │ ‹Nuxt 3›‹Vue 3›… │
│ SCOPE │ │
│ ## Requirements │ Live site ↗ │
│ ┌ Functional ─────────────┐ ┌ Non-functional ─────────┐ │ │
│ │ ▹ ratings dashboards │ │ ▹ no stale ratings │ │ │
│ └─────────────────────────┘ └─────────────────────────┘ │ │
│ HOW · ## Approach prose + diagram (figure + caption) │ │
│ TRADE-OFFS · ## Key decisions │ │
│ ┌ Axios → TanStack Query ─────────────────────────────┐ │ │
│ │ OPTIONS · CHOICE · WHY · COST (eyebrow labels) │ │ │
│ └─────────────────────────────────────────────────────┘ │ │
│ RETRO · ## What I'd do differently │ │
│ ‹fact chip›‹fact chip›‹fact chip› │ │
├───────────────────────────────────────────────────────────┴────────────────────────┤
│ More in Fintech / Web3 [CaseCard] [CaseCard] │
│ ← MSP Advanced Cart migration tool → │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: meta grid thành 2 column; key facts 1 column; TOC thành `collapsible` sticky "On this page ▾" dưới header; requirement card xếp chồng.

 

<h3 id="s-5-5">5.5 List blog `/[locale]/notes` và post `/[locale]/notes/[slug]` (v2)</h3>

List: eyebrow `WRITING` + H1 + intro → search + tag chip → group theo năm các hàng `PostCard` (card với `OCT 12, 2026 · 6 MIN` mono, title + `↗`, excerpt, chip `#tag`). Post featured (`isFeatured`) được card rộng hơn, cover nằm trên đầu list.

List desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ WRITING │
│ Notes [⌕ Search notes… ⌘K ] │
│ Things I learned shipping frontends. │
│ ‹all 12› ‹#vue› ‹#react› ‹#nuxt› ‹#testing› ‹#architecture› │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 2026 ──────────────────────────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12, 2026 · 6 MIN │ │
│ │ Vue → React: what transfers, what doesn't ↗ (subheading) │ │
│ │ Excerpt, 2 lines, text-body muted… │ │
│ │ #react #vue │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ SEP 30, 2026 · 8 MIN · TanStack Query in Nuxt 3 ↗ … ───────────────────────────┐ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Post: cột đọc giữ nguyên (66ch, background thường). v2 thêm eyebrow `NOTE · #react`, reading progress bar, bullet `▹`, callout với icon tile, header code block với language badge + copy, card "Key takeaways" ở cuối (từ `Post.takeaways`, optional), và các `PostCard` related.

Post desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━ (progress) │
├────────────────────────────────────────────────────────────┬───────────────────────┤
│ ← Notes │ │
│ NOTE · #REACT #VUE │ ON THIS PAGE │
│ Vue → React: what transfers, what doesn't (text-title) │ ▌Reactivity │
│ Oct 12, 2026 · Updated Oct 14 · 6 min · Đọc bằng tiếng Việt│ Effects │
│ ───────────────────────────────────────────────────────── │ Data fetching │
│ prose 18/1.75, 66ch │ │
│ ┌ ▣ Callout ────────────────────────────────────────────┐ │ Copy link │
│ │ Treat React state as a value you replace… │ │ │
│ └───────────────────────────────────────────────────────┘ │ │
│ ┌ components/Counter.tsx ─────────── ‹tsx› [copy] ┐ │ │
│ │ code 15px JetBrains Mono, diff lines tinted │ │ │
│ └─────────────────────────────────────────────────┘ │ │
│ ┌ KEY TAKEAWAYS ────────────────────────────────────────┐ │ │
│ │ ▹ … ▹ … ▹ … │ │ │
│ └───────────────────────────────────────────────────────┘ │ │
├────────────────────────────────────────────────────────────┴───────────────────────┤
│ Related notes [PostCard] [PostCard] [PostCard] ← Prev Next → │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (list và post): card full width; search trên tag; tag scroll ngang; TOC collapsible; code block scroll ngang trong region focus được.

 

<h3 id="s-5-6">5.6 Contact `/[locale]/contact` (v2)</h3>

Layout tách trên grid mờ: trái = eyebrow, H1, intro (`SiteSettings.contactIntro`), note thời gian reply, channel card (Copy email, LinkedIn, GitHub, mỗi cái có icon tile), availability badge; phải = form card trên `--card-glass`. Success thay form bằng status card (icon tile check, message, "Back to case studies").

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│░ CONTACT ┌────────────────────────────────────┐░│
│░ Let's talk about your product. │ Name * Email * │░│
│░ Senior frontend roles or a migration │ [ ] [ ] │░│
│░ done right. (text-prose) │ Topic │░│
│░ ● Open to senior roles · replies in 2 days │ [ Job opportunity ▾ ] │░│
│░ ┌───────────────────────────────────────┐ │ Message * │░│
│░ │ ▣ Email [ Copy email ] │ │ [ ] │░│
│░ ├───────────────────────────────────────┤ │ [ ] │░│
│░ │ ▣ LinkedIn linkedin.com/in/… ↗ │ │ 0 / 2000 │░│
│░ ├───────────────────────────────────────┤ │ [ Send message → ]glow │░│
│░ │ ▣ GitHub github.com/parker2808 ↗│ └────────────────────────────────────┘░│
│░ └───────────────────────────────────────┘ ░│
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: channel card trước (xếp chồng), form bên dưới, submit full-width. Validation: error inline dưới field + summary `alert` lúc submit; input giữ value khi error.

 

<h3 id="s-5-7">5.7 Admin dashboard `/admin`</h3>

KPI (7/30/90 ngày): views, unique visitors, contact messages, published posts; chart views; top pages; inbox preview (realtime); recent activity (audit); content health (draft, thiếu bản dịch vi, image không có alt).

Mobile:
```
┌───────────────────────────────┐
│ ☰ Dashboard 🔔3 (P)│
├───────────────────────────────┤
│ [7d][30d][90d] │
│ ┌─────────────┐┌─────────────┐│
│ │Views 2,140 ││Visitors 980 ││
│ │▲ 12% ╱╲╱ ││▲ 4% ╱╲_ ││
│ └─────────────┘└─────────────┘│
│ ┌─────────────┐┌─────────────┐│
│ │Messages 6 ││Published 2 ││
│ └─────────────┘└─────────────┘│
├───────────────────────────────┤
│ Inbox (3 new) View all │
│ ● Ana · Job opportunity · 2m │
├───────────────────────────────┤
│ Content health │
│ 2 drafts · 3 missing VI · 1 alt│
├───────────────────────────────┤
│ Activity │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ ◆ Parker ▾ │ Dashboard [7d][30d][90d] 🔔3 (P)│
│ 🔍 Search ⌘K├─────────────────────────────────────────────────────────┤
│ │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐ │
│ Dashboard │ │Views ││Visitors ││Messages ││Published │ │
│ Inbox 3 │ │2,140 ▲12%││980 ▲4% ││6 ▼1 ││2 │ │
│ ─ Content │ └──────────┘└──────────┘└──────────┘└──────────┘ │
│ Projects │ ┌───────────────────────────────────┐┌────────────────┐ │
│ Posts │ │ Views (area chart, 30d) ││ Top pages │ │
│ Experience │ │ ││ /projects/pa… │ │
│ Skills │ │ ││ /notes/vue-… │ │
│ Media │ └───────────────────────────────────┘└────────────────┘ │
│ ─ Insights │ ┌───────────────────────┐┌──────────────────────────────┐│
│ Analytics │ │ Inbox View → ││ Recent activity ││
│ Audit log │ │ ● Ana Job opp. 2m ││ Parker published "Vue → R…" ││
│ ─ │ │ Minh Freelance 1d ││ Parker updated Particula v2 ││
│ Settings │ └───────────────────────┘└──────────────────────────────┘│
│ │ Content health: 2 drafts · 3 missing VI · 1 image no alt │
└────────────┴─────────────────────────────────────────────────────────┘
Realtime: new message → toast bottom-right "New message from Ana [Open]", Inbox badge 3→4.
```
Realtime: message mới → toast góc dưới phải "New message from Ana [Open]", Inbox badge 3→4.

 

<h3 id="s-5-8">5.8 Admin list/table `/admin/posts` (cùng pattern cho projects, skills, experience, media, inbox, audit)</h3>

Mobile (table thành list các row, filter trong sheet):
```
┌───────────────────────────────┐
│ ☰ Posts [+ New] │
├───────────────────────────────┤
│ [🔍 Search ] [Filter (2)] [⋯] │
│ Status: Draft ✕ Tag: react ✕ │
├───────────────────────────────┤
│ ○ Vue → React: what transfers │
│ Draft · EN ● VI ○ · 2h ago │
│ ───────────────────────────── │
│ ● TanStack Query in Nuxt 3 │
│ Published · EN ● VI ● · 3d │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar │ Posts [Views ▾] [+ New post C] │
│ ├─────────────────────────────────────────────────────────┤
│ │ [🔍 Filter posts… /] Status is Draft ✕ + Filter │
│ ├──┬──────────────────────────┬──────────┬───────┬───────┬─┤
│ │☐ │ Title ↓ │ Status │ Lang │Updated│⋯│
│ ├──┼──────────────────────────┼──────────┼───────┼───────┼─┤
│ │☐ │ Vue → React: what trans… │ ○ Draft │ EN VI○│ 2h │⋯│
│ │☑ │ TanStack Query in Nuxt 3 │ ● Publ. │ EN VI │ 3d │⋯│
│ │☑ │ Playwright at Particula │ ◷ Sched. │ EN │ 5d │⋯│
│ ├──┴──────────────────────────┴──────────┴───────┴───────┴─┤
│ │ 1–25 of 42 ‹ 1 2 › │
│ │ ┌──────── 2 selected · Publish · Archive · Delete · ✕ ─┐│
└────────────┴─────────────────────────────────────────────────────────┘
Keys: j/k move · x select · Enter open · C new · / search · ⌫ delete (confirm)
```
Keys: j/k di chuyển · x chọn · Enter mở · C tạo mới · / search · ⌫ xóa (confirm)

 

<h3 id="s-5-9">5.9 Admin editor `/admin/posts/[id]` (projects dùng cùng shell với field section case-study)</h3>

Mobile (editor full screen; properties trong bottom sheet):
```
┌───────────────────────────────┐
│ ← Saved 4s ago [⚙] [Publish]│
├───────────────────────────────┤
│ [EN ●] [VI ○] │
│ Title │
│ Vue → React: what transfers │
│ [Write][Preview] │
│ B I H 🔗 </> 🖼 │
│ ┌───────────────────────────┐ │
│ │ markdown… │ │
│ │ │ │
│ └───────────────────────────┘ │
│ 1,240 words · 6 min │
└───────────────────────────────┘
```

Desktop (`lg`: editor + properties; `2xl`: thêm live preview):
```
┌────────────┬────────────────────────────────────────┬────────────────┐
│ sidebar │ Posts / Vue → React Saved 4s ago │ [Preview] [Pub]│
│ ├────────────────────────────────────────┼────────────────┤
│ │ [EN ●] [VI ○ missing title, body] │ Status ○ Draft│
│ │ Title │ Slug vue-react│
│ │ Vue → React: what transfers │ Tags [react]+ │
│ │ Excerpt │ Publish date ▾│
│ │ One-sentence summary… │ Featured ☐ │
│ │ ┌ B I H1 H2 🔗 </> 🖼 callout [Split]┐│ Cover [img] │
│ │ │ ## Reactivity ││ SEO title │
│ │ │ In Vue, `ref()`… ││ SEO desc 0/160│
│ │ │ / ← slash menu: image, code, callout││ ────────────── │
│ │ │ [drop image to upload ▓▓▓░ 60% ✕] ││ History │
│ │ └─────────────────────────────────────┘│ Parker · 2h │
│ │ 1,240 words · 6 min read │ Created · 1d │
└────────────┴────────────────────────────────────────┴────────────────┘
Publish is blocked with an inline list when required fields are missing (per locale) or images lack alt.
⌘S save now · ⌘↵ publish · ⌘⇧P preview · Esc leaves (confirm if unsaved).
```
Publish bị block kèm list inline khi thiếu field required (theo locale) hoặc image thiếu alt.
⌘S save ngay · ⌘↵ publish · ⌘⇧P preview · Esc thoát (confirm nếu chưa save).

---

 

<h3 id="s-5-10">5.10 Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics)</h3>

Chỗ edit mọi thứ không phải project/post/experience/skill, nên không text nào hiện ra lại cần sửa code. Tab: General · Navigation · Sections · Social · Contact. Reorder là drag-and-drop **và** nút "Move up / Move down" (thân thiện bàn phím và screen reader); mỗi lần move là một update `sortOrder` optimistic.

Mobile:
```
┌───────────────────────────────┐
│ ☰ Site [Save] │
├───────────────────────────────┤
│ [General][Nav][Sections] ▸ │
├───────────────────────────────┤
│ Home sections [EN][VI] │
│ ≡ Hero ● shown ⋯ │
│ ≡ Featured ● shown ⋯ │
│ ≡ Selected work ● shown ⋯ │
│ ≡ Skills ○ hidden ⋯ │
│ ≡ Latest notes ● shown ⋯ │
│ ⋯ → Move up · Move down · Edit│
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar │ Site Saved 3s ago │
│ │ [General] [Navigation] [Sections] [Social] [Contact] │
│ ├─────────────────────────────────────────────────────────┤
│ │ Page [Home ▾] │
│ │ ┌──┬───────────────┬──────────────────────┬────────┬───┐ │
│ │ │≡ │ Section │ Title (EN · VI) │ Shown │ │ │
│ │ ├──┼───────────────┼──────────────────────┼────────┼───┤ │
│ │ │≡ │ hero │ (uses profile) │ [●] │ ⋯ │ │
│ │ │≡ │ featured │ Featured case study · │ [●] │ ⋯ │ │
│ │ │≡ │ work │ Selected work · Dự án │ [●] │ ⋯ │ │
│ │ │≡ │ skills │ What I work with · ○ │ [ ] │ ⋯ │ │
│ │ └──┴───────────────┴──────────────────────┴────────┴───┘ │
│ │ Edit row → sheet: title EN/VI, intro EN/VI, CTA label │
└────────────┴─────────────────────────────────────────────────────────┘
```
Sidebar thêm group **Site**: Site settings, Profile, Media. Bản thân admin UI là chrome English-only; mọi field content hiện EN và VI cạnh nhau qua tab locale.


 

<h3 id="s-5-11">5.11 Thay đổi admin cho v2 (nhỏ; admin layout giữ nguyên)</h3>

Admin giữ vẻ Linear điềm tĩnh: **không atmosphere, band, orb, reveal hay marquee trong `/admin`**. Nó chỉ thêm editor và check mà public site giàu hơn cần.

| Chỗ | Thay đổi | Component |
| --- | --- | --- |
| Sidebar → Content | List mới: **Stats**, **Domains**, **Process steps**. Cùng pattern `DataTable` + sheet editor như Skills (drag + Move up/down, switch `isVisible`, reorder optimistic) | `table`, `sheet`, `switch` |
| Stats editor | Label EN/VI, select `source`; `value` + `suffix` chỉ hiện với `MANUAL`; preview read-only của value computed cho các nguồn còn lại | `select`, `field`, `input` |
| Domains editor | Name/description EN/VI, **hue picker** (5 swatch kèm tên, `radio-group`, hiện preview pill light và dark), **icon picker**, project count read-only | `radio-group`, `popover` + `command` |
| Icon picker (dùng chung) | Grid search được của lucide icon trong allowlist; lưu `iconKey`; navigate bằng bàn phím (phím mũi tên trong grid, Enter chọn) | `popover`, `command`, `toggle-group` |
| Profile editor | Field mới: hero kicker, headline accent (error inline nếu không phải substring của headline, theo locale) | `field`, `input` |
| Project editor | Tab mới "Card & facts": domain select, key facts (2–4 dòng, counter), fact chips (tag input, ≤ 6) | `select`, `textarea`, `badge` |
| Post editor | Field "Key takeaways" (≤ 5 dòng) dưới body | `textarea` |
| Skills table | Cột switch "Marquee" mới; header hiện "n of 6+ needed" | `switch` |
| Social links | Switch mới "Show in CTA" (tối đa 2, cái còn lại disable khi đã bật 2) | `switch`, `tooltip` |
| Site → General | Switch mới: "Ambient effects (grid, glow)" và "Animate tech marquee" | `switch` |
| Site → Sections | Key mới `stats`, `marquee`, `domains`, `process`, `principles` xuất hiện thành row với control reorder/ẩn sẵn có | existing |
| Publish validation | Block publish khi bất kỳ field EN nào chứa `{{`, `TODO`, `TBD` hoặc `lorem` (site reference hiện `{{TODO}}` thô trên production; mình thì không được), và khi project không có domain | List `alert` trong editor |
| Dashboard → Content health | Thêm dòng: "Projects without a domain", "Case studies with < 2 key facts", "Stats hidden (fewer than 2 visible)", "Marquee needs 6+ skills" | Card sẵn có |
| Live preview (`2xl`) | Render đúng public component (`CaseCard`, `KeyFacts`, `StatBand`) với draft props, light và dark (toggle trên preview header) | `toggle-group` |

---

 
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

 
<h2 id="s-7">7. Brief để rebuild mockup (v2)</h2>

> **Trong chương này:** Cho model đang rebuild `mockups/portfolio/`.

| § | Mục |
| --- | --- |
| 7.1 | Rule global (áp cho mọi public screen) |
| 7.2 | Screen |


Cho model đang rebuild `mockups/portfolio/`. Verdict của Parker với v1 là "too bare/plain". Screen v1 (`01`–`09`) là một surface trung tính, heading nhỏ, card flat và không imagery. **Screen mới phải nhìn giàu hơn trong một ánh mắt** nhưng vẫn giữ mọi type rule ở 3.2 và mọi contrast pair ở 3.1. Làm theo section 2, 3, 4.7 và 5.1–5.6 của spec này. Đừng copy layout, copy hay palette xanh của site reference.

 

<h3 id="s-7-1">7.1 Rule global (áp cho mọi public screen)</h3>

| # | Phải khác v1 nhìn thấy được | Spec |
| --- | --- | --- |
| G1 | Section xen kẽ giữa `--background` và sọc `--band` full-width với `border-y`; không chạy dài các section cùng màu | 3.1, 4.4 |
| G2 | Dark mode dùng neutral **nhuộm jade** (bg `#0A0F0E`, card `#111817`), không phải gray `#0B0C0E` của v1 | 3.1, 3.6 |
| G3 | Home hero và CTA band nằm trên grid 44px đã mask với 1–2 orb mềm (`--glow`); không atmosphere chỗ nào khác | 3.1b, 4.7 `Atmosphere` |
| G4 | Mọi section title có **eyebrow** uppercase mono phía trên, và trên home có **icon tile** 28px bên cạnh | 3.2 `text-eyebrow`, 4.7 `SectionHeader` |
| G5 | Card có hover/focus state nhìn thấy: lift −2px, `--border-strong`, `--shadow-2`, title chuyển `--primary`, mũi tên góc `↗`. Mỗi screen capture một card ở hover state (thêm `.is-hover` vào card đó) | Bảng motion 3.4 |
| G6 | Project mang **domain pill** (icon + name) theo hue của nó; hue chỉ lấy từ bảng 5-hue | 3.1b |
| G7 | Icon là SVG inline copy từ lucide (stroke 1.75, 16/20px). Không emoji, không icon font | 4.7 |
| G8 | Size body và prose giữ đúng như 3.2 (16/18px, 1.6/1.75). "Giàu hơn" đến từ surface, card và icon, **không bao giờ** từ text nhỏ hơn, nhạt hơn hay contrast thấp hơn | 3.2 |
| G9 | Content: placeholder dựa trên CV như v1 (Parker Vu / Hung Vu Van, Hanoi, `parker2808`, Particula v2, LitGroup cart migration, Samsung SDS MSP, This portfolio). **Không phone hay email**: hiện `<email>` chỗ nào lẽ ra có address, và nút "Copy email" copy placeholder | 1.5 |
| G10 | Mỗi screen có bản light; home, case study và post thêm bản dark (`?dark=1`) | 3.6 |

**Spec screenshot:** Playwright + system Chrome, DPR 2, full page, width 1440 (desktop) và 390 (mobile). Capture với `reducedMotion: 'no-preference'` nhưng đóng băng animation ở trạng thái cuối (thêm class `.capture` trên `<html>` để set `animation: none !important; transition: none !important` và hiện content đã reveal cùng giá trị count-up cuối), nên orb, glow và hover state nhìn thấy được nhưng ảnh là deterministic. Tên file bên dưới; lưu vào artifacts và giữ `screenshot.mjs` là entry point duy nhất.

 

<h3 id="s-7-2">7.2 Screen</h3>

| File | Screen | Phải khác v1 nhìn thấy được | Content dùng |
| --- | --- | --- | --- |
| `01-home-light.png` (1440) | Home, light | (1) Hero: kicker pill `>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS`, H1 ở `text-display` (64px) với cụm accent bằng `--primary`, hero sub-line ở `text-prose`, primary + outline button, và **`MigrationDiagram`** (node v1 → v2 trên một card) bên phải thay vì box `git log` của v1; grid + orb phía sau. (2) **Stats band** mới (4 tile, icon + số lớn + label mono) trên một band. (3) Hàng **tech marquee** mới với nút pause nhìn thấy. (4) Featured case study thành `CaseCard` lớn với cover trông thật (gradient nhuộm + khung screenshot UI với block UI giả), domain pill, dòng `DiffStat` và fact chips, không phải placeholder grid flat. (5) Hàng **domains** 4-card mới với icon tile theo hue và project count. (6) Selected work card: domain pill, `↗`, `DiffStat`, chip; một card ở hover state. (7) Band **process** mới: feature card 2×2 + flow dọc 5-step với step giữa được highlight. (8) Skills 3 column với heading theo depth. (9) Notes dạng hàng `PostCard` với `#tags`. (10) **CTA band** với grid, glow, icon tile, H2, nút "Copy email" + GitHub + LinkedIn, thay CTA một dòng plain của v1. (11) Footer: một dòng mono (tên, footer nav, social icon, deploy hash), như wireframe 5.1 | Wireframe section 5.1; stats: "5+ years", "4 products shipped", "2 framework migrations", "1 enterprise platform"; domains như seed v2 ở 1.5 |
| `02-home-dark.png` (1440) | Home, dark | Cùng structure như 01 trong dark theme nhuộm jade; orb và grid hiện hơn (giá trị dark), primary button với `--glow-button`; contrast band nhìn thấy giữa `#0A0F0E` và `#0D1412` | Giống 01 |
| `03-case-study-light.png` (1440) | Case study Particula v2 | (1) Header: back link, domain pill + status pill, H1, tagline, **meta grid** với label eyebrow (ROLE, TEAM, TIMELINE, STACK). (2) Cover 21:9 với screenshot UI có khung, không phải grid flat. (3) Card **Key facts** 2×2. (4) Mỗi section bắt đầu bằng eyebrow (SUMMARY, LIMITS, HOW, TRADE-OFFS, RESULT, RETRO). (5) **Requirement columns** (functional / non-functional) với bullet ▹. (6) Decisions dạng card nhỏ với "Chose / Over / Because". (7) Metric before → after dạng card `DiffStat`. (8) Hàng **Fact chips**. (9) "More in Fintech / Web3" với 2 `CaseCard`. (10) TOC sticky bên phải với item active được đánh dấu, và reading-progress bar 2px dưới header (hiện ở ~40%) | Section 5.4; Particula: Vue 2 → Nuxt 3, RWA ratings, ReFi, team 6 người, 2024–now |
| `03b-case-study-dark.png` (1440, mới) | Case study, dark | Giống 03 bản dark | Giống |
| `04-blog-post-light.png` (1440) | Post "Vue → React: what transfers, what doesn't" | (1) Eyebrow NOTE + date · minutes mono + tag chip trên H1. (2) Callout với icon tile, không chỉ border trái. (3) Code block với thanh header (filename + language badge + nút copy). (4) Card **Key takeaways** ở cuối (3–5 bullet ▹, background `--primary-subtle`). (5) Prev/next là hai `PostCard`. (6) TOC sticky + progress bar. Prose giữ 18px / 1.75 / 66ch | Section 5.5 |
| `04b-blog-list-light.png` (1440, mới) | List notes | Search input với icon + hint `⌘K`, tag pill kèm count, list `PostCard` (date · minutes, title, `↗`, excerpt, `#tags`), một card ở hover state | Section 5.5; 3–5 post với title dựa trên CV |
| `05-home-mobile-light.png` (390) | Home, mobile | Hero với kicker, `text-display` 40px, diagram **dưới** button (đã scale), stats 2×2, marquee một hàng, domain card 1 column, process chỉ chuỗi dọc (feature card bên dưới), CTA band full width với button xếp chồng; header có hamburger. Không truncated; không scroll ngang page | Wireframe mobile section 5.1 |
| `06-admin-dashboard.png` (1440, dark) | Admin dashboard | Giữ layout. Chỉ đổi: card Content health list các check v2 mới ("Projects without a domain", "Case studies with < 2 key facts", "Marquee needs 6+ skills"); sidebar hiện item Stats, Domains và Process mới. Dùng token dark đã nhuộm. **Không** grid, orb hay band | Section 5.11 |
| `07-admin-projects-table.png` (1440) | Admin projects table | Giữ layout. Thêm cột **Domain** (hue pill) và cột count "Key facts" | Section 5.11 |
| `08-admin-project-editor.png` (1440) | Admin project editor | Giữ layout. Hiện tab mới "Card & facts" đang active: domain select, textarea key facts kèm counter, input fact chips, và live preview hiện đúng `CaseCard` | Section 5.11 |
| `09-home-skeletons.png` (1440) | Home loading state | Skeleton shape khớp section v2: hero với block diagram, 4 stat tile, hàng chip marquee, featured card, 4 domain card, chuỗi process. Atmosphere vẫn hiện (nó không phải content); không shimmer khi reduced motion | Các row section 5.0 |
| `10-about-light.png` (1440, mới) | About + timeline | Intro tách (avatar card với city + availability pill, bio), stats strip compact, timeline với year rail và group theo company (LitGroup hiện 2 role), principles đánh số (`01 -`), skills theo depth, hàng education, card download CV | Section 5.2; 4 experience row từ CV |
| `11-projects-light.png` (1440, mới) | List projects | Filter pill domain kèm count (hue dot), tech combobox, featured card rộng rồi grid `CaseCard` 2-column, một card ở hover state | Section 5.3; 4 project |
| `12-contact-light.png` (1440, mới) | Contact | Layout tách trên grid mờ: trái H1 + intro + note thời gian reply + channel card (Email `<email>` với "Copy email", GitHub `parker2808`, LinkedIn); phải form trên `--card-glass` với topic select; một field hiện ở error state | Section 5.6 |

**Acceptance check trước khi trả:** (a) mọi screen có ít nhất một band, một eyebrow và một icon tile (trừ admin); (b) body text 16px và prose 18px mọi nơi; (c) check nhanh contrast của muted text trên `--band` và mọi hue pill đạt 4.5:1 ở cả hai theme; (d) search `mockups/portfolio/*.html` tìm string dạng email, `+84` và `gmail` không ra gì; (e) screenshot 390px không overflow ngang.
