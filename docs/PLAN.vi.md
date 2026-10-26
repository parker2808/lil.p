# Kế hoạch triển khai portfolio

[English](./PLAN.md) · Cấu trúc: [root](../STRUCTURE.md) · [web](../apps/web/STRUCTURE.md) · [api](../apps/api/STRUCTURE.md) · Snapshot thiết kế: [docs/design/](./design/)

Plan này biến design của Parker (spec, Figma, mockup, practice roadmap) thành 67 task nhỏ. Mỗi task là một pull request mà một implementation agent, hoặc Parker, có thể tự làm xong và merge. Các task đi theo thứ tự của practice roadmap (p01–p33, milestone M0–M7), nên code lớn lên theo đúng nhịp của các bài học.

## Mục lục

0. [Cách dùng plan này](#0-how-to-use-this-plan)
1. [Nguồn sự thật (sources of truth)](#1-sources-of-truth)
2. [Quy tắc nền và Definition of Done (DoD)](#2-ground-rules-and-definition-of-done)
3. [Quyết định](#3-decisions)
4. [Kiến trúc tổng quan](#4-architecture-at-a-glance)
5. [Bản đồ thiết kế](#5-design-map)
6. [Tổng quan task](#6-task-overview)
7. [Các task](#7-tasks)
8. [Việc của owner và ngoài phạm vi](#8-owner-tasks-and-out-of-scope)
9. [Câu hỏi mở](#9-open-questions)

---

<a id="0-how-to-use-this-plan"></a>

## 0. Cách dùng plan này

1. Chọn task có số nhỏ nhất mà mọi **Phụ thuộc** của nó đều đã merge. Các task trong cùng milestone không phụ thuộc nhau có thể chạy song song. Task có hậu tố chữ cái (T01a, T10a, T45b) được thêm sau và nằm ngay sau số của nó: T01a đứng sau T01 và trước T02.
2. Đọc theo thứ tự: task, các mục spec mà task trích dẫn, Figma node và mockup mà task nêu tên, rồi các file STRUCTURE.md để biết path.
3. Làm trên một branch, mở một PR cho mỗi task, và dùng **Tiêu đề PR** của task. Khi roadmap có sẵn commit message cho bước đó, tiêu đề PR dùng lại message đó.
4. Copy list **Tiêu chí nghiệm thu** của task vào PR description dưới dạng checklist, kèm [Definition of Done](#2-ground-rules-and-definition-of-done). Tick từng mục kèm bằng chứng (output của một lệnh, một screenshot, tên một test).
5. Nếu spec, Figma và plan này mâu thuẫn nhau, làm theo thứ tự ưu tiên ở §1. Nếu một câu hỏi vẫn còn mở, thêm nó vào §9 trong cùng PR và chọn phương án được đánh dấu "mặc định".
6. Task backend có một khối **Các bước backend, giải thích** viết cho người mới với backend. Làm theo đúng thứ tự. Mỗi bước nêu tên một khái niệm mà nó dạy và link tới glossary của spec ([§1.6](./design/portfolio-design-system.vi.md#s-1-6)).

Cỡ task: **S** vừa một session ngắn (một nhóm file, không có khái niệm mới); **M** thêm một khái niệm mới hoặc một màn hình; **L** là cả một màn hình hoặc một feature xuyên suốt nhiều phần. Không task nào lớn hơn L; cái gì lớn hơn đã được tách nhỏ.

<a id="1-sources-of-truth"></a>

## 1. Nguồn sự thật (sources of truth)

| # | Nguồn | Quyết định gì | Ở đâu |
| --- | --- | --- | --- |
| 1 | **Spec** `portfolio-design-system.md` (+ `.vi.md`) | Giá trị token, typography, component, behavior, data model, API, security | Bản gốc: private repo `parker2808/interview-fe-data`, `plans/`. Snapshot: [docs/design/portfolio-design-system.md](./design/portfolio-design-system.vi.md) |
| 2 | **Figma** Design System v2 | Tên variable và component (cùng tên với CSS trong spec), variant của component | [figma.com/design/ULYJR56vSbNQhZE3JxvkRu](https://www.figma.com/design/ULYJR56vSbNQhZE3JxvkRu): 180 variable (Color Light/Dark, Spacing, Radius), 17 text style (`Public/<token> · <px>`, `Admin/<token> · <px>`), 7 component set / 84 variant, 14 screen |
| 3 | **Mockup** (đã đóng băng) và screen trong Figma | Layout, thứ tự section, mật độ visual của từng screen | [docs/design/mockups/](./design/mockups/) (mở `index.html`, thêm `?dark=1` trên home và case study); gallery tại [/practice/design](https://parker-interview-senior-fe.vercel.app/practice/design). Gallery ghi: "Match these screens, not a redesign." |
| 4 | **Practice roadmap** p01–p33 | Thứ tự task, các bước học, done-check, commit message | [/practice](https://parker-interview-senior-fe.vercel.app/practice). Snapshot: [docs/design/roadmap.json](./design/roadmap.json) |
| 5 | Các file **STRUCTURE.md** | Mỗi file nằm ở đâu, cách đặt tên | [root](../STRUCTURE.md), [apps/web](../apps/web/STRUCTURE.md), [apps/api](../apps/api/STRUCTURE.md) |
| 6 | `colors.json` (Figma export) | Test oracle cho color token | [docs/design/colors.json](./design/colors.json): 58 token × light/dark, giống hệt spec §3.6 |

**Thứ tự ưu tiên khi các nguồn mâu thuẫn:** spec thắng về giá trị, behavior, data và API (1). Tên trong Figma theo spec, nên một giá trị bị lệch là bug của Figma: dùng giá trị của spec và ghi chú lại trong PR (2). Layout theo mockup và Figma frame (3). Thứ tự và cách dạy theo roadmap (4), trừ chỗ một quyết định ở §3 thay một chi tiết của roadmap bằng lựa chọn của spec. File path theo STRUCTURE.md (5), thay cho các path minh họa trong spec (xem D20). Một quyết định đánh dấu **Parker** ở §3 là lựa chọn riêng của Parker sau khi spec đã viết xong; nó thắng mọi nguồn ở trên, kể cả spec (hiện tại: D7 và D24 về auth, D25 về editor của admin, D26 về page dựng từ block, D27 về hook format cho cả repo).

**Ghi chú về snapshot.**

- Snapshot trong `docs/design/` được lấy ngày 2026-10-25 từ practice site public, vì private repo không đọc được từ môi trường này. Nếu private repo đã thay đổi từ đó, private repo thắng. Refresh snapshot trong một PR riêng (`docs(design): refresh snapshot`).
- Chỉ screen Projects (Figma `13:2`) được bind đầy đủ vào variable. Với các frame khác, đọc layout từ Figma và giá trị từ token trong spec.
- Figma frame `2:2`/`3:2` (home) và `4:2`/`5:2` (case study) là các cặp light/dark, nhưng chưa xác minh frame nào là frame nào (đã chạm rate limit của Figma API). Kiểm tra tên frame trước khi so sánh screenshot.

<a id="2-ground-rules-and-definition-of-done"></a>

## 2. Quy tắc nền và Definition of Done (DoD)

**Quy tắc nền (mọi task).**

1. **Không hard-code content.** Mọi text mà visitor đọc và nói về Parker hoặc site đều đến từ API và edit được trong `/admin`. Code chỉ chứa design token, UI label cố định trong `apps/web/i18n/locales/{en,vi}.json`, danh sách route, và block registry (có những block type nào và zod schema cho props của chúng, không bao giờ là content của chúng; D26) (spec [§1.5](./design/portfolio-design-system.vi.md#s-1-5), [§4.5](./design/portfolio-design-system.vi.md#s-4-5)).
2. **Privacy.** Không bao giờ commit email hay số điện thoại thật. Dùng `<email>` và `<phone>` trong seed, fixture, test, doc và `.env.example`. Nếu không, `pnpm check:content` (từ T14) sẽ làm build fail.
3. **Chỉ dùng token.** Màu, radius, shadow, spacing và font size đến từ `packages/ui/src/styles/globals.css`. Không hex value, không arbitrary value của Tailwind (`text-[17px]`, `bg-[#…]`) trong component. Chỉ dùng 11 text size có tên: `text-display`, `text-title`, `text-heading`, `text-subheading`, `text-prose`, `text-body`, `text-meta`, `text-eyebrow`, `text-ui-title`, `text-ui`, `text-ui-meta` (spec [§3.2](./design/portfolio-design-system.vi.md#s-3-2)).
4. **Chữ dễ đọc.** Body 16px / 1.6, prose 18px / 1.75 / max 66ch. Cảm giác "richer" đến từ surface và icon, không bao giờ từ chữ nhỏ hơn hay contrast thấp hơn (spec §7.1 G8). Áp dụng line-height tối thiểu cho tiếng Việt (1.2 cho heading, 1.5 cho UI).
5. **File đặt đúng chỗ STRUCTURE.md quy định.** List **File** của task dùng các path đó. Một loại folder mới cần cập nhật STRUCTURE.md trong cùng PR.
6. **An toàn database.** Không bao giờ sửa một migration đã apply; hãy thêm migration mới. Không bao giờ chạy `prisma db push` khi đã có migration.
7. **Một task, một PR.** Không kéo việc của task sau lên làm trước. Nếu thiếu thứ gì, stub nó sau interface nhỏ nhất có thể và ghi chú lại.
8. **Một block type được thêm trong một PR, vào mọi registry cùng lúc** (D26): definition của nó trong `packages/contracts/src/blocks/definitions/` + `block-registry.constant.ts`, renderer của nó trong `apps/web/src/modules/blocks/` + `block-renderers.constant.ts`, và từ T45b trở đi, entry admin của nó trong `apps/web/src/modules/admin-pages/constants/block-editor-meta.constant.ts` cùng các label `admin.blocks.*`. Các registry phía web có type `satisfies Record<BlockType, …>`, nên thiếu một entry thì `pnpm typecheck` fail.

**Definition of Done (DoD), copy vào mọi PR.**

- [ ] `pnpm lint`, `pnpm format:check` (từ T01a), `pnpm typecheck`, `pnpm test`, `pnpm build` pass ở local và trên CI.
- [ ] `pnpm check:content` pass (từ T14 trở đi).
- [ ] `pnpm check:deps` pass (từ T42 trở đi): không có package Tiptap trả phí (D25).
- [ ] Các mục nghiệm thu của task được tick kèm bằng chứng.
- [ ] Task UI: screenshot ở 1440 và 390, light và dark, đính kèm vào PR và so sánh với Figma node hoặc mockup mà task nêu tên. Các điểm khác biệt được liệt kê và giải thích lý do.
- [ ] Task UI: kiểm tra bằng bàn phím (thứ tự Tab, focus ring nhìn thấy được, `Esc` đóng overlay) và kiểm tra reduced-motion.
- [ ] Chỉ dùng token và 11 text size; không có email hay số điện thoại thật ở bất kỳ đâu trong diff.
- [ ] File nằm đúng vị trí theo STRUCTURE.md; request mới được thêm vào `apps/api/api.http` (task API).
- [ ] Migration (nếu có) được tạo bằng `prisma migrate dev --name …`, và SQL sinh ra đã được đọc và tóm tắt trong PR.

<a id="3-decisions"></a>

## 3. Quyết định

Các quyết định này chốt những chỗ các nguồn mâu thuẫn hoặc không nói gì. Mỗi quyết định là mặc định; §9 liệt kê những quyết định Parker có thể muốn lật lại.

| ID | Quyết định | Vì sao / mâu thuẫn được giải quyết |
| --- | --- | --- |
| D1 | Repo root của `lil.p` là monorepo. Folder `portfolio/` trong roadmap nghĩa là repository này. | Roadmap được viết trước khi repo tồn tại |
| D2 | Code dùng chung nằm trong `packages/ui` và `packages/contracts`, không phải một `packages/shared`. | Spec §4.0 và §6 tách chúng ra; roadmap p01/p08 ghi `packages/shared` |
| D3 | Text dài (các section case study, body của post, bio) là **Markdown trong `@db.Text`**, render trên Next server bằng một pipeline an toàn duy nhất (không raw HTML, element theo allowlist, output của Shiki được chuyển thành React, không `dangerouslySetInnerHTML`). Quyết định này thay cho "JSON blocks" của roadmap p12; các rule của p12 (input validate bằng zod, draft không hiện ra) vẫn áp dụng. Phần bố cục page thì có dùng JSON block (D26); text dài bên trong một block vẫn là Markdown. | Spec §1.5 và §4.3 (`MarkdownEditor`) |
| D4 | API route theo spec: `/api/public/*` (không auth), `/api/admin/*` (JWT đã login, D24), `/api/auth/*`, cộng thêm một aggregate `GET /api/public/site?locale` cho layout. Các URL trong roadmap như `GET /settings`, `GET /posts` map vào các route này. | Spec §4.5, §5.0 |
| D5 | Mọi error dùng chung một body: `{ statusCode, code, message, requestId, fieldErrors? }`. | Spec §4.6 |
| D6 | List dùng pagination theo page: request `?page&pageSize&sort&q&…`, response `{ items, page, pageSize, total }`, `pageSize` tối đa 100. Chỉ audit log và media library dùng cursor pagination (`?cursor&limit`). Các check của p13 vẫn áp dụng: lật qua tất cả row không bị trùng hay sót (sort luôn kết thúc bằng `id`), và `pageSize=500` trả 400 kèm field error. | Mockup admin table hiện "1–5 of 5" và các page size; spec §4.6 chỉ dùng cursor cho infinite list |
| D7 | **Parker.** Chỉ có hai role: `admin` và `user` (Prisma enum `Role { admin user }`, cùng chuỗi đó trong `@Roles('admin')`). `admin` làm được mọi thứ. `user` là người review đã login, chỉ đọc: dashboard, list nội dung và editor ở chế độ read-only, analytics, xem trước draft, và password của chính mình; không ghi, không publish, không upload, không inbox, không audit log, không quản lý user (bảng đầy đủ ở T36). Một route được bảo vệ mà không có `@Roles()` thì chỉ admin dùng được, nên quên decorator thì vẫn fail an toàn. Login bằng email + password, hash bằng argon2id. Seed tạo một `admin` từ env (`ADMIN_EMAIL="<email>"` trong `.env.example`); admin tạo các tài khoản khác trong màn hình quản lý user chỉ dành cho admin (T46). | Thay cho spec §1.5 `User.role` (`OWNER\|EDITOR\|VIEWER`) và §4.3 "Users (owner only)" |
| D8 | Bảo vệ CSRF bằng cookie `SameSite=Lax` + check `Origin` trên request có thay đổi data, không dùng double-submit token. Vẫn áp dụng khi dùng JWT, vì token đi trong cookie (D24). Check của roadmap p19 "ghi mà không có CSRF header → 403" trở thành "ghi với `Origin` lạ hoặc thiếu → 403". | Spec §1.6 |
| D9 | Không CORS. Browser chỉ nói chuyện với Next; `next.config.ts` rewrite `/api/*` sang Nest. Mục "CORS" của roadmap p05 được bỏ qua. API bind vào `127.0.0.1` cho tới khi có guard (T36). | Spec §1.6, §6 |
| D10 | Quan hệ many-to-many dùng implicit join table của Prisma (`skills Skill[]` ở cả hai phía). Check `ProjectSkill` của roadmap p11 trở thành "các join row `_ProjectToSkill` nhìn thấy được trong Prisma Studio". | Spec §1.5 |
| D11 | Tên: `ContactMessage` và `ContactTopic` (không phải `Message`), public route `/notes` (không phải `/blog`), `Domain`, `ProfileStat`, `ProcessStep`. | Spec §1.5, §5.5 |
| D12 | Các Prisma model đầu tiên (T08) là `SiteSettings`, `Profile`, `NavItem`, `SocialLink`, `Page`, `PageBlock` (D26). `Experience` đến ở T15. Check của roadmap p06 "Studio hiện SiteSettings, Profile, Experience" trở thành "Studio hiện SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock". | Spec §6 Day 4, aggregate `GET /public/site` và các page block cần các model này trước |
| D13 | Hai seed profile trong `apps/api/prisma/seed/profiles/`: **`demo`** (dev, CI, screenshot: project `PUBLISHED`, 3 post mẫu, message và view mẫu — copy placeholder từ mockup) và **`baseline`** / **`owner`** (lần boot production đầu tiên: `data/portfolio-data.json`, project `DRAFT`, 0 post). Chọn bằng `SEED_PROFILE`. Giá trị owner copy nguyên văn; field không có model nằm ở `data/portfolio-unmapped.json`. Metric trong demo chỉ lấy từ wireframe. | Spec §1.5 seed draft và 0 post, nhưng screen public nào cũng cần data đã publish để build và test |
| D14 | Media nhận JPG, PNG, WebP, AVIF và **PDF** (file resume cho `Profile.resumeEnId/ViId`). Image có variant WebP (480/960/1600); PDF được lưu nguyên. Tối đa 10 MB. **Parker (hosting):** file nằm trên **Cloudinary**, không `UPLOAD_DIR` hay Docker volume. API chỉ lưu metadata (`Media.fileName` là Cloudinary public id). Variant là URL transform (`f_webp`). Test và boot local không có env Cloudinary dùng storage in-memory, không ghi đĩa. | Spec §1.5 link resume tới `Media`; hosting miễn phí (disk Render ephemeral) |
| D15 | Storybook nằm trong `packages/ui` (`@storybook/react-vite`, addon-a11y, một nút chuyển light/dark trên toolbar). Mọi product component đều đi kèm một story. | Spec §6 Days 1–6 build component dựa trên fixture |
| D16 | CI (GitHub Actions) bắt đầu từ T01 với install + lint + typecheck + build và lớn dần theo từng task (`format:check` ở T01a, test từ T05, build Storybook ở T06, API test ở T29, e2e ở T56). | Roadmap p28 thêm CI muộn; có CI sớm giúp PR nào cũng merge được |
| D17 | Test database là một MySQL service thứ hai thuộc compose profile `test` (port 3307), được thêm ở T29 cùng các integration test đầu tiên. | Roadmap p15/p28 |
| D18 | Block mặc định của từng page, seed dưới dạng `key` của block → block type (D26). **HOME:** `hero` → `hero`, `stats` → `stat-band`, `marquee` → `tech-marquee` (stats và marquee dùng chung một band), `featured` → `featured-case`, `domains` → `domain-grid`, `work` → `case-grid`, `process` → `process`, `skills` → `skill-groups`, `notes` → `post-list`, `cta` → `cta-band`. **ABOUT:** `intro` → `about-intro`, `stats` → `stat-band` (compact), `experience` → `timeline`, `principles` → `principle-list`, `skills` → `skill-groups`, `education` → `education-list`, `cv` → `cv-download`. **PROJECTS:** `header` → `page-header`, `projects` → `projects-browser`. **NOTES:** `header` → `page-header`, `notes` → `notes-browser`. **CONTACT:** `contact` → `contact-form`. Các key này là key `PageSection` cũ, nên anchor như `/#work` vẫn chạy. | Spec §1.5 liệt kê ví dụ section; §5.1–5.6 cần các block này. `header` lấp chỗ trống cho title của các list page. Heading của CONTACT nằm bên trong `contact-form`, vì mockup đặt nó trong cột cạnh form |
| D19 | Locale fallback theo từng nhóm field. Một nhóm DTO public (ví dụ một project card, body của một post) chỉ dùng tiếng Việt khi mọi field dịch được có giá trị tiếng Anh cũng có giá trị tiếng Việt; nếu không, cả nhóm là tiếng Anh với `lang: "en"`. | Spec §1.5 "falling back to English with `lang` on the field group" |
| D20 | Path trong STRUCTURE.md thay cho path minh họa trong spec: `apps/web/messages/` → `apps/web/i18n/locales/`; `packages/contracts/icons.ts` → `src/constants/icons.constant.ts`; `query-keys.ts` → `src/constants/query-keys.constant.ts`; `fixtures/*` → `src/fixtures/*.fixture.ts`. | Quy ước đặt tên của Parker (kebab-case + hậu tố) |
| D21 | Một shadcn primitive được thêm bởi task đầu tiên dùng nó, không thêm tất cả cùng lúc. | Giữ PR nhỏ và dễ review |
| D22 | Chuỗi chrome của admin nằm trong `apps/web/i18n/locales/en.json` dưới `admin.*`. Admin UI chỉ có tiếng Anh (phần intro của spec §5), nên `vi.json` không có key `admin`. | Giữ `react/jsx-no-literals` bật cho cả admin |
| D23 | Fetch public dùng `revalidate: 3600` + tag trên production và `revalidate: 0` khi development (`NODE_ENV`), nên thay đổi seed hiện ra ngay mà không phải chờ. | Check của roadmap p09 "seed lại thì home page thay đổi" |
| D24 | **Parker.** Auth dùng **JWT thay cho session MySQL**: `@nestjs/jwt` ký, `passport-jwt` (qua `@nestjs/passport`) verify. Một **access token** ngắn (15 phút, payload `{ sub, role }`) và một **refresh token** dài hơn (7 ngày, payload `{ sub, ver }`), ký bằng hai secret khác nhau. Cả hai nằm trong cookie `httpOnly` do API set (`access_token` trên `Path=/`, `refresh_token` trên `Path=/api/auth`), không bao giờ ở `localStorage` hay bộ nhớ JS; cách này chạy được vì Next proxy `/api/*`, nên cookie là first-party với origin của web (D9). Không có bảng `Session`: `User.tokenVersion` là công tắc khẩn cấp ("sign out everywhere", khóa tài khoản, đổi password đều tăng nó, và mọi lần refresh đều check nó). Đánh đổi, đã chấp nhận: access token đã cấp vẫn dùng được tới khi hết hạn (tối đa 15 phút), và logout thường chỉ xóa cookie của browser này. | Thay cho spec §1.5 `Session`, dòng Auth ở §1.6 (vốn chọn session) và "session MySQL" của roadmap p18; mục tiêu học của p18 (hash, cookie httpOnly, logout) vẫn giữ |
| D25 | **Parker.** `MarkdownEditor` của admin được dựng trên **Tiptap v3** (ProseMirror), chỉ dùng các package MIT miễn phí từ npm registry public: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` và `@tiptap/extension-*`. Không dùng Tiptap Pro hay extension trả phí, không dùng registry `@tiptap-pro/*`, không Tiptap Cloud, Collaboration, Comments hay AI, không cần tài khoản hay token Tiptap; `pnpm check:deps` enforce điều này trong CI (T42). Cách lưu không đổi (D3): editor load với `contentType: 'markdown'` và lưu `editor.getMarkdown()`. Schema của nó chính là allowlist Markdown dùng chung với renderer public (`packages/contracts/src/constants/markdown.constant.ts`, T23), nên editor không thể tạo ra thứ mà site public sẽ bỏ đi. Code block dùng `@tiptap/extension-code-block-lowlight` + `lowlight` lúc viết; chế độ Preview hiện đúng output Shiki của trang public. | Thay cho `MarkdownEditor` (CodeMirror 6) ở spec §4.0 và §4.3; toolbar, slash menu, paste ảnh, các chế độ, word count và `SaveStatus` của spec vẫn giữ |
| D26 | **Parker.** Page public được **dựng từ block quản lý trong admin**. Mỗi page trong năm route page (`HOME`, `ABOUT`, `PROJECTS`, `NOTES`, `CONTACT`) là một list có thứ tự gồm các row `PageBlock`: `type`, `key` (anchor), `props` (MySQL `JSON`), một `layout` preset, `surface`, `sortOrder`, `isVisible`. Block type chỉ đến từ một **registry nằm trong code** gồm các component của design system (`packages/contracts/src/blocks/`). Mỗi type có một zod 4 props schema, được API dùng để validate mọi lần ghi và mọi lần đọc, và được admin biến thành một TanStack Form (`z.toJSONSchema` + gợi ý widget qua `.meta()`), cùng các page, layout và giới hạn được phép của nó. Layout chỉ được chọn từ preset (`ONE`, `TWO`, `THREE`, `FOUR`, `SPLIT_8_4`, `SPLIT_4_8`, `SPLIT_7_5`) với luật responsive cố định (§4); không có grid tự do theo từng field. Page builder trong admin (T45b) sắp xếp block bằng drag and drop với `@dnd-kit/core` + `@dnd-kit/sortable` (MIT; move up/down vẫn giữ làm cách thay thế cho bàn phím và một-con-trỏ), thêm, nhân bản, xóa và ẩn block, và sửa props trong form được generate. Mỗi page có một draft (các row) và các version đã publish (JSON snapshot `PageVersion`): publish copy draft thành một version mới, version nào cũng restore được vào draft, và live preview hiện draft qua Next draft mode (T52a). Page public vẫn là React Server Component có cache tag (`page:{key}` + tag data của từng block). Type lạ hoặc props sai không bao giờ làm vỡ page: API bỏ block đó và log lại, web không render gì cho type nó không biết, và mỗi block có `SectionBoundary` riêng. `PageSection` trở thành `PageBlock`: cùng model thứ tự và hiển thị, với các cột `title`, `intro` và `ctaLabel` chuyển vào `props`, nên không có model thứ hai. Page chi tiết (`/projects/[slug]`, `/notes/[slug]`) giữ template cố định, và text dài vẫn là Markdown (D3). | Thay cho `PageSection` ở spec §1.5 (key cố định, mỗi key một component), luật sắp xếp ở §4.5 và tab Sections ở §5.10; đưa `BlockRenderer` của roadmap p14 và "block editor list" của p22 trở lại ở cấp page. Đặt block tự do trên grid và block nằm cạnh nhau là hướng mở rộng có thể làm sau (Q13) |
| D27 | **Parker.** Một toolchain Prettier + Husky v9 ở root cho cả monorepo (`apps/web`, `apps/api`, `packages/*` sau này): giữ `.prettierrc` và `eslint.config.mjs` của T01, thêm `format` / `format:check`, lint-staged ở pre-commit, commitlint (conventional commit, cùng dạng với tiêu đề PR) ở commit-msg, `pnpm typecheck` tùy chọn ở pre-push, và `pnpm format:check` trên CI. Không có config format/lint theo từng app trừ khi app sau này thật sự cần override. | T01 đã có config dùng chung nhưng chưa có git hook hay format check cho cả repo |

<a id="4-architecture-at-a-glance"></a>

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

**Rendering (spec [§4.6](./design/portfolio-design-system.vi.md#s-4-6)).** Public page là React Server Component gọi `apiServer()` kèm cache tag (`site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`). Khi publish, API gọi `POST /api/revalidate` trên web app, endpoint này chạy `revalidateTag`. Client island (search notes, contact form, pause marquee, ⌘K) là các file `'use client'` nhỏ. Admin prefetch trên server, hydrate bằng `HydrationBoundary`, và đọc bằng `useSuspenseQuery` với key từ `qk`.

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

## 5. Bản đồ thiết kế

Link Figma dùng dạng `https://www.figma.com/design/ULYJR56vSbNQhZE3JxvkRu/?node-id=<id>` (viết `13:2` thành `13-2`). Mockup nằm trong `docs/design/mockups/`. Gallery id là tên các screenshot trên [/practice/design](https://parker-interview-senior-fe.vercel.app/practice/design).

| Screen | Figma node | Mockup | Gallery | Spec | Task |
| --- | --- | --- | --- | --- | --- |
| Cover & foundations (token, type, màu) | page `0:1` | `foundations.html`, `cover.html` | n/a | §3 | T04, T05, T06 |
| Component (Button, Badge/Pill, Eyebrow, Input, CaseCard, Kicker pill, Nav link) | page `1:2` | `foundations.html` | n/a | §4.1, §4.7 | T12, T13, T20 |
| Home, light / dark (một cặp, cần xác minh frame nào) | `2:2`, `3:2` | `home.html`, `home.html?dark=1` | `01-home-light`, `02-home-dark` | §5.1, §7.2 | T14, T24 |
| Home, mobile 390 | `8:2` | `home.html` ở 390px | `05-home-mobile-light` | §5.1 | T14, T24 |
| Home, loading | `21:2` | `home-skeleton.html` | `09-home-skeletons` | §5.0 | T13, T24 |
| About + timeline | `7:2` | `about.html` | `10-about-light` | §5.2 | T25 |
| List project (bind token đầy đủ) | `13:2` | `projects.html` | `11-projects-light` | §5.3 | T26 |
| Case study, light / dark (một cặp, cần xác minh frame nào) | `4:2`, `5:2` | `case-study.html`, `?dark=1` | `03-case-study-light`, `03b-case-study-dark` | §5.4 | T27 |
| List notes | `9:2` | `notes.html` | `04b-blog-list-light` | §5.5 | T28 |
| Post | `10:2` | `post.html` | `04-blog-post-light` | §5.5 | T23, T28 |
| Contact | `12:2` | `contact.html` | `12-contact-light` | §5.6 | T48 |
| Admin dashboard (dark) | `14:2` | `admin-dashboard.html` | `06-admin-dashboard` | §5.7, §5.11 | T37, T38, T54 |
| Admin table project | `15:2` | `admin-table.html` | `07-admin-projects-table` | §5.8, §5.11 | T39, T40, T41 |
| Admin editor project | `18:2` | `admin-editor.html` | `08-admin-project-editor` | §5.9, §5.11 | T42, T43, T44 |
| Admin page builder (chưa có frame: ghép từ `18:2` và `15:2`) | không có | không có | n/a | §5.10, D26 | T45b, T52a |

**Figma component set → code.**

| Figma set (variant) | Property | Code |
| --- | --- | --- |
| Button (40) | Variant `Primary/Secondary/Outline/Ghost/Destructive` × State `Default/Hover` × Size `Public 40/Admin 32` × Theme | `packages/ui/src/components/ui/button.tsx` với các variant `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; size `sm` 28, `default` 32, `lg` 40 (T12) |
| Badge/Pill (22) | Hue `neutral/primary/success/warning/destructive/outline/jade/amber/blue/violet/rose` × Theme | `components/ui/badge.tsx` với variant `hue` (T12) |
| Eyebrow (4) | Tone `Primary/Subtle` × Theme | `components/Eyebrow/` (T12) |
| Input (8) | State `Default/Focus/Error/Disabled` × Theme | `components/ui/input.tsx` + `field.tsx` (T12) |
| CaseCard (4) | State `Default/Hover` × Theme | `components/CaseCard/` (T20) |
| Kicker pill (2) | Theme | `components/KickerPill/` (T12) |
| Nav link (4) | State `Default/Active` × Theme | `components/NavLink/` (T12) |

<a id="6-task-overview"></a>

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

## 7. Các task

Mỗi task dùng cùng một template: **Roadmap · Spec · Phụ thuộc · Cỡ**, rồi Mục tiêu, Phạm vi, Ngoài phạm vi, File, Thiết kế, Các bước backend, giải thích (chỉ với task backend), Tiêu chí nghiệm thu, Tiêu đề PR.

### M0 — Nền tảng

#### T01 · Scaffold monorepo, toolchain, CI tối thiểu

**Roadmap** p01 · **Spec** [§1.6](./design/portfolio-design-system.vi.md#s-1-6), [§6](./design/portfolio-design-system.vi.md#s-6) · **Phụ thuộc** không có · **Cỡ** S

**Mục tiêu.** Một pnpm workspace với layout cố định, config lint/format/TypeScript dùng chung, và một CI job mà mọi PR sau này đều phải pass.

**Phạm vi.**
- Root `package.json`: `"private": true`, `"packageManager": "pnpm@<pinned>"` (bật bằng `corepack enable`), `"engines": { "node": ">=22" }`, script `dev`, `lint`, `typecheck`, `test`, `build`, `format` chạy qua mọi workspace bằng `pnpm -r` (dùng `--if-present` để package rỗng vẫn pass).
- `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (`22`), `.editorconfig` (utf-8, lf, 2 space), `.gitignore` (`node_modules`, `.env`, `.next`, `dist`, `coverage`, `uploads`, `storybook-static`), `.npmrc` nếu cần.
- `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`), `eslint.config.mjs` (flat config, typescript-eslint, sort import), config Prettier.
- `README.md`: những thứ cần cài trước (Node 22, pnpm qua corepack, Docker Desktop, git) và các lệnh root từ [STRUCTURE.md](../STRUCTURE.md#root-commands).
- `.github/workflows/ci.yml`: checkout, `pnpm/action-setup`, `setup-node` 22 với pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (D16).

**Ngoài phạm vi.** Tạo các app hay package (T04, T05, T07, T09). Docker (T02).

**File.** Chỉ ở root: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `README.md`, `.github/workflows/ci.yml`. Giữ nguyên `STRUCTURE.md`, `apps/*/STRUCTURE.md` và `docs/` hiện có.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] `node -v` in ra 22.x; `pnpm -v` và `docker compose version` chạy được (roadmap p01).
- [ ] `pnpm install`, `pnpm lint`, `pnpm typecheck` exit 0 trên một bản clone mới.
- [ ] CI chạy trên PR và xanh.
- [ ] Commit message của squash-merge là `chore: init portfolio monorepo` (roadmap p01).

**Tiêu đề PR:** `chore: init portfolio monorepo`

#### T01a · Prettier, Husky, lint-staged, commitlint

**Roadmap** — (Parker, D27) · **Spec** — · **Phụ thuộc** T01 · **Cỡ** S

**Mục tiêu.** Một toolchain format và git hook ở root, phủ `apps/web`, `apps/api` và `packages/*` sau này mà không cần config theo từng app.

**Phạm vi.**
- Giữ `.prettierrc` và `eslint.config.mjs` ở root của T01. Thêm `prettier-plugin-tailwindcss` để sort class Tailwind khi T04 thêm chúng.
- `.prettierignore` cho lockfile, output build, uploads, Storybook static, file nội bộ của Husky, và snapshot thiết kế đã đóng băng.
- Script root `format` (`prettier --write .`) và `format:check` (`prettier --check .`) — một lệnh cho cả cây, không dùng `pnpm -r`.
- Husky v9 + script `prepare`. **pre-commit** → lint-staged (Prettier `--write` trên file staged `ts`/`tsx`/`js`/`json`/`md`/`css`/`yml`; ESLint `--fix` trên JS/TS). **commit-msg** → commitlint (conventional commit, cùng dạng với tiêu đề PR như `chore: …`). **pre-push** → `pnpm typecheck` (lưới an toàn tùy chọn).
- CI: thêm `pnpm format:check`.
- README + STRUCTURE.md: một mục ngắn cho người mới về các hook.

**Ngoài phạm vi.** Prettier/ESLint theo từng app. Docker (T02). Tạo app hay package (T04, T05, T07, T09).

**File.** Root: `package.json`, `pnpm-lock.yaml`, `.prettierrc`, `.prettierignore`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.github/workflows/ci.yml`, `README.md`, `STRUCTURE.md`, `docs/PLAN.md`, `docs/PLAN.vi.md`.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm format:check` exit 0.
- [ ] `pnpm lint` và `pnpm typecheck` vẫn exit 0.
- [ ] CI có `pnpm format:check` và xanh.
- [ ] Commit message không theo conventional bị hook commit-msg từ chối.
- [ ] Không có config Prettier/ESLint trong `apps/*` hay `packages/*`.

**Tiêu đề PR:** `chore: add prettier, husky and commitlint`

#### T02 · Docker Compose: MySQL 8.4 + Adminer

**Roadmap** p02 · **Spec** §1.6 · **Phụ thuộc** T01 · **Cỡ** S

**Mục tiêu.** Một MySQL local giữ được data qua các lần restart, cộng Adminer để nhìn vào bên trong, khởi động bằng một lệnh.

**Phạm vi.**
- `docker-compose.yml` gồm:
  - `db`: `mysql:8.4` (pin tag), `command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci`, env từ `.env`, `ports: ["127.0.0.1:3306:3306"]`, named volume `db-data:/var/lib/mysql`, `./infra/mysql/init:/docker-entrypoint-initdb.d:ro`, healthcheck `mysqladmin ping -h localhost`.
  - `adminer`: pin tag, `127.0.0.1:8080:8080`, `depends_on: db: condition: service_healthy`.
- `infra/mysql/init/01-dev-grants.sql`: cho app user quyền tạo và drop database, thứ mà shadow database của Prisma cần cho `migrate dev` (tránh lỗi P3014). Chỉ dùng cho dev.
- `.env.example` với các dòng `MYSQL_*` và `DATABASE_URL` từ §4 (password placeholder). `.env` vẫn bị git ignore.
- Root script `db:up`, `db:down`, `db:logs`. Section "Database" trong README.

**Ngoài phạm vi.** Test DB (T29), compose cho production (T58).

**File.** `docker-compose.yml`, `infra/mysql/init/01-dev-grants.sql`, `.env.example`, `package.json` (script), `README.md`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Image và container** (glossary §1.6). `mysql:8.4` là chương trình đã được đóng gói; `docker compose up` khởi động một bản đang chạy của nó. Pin tag để mọi người chạy cùng một version.
2. **Port mapping.** `127.0.0.1:3306:3306` nghĩa là "port 3306 trên laptop của mình, chỉ truy cập được từ chính laptop đó, đi tới port 3306 trong container". Bind vào `127.0.0.1` giữ DB không lộ ra mạng Wi-Fi của bạn.
3. **Volume.** `db-data` là một folder Docker giữ bên ngoài container. `docker compose down` xóa container nhưng không xóa volume, nên data vẫn còn. `docker compose down -v` xóa luôn volume (reset toàn bộ).
4. **Biến môi trường (environment variable).** Password nằm trong `.env`, không bao giờ vào git. `.env.example` cho biết có những key nào, với giá trị giả.
5. **Init script.** File trong `/docker-entrypoint-initdb.d` **chỉ chạy lần đầu tiên** volume được tạo. Nếu bạn đã có volume từ trước, hãy chạy lệnh grant trong `01-dev-grants.sql` bằng tay trong Adminer, hoặc reset bằng `down -v`.
6. **Healthcheck.** Compose ping MySQL cho tới khi nó trả lời, nên các service khác (hiện là Adminer, sau này là API ở T58) chỉ khởi động khi DB đã sẵn sàng.

**Tiêu chí nghiệm thu.**
- [ ] `docker compose up -d db` đạt `healthy` trong `docker compose ps` (roadmap p02).
- [ ] Tạo một table nháp trong Adminer, chạy `docker compose down` rồi `up`: table vẫn còn (roadmap p02). Drop nó sau đó.
- [ ] Adminer ở `http://localhost:8080` login được bằng user trong `.env`.
- [ ] `docker compose ps` cho thấy port được bind vào `127.0.0.1`.
- [ ] `SHOW VARIABLES LIKE 'character_set_server'` trả về `utf8mb4`.

**Tiêu đề PR:** `chore(infra): mysql via docker compose`

#### T03 · Ghi chú SQL viết tay (Parker)

**Roadmap** p03 · **Spec** §1.5, §1.6 · **Phụ thuộc** T02 · **Cỡ** S · **Người làm:** Parker (agent chỉ được soạn outline)

**Mục tiêu.** Học table, key và join bằng cách tự gõ SQL trước khi Prisma viết nó thay bạn.

**Phạm vi.**
- Mở MySQL shell: `docker compose exec db mysql -u app -p portfolio`.
- Tạo table nháp `profile` và `experience` (có foreign key `profile_id`), insert row, `SELECT … JOIN`, `UPDATE`, `DELETE`.
- Thử xóa một profile đang có experience: xem foreign key chặn lại (`RESTRICT`), rồi tạo lại với `ON DELETE CASCADE` và giải thích trong comment bạn sẽ chọn cách nào và vì sao.
- Drop các table nháp ở cuối để Prisma (T08) bắt đầu từ một database trống.

**File.** `docs/sql-notes.sql` (T34 cũng dùng file này cho ghi chú EXPLAIN).

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] Một query JOIN trả về các experience của một profile (roadmap p03).
- [ ] Hành vi của FK (bị chặn hay cascade) được giải thích trong `docs/sql-notes.sql` (roadmap p03).
- [ ] Database không còn table nháp nào.

**Tiêu đề PR:** `docs: sql fundamentals notes`

#### T04 · Design token + shadcn theme trong `packages/ui`

**Roadmap** p04 · **Spec** [§3](./design/portfolio-design-system.vi.md#s-3), [§3.6](./design/portfolio-design-system.vi.md#s-3-6), [§3.7](./design/portfolio-design-system.vi.md#s-3-7), §4.0 · **Phụ thuộc** T01 · **Cỡ** M

**Mục tiêu.** Nguồn duy nhất cho mọi giá trị màu, font size, radius, shadow và motion, nối vào shadcn và Tailwind v4, kèm một test sẽ fail nếu token lệch khỏi design.

**Phạm vi.**
- Tạo `packages/ui` (`@portfolio/ui`): `package.json` có `exports` map (`./styles/globals.css`, `./components/*`, `./hooks/*`, `./utils/*`, `./lib/utils`), `tsconfig.json`, config Vitest.
- `src/styles/globals.css`: copy **nguyên văn** block §3.6 của spec (light `:root` + `.dark`) và mapping `@theme inline` của §3.7, gồm cả token v2 (`--band`, `--border-strong`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), 11 text size kèm line-height, radius, shadow, motion easing, thang z-index, `--container`, `--measure`, và các rule reduced-motion (§3.4). Thêm `@custom-variant dark (&:where(.dark, .dark *));`.
- `components.json` cho shadcn: style `new-york`, `rsc: true`, `tsx: true`, `baseColor: neutral`, `cssVariables: true`, css path `src/styles/globals.css`, alias `@portfolio/ui/components`, `@portfolio/ui/components/ui`, `@portfolio/ui/lib/utils`, `@portfolio/ui/hooks`.
- `src/lib/utils.ts`: `cn()` với `clsx` + `tailwind-merge`. Mở rộng group `font-size` của tailwind-merge với 11 size custom, nếu không `cn('text-title', 'text-primary')` sẽ bỏ mất một trong hai.
- `src/styles/globals.test.ts`: parse `:root` và `.dark` từ `globals.css` và so sánh mọi key trong `docs/design/colors.json` (58 token × 2 mode); assert 11 token text-size đều tồn tại.

**Ngoài phạm vi.** Font và web app (T05). Component (T12+). Storybook (T06).

**File.** `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/components.json`, `packages/ui/src/styles/globals.css`, `packages/ui/src/styles/globals.test.ts`, `packages/ui/src/lib/utils.ts`, `packages/ui/src/lib/utils.test.ts` ([STRUCTURE ở root: packages/ui](../STRUCTURE.md#package-layout-packagesui)).

**Thiết kế.** Figma page `0:1` (Cover & Foundations), variable Color Light/Dark, Spacing, Radius. Mockup `foundations.html`. Token: toàn bộ §3.6–3.7.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/ui test` pass; đổi bất kỳ mã hex nào trong `globals.css` sẽ làm nó fail.
- [ ] `cn('text-title', 'text-primary')` giữ cả hai class (unit test).
- [ ] Diff giữa `globals.css` và block trong spec chỉ khác nhau về format.

**Tiêu đề PR:** `feat(ui): design tokens and shadcn theme`

#### T05 · Next.js shell: font, theme toggle, type specimen

**Roadmap** p04 · **Spec** §3.1, §3.2, §3.4, §4.2 (`ThemeToggle`) · **Phụ thuộc** T04 · **Cỡ** M

**Mục tiêu.** Một app Next.js chạy được, load ba font, chuyển light/dark/system mà không bị nháy, và hiện một specimen page tạm thời để kiểm tra token và cách render tiếng Việt.

**Phạm vi.**
- Scaffold bằng `create-next-app` (TypeScript, App Router, ESLint, Tailwind v4, **không** `src/app`, import alias `@/*` → `src/*`) vào một folder tạm, rồi chuyển các file vào `apps/web`. Tool này từ chối folder không trống, và `apps/web/STRUCTURE.md` phải được giữ lại.
- `package.json` tên `@portfolio/web`; phụ thuộc `@portfolio/ui` (`workspace:*`); `next.config.ts` với `transpilePackages: ['@portfolio/ui', '@portfolio/contracts']`.
- `app/globals.css`: `@import "@portfolio/ui/styles/globals.css";` cộng `@source "../src";` và `@source "../../../packages/ui/src";` (Tailwind v4 không tự scan các workspace package).
- `apps/web/components.json` trỏ shadcn tới `packages/ui` (setup monorepo).
- Font trong `src/modules/core/utils/fonts.util.ts` qua `next/font/google`: Be Vietnam Pro 600/700, Inter (variable), JetBrains Mono 400/600; `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`; CSS variable `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` (file token map chúng sang `--font-heading`, `--font-sans`, `--font-mono`). Tắt ligature của font Mono.
- `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange`) và `ThemeToggle` (menu light / dark / system, `aria-pressed`). Thêm shadcn `dropdown-menu` (D21).
- `app/layout.tsx` + `app/page.tsx` tạm thời, render `CoreSpecimen`: 11 text size với QA string `Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`, swatch màu, một dải band, swatch hue, eyebrow. T11 sẽ xóa ba file này.
- Vitest + Testing Library trong `apps/web`; một test cho `ThemeToggle`.

**Ngoài phạm vi.** next-intl, data fetching, locale layout (T11). Component thật (T12+).

**File.** `apps/web/app/layout.tsx` (tạm thời), `apps/web/app/page.tsx` (tạm thời), `apps/web/app/globals.css`, `apps/web/next.config.ts`, `apps/web/components.json`, `apps/web/vitest.config.mts`, `apps/web/src/modules/core/utils/fonts.util.ts`, `apps/web/src/modules/core/components/Providers/ThemeProvider.tsx`, `apps/web/src/modules/core/components/ThemeToggle/ThemeToggle.tsx` (+ `.test.tsx`), `apps/web/src/modules/core/views/CoreSpecimen.tsx` (tạm thời), `packages/ui/src/components/ui/dropdown-menu.tsx` ([STRUCTURE của web](../apps/web/STRUCTURE.md)).

**Thiết kế.** Figma page `0:1`; text style `Public/*` và `Admin/*`. Mockup `foundations.html`. Token: `--font-*`, mọi text size, `--background`, `--foreground`, `--band`, `--hue-*`, `--primary`.

**Tiêu chí nghiệm thu.**
- [ ] Specimen ở `/` render ở light và dark, contrast AA đã được kiểm tra trong DevTools (roadmap p04).
- [ ] Font size khớp thang trong spec (`text-title`, `text-prose`, …) và dấu tiếng Việt trên QA string không bị cắt (roadmap p04).
- [ ] Reload ở dark mode không bị nháy sáng.
- [ ] Network panel cho thấy tối đa 5 file font.
- [ ] Khi bật `prefers-reduced-motion`, việc chuyển theme không có transition.

**Tiêu đề PR:** `feat(web): next shell, tokens, theme`

#### T06 · Storybook + story Foundations

**Roadmap** p04 (phần tiếp theo) · **Spec** §3, §3.2, §6 (Day 1–6) · **Phụ thuộc** T04 · **Cỡ** S

**Mục tiêu.** Một Storybook trong `packages/ui`, nơi mọi component được build và kiểm tra riêng lẻ, ở cả hai theme, có panel accessibility (D15).

**Phạm vi.**
- `@storybook/react-vite` trong `packages/ui`, `@storybook/addon-a11y`, `@storybook/addon-themes` (`withThemeByClassName`, light/dark).
- `.storybook/preview.tsx` import `globals.css` và một `fonts.css` chỉ dùng cho Storybook, load cùng ba font family từ các package `@fontsource` với subset `vietnamese` (next/font không chạy trong Storybook) và set các variable `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono`.
- Story Foundations: Colors (mọi token, cả hai mode, kèm contrast ratio của các cặp liệt kê ở §3.1), Typography (mỗi size trong 11 size đặt cạnh tên text style Figma của nó, ví dụ `Public/title · 48`, kèm QA string), Spacing & Radius & Shadows, Motion (easing, demo reduced-motion).
- Bước CI `pnpm --filter @portfolio/ui build-storybook`.
- Thêm `src/stories/foundations/` vào cây `packages/ui` trong `STRUCTURE.md` ở root (quy tắc 5).

**File.** `packages/ui/.storybook/main.ts`, `packages/ui/.storybook/preview.tsx`, `packages/ui/.storybook/fonts.css`, `packages/ui/src/stories/foundations/{Colors,Typography,Spacing,Motion}.stories.tsx`, `.github/workflows/ci.yml`, `STRUCTURE.md`.

**Thiết kế.** Figma page `0:1`; mockup `foundations.html`.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/ui storybook` khởi động được; mọi story Foundations render ở light và dark.
- [ ] Panel a11y cho thấy 0 violation trên các story Foundations.
- [ ] Storybook build được trong CI.

**Tiêu đề PR:** `chore(ui): storybook + foundations stories`

### M1 — API đầu tiên

#### T07 · NestJS app + health + config được validate

**Roadmap** p05 · **Spec** §1.6 · **Phụ thuộc** T01 · **Cỡ** M

**Mục tiêu.** Một NestJS app ở `:4000` với prefix `/api`, config fail ngay khi giá trị env sai, và `GET /api/health`.

**Phạm vi.**
- Scaffold bằng `nest new` (pnpm, strict) vào một folder tạm, rồi chuyển vào `apps/api` (giữ `apps/api/STRUCTURE.md`). Tên package `@portfolio/api`.
- `src/main.ts`: `setGlobalPrefix('api')`, `enableShutdownHooks()`, listen trên `API_PORT` / `API_HOST` (`127.0.0.1`, D9). **Không** `enableCors()` (D9).
- `src/config/`: `env.schema.ts` (zod: `NODE_ENV`, `API_PORT`, `API_HOST`, `WEB_ORIGIN`), `app-config.service.ts` (getter có type), `config.module.ts` (`@nestjs/config`, global, `validate: (raw) => envSchema.parse(raw)`, đọc `.env` ở root).
- `src/modules/health/`: `health.module.ts`, `health.controller.ts` (`GET /health` → `{ status: "ok" }`).
- Thay Jest bằng Vitest + `unplugin-swc` (decorator của Nest cần metadata do SWC tạo ra), test đầu tiên là `health.controller.spec.ts`.
- `apps/api/api.http` chứa request health. `pnpm dev` ở root giờ chạy song song web và api.

**Ngoài phạm vi.** Prisma (T08), error filter (T10).

**File.** `apps/api/package.json`, `apps/api/nest-cli.json`, `apps/api/tsconfig*.json`, `apps/api/vitest.config.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts,config.module.ts}`, `apps/api/src/modules/health/{health.module.ts,health.controller.ts,health.controller.spec.ts}`, `apps/api/api.http`, `.env.example` ([STRUCTURE của api](../apps/api/STRUCTURE.md)).

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Nest cho bạn những gì.** Một *module* gom một feature. Một *controller* map một URL tới một method. Một *service* chứa logic. Nest tự tạo các class này và truyền chúng cho nhau (*dependency injection*): bạn khai báo cần `AppConfigService` trong constructor và Nest sẽ đưa nó vào.
2. **Bootstrap (`main.ts`).** Tạo app từ `AppModule`, đặt `/api` trước mọi route, và bắt đầu listen. `127.0.0.1` nghĩa là chỉ máy của bạn gọi được nó, cho tới khi có guard (T36).
3. **Config.** Giá trị trong `.env` đều là string. Zod schema biến `API_PORT="4000"` thành số 4000 và dừng app ngay lúc khởi động nếu một giá trị bị thiếu hoặc sai, nên bạn không bao giờ phải debug một server mới được config một nửa.
4. **Health module.** `@Controller('health')` + `@Get()` = `GET /api/health`. Health check là thứ Docker và các uptime monitor sẽ gọi sau này (T58, T61).
5. **Thử nó.** `curl localhost:4000/api/health`, hoặc bấm "Send Request" trong `api.http`.
6. **Test nó.** File spec tạo controller và kiểm tra giá trị trả về. Vitest cần SWC vì Nest đọc type metadata của TypeScript lúc runtime.

**Tiêu chí nghiệm thu.**
- [ ] `curl localhost:4000/api/health` trả về `{"status":"ok"}` (roadmap p05).
- [ ] Set `API_PORT=abc` làm app dừng lúc khởi động với một lỗi zod dễ đọc.
- [ ] API không truy cập được qua IP LAN của máy.
- [ ] `pnpm --filter @portfolio/api test` xanh trong CI.

**Tiêu đề PR:** `feat(api): nest app + health`

#### T08 · Prisma: model layout site, migration đầu tiên, seed profile

**Roadmap** p06 · **Spec** [§1.5](./design/portfolio-design-system.vi.md#s-1-5), §1.6 · **Phụ thuộc** T02, T07 (nên làm T03 trước) · **Cỡ** L

**Mục tiêu.** Năm table đầu tiên từ spec, được tạo bởi một migration bạn đọc được, được điền bởi một seed idempotent, và mọi service đều dùng được qua `PrismaService`.

**Phạm vi.**
- Cài Prisma (pin version). Nếu là Prisma 7+, thêm `prisma.config.ts` và MariaDB driver adapter (nó hỗ trợ MySQL) theo hướng dẫn của Prisma docs cho version đó.
- `prisma/schema.prisma` theo các quy ước ở §1.5 (`id` autoincrement, `createdAt`/`updatedAt`, cặp cột `En`/`Vi`, `sortOrder`/`isVisible`, `@@map` sang snake_case, `@db.Text` cho markdown):
  - `SiteSettings` (1 row): mọi field ở §1.5, gồm cả `ambientEffects`, `marqueeEnabled`; `ogImageId` tạm là `Int?` thường cho tới khi có media (T50 thêm relation).
  - `Profile` (1 row): mọi field ở §1.5, gồm cả `heroKicker{En,Vi}`, `headlineAccent{En,Vi}`, `phone` private; `avatarId`, `resumeEnId`, `resumeViId` tạm thời là `Int?` thường.
  - `NavItem`, `SocialLink` (có `showInHeader`, `showInCta`).
  - Cặp model của page (D26): `Page` (`key` là enum `PageKey` `@unique`; `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`) và `PageBlock` (`pageId` → `Page` với `onDelete: Cascade`, `type` `VarChar(48)`, `key` `VarChar(48)`, `schemaVersion Int @default(1)`, `props Json`, `layout` là enum `LayoutPreset`, `surface` là enum `BlockSurface` (`PLAIN` | `BAND`), `sortOrder`, `isVisible`; `@@unique([pageId, key])`, `@@index([pageId, sortOrder])`). `type` là string thường, không phải enum trong DB, nên một block type mới về sau không cần migration; T10a check nó với registry.
  - Enum `Availability`, `NavLocation`, `SocialKind`, `PageKey`, `LayoutPreset`, `BlockSurface`.
- Migration đầu tiên `pnpm prisma migrate dev --name init-site`.
- Seed (D13): `prisma/seed/seed.ts` đọc `SEED_PROFILE` (`demo` | `baseline`) và chạy `profiles/demo.seed.ts` hoặc `profiles/baseline.seed.ts`; row lấy từ `prisma/seed/data/site.data.ts`. Chỉ dùng giá trị placeholder: copy từ wireframe/mockup, `contactEmail: '<email>'`, `phone: '<phone>'`. Seed năm row `Page` và các block mặc định của chúng từ D18 (`prisma/seed/data/pages.data.ts`: `type`, `key`, `layout`, `surface`, `props` placeholder với text `{ en, vi }`). Upsert trên unique key để chạy hai lần cũng không thay đổi gì.
- `src/prisma/prisma.module.ts` (`@Global`) và `prisma.service.ts` (extends `PrismaClient`, connect khi module init).
- `GET /api/health` trả thêm `db: "ok"` sau khi chạy `SELECT 1`.
- Script `db:migrate`, `db:reset`, `db:seed`, `db:studio`.

**Ngoài phạm vi.** Các table content (T15+), public endpoint (T09).

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_init_site/`, `apps/api/prisma/seed/seed.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/prisma/seed/data/{site,pages}.data.ts`, `apps/api/prisma.config.ts` (Prisma 7+), `apps/api/src/prisma/{prisma.module.ts,prisma.service.ts}`, `apps/api/src/modules/health/health.controller.ts`.

**Thiết kế.** Các table "Site" và "About · Profile" ở spec §1.5; block mặc định của D18, D26.

**Các bước backend, giải thích.**
1. **ORM.** Prisma biến `schema.prisma` thành các table SQL và một client có type. Bạn viết `prisma.profile.findUnique({ where: { id: 1 } })` thay vì SQL, và TypeScript biết mọi cột.
2. **Quy ước schema.** Đọc table quy ước ở §1.5 trước. Hai cột cho mỗi text cần dịch (`headlineEn`, `headlineVi`) giúp mọi thứ nhìn thấy được trong Adminer; singleton là một table chỉ có một row, `id = 1`.
3. **Migration.** `migrate dev --name init-site` so sánh schema với DB và viết một file SQL trong `prisma/migrations/`. **Hãy mở ra và đọc nó**: bạn sẽ thấy `CREATE TABLE`, unique index trên `(page, key)`, và `utf8mb4`. File đó được commit và không bao giờ bị sửa (quy tắc 6). Nếu bạn gặp lỗi P3014, nghĩa là đang thiếu grant cho shadow database từ T02.
4. **Seed.** Một script điền dữ liệu vào DB trống. `upsert` (update-or-insert) giúp chạy lại nhiều lần vẫn an toàn. Có hai profile: `demo` cho dev và CI một site đầy đủ, `baseline` là dữ liệu ban đầu của production (D13).
5. **PrismaService.** Một connection dùng chung, được đăng ký làm global provider của Nest, nên service nào cũng có thể xin nó trong constructor thay vì tự mở connection riêng.
6. **Xem data.** `pnpm db:studio` mở Prisma Studio; dùng Adminer cũng được.
7. **Một cột JSON.** `PageBlock.props` là MySQL `JSON`: mỗi row có thể có shape riêng. Mở một row trong Adminer để xem. MySQL không check bên trong có gì; T10a thêm việc check đó trong code.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm --filter @portfolio/api prisma migrate reset` tạo lại các table và seed chúng (roadmap p06).
- [ ] Prisma Studio hiện row trong SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock (roadmap p06, điều chỉnh theo D12).
- [ ] Chạy seed hai lần vẫn giữ nguyên số row.
- [ ] Mô tả PR tóm tắt SQL được generate.
- [ ] Dùng `rg` tìm pattern email/phone trong `apps/api/prisma` chỉ thấy `<email>` và `<phone>`.
- [ ] `GET /api/health` trả về `{"status":"ok","db":"ok"}`.

**Tiêu đề PR:** `feat(api): prisma schema + seed`

#### T09 · Package contracts + `GET /api/public/site`

**Roadmap** p07 · **Spec** §1.5 ("Hai shape API"), §4.5 ("Data quan trọng"), §5.0 (row Layout) · **Phụ thuộc** T08 · **Cỡ** L

**Mục tiêu.** Một public endpoint trả về mọi thứ layout cần, đã ở sẵn ngôn ngữ được yêu cầu, có type nhờ một package contracts dùng chung.

**Phạm vi.**
- Tạo `packages/contracts` (`@portfolio/contracts`, chỉ phụ thuộc `zod`; zod 4, vì block dùng `.meta()` và `z.toJSONSchema`, D26). Build bằng `tsup` ra `dist/` (ESM + CJS + type) để Nest dùng được; `pnpm dev` ở root chạy `tsup --watch`.
- Contracts: `common/locale.schema.ts`, `common/api-error.schema.ts`, và các public DTO schema trong `site-settings/`, `profile/`, `navigation/`, `social-links/`, `public-site/` (`[domain].schema.ts` + `[domain].type.ts` + `[domain].enum.ts`), `constants/routes.constant.ts` (các public route thật cho `NavItem.href`).
- API `src/i18n/`: `locale.decorator.ts` (`@Locale()` đọc `?locale`, mặc định `en`), `pick-locale.util.ts` hiện thực D19 (`pickGroup(row, ['headline', 'subheadline'], locale)` → `{ headline, subheadline, lang }`), kèm `pick-locale.util.spec.ts`.
- Các module sở hữu table (service + entity + mapper, chưa có controller): `site-settings`, `profile`, `navigation`, `social-links`. Mapper của profile không bao giờ output `phone`. Page block có module và endpoint riêng ở T10a.
- `modules/public-site/`: `public-site.controller.ts` (`GET /public/site`), `public-site.service.ts` (gọi song song bốn service; chỉ lấy row visible, sắp theo `sortOrder`). Response: `{ settings, profile, nav: { header, footer }, socialLinks }`. `profileStats` sẽ được T15 thêm vào.
- Singleton bị thiếu thì trả về 404 `{ code: "NOT_SEEDED", message }`. T10 sẽ biến nó thành error body đầy đủ.
- Request trong `api.http` với `?locale=en` và `?locale=vi`.

**Ngoài phạm vi.** Validation global và error filter (T10). Phía web dùng data (T11).

**File.** `packages/contracts/{package.json,tsconfig.json,tsup.config.ts}`, `packages/contracts/src/index.ts`, `packages/contracts/src/common/{locale.schema.ts,api-error.schema.ts}`, `packages/contracts/src/{site-settings,profile,navigation,social-links,public-site}/*`, `packages/contracts/src/constants/routes.constant.ts`, `apps/api/src/i18n/{locale.decorator.ts,pick-locale.util.ts,pick-locale.util.spec.ts}`, `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{[domain].module.ts,[domain].service.ts,entities/*}`, `apps/api/src/modules/public-site/{public-site.module.ts,public-site.controller.ts,public-site.service.ts}`, `apps/api/api.http` ([STRUCTURE ở root: contracts](../STRUCTURE.md#package-layout-packagescontracts), [module layout của api](../apps/api/STRUCTURE.md#module-layout)).

**Thiết kế.** Row "Layout: header, footer" ở spec §5.0; "Hai shape API" ở §1.5.

**Các bước backend, giải thích.**
1. **Contracts.** Một zod schema mô tả shape của một JSON đúng một lần. API dùng nó để kiểm tra output trong test, web dùng type được infer ra từ nó, và sau này form admin dùng chính schema đó để validate input.
2. **Mỗi table một module.** `profile` sở hữu table `Profile`: chỉ `ProfileService` được query nó. `public-site` không sở hữu table nào; nó hỏi bốn service kia rồi gộp kết quả lại. Quy tắc này giữ query của mỗi table ở đúng một chỗ.
3. **Entity và mapper.** File entity cố định những cột nào được load. Mapper biến row từ DB thành public DTO: nó chọn `headlineVi` hoặc `headlineEn` và bỏ các field private như `phone`.
4. **Locale fallback (D19).** Nếu bất kỳ field nào trong một nhóm thiếu tiếng Việt, cả nhóm sẽ dùng English và mang `lang: "en"`, để page đánh dấu đúng ngôn ngữ cho screen reader và font.
5. **Đọc song song.** `Promise.all` chạy bốn query cùng lúc thay vì lần lượt từng cái.

**Tiêu chí nghiệm thu.**
- [ ] `GET /api/public/site?locale=vi` trả về field phẳng (`headline`, không phải `headlineVi`) từ seed (roadmap p07).
- [ ] Xóa giá trị `Profile.subheadlineVi` trong Adminer làm nhóm profile chuyển sang English với `lang: "en"`.
- [ ] Nav item bị ẩn không được trả về; thứ tự theo `sortOrder`.
- [ ] `phone` không bao giờ xuất hiện trong response (unit test của mapper).
- [ ] Với DB trống (`migrate reset --skip-seed`), endpoint trả về 404 kèm `code` + `message` (roadmap p07).

**Tiêu đề PR:** `feat(api): public read endpoints`

#### T10 · Validation pipe, error filter, request id, logging

**Roadmap** p08 · **Spec** §1.6, §4.6 ("Error shape") · **Phụ thuộc** T09 · **Cỡ** M

**Mục tiêu.** Mọi input sai đều trả về 400 kèm lỗi theo từng field, mọi error có cùng một body (D5) và một request id, và mọi request đều được log mà không làm lộ data.

**Phạm vi.**
- `common/pipes/zod-validation.pipe.ts`: `new ZodValidationPipe(schema)` cho `@Query()`, `@Body()`, `@Param()`; khi fail sẽ throw 400 với `fieldErrors` có key là path.
- `common/filters/all-exceptions.filter.ts` (global): `HttpException` → status của nó; zod error → 400 `VALIDATION_FAILED`; Prisma `P2002` → 409 `CONFLICT` với `fieldErrors` trên field unique; `P2025` → 404 `NOT_FOUND`; mọi thứ khác → 500 `INTERNAL` với message chung chung (stack được log, không bao giờ trả về).
- `common/middleware/request-id.middleware.ts`: dùng lại `x-request-id` được gửi tới hoặc tạo mới; trả nó về trong header và trong error body.
- `common/interceptors/logging.interceptor.ts`: một dòng cho mỗi request (method, path, status, ms, request id). Không bao giờ log body, password, cookie hay email.
- `contracts/common/api-error.schema.ts`: error body cuối cùng + enum `ErrorCode`. `@Locale()` giờ validate qua pipe.
- Unit test cho mapping của filter và cho pipe.

**File.** `apps/api/src/common/pipes/zod-validation.pipe.ts` (+ `.spec.ts`), `apps/api/src/common/filters/all-exceptions.filter.ts` (+ `.spec.ts`), `apps/api/src/common/middleware/request-id.middleware.ts`, `apps/api/src/common/interceptors/logging.interceptor.ts`, `apps/api/src/app.module.ts`, `apps/api/src/i18n/locale.decorator.ts`, `packages/contracts/src/common/api-error.schema.ts`.

**Thiết kế.** Error shape ở spec §4.6.

**Các bước backend, giải thích.**
1. **Pipeline của một request.** Đọc diagram trong [STRUCTURE của api](../apps/api/STRUCTURE.md#how-a-request-flows): middleware → guards → pipes → controller → service, và filter bắt mọi thứ bị throw trên đường đi.
2. **Pipe.** Chạy ngay trước controller, kiểm tra input với một zod schema, rồi hoặc chuyển giá trị đã parse đi tiếp, hoặc throw 400. Nhờ vậy controller có thể tin vào argument của mình.
3. **Filter.** Một chỗ duy nhất biến mọi error (của bạn, của Nest, của Prisma) thành cùng một JSON body. `ApiError` phía web (T11) phụ thuộc vào shape này.
4. **Mã lỗi Prisma.** `P2002` nghĩa là "unique constraint failed" (ví dụ slug bị trùng) → 409. `P2025` nghĩa là "record not found" → 404. Map chúng một lần ở đây nghĩa là service không cần try/catch ở khắp nơi.
5. **Request id.** Một id ngẫu nhiên cho mỗi request, trả về trong header và error body và in ra log, để từ screenshot của một lỗi có thể tìm đúng dòng log tương ứng.
6. **Logging.** Log chuyện gì đã xảy ra, không bao giờ log thứ được gửi lên. Body có thể chứa password và địa chỉ email.

**Tiêu chí nghiệm thu.**
- [ ] `GET /api/public/site?locale=fr` trả về 400 với `fieldErrors.locale` theo shape chung (roadmap p08).
- [ ] Route không tồn tại trả về 404 với cùng shape; một `Error` bị throw trả về 500 và body không chứa stack.
- [ ] Response header `x-request-id` bằng `requestId` trong error body.
- [ ] Type của `@portfolio/contracts` được `apps/api` import, và được `apps/web` import từ T11 (roadmap p08, điều chỉnh theo D2).

**Tiêu đề PR:** `feat(contracts): zod contracts + error filter`

#### T10a · Contracts cho block registry + `GET /api/public/pages/:key`

**Roadmap** p08 · **Spec** §1.5 (`PageSection`, được D26 thay thế), §4.5 (thứ tự và hiển thị), §5.0 · **Phụ thuộc** T10 · **Cỡ** M

**Mục tiêu.** Một chỗ duy nhất trong code nói có những loại block nào và props của chúng trông ra sao, cùng một public endpoint trả về các block visible và hợp lệ của một page bằng một ngôn ngữ, để một row hỏng không bao giờ làm sập cả page.

**Phạm vi.**
- Contracts `packages/contracts/src/blocks/`:
  - `localized.schema.ts`: `localizedText({ max })` và `localizedMarkdown()` (một cặp `{ en, vi }`; English bắt buộc khi field là bắt buộc, tiếng Việt có thể để trống), `routeHref()` (một route trong `routes.constant.ts`), `sectionHeadingSchema` (`eyebrow`, `title`, `intro`, `iconKey`, `link` optional gồm label + route).
  - `block-layout.constant.ts`: `LAYOUT_PRESETS` (`ONE`, `TWO`, `THREE`, `FOUR`, `SPLIT_8_4`, `SPLIT_4_8`, `SPLIT_7_5`) kèm số cột theo từng breakpoint (bảng ở §4) và `BLOCK_SURFACES` (`PLAIN`, `BAND`).
  - `define-block.util.ts`: `defineBlock({ type, version, props, defaults, pages, layouts, maxPerPage, role, migrate, refs })`. `role` là `h1` (đứng đầu, visible, không bao giờ bị xóa), `required` (không bao giờ bị xóa hay ẩn) hoặc `optional`. `migrate(props, fromVersion)` nâng cấp props được lưu dưới một `version` cũ hơn. `refs(props)` liệt kê các id mà props trỏ tới (project, stat, tag), để T32a check chúng có tồn tại.
  - `definitions/hero.block.ts`, `definitions/page-header.block.ts`, `definitions/cta-band.block.ts`: ba type đầu tiên (catalog ở §4). Mỗi field mang `.meta({ widget, label })`: `label` là một key `admin.blocks.*` trong `en.json` (D22), không bao giờ là text, còn `widget` cho form được generate biết cần vẽ input nào (T45a).
  - `block-registry.constant.ts`: `BLOCK_REGISTRY` (`type` → definition), `BlockType`, `blockTypeSchema`.
  - `block.schema.ts` + `block.type.ts`: `adminBlockSchema` (cả hai ngôn ngữ, cộng `issues` cho một row không hợp lệ), `publicBlockSchema` (`{ id, type, key, layout, surface, props, lang }`), `blockKeySchema` (kebab-case, tối đa 48 ký tự).
  - `resolve-block.util.ts`: `parseBlock(row)` chạy `migrate`, rồi props schema, và trả về `{ ok: true, block }` hoặc `{ ok: false, reason: 'UNKNOWN_TYPE' | 'INVALID_PROPS', issues }`. `resolveBlockLocale(props, locale)` thay mỗi cặp `{ en, vi }` bằng một chuỗi và áp dụng D19 cho cả block (`lang: "en"` khi thiếu bất kỳ giá trị tiếng Việt nào).
- Contracts `pages/`: `pages.enum.ts` (`PageKey`, `LayoutPreset`, `BlockSurface`, mirror từ Prisma), `pages.schema.ts` (`publicPageSchema`: `{ key, seo, blocks }`), `pages.type.ts`. Page key viết thường trong URL và cache tag (`/public/pages/home`, `page:home`).
- API `modules/pages/`: `pages.service.ts` load `Page` và các `PageBlock` visible của nó theo `sortOrder`, rồi cho mọi row đi qua `parseBlock`. Một row không biết type hoặc không hợp lệ sẽ bị bỏ và được log một lần ở mức warning kèm page key, block id, type và request id (không bao giờ log props). `public-pages.controller.ts`: `GET /public/pages/:key?locale` (`:key` được parse bằng `PageKey` qua pipe của T10; key lạ → 404 `NOT_FOUND`). `entities/page.entity.ts`, `entities/page.mapper.ts` (locale theo từng block, nhóm SEO theo D19).
- Seed: các row trong `pages.data.ts` được check bằng `parseBlock` với những type đã có. Row của các type được thêm sau vẫn nằm trong seed và bị bỏ lúc đọc cho tới khi task của chúng xong (T24, T25, T26, T28, T48).
- Test: `resolve-block.util.test.ts` (type lạ, props sai, `migrate` từ một `version` cũ hơn, locale fallback), `pages.service.spec.ts`; `api.http` với `?locale=en` và `?locale=vi`.

**Ngoài phạm vi.** Render (T14). Ghi (T32a). Version và publish (T52a): tới lúc đó visitor thấy các row hiện tại, giống mọi table khác trước T52.

**File.** `packages/contracts/src/blocks/{localized.schema.ts,block-layout.constant.ts,define-block.util.ts,block-registry.constant.ts,block.schema.ts,block.type.ts,resolve-block.util.ts,resolve-block.util.test.ts}`, `packages/contracts/src/blocks/definitions/{hero,page-header,cta-band}.block.ts`, `packages/contracts/src/pages/{pages.schema.ts,pages.type.ts,pages.enum.ts}`, `packages/contracts/src/index.ts`, `apps/api/src/modules/pages/{pages.module.ts,public-pages.controller.ts,pages.service.ts,pages.service.spec.ts,entities/page.entity.ts,entities/page.mapper.ts}`, `apps/api/src/app.module.ts`, `apps/api/prisma/seed/data/pages.data.ts`, `apps/api/api.http` ([STRUCTURE ở root: contracts](../STRUCTURE.md#package-layout-packagescontracts), [api: page và block](../apps/api/STRUCTURE.md#pages-and-blocks)).

**Thiết kế.** Catalog block và layout preset ở §4. Quy ước của spec §1.5 (`sortOrder`, `isVisible`, cặp En/Vi, ở đây là `{ en, vi }` bên trong JSON).

**Các bước backend, giải thích.**
1. **Một cột JSON.** `PageBlock.props` là một cột MySQL `JSON`, nên mỗi row có thể giữ một shape khác nhau, đúng thứ block cần (hero và post list có setting khác nhau). MySQL chỉ check giá trị là JSON hợp lệ. Nó không biết shape, nên API check bằng zod ở mọi lần ghi (T32a) *và* mọi lần đọc, vì một row cũng có thể bị sửa tay trong Adminer hoặc được ghi bởi một version code cũ hơn.
2. **Registry là code, content là data.** Có những loại block nào và mỗi loại nhận props gì được quyết định trong code và review trong PR. Một page hiện block nào, theo thứ tự nào và với text gì là data trong MySQL, sửa trong `/admin`. Admin có thể thêm block của một type đã biết nhưng không thể tự nghĩ ra type mới.
3. **Fail an toàn, không fail ầm ĩ.** Một block hỏng không được làm sập trang home. Service bỏ qua nó, log một warning mà bạn tìm được bằng request id, và trả về phần còn lại. Builder (T45b) hiện block hỏng cho admin thấy để sửa.
4. **Version của schema.** Khi props của một block đổi shape (một field bị đổi tên), tăng `version` của nó và viết `migrate`. Row cũ và snapshot đã publish cũ được nâng cấp lúc đọc, nên không có gì trong DB phải ghi lại, và restore một version cũ vẫn chạy.
5. **Tham chiếu trong JSON không có foreign key.** MySQL không check `projectIds: [3, 7]` bên trong JSON, nên một project có thể bị archive trong khi một block vẫn trỏ tới nó. Renderer bỏ qua id bị thiếu, T32a check id khi ghi, và content health liệt kê những tham chiếu bị treo (T52a).

**Tiêu chí nghiệm thu.**
- [ ] `GET /api/public/pages/home?locale=vi` trả về các block visible theo `sortOrder`, với text props phẳng và một `lang` cho mỗi block.
- [ ] Một row có `type` lạ hoặc `props` sai, chèn vào bằng Adminer, không có trong response, request vẫn trả 200, và log có một warning kèm id của nó.
- [ ] Xóa một giá trị tiếng Việt trong một block chỉ làm block đó chuyển sang English với `lang: "en"`.
- [ ] Unit test phủ `parseBlock` (type lạ, props sai, `migrate` từ một `version` cũ hơn) và `resolveBlockLocale`.
- [ ] `GET /api/public/pages/unknown` trả 404 theo shape error chung.

**Tiêu đề PR:** `feat(contracts): block registry + public pages`

#### T11 · Data layer phía web + next-intl + root layout

**Roadmap** p09 · **Spec** [§4.6](./design/portfolio-design-system.vi.md#s-4-6), §4.5, phần mở đầu §5 · **Phụ thuộc** T05, T09 · **Cỡ** L

**Mục tiêu.** Web app đọc API trên server với cache tag, có route `/en` và `/vi`, và có sẵn data layer phía client (TanStack Query, `ApiError`, `qk`) cho island và admin.

**Phạm vi.**
- next-intl: `i18n/routing.ts` (locale `en`, `vi`; mặc định `en`; luôn có prefix), `i18n/request.ts`, `i18n/navigation.ts` (`Link`, `redirect`, `usePathname`), `i18n/locales/en.json` + `vi.json` (các key đầu tiên: `core.*`, `states.*`), `middleware.ts` (matcher bỏ qua `/api`, `/admin`, `/_next`, file tĩnh). Nếu dùng Next 16 thì dùng `proxy.ts` thay thế.
- Xóa `app/layout.tsx`, `app/page.tsx` tạm thời và `CoreSpecimen` từ T05 (Storybook vẫn giữ phần foundations). Thêm `app/[locale]/layout.tsx` (root layout: `<html lang>`, font, `Providers`, `generateStaticParams`, `setRequestLocale`), `app/[locale]/(site)/layout.tsx` (wrapper đơn giản cho tới T14), `app/[locale]/(site)/page.tsx` → `home/views/HomeIndex` (tạm thời: render `profile.displayName` và `headline` kèm `lang` của chúng; T14 sẽ thay nó).
- `next.config.ts`: rewrite `/api/:path*` → `${API_URL}/api/:path*` (mặc định `afterFiles`, để các handler `app/api/*` thêm sau này được ưu tiên), `createNextIntlPlugin`.
- `core/services/api-server.service.ts` (`import 'server-only'`; `apiServer(path, { locale, tags, schema? })`; `revalidate` theo D23; non-2xx → `ApiError`).
- `core/services/api-client.service.ts` (`/api` cùng origin, chuyển tiếp `signal`, throw `ApiError`).
- `core/services/site.service.ts` (`getSite(locale)`, tag `site`, bọc trong React `cache()`).
- `core/utils/api-error.util.ts` (`ApiError` có `status`, `code`, `requestId`, `fieldErrors`), `core/utils/query-client.util.ts` (`getQueryClient()` với các giá trị mặc định ở §4.6), `core/components/Providers/{Providers,QueryProvider}.tsx`.
- `packages/contracts/src/constants/query-keys.constant.ts`: factory `qk` từ §4.6.
- ESLint `react/jsx-no-literals` trên `app/**`, `src/modules/**/components/**`, `src/modules/**/views/**` và `packages/ui/src/components/**` (allowlist: dấu câu, `·`, `→`, `—`).
- Unit test: mapping lỗi của `apiServer`, abort của `apiClient`.

**Ngoài phạm vi.** Header, footer, hero (T14). Root layout của admin (T37).

**File.** `apps/web/middleware.ts`, `apps/web/next.config.ts`, `apps/web/i18n/{routing.ts,request.ts,navigation.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `apps/web/app/[locale]/layout.tsx`, `apps/web/app/[locale]/(site)/{layout.tsx,page.tsx}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts,site.service.ts}`, `apps/web/src/modules/core/utils/{api-error.util.ts,query-client.util.ts}`, `apps/web/src/modules/core/components/Providers/{Providers.tsx,QueryProvider.tsx}`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `packages/contracts/src/constants/query-keys.constant.ts`, `eslint.config.mjs` ([STRUCTURE của web: data](../apps/web/STRUCTURE.md#data-services-hooks-actions), [i18n](../apps/web/STRUCTURE.md#i18n)).

**Thiết kế.** Không có gì nhìn thấy được ngoài text tạm thời ở home.

**Tiêu chí nghiệm thu.**
- [ ] `/` redirect tới `/en`; `/en` và `/vi` render headline đã seed; `<html lang>` khớp với locale.
- [ ] Đổi một giá trị seed rồi seed lại sẽ làm page thay đổi (roadmap p09).
- [ ] `curl localhost:3000/api/health` trả về response của API (rewrite hoạt động).
- [ ] Một string literal trong view làm `pnpm lint` fail.
- [ ] Không có `app/layout.tsx`.

**Tiêu đề PR:** `feat(web): data layer, i18n and locale layout`

#### T12 · UI primitive khớp với component set trong Figma

**Roadmap** p09 (chuẩn bị) · **Spec** [§4.0](./design/portfolio-design-system.vi.md#s-4-0), [§4.1](./design/portfolio-design-system.vi.md#s-4-1), §4.7 (`Eyebrow`, `KickerPill`) · **Phụ thuộc** T06 · **Cỡ** M

**Mục tiêu.** Các component nền mà mọi màn hình đều dùng, khớp với component set trong Figma tới từng variant, mỗi cái đều có story và test.

**Phạm vi.**
- shadcn (`pnpm --filter @portfolio/ui dlx shadcn@latest add …`): `button`, `badge`, `input`, `textarea`, `label`, `field`, `card`, `skeleton`, `separator`, `tooltip`, `kbd`, `spinner`.
- Tùy chỉnh theo §4.0/§4.1 và các Figma set (table ở §5):
  - `button`: variant `default` (Primary), `secondary`, `outline`, `ghost`, `destructive`, `link` (gạch chân); size `sm` 28, `default` 32 (Admin), `lg` 40 (Public); prop `loading` (spinner, giữ nguyên chiều rộng, `aria-busy`); vùng chạm 44px trên coarse pointer.
  - `badge`: variant `neutral`, `primary`, `success`, `warning`, `destructive`, `info`, `outline` + `hue` (`jade`, `amber`, `blue`, `violet`, `rose`, dùng `--hue-*` và `--hue-*-subtle`); style `subtle` / `outline`.
  - `input` / `field`: state Default, Focus, Error (`aria-invalid`), Disabled; `FieldError` nối với `aria-describedby`.
  - `skeleton`: tắt shimmer khi bật reduced motion.
- Component product custom: `Eyebrow` (tone `primary` | `subtle`, mono, `text-eyebrow`), `KickerPill` (glyph `>_` có `aria-hidden`), `NavLink` (state default/active → `aria-current="page"`, `asChild` để web truyền `Link` của next-intl vào), `VersionTag` (`from`, `to`, label của mũi tên truyền qua prop).
- Mỗi component một story hiện mọi variant Figma ở cả hai theme; test cho loading của `Button`, active của `NavLink`, hue của `Badge`.

**Ngoài phạm vi.** Component state và atmosphere (T13). Card (T20).

**File.** `packages/ui/src/components/ui/{button,badge,input,textarea,label,field,card,skeleton,separator,tooltip,kbd,spinner}.tsx`, `packages/ui/src/components/{Eyebrow,KickerPill,NavLink,VersionTag}/{Name.tsx,Name.stories.tsx,Name.test.tsx}`, story cho các primitive shadcn trong `packages/ui/src/components/ui/*.stories.tsx`.

**Thiết kế.** Figma page `1:2`: set Button (40), Badge/Pill (22), Eyebrow (4), Input (8), Kicker pill (2), Nav link (4). Mockup `foundations.html`. Token: `--primary`, `--primary-hover`, `--primary-subtle`, `--primary-foreground`, `--secondary`, `--destructive`, `--border`, `--border-strong`, `--input`, `--ring`, `--hue-*`, `--radius-sm`/`--radius-md`, `text-ui`, `text-body`, `text-meta`, `text-eyebrow`.

**Tiêu chí nghiệm thu.**
- [ ] Mọi variant Figma đều có story, ở light và dark; screenshot được so với các Figma set.
- [ ] Chiều cao control: 28 / 32 / 40px; focus ring nhìn thấy được trên mọi primitive tương tác.
- [ ] Panel a11y của Storybook: 0 violation.
- [ ] Hue pill đạt contrast text 4.5:1 ở cả hai theme (tiêu chí nghiệm thu (c) ở spec §7.2).

**Tiêu đề PR:** `feat(ui): primitives from figma component sets`

#### T13 · Component state + atmosphere

**Roadmap** p09 · **Spec** [§4.5](./design/portfolio-design-system.vi.md#s-4-5), [§4.7](./design/portfolio-design-system.vi.md#s-4-7), §3.1b, §3.4, §4.3 (`StatusPill`) · **Phụ thuộc** T12 · **Cỡ** M

**Mục tiêu.** Các component xử lý state loading, empty và error, cùng lớp atmosphere của v2, để mọi section được bọc theo cùng một cách.

**Phạm vi.**
- shadcn: `alert`, `empty`.
- `SectionBoundary` (client): error boundary + `Suspense` + kiểm tra `isEmpty`; prop `fallback` (skeleton), `onReset`, `hideWhenEmpty`, `labels` (text lỗi, retry). Web bọc nó bằng `QueryErrorResetBoundary` của TanStack khi cần, để `packages/ui` không phụ thuộc vào TanStack Query.
- `ErrorState` (message, request id, button retry), `StatusPill` (draft / published / archived, icon + text, label truyền qua prop), `Band` (`--band` full-width + `border-y`, `aria-labelledby`), `SectionHeader` (ô icon 28px + H2 `text-heading` + intro + link bên phải tùy chọn).
- `packages/contracts/src/constants/icons.constant.ts` (~40 tên lucide trong allowlist, `iconKeySchema`) và `Icon` trong `packages/ui` (map một `IconKey` sang component lucide; key lạ thì không render gì).
- `Atmosphere` (`variant="hero" | "cta"`, `enabled`; grid `--grid-line` có mask + 1–2 orb `--glow`; `aria-hidden`, `pointer-events: none`), `AccentHeadline` (bọc substring accent trong `text-primary`; H1 thường nếu không tìm thấy), `CtaBand` (layout: ô icon, H2, intro, slot cho action, `Atmosphere variant="cta"`).
- `hooks/use-in-view.hook.ts` + `Reveal` (fade/slide vào; khi bật reduced motion, content hiện ra ngay lập tức).
- Story có toggle reduced-motion và reduced-transparency; test cho `AccentHeadline`, các state của `SectionBoundary`, `Icon` với key lạ.

**File.** `packages/ui/src/components/ui/{alert,empty}.tsx`, `packages/ui/src/components/{SectionBoundary,ErrorState,StatusPill,Band,SectionHeader,Icon,Atmosphere,AccentHeadline,CtaBand,Reveal}/*`, `packages/ui/src/hooks/use-in-view.hook.ts`, `packages/contracts/src/constants/icons.constant.ts`.

**Thiết kế.** Figma `21:2` (home loading), vùng hero và CTA của `2:2`/`3:2`. Mockup `home-skeleton.html`, `home.html` (hero, CTA band, section header). Spec §7.1 G1, G3, G4. Token: `--band`, `--grid-line`, `--glow`, `--card-glass`, `--shadow-glow`, `--primary-subtle`, `--muted`, motion easing.

**Tiêu chí nghiệm thu.**
- [ ] Story hiện loading, empty và error cho `SectionBoundary`; story error hiện request id và Retry.
- [ ] `Atmosphere` không render gì khi `enabled={false}` và có `aria-hidden` trong trường hợp còn lại.
- [ ] Khi bật reduced motion, không có gì chuyển động trong bất kỳ story nào (check v2 của Day 2 ở spec §6).
- [ ] `StatusPill` hiện text ở mọi state (không bao giờ chỉ dùng màu).

**Tiêu đề PR:** `feat(ui): state and atmosphere components`

#### T14 · Site shell + hero/CTA của home từ API + kiểm tra content

**Roadmap** p09 · **Spec** [§4.2](./design/portfolio-design-system.vi.md#s-4-2), §4.5, [§5.1](./design/portfolio-design-system.vi.md#s-5-1), §7.1 · **Phụ thuộc** T11, T13 · **Cỡ** L

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
4. **Một module cho mỗi table.** Năm module nhỏ có cùng shape. Dùng lệnh scaffold trong [api STRUCTURE](../apps/api/STRUCTURE.md#new-api-module).

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

#### T23 · Pipeline markdown + Prose + CodeBlock + công cụ hỗ trợ đọc

**Roadmap** p14 · **Spec** §3.2 (long-form, code), §4.1 (`Prose`, `CodeBlock`), §4.2 (`SectionNav`), §4.7 (`ContentProgress`, `RequirementColumns`), §5.4, §5.5, D3 · **Phụ thuộc** T11, T12 · **Cỡ** L

**Mục tiêu.** Một cách an toàn duy nhất để biến markdown đã lưu thành trang dễ đọc và accessible, cùng các công cụ hỗ trợ đọc dùng cho case study và post.

**Phạm vi.**
- Module `content` (chỉ chạy trên server): `services/markdown.service.ts` chạy `remark-parse` → `remark-gfm` → `remark-rehype` (không raw HTML) → `rehype-slug` → `rehype-sanitize` (schema dựng từ allowlist dùng chung bên dưới) → Shiki (một theme CSS-variables qua `createCssVariablesTheme`: màu token là `var(--shiki-token-*)`, nên light và dark đều lấy từ palette; comment ≥ 4.5:1; chỉ load `MARKDOWN_CODE_LANGUAGES`, ngôn ngữ khác render như text thường) → `hast-util-to-jsx-runtime`, map các element sang component của `packages/ui`. Alert kiểu GitHub (`> [!NOTE]`, `> [!WARNING]`) thành `Callout`. Không dùng `dangerouslySetInnerHTML`.
- Allowlist Markdown dùng chung (D25), danh sách duy nhất mà cả renderer này lẫn editor của admin (T42) tuân theo: `packages/contracts/src/constants/markdown.constant.ts` (`MARKDOWN_HEADING_LEVELS = [2, 3]`; `MARKDOWN_CALLOUT_KINDS = ['NOTE', 'WARNING']`; `MARKDOWN_CODE_LANGUAGES` = ts, tsx, js, jsx, json, bash, css, html, sql, prisma, yaml, md, diff, vue; `MARKDOWN_LINK_PROTOCOLS = ['http', 'https', 'mailto']` cộng với link tương đối `/…` và `#…`; image chỉ từ `/api/public/media/`) và `packages/contracts/src/common/markdown-url.util.ts` (`isAllowedMarkdownUrl`, `isAllowedImageSrc`). Các cấu trúc được phép: paragraph, H2/H3, bold, italic, strikethrough, inline code, link, bullet list và ordered list, blockquote, callout, fenced code có ngôn ngữ, horizontal rule, image có alt text, table GFM, hard break. Mọi thứ khác (raw HTML, H1, footnote, task list, embed) bị bỏ hoặc render như text thường. H1 trong Markdown đã lưu được render thành H2.
- Fixture trong `packages/contracts/src/fixtures/`: `markdown-kitchen-sink.fixture.ts` (mỗi cấu trúc được phép xuất hiện một lần) và `markdown-unsafe.fixture.ts` (`<script>`, `<iframe>`, một attribute `onerror`, một link `javascript:`, một image bên ngoài, một H1). T42 dùng lại cả hai.
- `packages/ui/src/styles/code-syntax.css` (được `globals.css` import): các biến `--shiki-foreground`, `--shiki-background` và `--shiki-token-*`, chỉ là alias của token palette (map mặc định: keyword → `--primary`, string → `--hue-jade`, constant → `--hue-amber`, function → `--hue-violet`, comment và punctuation → `--muted-foreground`, background → `--muted`; chỉnh trong phạm vi palette nếu check contrast fail). Highlighter của editor admin đọc cùng các biến này (T42).
- Util của `content`: `toc.util.ts` (h2/h3 → item TOC), `split-sections.util.ts` (tách một field markdown tại các heading `###`; dùng cho requirement column và decision card), `constants/shiki-theme.constant.ts`.
- `content/components/Markdown/Markdown.tsx` (server component).
- `packages/ui`: `Prose` (`prose` / `compact`; mọi rule long-form trong §3.2: 66ch, spacing, bullet `▹` thụt treo, link gạch chân, table scroll được trong một vùng focus được), `CodeBlock` (thanh filename, badge ngôn ngữ, nút copy có `aria-live`, scroll ngang focus được, toggle wrap), `Callout` (ô icon), `SectionNav` (sticky từ `lg+`, scroll-spy với `aria-current`, `<details>` trên mobile), `ContentProgress` (thanh `--primary` 2px, ẩn khi reduced motion), `RequirementColumns` (hai card, bullet `▹`), `DecisionCard` (title + prose compact), `TakeawaysCard` (`--primary-subtle`, bullet `▹`).
- Test: mọi cấu trúc của fixture kitchen-sink đều được render; không thứ gì từ fixture unsafe được render (`<script>`, HTML inline, link `javascript:`, image bên ngoài); heading có id; trích xuất TOC; util tách section.

**File.** `apps/web/src/modules/content/services/markdown.service.ts`, `apps/web/src/modules/content/utils/{toc.util.ts,split-sections.util.ts}` (+ test), `apps/web/src/modules/content/constants/shiki-theme.constant.ts`, `packages/contracts/src/constants/markdown.constant.ts`, `packages/contracts/src/common/markdown-url.util.ts` (+ test), `packages/contracts/src/fixtures/{markdown-kitchen-sink,markdown-unsafe}.fixture.ts`, `packages/ui/src/styles/{globals.css,code-syntax.css}`, `apps/web/src/modules/content/components/Markdown/Markdown.tsx`, `packages/ui/src/components/{Prose,CodeBlock,Callout,SectionNav,ContentProgress,RequirementColumns,DecisionCard,TakeawaysCard}/*`.

**Thiết kế.** Figma `10:2` (post), `4:2`/`5:2` (case study). Mockup `post.html`, `case-study.html`. Token: `text-prose`, `text-heading`, `text-subheading`, `text-meta`, `--measure`, `--muted`, `--subtle-foreground`, `--primary`, `--primary-subtle`, `--radius-lg`, `--font-mono`.

**Tiêu chí nghiệm thu.**
- [ ] Một mẫu markdown có `<script>`, attribute `onerror` và link `javascript:` không render ra cái nào trong số đó (test).
- [ ] Prose rộng ≤ 66ch ở 18px / 1.75; heading có anchor link.
- [ ] Code block scroll được bằng bàn phím, copy thông báo "Copied", và cả hai theme đạt contrast.
- [ ] TOC highlight section hiện tại khi scroll; trên mobile nó là một `<details>`.

**Tiêu đề PR:** `feat(web): markdown pipeline and prose`

#### T24 · Hoàn thiện Home v2

**Roadmap** p14 · **Spec** [§5.1](./design/portfolio-design-system.vi.md#s-5-1), §5.0 (row home), §4.4, §4.5, §7.2 (`01`, `02`, `05`, `09`) · **Phụ thuộc** T14, T19, T20, T21, T22 · **Cỡ** L

**Mục tiêu.** Toàn bộ trang home dựng từ các block của home (D26), theo thứ tự, trạng thái hiển thị và layout của chúng, khớp với các frame home.

**Phạm vi.**
- Service (server, có tag): `projects/services/{projects,domains}.service.ts`, `about/services/skills.service.ts`, `home/services/process-steps.service.ts`, `notes/services/posts.service.ts`.
- Block type (quy tắc 8: definition + renderer + các entry trong registry):
  - `stat-band`: `StatBand`, ẩn nếu ít hơn 2 stat.
  - `tech-marquee`: `TechMarquee`, ẩn nếu rỗng, tĩnh nếu ít hơn 6 skill hoặc `marqueeEnabled` là false.
  - `featured-case`: `CaseCard` featured, ẩn nếu không có.
  - `domain-grid`: các `DomainCard`; card có 0 project bị ẩn.
  - `case-grid`: các `CaseCard` theo `source`. `manual` giữ thứ tự của `projectIds` và bỏ qua id bị thiếu hoặc chưa publish.
  - `process`: `FeatureCard` 2×2 từ principles + `ProcessFlow`, ẩn nếu ít hơn 3 bước.
  - `skill-groups`: `SkillGroup`.
  - `post-list`: các `PostCard`, với `limit` và một `tag` optional.
  - Hero có thêm `MigrationDiagram` trong aside khi `layout` là `SPLIT_7_5` và `showDiagram` bật.
- Các band của §5.1 đến từ giá trị `surface` đã seed: stats + marquee (một band dùng chung), domains, process. `SectionHeader` có eyebrow và ô icon ở mọi block có `heading`. `Reveal` khi scroll.
- Mỗi block nằm trong `SectionBoundary` với skeleton đúng hình block (Figma `21:2`) và lỗi inline có Retry; một block optional bị rỗng thì biến mất cùng anchor của nó.

**File.** `apps/web/src/modules/blocks/components/{StatBandBlock,TechMarqueeBlock,FeaturedCaseBlock,DomainGridBlock,CaseGridBlock,ProcessBlock,SkillGroupsBlock,PostListBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `apps/web/src/modules/blocks/components/HeroBlock/HeroBlock.tsx`, `packages/contracts/src/blocks/definitions/{stat-band,tech-marquee,featured-case,domain-grid,case-grid,process,skill-groups,post-list}.block.ts`, `packages/contracts/src/blocks/{block-registry.constant.ts,definitions/hero.block.ts}`, `apps/web/src/modules/home/services/process-steps.service.ts`, `apps/web/src/modules/projects/services/{projects,domains}.service.ts`, `apps/web/src/modules/about/services/skills.service.ts`, `apps/web/src/modules/notes/services/posts.service.ts`, `apps/web/i18n/locales/{en,vi}.json`.

**Thiết kế.** Figma `2:2`/`3:2` (1440 light/dark), `8:2` (390), `21:2` (loading). Mockup `home.html` (+ `?dark=1`, 390px), `home-skeleton.html`. Token: mọi token v2 (`--band`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), `text-display`, `text-title`, `text-heading`.

**Tiêu chí nghiệm thu.**
- [ ] Mọi text trên trang đều truy ra được một field API; `pnpm check:content` pass (roadmap p14).
- [ ] Thứ tự block theo `PageBlock.sortOrder`; ẩn block `marquee` trong Adminer thì nó biến mất (check v2 Day 7 trong spec §6).
- [ ] Đổi `layout` của block `work` sang `TWO` trong Adminer thì có 2 cột từ 768px; ở 390px mọi block là một cột.
- [ ] Ép endpoint của một block bị lỗi thì block đó hiện alert inline trong khi phần còn lại vẫn render.
- [ ] Lượt test chỉ dùng bàn phím: thứ tự Tab, focus nhìn thấy được, card mở bằng Enter (roadmap p14).
- [ ] Không có scroll ngang ở 390px; CLS 0 từ count-up và reveal.
- [ ] Screenshot ở 1440 light/dark và 390 được so với frame Figma; trạng thái loading so với `21:2`.

**Tiêu đề PR:** `feat(web): home v2 sections`

#### T25 · Trang About + Timeline

**Roadmap** p14 · **Spec** [§5.2](./design/portfolio-design-system.vi.md#s-5-2), §4.2 (`Timeline`), §5.0 (row About) · **Phụ thuộc** T23, T24 · **Cỡ** L

**Mục tiêu.** Trang About dựng từ các block của about (D26): intro, dải stats, timeline experience, principles, skills, education và card CV, cộng một block `prose` tự do dùng được cho mọi page.

**Phạm vi.**
- Route `app/[locale]/(site)/about/page.tsx` → `about/views/AboutIndex.tsx`, view này render `BlocksPage` cho `about`.
- Service: `about/services/{experience,education,principles}.service.ts` (+ skills service đã có).
- Block type (quy tắc 8):
  - `about-intro` (H1): card avatar có city và pill availability; avatar hiện chữ cái đầu tên cho tới khi có media; bio qua `Markdown`.
  - `timeline`: `Timeline`.
  - `principle-list`, `education-list`.
  - `cv-download`: card download, ẩn khi `resumeEnId`/`resumeViId` còn trống; link hoạt động sau T51.
  - `prose`: một `body` Markdown tự do và một `aside` optional qua pipeline của T23, được phép trên mọi page; `SPLIT_8_4` đặt aside ở bên phải.
  - `stat-band` (`compact`) và `skill-groups` từ T24 được phép trên ABOUT.
- `Timeline` / `TimelineItem` trong `packages/ui`: thanh năm, row nhóm theo `company`, role, khoảng tháng bằng `<time datetime>`, label "now" cho `endDate` null (chrome), highlights trong một `accordion` (mở sẵn khi reduced motion), tech tag. `<ol>`.

**File.** `apps/web/app/[locale]/(site)/about/page.tsx`, `apps/web/src/modules/about/views/AboutIndex.tsx`, `apps/web/src/modules/blocks/components/{AboutIntroBlock,TimelineBlock,PrincipleListBlock,EducationListBlock,CvDownloadBlock,ProseBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/definitions/{about-intro,timeline,principle-list,education-list,cv-download,prose}.block.ts`, `packages/contracts/src/blocks/block-registry.constant.ts`, `apps/web/src/modules/about/services/{experience,education,principles}.service.ts`, `packages/ui/src/components/Timeline/*`, `packages/ui/src/components/ui/{accordion,avatar}.tsx`.

**Thiết kế.** Figma `7:2`. Mockup `about.html`. Token: `--band`, `--card`, `--border`, `--primary`, `text-title`, `text-subheading`, `text-prose`, `text-meta`.

**Tiêu chí nghiệm thu.**
- [ ] Công ty có hai role hiện thành một nhóm với hai item.
- [ ] Block optional bị ẩn hoặc rỗng thì biến mất cùng anchor; timeline rỗng hiện `empty`.
- [ ] Một block `prose` chứa fixture không an toàn của T23 không render item không an toàn nào.
- [ ] Trên `/vi`, các nhóm fallback mang `lang="en"` và badge "EN".
- [ ] Screenshot được so với `7:2`; có lượt test bàn phím.

**Tiêu đề PR:** `feat(web): about + timeline`

#### T26 · List project

**Roadmap** p14 · **Spec** [§5.3](./design/portfolio-design-system.vi.md#s-5-3), §5.0 (row Projects list) · **Phụ thuộc** T14, T19, T20 · **Cỡ** M

**Mục tiêu.** List project có filter theo domain và tech lưu trong URL state, render trên server, khớp với frame Figma đã bind token hoàn toàn.

**Phạm vi.**
- Route `app/[locale]/(site)/projects/page.tsx` → `projects/views/ProjectsIndex.tsx`. URL param được parse bằng `projectListParamsSchema`.
- `ProjectsIndex` render `BlocksPage` cho `projects`, với `searchParams` trong `BlockContext`: `page-header` (T14), rồi block mới `projects-browser` (quy tắc 8; required, một cái mỗi page; props `showFeatured`, `pageSize`; layout `TWO` hoặc `THREE` cho grid), block này chứa list bên dưới.
- `DomainFilter` (pill có số đếm và chấm hue, là link thật `?domain=`; trên mobile scroll ngang với mép mờ dần), `TechFilter` (client island: combobox `popover` + `command` điều hướng tới `?skill=`), `CaseCard` featured dạng rộng, rồi tới grid 2 cột; `empty` có "Clear filters"; `pagination` khi số row nhiều hơn `pageSize`.

**File.** `apps/web/app/[locale]/(site)/projects/page.tsx`, `apps/web/src/modules/projects/views/ProjectsIndex.tsx`, `apps/web/src/modules/projects/components/{DomainFilter,TechFilter,ProjectsGrid}/*`, `apps/web/src/modules/blocks/components/ProjectsBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/projects-browser.block.ts,block-registry.constant.ts}`, `packages/ui/src/components/ui/{popover,pagination}.tsx`.

**Thiết kế.** Figma `13:2` (bind hoàn toàn: so sánh cả variable, không chỉ pixel). Mockup `projects.html`. Token: `--hue-*`, `--card`, `--border-strong`, `--shadow-2`, `text-title`, `text-body`, `text-meta`.

**Tiêu chí nghiệm thu.**
- [ ] `/en/projects?skill=nuxt` và `?domain=<slug>` filter trên server (spec §6 Day 12).
- [ ] Link filter domain hoạt động khi không có JavaScript.
- [ ] Screenshot được so với `13:2` ở light và dark, tại 1440 và 390.

**Tiêu đề PR:** `feat(web): projects list`

#### T27 · Case study của project

**Roadmap** p14 · **Spec** [§5.4](./design/portfolio-design-system.vi.md#s-5-4), §5.0 (row Case study) · **Phụ thuộc** T23, T26 · **Cỡ** L

**Mục tiêu.** Trang case study theo thứ tự §5.4, generate tĩnh cho từng slug đã publish.

**Phạm vi.**
- Route `app/[locale]/(site)/projects/[slug]/page.tsx` → `projects/views/ProjectsDetail.tsx`; `generateStaticParams` từ các slug đã publish; `notFound()` khi gặp 404.
- Thứ tự: link quay lại → pill (domain, NDA, `VersionTag`) → H1 + tagline → grid meta với label eyebrow (client, role, team, period, stack) → cover 21:9 (placeholder cho tới T51) → `KeyFacts` → metric outcome dạng card `DiffStat` → các section có eyebrow: SUMMARY (problem), LIMITS (constraints), SCOPE (`RequirementColumns` từ `### Functional` / `### Non-functional`), HOW (approach), TRADE-OFFS (decisions tách tại `###` thành các `DecisionCard`), RESULT (outcome), RETRO (lessons) → `FactChips` → "More in <domain>" (2 `CaseCard`) → prev/next theo `sortOrder`.
- `SectionNav` sticky có chip stack và link live site (ẩn khi confidential); `ContentProgress`. Grid mờ chỉ ở vùng header.
- Label eyebrow là chuỗi chrome trong `i18n/locales`.

**File.** `apps/web/app/[locale]/(site)/projects/[slug]/page.tsx`, `apps/web/src/modules/projects/views/ProjectsDetail.tsx`, `apps/web/src/modules/projects/components/{CaseStudyHeader,CaseStudyMeta,CaseStudySections,OutcomeStats,RelatedProjects,PrevNext}/*`, `apps/web/src/modules/projects/services/projects.service.ts`, `packages/ui/src/components/ui/{breadcrumb,collapsible}.tsx`.

**Thiết kế.** Figma `4:2`/`5:2`. Mockup `case-study.html` (+ `?dark=1`). Token: `--grid-line`, `--hue-*`, `--primary-subtle`, `text-title`, `text-prose`, `text-eyebrow`, `--radius-xl`.

**Tiêu chí nghiệm thu.**
- [ ] Slug chưa publish hoặc không tồn tại trả về trang 404.
- [ ] Project confidential hiện NDA pill và không có link live/repo hay image.
- [ ] TOC và progress bar hoạt động; TOC trên mobile là một collapsible nằm dưới header.
- [ ] Screenshot được so với cả hai frame case study; có lượt test bàn phím.

**Tiêu đề PR:** `feat(web): project case study`

#### T28 · List note + post

**Roadmap** p14 · **Spec** [§5.5](./design/portfolio-design-system.vi.md#s-5-5), §4.6 (island search notes) · **Phụ thuộc** T19, T20, T23 · **Cỡ** L

**Mục tiêu.** List note (trang đầu render trên server + search ở client) và trang post.

**Phạm vi.**
- Route `app/[locale]/(site)/notes/page.tsx` → `notes/views/NotesIndex.tsx`; `notes/[slug]/page.tsx` → `notes/views/NotesDetail.tsx` (`generateStaticParams`, `notFound()`).
- List: `NotesIndex` render `BlocksPage` cho `notes`: `page-header`, rồi block mới `notes-browser` (quy tắc 8; required; props `showFeatured`, `pageSize`) chứa `NotesSearch` (client: `role="search"`, debounce 200ms, đồng bộ URL `?q=&tag=`, số kết quả trong một live region, gợi ý `⌘K`), pill tag có số đếm từ `GET /public/tags`, các nhóm theo năm gồm các row `PostCard`, post featured dạng card rộng, `pagination`.
  - `notes/hooks/use-notes-search.hook.ts`: `useQuery(qk.public.posts(params))`, `placeholderData: keepPreviousData`, `initialData` = trang đầu từ server khi `q` rỗng, abort qua `signal`. `notes/services/posts-client.service.ts` dùng `apiClient`.
- Post: eyebrow `NOTE · #tag`, date · minutes bằng mono, tag, H1, body `Markdown`, `TakeawaysCard` (nếu có `takeaways`), `PostCard` prev/next, `SectionNav`, `ContentProgress`.
- `CommandPalette` public có thêm search post (cùng hook).

**File.** `apps/web/app/[locale]/(site)/notes/page.tsx`, `apps/web/app/[locale]/(site)/notes/[slug]/page.tsx`, `apps/web/src/modules/notes/views/{NotesIndex,NotesDetail}.tsx`, `apps/web/src/modules/notes/components/{NotesSearch,TagFilter,PostList,PostHeader,PostPrevNext}/*`, `apps/web/src/modules/blocks/components/NotesBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/notes-browser.block.ts,block-registry.constant.ts}`, `apps/web/src/modules/notes/hooks/use-notes-search.hook.ts`, `apps/web/src/modules/notes/services/{posts.service.ts,posts-client.service.ts}`, `apps/web/src/modules/core/components/CommandPalette/*`, `packages/ui/src/components/ui/input-group.tsx`.

**Thiết kế.** Figma `9:2` (list), `10:2` (post). Mockup `notes.html`, `post.html`. Token: `text-prose`, `text-subheading`, `text-meta`, `--primary-subtle`, `--measure`.

**Tiêu chí nghiệm thu.**
- [ ] Gõ vào ô search thì URL và kết quả cập nhật mà không reload toàn trang; request cũ bị abort (thấy trạng thái cancelled trong DevTools, spec §6 Day 9).
- [ ] "No results for …" hiện kèm action Clear; khi tắt JS, trang đầu render trên server vẫn hoạt động.
- [ ] URL của post draft trả 404.
- [ ] Screenshot được so với `9:2` và `10:2`; prose giữ 18px / 1.75 / 66ch.

**Tiêu đề PR:** `feat(web): public pages from api`

### M3 — Phía ghi

Admin route trong M3 chưa có login. Chúng vẫn an toàn vì API chỉ listen trên `127.0.0.1` (D9) cho tới khi T36 thêm guard.

#### T29 · Admin write API cho project + test DB

**Roadmap** p15 · **Spec** §1.5, §1.6 (bậc thang 7), §4.6 (autosave `409`), §5.8, §5.9 · **Phụ thuộc** T19 · **Cỡ** L

**Mục tiêu.** Pattern đọc/ghi admin đầy đủ trên một entity (project), được chứng minh bằng integration test chạy với một database test riêng. Mọi task CRUD sau đều copy pattern này.

**Phạm vi.**
- `docker-compose.yml`: service `db-test` dưới profile `test` (MySQL 8.4, `127.0.0.1:3307`, data trên `tmpfs`). `.env.example`: `DATABASE_URL_TEST` (D17).
- Test harness: `apps/api/vitest.e2e.config.ts`, `test/helpers/{create-app.ts,reset-db.ts}` (chạy `prisma migrate reset --force --skip-seed` trên test DB một lần, truncate table giữa các test), script `test:e2e`. Job CI với một MySQL service container.
- Contracts `projects/`: admin DTO (cả hai cột ngôn ngữ, relation dạng id), `projectCreateSchema`, `projectUpdateSchema` (partial, `updatedAt` optional), `adminProjectListParamsSchema` (`status`, `domain`, `q`, `sort`).
- `admin-projects.controller.ts`: `GET /admin/projects`, `GET /admin/projects/:id`, `POST /admin/projects` (luôn là `DRAFT`), `PATCH /admin/projects/:id` (các field, `skills` qua `set`, `metrics` được thay bằng một nested write), `DELETE /admin/projects/:id` = archive (`status: ARCHIVED`). Ở đây không set status thành `PUBLISHED` được; T52 thêm route publish.
- Concurrency: nếu `PATCH` mang theo `updatedAt` và row đã đổi từ lúc đó, trả 409 `STALE` (autosave dùng, T42).
- File trong `dto/` re-export schema từ contracts; `entities/project.mapper.ts` có thêm `toAdminDto`.
- `api.http`: mọi route, kể cả một slug trùng và một update stale.
- `test/projects.e2e-spec.ts`: create, list, update, slug trùng → 409, `updatedAt` stale → 409, archive, id không tồn tại → 404, body sai → 400.

**File.** `docker-compose.yml`, `.env.example`, `apps/api/vitest.e2e.config.ts`, `apps/api/test/helpers/{create-app.ts,reset-db.ts}`, `apps/api/test/projects.e2e-spec.ts`, `apps/api/src/modules/projects/{admin-projects.controller.ts,projects.service.ts,dto/create-project.dto.ts,dto/update-project.dto.ts,dto/project-list-query.dto.ts,entities/project.mapper.ts}`, `packages/contracts/src/projects/*`, `apps/api/api.http`, `.github/workflows/ci.yml`.

**Thiết kế.** Nhu cầu data ở spec §5.8/§5.9; Figma `15:2`, `18:2`.

**Các bước backend, giải thích.**
1. **Động từ REST.** `GET` đọc, `POST` tạo mới (trả 201), `PATCH` sửa một vài field, `DELETE` xóa. Ở đây `DELETE` archive thay vì xóa (spec §1.5: không mất gì).
2. **DTO đầu vào.** Schema create liệt kê các field bắt buộc; schema update biến chúng thành optional. Pipe validate cả hai trước khi controller chạy.
3. **Lỗi unique.** Hai project cùng slug khiến MySQL báo lỗi unique constraint; filter từ T10 đổi nó thành 409 kèm `fieldErrors.slug`, để form hiện lỗi ngay dưới input slug.
4. **Nested write.** `metrics: { deleteMany: {}, create: [...] }` bên trong một `update` thay toàn bộ metric một cách atomic: Prisma chạy nó như một transaction.
5. **Optimistic concurrency.** Client gửi lên `updatedAt` mà nó đã load. Nếu row có `updatedAt` mới hơn, tức là người khác đã save trước: trả 409 thay vì lặng lẽ ghi đè.
6. **Integration test.** Test khởi động app thật và gọi qua HTTP, với một database dùng xong bỏ trên port 3307, nên chúng test pipe, filter, service và SQL cùng lúc. Không bao giờ trỏ test vào database dev.

**Tiêu chí nghiệm thu.**
- [ ] `api.http` chạy thử mọi route create/update/delete (roadmap p15).
- [ ] Slug trùng trả 409 với field error trên `slug` (roadmap p15).
- [ ] `pnpm --filter @portfolio/api test:e2e` xanh ở local và trên CI.
- [ ] `updatedAt` stale trả 409 `STALE`.

**Tiêu đề PR:** `feat(api): crud endpoints`

#### T30 · Write API: post, experience, education, principle, stat, process

**Roadmap** p15 · **Spec** §1.5, §5.8, §5.9 · **Phụ thuộc** T29 · **Cỡ** M

**Mục tiêu.** Admin CRUD cho các entity nội dung, dùng pattern của T29.

**Phạm vi.**
- `admin-*.controller.ts` + admin DTO + schema create/update + admin list params cho: `posts` (archive khi delete; `readingMinutes` tính lại khi save; `tags` qua `set`; publish lint chỉ chạy khi publish, ở T52), `experience` (`skills` qua `set`), `education`, `principles`, `profile-stats`, `process-steps` (hard delete, UI có bước confirm).
- Check conflict `updatedAt` trên post và experience (hai entity này có editor autosave).
- Mỗi module một e2e spec: create, lỗi validation, update, delete/archive, 404.

**File.** `apps/api/src/modules/{posts,experience,education,principles,profile-stats,process-steps}/{admin-*.controller.ts,*.service.ts,dto/*,entities/*.mapper.ts}`, `packages/contracts/src/{posts,experience,education,principles,profile-stats,process-steps}/*`, `apps/api/test/{posts,experience,about-small}.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Cùng shape, entity mới.** Copy admin controller, DTO và mapper của module projects; đổi field. Lặp lại ở đây là cố ý: module nào cũng trông giống nhau, nên code dễ bàn giao.
2. **Field suy ra.** `readingMinutes` do service tính mỗi lần save, client không bao giờ gửi lên.

**Tiêu chí nghiệm thu.**
- [ ] `api.http` phủ mọi route mới.
- [ ] e2e test xanh; body sai trả 400 kèm `fieldErrors`.

**Tiêu đề PR:** `feat(api): content crud endpoints`

#### T31 · Write API: skill, category, tag, domain

**Roadmap** p15 · **Spec** §1.5, §5.11 · **Phụ thuộc** T29 · **Cỡ** M

**Mục tiêu.** Admin CRUD cho taxonomy nối các nội dung với nhau.

**Phạm vi.**
- `admin-skills.controller.ts` (`/admin/skills`, `/admin/skill-categories`), `admin-tags.controller.ts` (tạo được ngay từ editor: `POST` nhận một name và suy ra slug bằng `common/utils/slug.util.ts`), `admin-domains.controller.ts` (`hue`, `iconKey` được validate theo allowlist).
- Quy tắc delete: xóa một skill hoặc tag thì xóa các link của nó; xóa một domain thì set `Project.domainId` về null (`onDelete: SetNull`, migration `domain-set-null`); xóa một category vẫn còn skill thì trả 409 `IN_USE`.
- e2e test, kể cả các quy tắc delete.

**File.** `apps/api/src/modules/{skills,tags,domains}/{admin-*.controller.ts,*.service.ts,dto/*,entities/*}`, `apps/api/src/common/utils/slug.util.ts` (+ `.spec.ts`), `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_domain_set_null/`, `packages/contracts/src/{skills,tags,domains}/*`, `apps/api/test/taxonomy.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Referential action.** `onDelete: SetNull` nói cho MySQL biết phải làm gì với các project khi domain của chúng bị xóa. Đọc file migration: nó đổi foreign key.
2. **Delete có chặn.** Có những lệnh delete phải bị từ chối. Check trong service và trả 409 kèm một `code` rõ ràng, thay vì để MySQL fail với lỗi foreign key.

**Tiêu chí nghiệm thu.**
- [ ] Xóa một domain thì các project của nó không còn domain; xóa một category đang được dùng trả 409 `IN_USE`.
- [ ] `iconKey` lạ trả 400 kèm `fieldErrors.iconKey`.

**Tiêu đề PR:** `feat(api): taxonomy crud endpoints`

#### T32 · Write API: site, profile, nav, social, contact topic

**Roadmap** p15 · **Spec** §1.5 (nhóm Site), §5.10, §6 Day 6 · **Phụ thuộc** T29 · **Cỡ** M

**Mục tiêu.** Admin endpoint cho mọi thứ định hình site xung quanh nội dung.

**Phạm vi.**
- `GET/PATCH /admin/site` (`site-settings`), `GET/PATCH /admin/profile` (`profile`; admin DTO có cả `phone` private; `headlineAccent{En,Vi}` phải là substring của `headline{En,Vi}` → `fieldErrors`).
- CRUD `navigation` (`href` phải là một route trong `routes.constant.ts` hoặc một URL tuyệt đối `https://`), CRUD `social-links` (tối đa 2 cái có `showInCta` → 400). Page và block có write API riêng (T32a).
- Module mới `contact-topics`: admin CRUD và `GET /public/contact-topics` (chỉ topic visible, theo thứ tự).
- e2e test: PATCH profile sai, accent không nằm trong headline, quy tắc href của nav, giới hạn CTA.

**File.** `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{admin-*.controller.ts,*.service.ts,dto/*}`, `apps/api/src/modules/contact-topics/*`, `apps/api/prisma/schema.prisma` + migration `add-contact-topics`, `apps/api/prisma/seed/data/site.data.ts`, `packages/contracts/src/{site-settings,profile,navigation,social-links,contact-topics}/*`, `apps/api/test/site.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Spec §5.10.

**Các bước backend, giải thích.**
1. **Singleton.** `PATCH /admin/site` luôn update row `id = 1`; không có create hay delete.
2. **Quy tắc liên field.** "Accent phải xuất hiện trong headline" liên quan tới hai field, nên nó nằm trong `superRefine` của schema và báo lỗi trên `headlineAccentEn` hoặc `headlineAccentVi`.

**Tiêu chí nghiệm thu.**
- [ ] `PATCH /admin/profile` sai trả 400 kèm `fieldErrors` (spec §6 Day 6).
- [ ] Accent không nằm trong headline bị từ chối chỉ cho đúng locale đó.
- [ ] `GET /api/public/contact-topics` trả các topic visible theo thứ tự.

**Tiêu đề PR:** `feat(api): site crud endpoints`

#### T32a · Write API: page và block

**Roadmap** p15 · **Spec** §1.5, §4.6 (autosave `409`), §5.10, D26 · **Phụ thuộc** T10a, T29 · **Cỡ** L

**Mục tiêu.** Admin endpoint để thêm, sửa, ẩn, nhân bản và xóa các block trong draft của một page, với mọi luật của registry được API enforce.

**Phạm vi.**
- `admin-pages.controller.ts`:
  - `GET /admin/pages`: năm page kèm key, số block và `updatedAt` (T52a thêm version đã publish và `hasUnpublishedChanges`).
  - `GET /admin/pages/:key`: các field SEO của page ở cả hai ngôn ngữ và mọi block, kể cả block bị ẩn. Row không biết type hoặc không hợp lệ được trả về kèm `issues`, để builder hiện được chúng.
  - `PATCH /admin/pages/:key`: các field SEO, có check `updatedAt`.
  - `POST /admin/pages/:key/blocks` `{ type, afterId? }`: tạo một block với `defaults` và layout đầu tiên của type, một `key` unique suy ra từ type (`case-grid`, `case-grid-2`), đặt sau `afterId` hoặc ở cuối. 400 `BLOCK_NOT_ALLOWED` khi type không được phép trên page này; 409 `BLOCK_LIMIT` khi vượt `maxPerPage`.
  - `PATCH /admin/pages/:key/blocks/:id` `{ props?, layout?, surface?, isVisible?, key?, updatedAt }`: `props` được parse bằng schema của type → 400 kèm `fieldErrors` có key là path (`props.primaryCta.label.en`); `layout` phải là một trong các layout của type; `refs` được check (id project hoặc stat không tồn tại → 400 trên field đó); `updatedAt` cũ → 409 `STALE`.
  - `POST /admin/pages/:key/blocks/:id/duplicate`: cùng props, key mới, đặt ngay sau.
  - `DELETE /admin/pages/:key/blocks/:id`: xóa hẳn row trong draft. Một version đã publish vẫn giữ block đó cho tới lần publish sau (T52a).
- Luật của page trong `pages-rules.util.ts` (có unit test, được publish ở T52a dùng lại): block `h1` đứng đầu, visible và không xóa được (409 `BLOCK_LOCKED`); block `required` không xóa hay ẩn được (409 `BLOCK_REQUIRED`); `maxPerPage`; các page được phép.
- Mọi thao tác ghi cũng update `Page.updatedAt` trong cùng transaction, để page biết nó có thay đổi trong draft.
- Contracts `pages/`: admin page DTO, `createBlockSchema`, `updateBlockSchema` (`props` ở đây là `unknown` và được parse theo type trong service, vì một body schema không thể biết mọi type), `updatePageSchema`. `ErrorCode` có thêm `BLOCK_NOT_ALLOWED`, `BLOCK_LIMIT`, `BLOCK_LOCKED`, `BLOCK_REQUIRED`.
- e2e `test/pages.e2e-spec.ts`: thêm mọi type được phép; props sai → 400 kèm path của field; type không được phép → 400; vượt giới hạn → 409; xóa block H1 → 409; ẩn một block required → 409; update cũ → 409; id project lạ trong một `case-grid` → 400; một row có type lạ (chèn bằng Prisma trong test) được admin route liệt kê kèm `issues` và không có trong public route.

**Ngoài phạm vi.** Reorder (T33). Publish, version, preview (T52a). UI của builder (T45b).

**File.** `apps/api/src/modules/pages/{admin-pages.controller.ts,pages.service.ts,pages-rules.util.ts,pages-rules.util.spec.ts,dto/*,entities/page.mapper.ts}`, `packages/contracts/src/pages/*`, `packages/contracts/src/common/api-error.schema.ts`, `apps/api/test/pages.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Validate theo type, trong service.** Body của `PATCH …/blocks/:id` phụ thuộc vào type của block, mà server đọc từ row trong DB. Vì vậy controller nhận `props` là unknown, còn service chọn zod schema của type rồi parse. Fail thì trở thành 400 quen thuộc kèm `fieldErrors`, nên form được generate (T45a) hiện từng message dưới đúng input của nó.
2. **Luật thuộc về server.** Builder ẩn các nút sẽ làm vỡ luật, nhưng API mới là bên từ chối, kèm một `code` rõ ràng. Một script hay một tab browser cũ không thể xóa hero.
3. **Chỉ draft thay đổi.** Các endpoint này sửa các row draft. Khi T52a xong, visitor vẫn thấy version đã publish cho tới khi có người publish, nên bạn sắp xếp lại thoải mái.
4. **Optimistic concurrency theo từng block.** Mỗi block có `updatedAt` riêng, nên hai người sửa hai block khác nhau không xung đột; cùng một block mở ở hai tab thì có.

**Tiêu chí nghiệm thu.**
- [ ] `api.http` phủ mọi route, kể cả các trường hợp lỗi (roadmap p15).
- [ ] Props sai trả 400 kèm `fieldErrors` ở đúng path; `key` block bị trùng trả 409 kèm `fieldErrors.key`.
- [ ] Xóa block H1 hoặc ẩn một block required trả 409 kèm code của nó.
- [ ] `pnpm --filter @portfolio/api test:e2e` xanh, kể cả trường hợp type lạ.

**Tiêu đề PR:** `feat(api): page blocks crud`

#### T33 · Reorder trong transaction + thay tag

**Roadmap** p16 · **Spec** §1.6 (transaction), §4.6 (optimistic reorder) · **Phụ thuộc** T31, T32, T32a · **Cỡ** M

**Mục tiêu.** Reorder bất kỳ list nào và thay tag của một post thì hoặc thành công trọn vẹn, hoặc không đổi gì cả.

**Phạm vi.**
- `common/utils/reorder.util.ts`: nhận một model delegate và `ids: number[]`, check các id đúng bằng tập hiện tại, rồi ghi `sortOrder = index` cho từng cái bên trong `prisma.$transaction(async (tx) => …)`.
- `PATCH /admin/{entity}/order` với body `{ ids }` cho project, experience, principle, profile stat, process step, skill, skill category, domain, nav item, social link, contact topic, và page block (`PATCH /admin/pages/:key/blocks/order`, theo từng page; block H1 phải luôn đứng đầu, T32a).
- Việc thay tag của post và thay skill/metric của project được chuyển vào interactive transaction tường minh, cùng với việc update field.
- Test ép lỗi: cho update thứ ba throw bên trong transaction và assert `sortOrder` và tag không đổi.

**File.** `apps/api/src/common/utils/reorder.util.ts` (+ `.spec.ts`), `apps/api/src/modules/*/admin-*.controller.ts` (route order), `apps/api/src/modules/{posts,projects,pages}/*.service.ts`, `packages/contracts/src/common/reorder.schema.ts`, `apps/api/test/reorder.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Transaction.** Nhiều lệnh ghi cùng thành công hoặc cùng thất bại. Nếu `UPDATE` thứ năm fail, MySQL rollback bốn cái đầu.
2. **Interactive transaction.** `$transaction(async (tx) => { … })` đưa cho bạn `tx`; mọi query bên trong phải dùng `tx`, không dùng `this.prisma`, nếu không nó chạy ngoài transaction.
3. **Validate trước.** Check `ids` khớp với các row hiện tại để một client stale không làm mất hay nhân đôi vị trí.

**Tiêu chí nghiệm thu.**
- [ ] Test ép lỗi để nguyên `sortOrder` và tag (roadmap p16).
- [ ] List `ids` thiếu một row trả 400.

**Tiêu đề PR:** `feat(api): transactional reorder`

#### T34 · Index + EXPLAIN

**Roadmap** p17 · **Spec** §1.5, §1.6 (bậc 8), §6 Day 14 · **Phụ thuộc** T33 · **Cỡ** S

**Mục tiêu.** Các query list dùng index, và một query N+1 được tìm ra và sửa.

**Phạm vi.**
- Bật query logging của Prisma sau một env flag (`PRISMA_LOG_QUERIES=1`).
- Chạy `EXPLAIN` trên: list post đã publish (`status`, `publishedAt desc`, `id`), post theo tag, project đã publish theo domain và theo skill, list project của admin.
- Thêm `@@index` ở chỗ plan hiện `ALL` (ví dụ `Post @@index([status, publishedAt])`, `Project @@index([status, sortOrder])`, `@@index([domainId])`); migration `add-list-indexes`.
- Tìm một N+1 trong log (ví dụ một mapper load relation cho từng row) và sửa bằng `include`.
- Ghi plan trước/sau vào `docs/sql-notes.sql`.

**File.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_list_indexes/`, `apps/api/src/prisma/prisma.service.ts`, `docs/sql-notes.sql`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Index.** Một cấu trúc tra cứu đã sắp xếp trên các cột. `WHERE status = ? ORDER BY publishedAt` chạy nhanh khi có một index bắt đầu bằng `(status, publishedAt)`.
2. **EXPLAIN.** Hỏi MySQL nó sẽ chạy một query thế nào. `type: ALL` nghĩa là nó đọc mọi row; `ref` hoặc `range` kèm tên index của bạn nghĩa là nó dùng index.
3. **N+1.** Một query cho list cộng thêm một query cho mỗi row. Query log hiện nó thành rất nhiều dòng gần như giống hệt nhau.

**Tiêu chí nghiệm thu.**
- [ ] `EXPLAIN` cho thấy dùng index (không có `ALL`) với query list post đã publish (roadmap p17).
- [ ] Ghi chú trước/sau được lưu trong `docs/sql-notes.sql` (roadmap p17).

**Tiêu đề PR:** `perf(db): indexes for list queries`

### M4 — Auth + CMS admin

#### T35 · User, argon2, cookie JWT access + refresh

**Roadmap** p18 (điều chỉnh theo D24) · **Spec** §1.5 (`User`), §1.6 (dòng Auth, được thay bằng D24), §6 Day 15 · **Phụ thuộc** T29 · **Cỡ** L

**Mục tiêu.** Login bằng email + password, trả về hai JWT nằm trong cookie httpOnly: một access token ngắn hạn để chứng minh bạn là ai trên mọi request, và một refresh token dài hơn để lấy cặp token mới khi access token hết hạn. Logout xóa cả hai cookie.

**Phạm vi.**
- Package: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` (+ `@types/passport-jwt`), `argon2`, `cookie-parser`.
- Model `User`: `id`, `email @unique`, `name`, `passwordHash`, `role Role @default(user)` với `enum Role { admin user }` (D7), `isActive @default(true)`, `tokenVersion Int @default(0)`, `lastLoginAt?`, timestamp. Không có model `Session` (D24). Migration `add-auth`.
- Contracts `auth/`: `auth.enum.ts` (`roleSchema = z.enum(['admin', 'user'])`, type `Role`), `auth.schema.ts` (`loginSchema`, `meSchema` = `{ id, email, name, role }`, không bao giờ có `passwordHash` hay `tokenVersion`).
- Config (`src/config/env.schema.ts`): `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` (mỗi cái ít nhất 32 ký tự và không được bằng nhau, nếu không thì boot fail), `JWT_ACCESS_TTL_SECONDS` (mặc định 900 = 15 phút), `JWT_REFRESH_TTL_SECONDS` (mặc định 604800 = 7 ngày).
- `modules/users`: `users.service.ts` (tìm theo email, tìm theo id, create với hash argon2id, `bumpTokenVersion`). Seed tạo một `admin` từ `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` chỉ khi cả ba đều được set; không bao giờ có password mặc định.
- `modules/auth`:
  - `token.service.ts`: `signAccess(user)` → `{ sub: String(user.id), role }` với `JWT_ACCESS_SECRET`, `expiresIn: JWT_ACCESS_TTL_SECONDS`; `signRefresh(user)` → `{ sub, ver: user.tokenVersion }` với `JWT_REFRESH_SECRET`, `expiresIn: JWT_REFRESH_TTL_SECONDS`. Cả hai dùng `JwtService.signAsync(payload, { secret, expiresIn })`, thuật toán HS256. Không để email, tên hay dữ liệu cá nhân nào trong payload.
  - `auth-cookies.util.ts`: `setAuthCookies(res, tokens)` và `clearAuthCookies(res)` với các option trong bảng bên dưới (`maxAge` của Express tính bằng mili giây: số giây × 1000).
  - `strategies/jwt.strategy.ts` (`PassportStrategy(Strategy, 'jwt')`): `jwtFromRequest` đọc `req.cookies.access_token`, `ignoreExpiration: false`, `secretOrKey: JWT_ACCESS_SECRET`; `validate(payload)` trả `{ id: Number(payload.sub), role: payload.role }` mà không query DB (đây sẽ là `request.user`).
  - `strategies/jwt-refresh.strategy.ts` (`'jwt-refresh'`): đọc `req.cookies.refresh_token` với `JWT_REFRESH_SECRET`; `validate` load user và từ chối (401) khi user không tồn tại, `isActive = false`, hoặc `payload.ver !== user.tokenVersion`.
  - `auth.service.ts`: `login` (tìm theo email, `argon2.verify`; cùng một lỗi 401 `INVALID_CREDENTIALS` cho email không tồn tại, sai password và user bị khóa; update `lastLoginAt`; cấp cả hai token), `refresh` (cấp cặp mới cho user đã được validate: rotation), `me` (load user theo `request.user.id`; 401 nếu không tồn tại hoặc bị khóa).
  - `auth.controller.ts`: `POST /auth/login` (body `loginSchema`; set cả hai cookie; trả `meSchema`, không bao giờ trả token), `POST /auth/refresh` (`@UseGuards(JwtRefreshGuard)`; set cặp mới; 204), `POST /auth/logout` (xóa cả hai cookie; 204, chạy được cả khi access token đã hết hạn), `GET /auth/me` (`@UseGuards(JwtAuthGuard)`). T36 biến `JwtAuthGuard` thành global.
- `common/guards/jwt-auth.guard.ts` (`AuthGuard('jwt')`, `handleRequest` đổi mọi lỗi thành 401 `UNAUTHENTICATED`, D5) và `common/guards/jwt-refresh.guard.ts` (`AuthGuard('jwt-refresh')`).
- `cookie-parser` trong `main.ts`. `.env.example`: bốn key `JWT_*` (secret để trống, kèm comment "generate with `openssl rand -base64 48`"), `ADMIN_EMAIL="<email>"`, `ADMIN_NAME`, `ADMIN_PASSWORD`.
- `test/helpers/auth.helper.ts`: tạo một `admin` và một `user` trong test DB và trả về các supertest agent đã login (giữ cookie giữa các request). `api.http`: login, me, refresh, logout (REST Client tự nhớ cookie).
- e2e: login set cả hai cookie với đúng flag; `me` trả DTO có `role`; access token hết hạn (ký trong test với `exp` ở quá khứ) → 401; refresh → 204 và cookie mới; refresh sau khi `tokenVersion` đổi → 401; logout xóa cả hai cookie.

**Cookie (D24).**

| Cookie | Chứa | `Path` | `Max-Age` | Flag |
| --- | --- | --- | --- | --- |
| `access_token` | access JWT `{ sub, role }` | `/` (Server Component của Next đọc nó trên `/admin/*` và forward đi, T37) | `JWT_ACCESS_TTL_SECONDS` (15 phút) | `httpOnly`, `SameSite=Lax`, `Secure` trên production |
| `refresh_token` | refresh JWT `{ sub, ver }` | `/api/auth` (chỉ gửi tới refresh và logout) | `JWT_REFRESH_TTL_SECONDS` (7 ngày) | `httpOnly`, `SameSite=Lax`, `Secure` trên production |

**File.** `apps/api/package.json`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_auth/`, `apps/api/prisma/seed/profiles/*.seed.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts}`, `apps/api/src/modules/users/{users.module.ts,users.service.ts,users.service.spec.ts,entities/*}`, `apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,auth.service.spec.ts,token.service.ts,auth-cookies.util.ts,strategies/jwt.strategy.ts,strategies/jwt-refresh.strategy.ts,dto/*}`, `apps/api/src/common/guards/{jwt-auth.guard.ts,jwt-refresh.guard.ts}`, `apps/api/src/main.ts`, `packages/contracts/src/auth/{auth.enum.ts,auth.schema.ts,auth.type.ts}`, `apps/api/test/helpers/auth.helper.ts`, `apps/api/test/auth.e2e-spec.ts`, `.env.example`, `apps/api/api.http` ([api STRUCTURE: auth](../apps/api/STRUCTURE.md#auth-jwt)).

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Hash, không phải mã hóa.** Một password hash không thể đảo ngược thành password. argon2id cố ý chạy chậm, nên đoán thử hàng triệu password sẽ rất tốn kém. `argon2.hash` khi tạo, `argon2.verify` khi login; password gốc không bao giờ được lưu hay log.
2. **JWT là gì.** Ba phần base64url nối bằng dấu chấm: header (thuật toán), payload (các claim như `sub` = user id, `role`, `exp` = thời điểm hết hạn) và một chữ ký tạo bằng secret mà chỉ API biết. Ai cũng *đọc* được payload (nó không được mã hóa, nên không để email hay bí mật vào đó), nhưng không ai *sửa* được nếu không làm hỏng chữ ký. API tin một token vì chữ ký hợp lệ, chứ không phải vì có một row trong DB.
3. **Vì sao cần hai token.** Access token được gửi trên mọi request và được check mà không đụng tới DB, nên nó phải chết nhanh (15 phút) phòng khi bị lộ. Refresh token chỉ được gửi tới `/api/auth/*` (nhờ `Path` của cookie), sống 7 ngày, và mỗi lần dùng đều được check với DB (`isActive`, `tokenVersion`). Hai secret khác nhau nên không thể dùng token này thay cho token kia.
4. **Token nằm ở đâu: cookie httpOnly.** `httpOnly`: JavaScript của page không đọc được, nên một lỗi XSS không lấy cắp được (token trong `localStorage` thì bị lấy được). `SameSite=Lax`: site khác không gửi được cookie kèm form post. `Secure`: chỉ qua HTTPS (production). Vì Next rewrite `/api/*` sang Nest, browser nghĩ mình đang nói chuyện với một site duy nhất; cookie do Nest set là first-party và browser tự gửi lại trên mọi lời gọi `/api/*` mà không cần thêm code.
5. **`@nestjs/jwt` và `passport-jwt`.** `JwtService` (từ `@nestjs/jwt`) *tạo* token. Một *strategy* của Passport (từ `passport-jwt`) *kiểm tra* token: nó khai báo tìm token ở đâu (cookie), secret nào dùng để verify, và `validate()` trả về thứ sẽ nằm trên `request.user`. `AuthGuard('jwt')` chạy strategy đó trước một route.
6. **Refresh và rotation.** Khi một request bị 401 vì access token hết hạn, web gọi `POST /api/auth/refresh` một lần (T37). API check refresh token, rồi gửi một access token mới *và* một refresh token mới. Chừng nào còn dùng admin, mốc 7 ngày cứ trượt tiếp; bỏ không 7 ngày thì phải login lại.
7. **Logout và công tắc khẩn cấp.** Logout xóa cả hai cookie trên browser này. Không có row session nào để xóa, nên muốn cắt *mọi* thiết bị thì API tăng `User.tokenVersion`; mọi refresh token ký với `ver` cũ sẽ fail, và user bị đẩy ra trong vòng 15 phút (khi access token của họ hết hạn). T46 dùng cơ chế này cho "sign out everywhere", khóa tài khoản và đổi password.
8. **Cùng một lỗi cho mọi trường hợp fail.** "Invalid email or password" cho email không tồn tại, sai password và tài khoản bị khóa, để không ai dò được email nào có tài khoản.

**Tiêu chí nghiệm thu.**
- [ ] Login set `access_token` và `refresh_token` là cookie httpOnly với path và thời hạn như trong bảng, và `GET /auth/me` trả user DTO có `role` (roadmap p18).
- [ ] Access token hết hạn hoặc bị sửa trả 401; `POST /auth/refresh` với refresh cookie hợp lệ trả 204 và cookie mới; sau khi `tokenVersion` đổi, refresh trả 401.
- [ ] Logout xóa cả hai cookie, và sau đó `GET /auth/me` trả 401 (roadmap p18, điều chỉnh theo D24).
- [ ] DB không chứa password dạng plain và không chứa token; không response body hay dòng log nào chứa token.

**Tiêu đề PR:** `feat(api): jwt auth` (roadmap p18 ghi `session auth`; đổi theo D24)

#### T36 · JWT guard global, role (admin/user), check Origin, throttle

**Roadmap** p19 · **Spec** §1.6 (Auth, CSRF, Rate limit), §6 Day 16 · **Phụ thuộc** T35 · **Cỡ** M

**Mục tiêu.** Mọi route không public đều cần access token hợp lệ và đúng role; request thay đổi dữ liệu phải đến từ site của mình; login bị rate limit.

**Phạm vi.**
- Đăng ký ba guard global trong `app.module.ts`, theo đúng thứ tự này (`APP_GUARD`): `JwtAuthGuard` → `RolesGuard` → `OriginGuard`.
- `JwtAuthGuard` (từ T35) trở thành global và đọc `@Public()` bằng `Reflector`: route public bỏ qua nó; mọi route khác cần access token hợp lệ, nếu không thì 401. `@Public()` trên health, `POST /auth/login`, `POST /auth/refresh` (route này có `JwtRefreshGuard` riêng), `POST /auth/logout` và mọi `public-*.controller.ts`.
- `common/decorators/roles.decorator.ts`: `@Roles(...roles: Role[])` với `Role = 'admin' | 'user'` lấy từ contracts.
- `common/guards/roles.guard.ts`: bỏ qua route `@Public()`; đọc `@Roles()` trên handler, rồi tới class; **không có `@Roles()` nghĩa là `['admin']`**; `request.user.role` không nằm trong danh sách → 403 `FORBIDDEN`.
- Thêm `@Roles('admin', 'user')` vào mọi handler đọc (`GET`) của các admin controller đã có tới lúc này (T29–T32a) và vào `GET /auth/me`. Các route ghi để trống decorator, nên chỉ admin dùng được. Các task sau ghi rõ role của mình (xem bảng).
- `common/guards/origin.guard.ts`: với `POST/PUT/PATCH/DELETE`, `Origin` phải bằng `WEB_ORIGIN`; nếu không thì 403 `BAD_ORIGIN` (D8). Login, refresh và logout cũng bị check. Các lời gọi server-to-server từ Next (Server Action của contact, T48) gửi `Origin: WEB_ORIGIN` một cách tường minh.
- `common/decorators/current-user.decorator.ts`: `@CurrentUser()` trả `request.user` (`{ id, role }`).
- `@nestjs/throttler`: login 5 lần mỗi phút cho mỗi IP + email → 429; refresh 30 lần mỗi phút cho mỗi IP. Trust proxy loopback (`trust proxy`) để IP client lấy từ `x-forwarded-for` do Next set.
- e2e: không có token → 401; token hết hạn → 401; `user` gọi bất kỳ route ghi nào → 403; `user` gọi admin `GET` → 200; `admin` ghi → 2xx; `Origin` lạ → 403; lần login sai thứ 6 → 429.

**Mỗi role làm được gì (D7).** API là nơi enforce; web chỉ ẩn những gì role đó không dùng được (T37 `RoleGate`).

| Khu vực | `admin` | `user` | Route (task) |
| --- | --- | --- | --- |
| Tài khoản của mình: me, logout, đổi password của mình | có | có | `/auth/*` (T35, T46) |
| Dashboard: số liệu, content health, chart analytics | đọc | đọc | `GET /admin/stats`, `GET /admin/health` (T38, T54) |
| Nội dung: project, post, experience và các bảng about khác, skill, tag, domain, site, profile, nav, social, contact topic, page và block | đọc, tạo, sửa, xóa, sắp xếp | chỉ đọc (list, editor và page builder mở ở chế độ read-only) | `/admin/*` (T29–T33, T39–T45b) |
| Publish, unpublish, đổi status hàng loạt; publish page, discard và restore version | có | không | T52, T52a, T55 |
| Xem trước draft (kể cả live preview của page builder) và lịch sử version của page | có | có | `GET /admin/preview/*`, `/api/draft`, `GET /admin/pages/:key/versions` (T52, T52a) |
| Media: duyệt thư viện | có | có | `GET /admin/media` (T50) |
| Media: upload, sửa alt text, xóa | có | không | T50 |
| Inbox (contact message chứa email của khách) và thông báo realtime | có | không | `/admin/messages`, `/admin/events` (T47, T49) |
| Audit log | có | không | `GET /admin/audit` (T55) |
| User: tạo, đổi role, khóa, sign out everywhere | có | không | `/admin/users` (T46) |

**File.** `apps/api/src/common/guards/{jwt-auth.guard.ts,roles.guard.ts,origin.guard.ts}` (+ spec), `apps/api/src/common/decorators/{public.decorator.ts,roles.decorator.ts,current-user.decorator.ts}`, `apps/api/src/app.module.ts`, `apps/api/src/main.ts`, `apps/api/src/modules/auth/auth.controller.ts`, mọi `public-*.controller.ts` (`@Public()`), mọi `admin-*.controller.ts` đã có (`@Roles('admin', 'user')` trên các handler `GET`), `apps/api/test/guards.e2e-spec.ts`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Guard.** Chạy trước controller và trả lời có hoặc không. Một guard global bảo vệ mọi route theo mặc định; `@Public()` cho một route đi ra ngoài. Vì vậy quên một decorator thì hệ thống fail an toàn (401), chứ không mở toang.
2. **Thứ tự guard.** Trước hết là "bạn là ai?" (`JwtAuthGuard` verify token và set `request.user`), rồi "bạn có được phép không?" (`RolesGuard`), rồi "request này có đến từ site của mình không?" (`OriginGuard`). Nest chạy các guard global theo thứ tự đăng ký.
3. **Role.** `@Roles('admin', 'user')` gắn một nhãn lên route; `RolesGuard` so nó với `request.user.role`, giá trị lấy từ token đã được verify, nên user không giả mạo được. Không có nhãn nghĩa là chỉ admin. Web cũng ẩn button, nhưng server mới là nơi thực sự enforce.
4. **Đổi role và 15 phút.** Role nằm bên trong access token, nên việc đổi role hay khóa tài khoản (T46) có hiệu lực ở lần refresh tiếp theo, chậm nhất 15 phút sau. Đó là cái giá của việc không đọc DB trên mọi request (D24).
5. **Check Origin (CSRF).** Một page độc hại có thể khiến browser của bạn gửi request kèm cookie của bạn. Browser luôn gửi header `Origin` với những request như vậy, nên từ chối các origin khác là chặn được nó. JWT nằm trong cookie cần điều này y hệt như cookie session.
6. **Rate limit.** Đếm request theo từng key trong một khung thời gian và trả 429 khi vượt giới hạn.

**Tiêu chí nghiệm thu.**
- [ ] Ghi khi không có token trả 401; ghi với `Origin` lạ hoặc thiếu trả 403 (roadmap p19, điều chỉnh theo D8).
- [ ] Lần login sai thứ 6 trong một phút trả 429 (roadmap p19).
- [ ] Chỉ `admin` ghi được: `user` nhận 403 trên mọi admin `POST/PATCH/DELETE`, và 200 trên các admin route `GET` (roadmap p19 "chỉ admin được ghi"; spec §6 Day 16).
- [ ] Một admin route mới không có `@Roles()` thì chỉ admin dùng được (có guard spec kiểm chứng).

**Tiêu đề PR:** `feat(api): guards + csrf + throttle`

#### T37 · Admin shell, login, ⌘K

**Roadmap** p20 · **Spec** [§4.3](./design/portfolio-design-system.vi.md#s-4-3), §4.6 (dòng Admin layout), §5.7, §5.11 · **Phụ thuộc** T11, T12, T36 · **Cỡ** L

**Mục tiêu.** Một admin được bảo vệ, có check token phía server, refresh token ngầm, UI theo role, shell kiểu Linear, page login và command palette của admin.

**Phạm vi.**
- `app/admin/layout.tsx`: root layout #2 (`<html lang="en">`, font, `Providers` với `QueryProvider`, `Toaster`, message admin từ `en.json` `admin.*`, D22).
- `middleware.ts` (mở rộng file của T11): với `/admin/*` trừ `/admin/login`, không có cookie `access_token` → redirect tới `/admin/login?next=<path>`. Đây chỉ là check nhanh, không gọi mạng (cookie biến mất khi token hết hạn, T35); check thật nằm ở layout bên dưới. Route public vẫn dùng middleware của next-intl.
- `app/admin/login/page.tsx` → `admin-auth/views/AdminAuthLogin.tsx`. Khi mount, nó thử `POST /api/auth/refresh` một lần (browser tự gửi `refresh_token`); 204 → `router.replace(next)`; ngược lại hiện `LoginForm` (TanStack Form + `field`, `loginSchema`, map `fieldErrors`, hiện message 429). `admin-auth/utils/safe-next.util.ts` chỉ nhận path bắt đầu bằng `/admin` (không có open redirect).
- `app/admin/(cms)/layout.tsx`: server gọi `GET /auth/me` (`apiServer` option `withAuth`: chỉ forward cookie `access_token`, `cache: 'no-store'`); 401 → `redirect('/admin/login')`; ngược lại render `AdminShell` với DTO `me`.
- `core/services/api-client.service.ts`: với `/api/admin/*` và `/api/auth/me`, một lỗi 401 sẽ kích hoạt đúng một lần `POST /api/auth/refresh` (single-flight: các 401 song song dùng chung một promise refresh) và retry request đó một lần; nếu refresh fail → `window.location.assign('/admin/login?next=…')`. Export `refreshOnce()` cho SSE hook (T49). Lời gọi public không bao giờ refresh.
- `admin-core`: `AdminShell` (shadcn `sidebar`, 240px, thu gọn được thành rail 56px, `[` để toggle; group và item lấy từ §4.3 cộng Stats, Domains, Process (§5.11); sheet trên mobile), `Topbar` (breadcrumb, slot cho page action, user menu có tên, badge role và logout), `CommandPalette` của admin (nhảy tới admin route, "New project/post" chỉ cho `admin`), `RoleGate` (`<RoleGate allow={['admin']}>` chỉ render children cho các role đó), `stores/admin-ui.store.tsx` (`AdminUiProvider`, `useAdminUi`: sidebar thu gọn, palette mở), `services/auth.service.ts` (me, logout), `hooks/use-me.hook.ts` (`useMe()`, khởi tạo từ `me` của layout; `useIsAdmin()`).
- Quy tắc UI theo role cho mọi task admin về sau: control ghi (New, Save, Delete, Publish, reorder, upload, bulk bar) được bọc trong `RoleGate allow={['admin']}`; các item sidebar Inbox, Audit log và Users chỉ dành cho `admin`; `user` thấy phần còn lại ở chế độ chỉ đọc (bảng ở T36).
- `app/admin/(cms)/page.tsx` → placeholder `AdminDashboardIndex` (T38 làm đầy).

**File.** `apps/web/middleware.ts`, `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/login/page.tsx`, `apps/web/app/admin/(cms)/{layout.tsx,page.tsx}`, `apps/web/src/modules/admin-auth/{views/AdminAuthLogin.tsx,components/LoginForm/*,utils/safe-next.util.ts}`, `apps/web/src/modules/admin-core/components/{AdminShell,AdminSidebar,Topbar,CommandPalette,RoleGate}/*`, `apps/web/src/modules/admin-core/{stores/admin-ui.store.tsx,services/auth.service.ts,hooks/use-me.hook.ts}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{sidebar,breadcrumb,avatar}.tsx`.

**Thiết kế.** Figma `14:2` (shell). Mockup `admin-dashboard.html`. Token: `--sidebar*`, `text-ui-title`, `text-ui`, `text-ui-meta`, chiều cao control admin 32 (28 khi compact). Không có atmosphere, band hay orb trong admin (§7.2 `06`).

**Luồng token, giải thích.**
1. **Browser không bao giờ đụng tới token.** Login, refresh và logout trả lời bằng `Set-Cookie`; browser lưu cookie httpOnly và gửi chúng trên mọi lời gọi `/api/*`. Code web chỉ thấy DTO `me`.
2. **Server Component forward cookie.** Server Component chạy trên server Next, không phải trong browser, nên phải tự chuyển cookie đi: `apiServer(..., { withAuth: true })` chép `access_token` từ `cookies()` vào request gửi tới Nest.
3. **Refresh chỉ ở một chỗ.** Trong browser, `apiClient` thấy 401, refresh một lần rồi retry. Khi load cả trang sau lúc access token hết hạn, middleware đưa bạn tới page login, page này refresh ngầm rồi đưa bạn quay lại. Chỉ khi refresh token cũng mất hoặc bị thu hồi thì bạn mới thấy form.

**Tiêu chí nghiệm thu.**
- [ ] Khi chưa login, `/admin` redirect về login ngay trên server: `curl -I` hiện redirect, không có flash phía client (roadmap p20).
- [ ] Với access token đã hết hạn nhưng refresh token còn hợp lệ, mở `/admin/projects` sẽ quay lại đúng `/admin/projects` mà không hiện form; một admin request gửi sau lúc hết hạn vẫn thành công sau một lần refresh tự động.
- [ ] Login bằng `user`: không có item Inbox, Audit log hay Users, không có button New/Save/Delete/Publish; badge role ghi `user`.
- [ ] ⌘K điều hướng tới một admin route (roadmap p20); `[` toggle sidebar.
- [ ] Sai credential thì lỗi hiện dưới form; lần thử thứ 6 hiện message rate limit.
- [ ] Screenshot được so với `14:2` (chỉ phần shell).

**Tiêu đề PR:** `feat(web): admin shell`

#### T38 · Admin dashboard v1 + endpoint stats

**Roadmap** p20 · **Spec** [§5.7](./design/portfolio-design-system.vi.md#s-5-7), §5.11, §5.0 (dòng Admin dashboard) · **Phụ thuộc** T37 · **Cỡ** M

**Mục tiêu.** Một dashboard có các con số và check content health đến từ API, từng card một.

**Phạm vi.**
- API `modules/dashboard`: `GET /admin/stats?range=7d|30d|90d` (đếm nội dung theo status; field cho message và view được T47 và T54 thêm vào), `GET /admin/health` (cả hai đều `@Roles('admin', 'user')`; check content health: project không có domain, case study có ít hơn 2 key fact, marquee có ít hơn 6 skill, thiếu field tiếng Việt trên item đã publish, lỗi publish lint; thiếu alt text do T50 thêm vào).
- Web `admin-dashboard`: `AdminDashboardIndex`, `StatCard` (trong `packages/ui`: giá trị, text delta + mũi tên, không chỉ dựa vào màu), `ContentHealthCard` (mỗi issue link tới item), `toggle-group` chọn khoảng thời gian, lưu trong URL. Server prefetch + `HydrationBoundary`; mỗi card dùng `useSuspenseQuery` bên trong `SectionBoundary` riêng của nó (skeleton, empty và error theo từng card).

**File.** `apps/api/src/modules/dashboard/*`, `packages/contracts/src/dashboard/*`, `apps/web/app/admin/(cms)/page.tsx`, `apps/web/src/modules/admin-dashboard/{views/AdminDashboardIndex.tsx,components/{StatsCards,ContentHealthCard}/*,hooks/use-dashboard.hook.ts,services/dashboard.service.ts}`, `packages/ui/src/components/StatCard/*`.

**Thiết kế.** Figma `14:2`. Mockup `admin-dashboard.html` (các check content health v2). Token: `--card`, `--success`, `--warning`, `--destructive`, `text-ui`, `text-ui-meta`.

**Tiêu chí nghiệm thu.**
- [ ] Các con số trên dashboard khớp với API (roadmap p20).
- [ ] Content health liệt kê các check v2 trong mockup, mỗi check link tới item.
- [ ] Một card lỗi hiện error riêng của nó kèm Retry; các card khác vẫn render.

**Tiêu đề PR:** `feat(web): admin dashboard`

#### T39 · DataTable + list project của admin

**Roadmap** p21 · **Spec** [§5.8](./design/portfolio-design-system.vi.md#s-5-8), §4.3 (`DataTable`, `FilterBar`), §4.6 (list điều khiển bằng URL, optimistic update) · **Phụ thuộc** T37 · **Cỡ** L

**Mục tiêu.** Một table generic, thân thiện với bàn phím, do server điều khiển, dùng đầu tiên cho project.

**Phạm vi.**
- `packages/ui` `DataTable` (TanStack Table trên shadcn `table`; `manualPagination/Sorting/Filtering`; cột sort được, resize được, ẩn được; chọn row, kèm chọn theo dải bằng shift; thanh bulk action; header sticky; density compact 32 / mặc định 40; phím `j/k` di chuyển, `x` chọn, `Enter` mở, `e` sửa, `⌫` xóa có confirm (sửa, xóa và bulk bar chỉ cho `admin`, qua prop `canWrite`); các state: skeleton row, empty kèm action tạo mới, không có kết quả kèm clear filter, error kèm Retry; dạng card list dưới `md`) và `FilterBar` (chip, menu thêm filter).
- `admin-core/hooks/use-list-params.hook.ts` (URL ↔ `ListParams` qua zod), `admin-core/utils/optimistic.util.ts` (helper snapshot / restore cho `onMutate`/`onError`).
- `admin-projects`: `services/admin-projects.service.ts`, `hooks/use-admin-projects.hook.ts` (list bằng `useSuspenseQuery` và `keepPreviousData`, archive với optimistic removal và rollback, toggle status, reorder bằng move up/down), `views/AdminProjectsIndex.tsx`. Cột: title, domain (pill theo hue), status (`StatusPill`), số key fact, updated, row action. Prefetch detail khi hover/focus row sau 100ms.
- Route `app/admin/(cms)/projects/page.tsx` với server prefetch + `HydrationBoundary`.

**File.** `packages/ui/src/components/{DataTable,FilterBar}/*`, `packages/ui/src/components/ui/{table,checkbox,alert-dialog}.tsx`, `apps/web/src/modules/admin-core/{hooks/use-list-params.hook.ts,utils/optimistic.util.ts}`, `apps/web/src/modules/admin-projects/{services/admin-projects.service.ts,hooks/use-admin-projects.hook.ts,views/AdminProjectsIndex.tsx,components/ProjectsTable/*}`, `apps/web/app/admin/(cms)/projects/page.tsx`.

**Thiết kế.** Figma `15:2`. Mockup `admin-table.html` (cột Domain, số key fact, "1–5 of 5"). Token: `text-ui`, `text-ui-meta`, `--border`, `--muted`, `--hue-*`, `--sidebar-accent`.

**Tiêu chí nghiệm thu.**
- [ ] Sort, search và phân trang gửi request API mới và update URL (roadmap p21).
- [ ] Archive thất bại thì row được khôi phục (optimistic rollback), chứng minh bằng một test với mock 500 (roadmap p21).
- [ ] Phím tắt hoạt động và được liệt kê trong help dialog.
- [ ] Screenshot được so với `15:2`; table dùng được ở 360px.

**Tiêu đề PR:** `feat(web): admin data table`

#### T40 · List admin: post, experience

**Roadmap** p21 · **Spec** §5.8 · **Phụ thuộc** T30, T39 · **Cỡ** M

**Mục tiêu.** Table post và experience trên `DataTable` dùng chung.

**Phạm vi.**
- `admin-posts`: service, hook, `AdminPostsIndex` (cột: title, status, tag, số phút đọc, ngày publish, updated; filter status/tag; archive optimistic). Route `app/admin/(cms)/posts/page.tsx`.
- `admin-about`: table experience (`AdminAboutExperienceIndex`: company, role, ngày tháng, switch visible (optimistic), move up/down). Route `app/admin/(cms)/experience/page.tsx`.

**File.** `apps/web/src/modules/admin-posts/{services,hooks,views,components}/*`, `apps/web/src/modules/admin-about/{services/experience.service.ts,hooks/use-admin-experience.hook.ts,views/AdminAboutExperienceIndex.tsx}`, `apps/web/app/admin/(cms)/{posts,experience}/page.tsx`.

**Thiết kế.** Pattern Figma `15:2`; mockup `admin-table.html`.

**Tiêu chí nghiệm thu.**
- [ ] Cả hai list sort, filter và phân trang qua API, với state nằm trên URL.
- [ ] Toggle `isVisible` là optimistic và rollback khi lỗi.

**Tiêu đề PR:** `feat(web): posts and experience lists`

#### T41 · List admin: entity nhỏ + picker icon/hue

**Roadmap** p21 · **Spec** §5.11, §6 Day 13 v2 · **Phụ thuộc** T31, T32, T39 · **Cỡ** M

**Mục tiêu.** Table kèm editor dạng sheet cho các entity nhỏ, gồm cả picker icon và picker hue.

**Phạm vi.**
- `packages/ui`: `IconPicker` (popover + command trên allowlist icon, preview bằng `Icon`), `HuePicker` (toggle group 5 hue kèm preview bằng `Badge`).
- `admin-about`: education, principle, profile stat, process step. `admin-taxonomy`: skill (category, depth, switch marquee), skill category, tag, domain (hue + icon). Mỗi cái: `DataTable` + một `Sheet` chứa editor TanStack Form (zod schema từ contracts, hai field ngôn ngữ đặt cạnh nhau), reorder bằng move up/down, delete qua `alert-dialog`.
- Route dưới `app/admin/(cms)/` cho từng list (`education`, `principles`, `stats`, `process`, `skills`, `tags`, `domains`).

**File.** `packages/ui/src/components/{IconPicker,HuePicker}/*`, `apps/web/src/modules/admin-about/{components,hooks,services,views}/*`, `apps/web/src/modules/admin-taxonomy/{components,hooks,services,views}/*`, `apps/web/app/admin/(cms)/{education,principles,stats,process,skills,tags,domains}/page.tsx`, `packages/ui/src/components/ui/{sheet,select,switch}.tsx`.

**Thiết kế.** Các item sidebar trong mockup `admin-dashboard.html`; spec §5.11. Token: `--hue-*`, `text-ui`.

**Tiêu chí nghiệm thu.**
- [ ] Reorder domain làm đổi thứ tự trên home (ngay lập tức khi dev theo D23; sau revalidation lúc publish từ T52) (spec §6 Day 13 v2).
- [ ] Icon picker chỉ đưa ra icon trong allowlist; hue picker hiện pill của từng hue.

**Tiêu đề PR:** `feat(web): admin taxonomy lists`

#### T42 · Editor shell + Tiptap MarkdownEditor + autosave

**Roadmap** p22 · **Spec** [§5.9](./design/portfolio-design-system.vi.md#s-5-9), §4.3 (`MarkdownEditor`, `SaveStatus`, `LocaleTabs`, `PropertyList`), §4.6 (Autosave), D25 · **Phụ thuộc** T39 · **Cỡ** L

**Mục tiêu.** Khung editor dùng chung cho mọi editor của entity: một rich-text editor Tiptap đọc và ghi Markdown, một toolbar dựng từ các phần của shadcn, một preview giống hệt renderer public, locale tab, pane properties, autosave có phát hiện conflict, dirty guard, và chế độ read-only cho `user`.

**Phạm vi.**
- **Dependency** (`packages/ui`, mọi `@tiptap/*` được pin cùng một version chính xác và nâng cấp cùng lúc, vì peer dependency của chúng đòi hỏi vậy): `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` (`Placeholder`, `CharacterCount`), `@tiptap/extension-code-block-lowlight` + `lowlight` + `highlight.js` (BSD-3-Clause, miễn phí), `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/suggestion` + `@floating-ui/dom`. Tất cả là MIT trừ highlight.js. Không có gì từ `@tiptap-pro/*` hay registry riêng của Tiptap (D25).
- **`scripts/check-deps.mjs`** + root script `check:deps`, chạy trong CI: fail nếu `pnpm-lock.yaml` chứa `@tiptap-pro/` hoặc `@tiptap-cloud/`, nếu có `.npmrc` nào trỏ tới `registry.tiptap.dev`, hoặc nếu một package `@tiptap/*` đã cài có `license` khác `MIT`.
- **`MarkdownEditor` trong `packages/ui`** (`'use client'`). Prop: `value` (Markdown), `onChange(markdown)`, `onBlur`, `editable`, `variant` (`full` | `compact`), `labels` (chuỗi chrome, vì `packages/ui` không có i18n), `renderPreview(markdown)` (slot do web điền), `onUploadImage?` (nối ở T51).
  - `useEditor({ extensions: createMarkdownExtensions(), content: value, contentType: 'markdown', editable, immediatelyRender: false })`. `immediatelyRender: false` là bắt buộc khi Next.js render trên server, nếu không hydration sẽ fail.
  - `extensions/create-markdown-extensions.ts` là schema của editor, và nó theo đúng allowlist của T23: `StarterKit.configure({ heading: { levels: MARKDOWN_HEADING_LEVELS }, underline: false, codeBlock: false, link: { openOnClick: false, autolink: true, isAllowedUri: isAllowedMarkdownUrl } })`, `Markdown`, `CodeBlockLowlight` (một instance `lowlight` chỉ đăng ký `MARKDOWN_CODE_LANGUAGES`), `Image` (`isAllowedImageSrc`, attribute `alt`), các extension Table, `Placeholder`, `CharacterCount`, cộng ba extension tự viết bên dưới. Không đăng ký gì nằm ngoài allowlist, nên HTML được paste vào sẽ bị schema của ProseMirror rút gọn về các node được phép, và HTML lạ trong Markdown vẫn chỉ là text thường.
  - `extensions/heading-clamp.extension.ts`: mở rộng `Heading` để H1 trong Markdown khi load trở thành H2, khớp với renderer public.
  - `extensions/callout.extension.ts`: một block node `callout` (`kind`: `NOTE` | `WARNING`) có `markdownTokenizer` cho `> [!NOTE]` / `> [!WARNING]` và `renderMarkdown` ghi lại đúng cú pháp đó; render qua `ReactNodeViewRenderer` với giao diện giống `Callout` public.
  - `extensions/slash-command.extension.ts`: `@tiptap/suggestion` trên `/`, liệt kê Heading 2, Heading 3, bullet list, ordered list, quote, Note, Warning, code block, image, table và divider; menu là `command` của shadcn trong một panel nổi.
  - Code block: một header `ReactNodeViewRenderer` có `select` ngôn ngữ (`MARKDOWN_CODE_LANGUAGES` + "Plain text") và cùng giao diện filename/ngôn ngữ như `CodeBlock` public. Màu highlight lấy từ `packages/ui/src/styles/editor.css`, file này map các class `.hljs-*` sang các biến `--shiki-token-*` của T23, nên lúc viết và lúc đọc dùng chung một palette. Chế độ Preview hiện đúng output Shiki.
  - Paste text thường trông như Markdown thì chèn vào dưới dạng Markdown (`insertContent(text, { contentType: 'markdown' })`), qua một `handlePaste` nhỏ trong `extensions/markdown-paste.extension.ts` nếu `@tiptap/markdown` không có sẵn option cho việc này.
  - Các chế độ trên `tabs` của shadcn: **Write** (editor), **Split** (editor và preview cạnh nhau trên `resizable`, từ `xl` trở lên), **Preview** (`renderPreview`, debounce 500ms), **Markdown** (`<pre>` chỉ đọc của `getMarkdown()`: chính xác thứ sẽ được lưu). Word count từ `CharacterCount` ở footer.
  - `editable: false`: toolbar, slash menu và xử lý paste/drop tắt, placeholder ẩn, `aria-readonly="true"`, link mở khi click. `useEffect` gọi `editor.setEditable(editable)` khi prop đổi.
  - Story: rỗng, fixture kitchen-sink, read-only, compact, dark.
- **Toolbar** (`MarkdownEditor/components/EditorToolbar`): `role="toolbar"` với roving focus bằng phím mũi tên, sticky ở đầu editor; mọi icon button có `tooltip` hiện shortcut trong `kbd`; các nhóm cách nhau bằng `separator` dọc. `variant="compact"` (highlights của experience, bio) chỉ hiện bold, italic, link và list; schema vẫn giữ nguyên, nên không mất nội dung nào đã lưu.

| Control | Phần của shadcn | Markdown nó ghi ra | Shortcut |
| --- | --- | --- | --- |
| Undo, redo | `button` (`ghost`, `sm`) | n/a | `Mod-Z`, `Shift-Mod-Z` |
| Loại block: Paragraph, Heading 2, Heading 3 | `dropdown-menu` | `## `, `### ` | `Mod-Alt-0/2/3` |
| Bold, italic, strikethrough, inline code | `toggle-group` (`multiple`, `aria-pressed`) | `**…**`, `*…*`, `~~…~~`, `` `…` `` | `Mod-B`, `Mod-I`, `Mod-Shift-S`, `Mod-E` |
| Link | `popover` + `input` + `button` (Apply, Remove); URL được check bằng `isAllowedMarkdownUrl` | `[text](url)` | `Mod-K` |
| Bullet list, ordered list, quote | `toggle` | `- `, `1. `, `> ` | `Mod-Shift-8/7/B` |
| Callout: Note, Warning | `dropdown-menu` | `> [!NOTE]`, `> [!WARNING]` | `/note`, `/warning` |
| Code block | `button`; `select` ngôn ngữ trong header của block | fenced block có ngôn ngữ | `Mod-Alt-C` |
| Image | `button` → `popover` (URL + alt bắt buộc) cho tới T51, sau đó là `dialog` media picker | `![alt](url)` | `/image` |
| Table | `dropdown-menu` (chèn 3×3, thêm/xóa row hoặc column, xóa table) | table GFM | `/table` |
| Chế độ | `tabs` (Write, Split, Preview, Markdown) | n/a | n/a |

- **Web `admin-core/components/MarkdownField`**: nối một field của TanStack Form với `MarkdownEditor`. Nó load editor bằng `next/dynamic` (`ssr: false`, có skeleton trong lúc load), nên Tiptap chỉ nằm trong chunk của admin. Nó truyền `labels` từ `admin.editor.*` trong `en.json`, `renderPreview` (gọi `content/actions/preview.action.ts`) và `editable={!readOnly}`.
- **Tích hợp autosave** (`hooks/use-autosave.hook.ts`):
  - Mỗi lần Tiptap `update`, `getMarkdown()` chạy với debounce 250ms rồi gọi `field.handleChange(markdown)`. Listener của form sau đó debounce 1.5s và gửi `PATCH` kèm `updatedAt`. Blur, chuyển locale tab và rời trang thì flush cả hai debounce ngay.
  - **Không save khi mở.** `@tiptap/markdown` có thể chuẩn hóa Markdown viết tay (ví dụ bullet `*` thành `-`). Ngay sau khi load, `MarkdownField` lưu `baseline = editor.getMarkdown()`, và field chỉ bị coi là dirty khi Markdown hiện tại khác baseline đó, chứ không so với chuỗi gốc trong DB.
  - **Thay đổi từ bên ngoài** ("Load latest" sau conflict 409, khôi phục bản copy offline, chuyển locale) gọi `editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })`, nhưng chỉ khi `value` khác Markdown được emit lần cuối, nên con trỏ không bao giờ nhảy khi đang gõ.
  - 409 → `SaveStatus` "Conflict" với "Load latest" / "Overwrite"; offline → chuỗi Markdown được giữ trong `localStorage` theo entity và locale. Không chỗ nào giữ JSON của editor.
- **Chế độ read-only** (D7): `readOnly` của `EditorShell` bằng true khi `useIsAdmin()` là false. Khi đó mọi `MarkdownField` nhận `editable: false`, các field khác bị disable, autosave và dirty guard tắt, slot publish bị ẩn, và header hiện badge "Read only". Mọi editor trong T43–T45 truyền prop này xuống.
- **`packages/ui`**: thêm `SaveStatus` (`Saving…`, `Saved 12s ago`, `Offline, changes kept locally`, `Conflict: newer version` với Load latest / Overwrite), `LocaleTabs` (EN/VI có chấm hoàn thiện), `PropertyList`.
- **`content`**: tách pipeline của T23 thành `markdown-to-hast` (server) và `hast-to-react.util.ts` (dùng chung); `content/actions/preview.action.ts` (Server Action trả HAST đã sanitize cho pane preview, dùng cùng sanitize schema và Shiki theme với các page public).
- **`admin-core`**: `EditorShell` (header có title, `SaveStatus`, slot publish; editor; pane properties 320px trên `lg`; cột live preview trên `2xl`; properties nằm trong `sheet`/`drawer` trên mobile), `hooks/use-dirty-guard.hook.ts`, `utils/map-field-errors.util.ts` (`ApiError.fieldErrors` → lỗi field của form).
- **Test**:
  - Round-trip của `MarkdownEditor` với fixture kitchen-sink của T23: load → `getMarkdown()` → load → `getMarkdown()` cho ra cùng một chuỗi, và mọi cấu trúc đều còn nguyên.
  - Fixture unsafe đi qua editor: output không có `<script>`, `<iframe>`, `onerror`, `javascript:` hay image bên ngoài, và không có H1.
  - Output đó của editor đi qua pipeline public thì render đủ mọi element của kitchen-sink.
  - Markdown của callout và ngôn ngữ của code block round-trip đúng.
  - Mở một document không làm nó bị dirty.
  - State machine của autosave, việc map field error, và chế độ read-only (không gửi `PATCH` nào, `editor.isEditable` là false).

**File.** `packages/ui/package.json`, `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,MarkdownEditor.stories.tsx,MarkdownEditor.test.tsx,components/{EditorToolbar,SlashMenu,LinkPopover,CodeBlockView,CalloutView}/*,extensions/{create-markdown-extensions.ts,heading-clamp.extension.ts,callout.extension.ts,slash-command.extension.ts,markdown-paste.extension.ts}}`, `packages/ui/src/styles/{globals.css,editor.css}`, `packages/ui/src/components/{SaveStatus,LocaleTabs,PropertyList}/*`, `packages/ui/src/components/ui/{tabs,resizable,drawer,toggle,toggle-group,tooltip,kbd,dropdown-menu,popover,command,select,separator}.tsx`, `apps/web/src/modules/content/{services/markdown.service.ts,utils/hast-to-react.util.ts,actions/preview.action.ts}`, `apps/web/src/modules/admin-core/{components/EditorShell/*,components/MarkdownField/*,hooks/use-autosave.hook.ts,hooks/use-dirty-guard.hook.ts,utils/map-field-errors.util.ts}`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `package.json`, `.github/workflows/ci.yml` ([root STRUCTURE: packages/ui](../STRUCTURE.md#package-layout-packagesui)).

**Thiết kế.** Figma `18:2`. Mockup `admin-editor.html` (toolbar `B I H1 H2 🔗 </> 🖼 callout [Split]`, slash menu). Các button "H1 H2" của mockup map sang Heading 2 và Heading 3, vì title của page là H1 duy nhất. Token:
- toolbar: nền `--card`, border dưới `--border`, control 28px (`sm`), `text-ui`, toggle đang bật `--accent` / `--accent-foreground`, focus `--ring`;
- menu và popover: `--popover`, `--shadow-2`, `--z-dropdown`, `--radius-md`;
- vùng viết: `Prose` (`text-prose`, `--measure`), để độ dài dòng khớp với page public; placeholder `--muted-foreground`; selection `--primary-subtle`;
- code block: `--muted`, `--font-mono`, `--shiki-token-*`; callout: `--info-subtle` (Note) và `--warning-subtle` (Warning);
- word count: `text-ui-meta`; trạng thái save: `--success`, `--warning`.

**Tiêu chí nghiệm thu.**
- [ ] Gõ `## `, `- ` hoặc một code fence thì thành block tương ứng, và tab Markdown hiện đúng Markdown đó; giá trị lưu trong DB là Markdown, không bao giờ là HTML hay JSON (D3).
- [ ] Fixture kitchen-sink round-trip không đổi, và fixture unsafe mất hết mọi thứ không được phép (test).
- [ ] Mở một item không bao giờ gây ra `PATCH`; autosave chạy 1.5s sau khi ngừng gõ và hiện `Saved …`; một lần save cũ hiện `Conflict` với cả hai action (có test).
- [ ] Rời trang khi còn thay đổi chưa save thì hỏi xác nhận.
- [ ] Login bằng `user`, editor mở ở chế độ chỉ đọc (`editable: false`, không có toolbar) và không gửi thao tác ghi nào.
- [ ] Output của preview dùng cùng pipeline đã sanitize và cùng Shiki theme với site public (fixture dùng chung).
- [ ] `pnpm check:deps` pass, và fail khi thêm một package `@tiptap-pro/` trên một branch thử.
- [ ] `next build` cho thấy First Load JS của các route public không tăng (Tiptap chỉ nằm trong chunk `/admin`).
- [ ] Kiểm tra toolbar bằng bàn phím: Tab tới toolbar đúng một lần, phím mũi tên di chuyển giữa các control, mọi control có accessible name và hiện shortcut.

**Tiêu đề PR:** `feat(web): editor shell + markdown editor`

#### T43 · Editor project

**Roadmap** p22 · **Spec** §5.9, §5.11 ("Card & facts"), §4.6 (field array của TanStack Form) · **Phụ thuộc** T42 · **Cỡ** L

**Mục tiêu.** Tạo và sửa project với mọi field của case study, metric, và một preview `CaseCard` live.

**Phạm vi.**
- Route `app/admin/(cms)/projects/new/page.tsx` và `projects/[id]/page.tsx` → `admin-projects/views/AdminProjectsEditor.tsx`.
- Tab: Content (title, tagline, sáu field markdown của case study cho mỗi locale, mỗi field là một `MarkdownField` (T42); chỉ mount editor của locale đang mở; Scope và Trade-offs hiện gợi ý "Use `###` headings to split into columns/cards", vì `split-sections.util.ts` của T23 tách theo H3), Card & facts (select domain, textarea key fact có bộ đếm 2–4 dòng, input fact chip tối đa 6, preview `CaseCard` live), Metrics (field array: label, before, after, value; reorder), SEO.
- Pane properties: status, slug, ngày tháng, featured, confidential, link tới experience, multi-combobox skill, version from/to, URL live/repo. Picker cover có ở T51; button publish ở T52.
- Autosave qua `use-autosave`; create xong thì redirect sang route edit.
- Read-only cho `user`: `AdminProjectsEditor` truyền `readOnly` cho `EditorShell`, mọi `MarkdownField` nhận `editable: false`, và field array của metric ẩn thêm, xóa và reorder.

**File.** `apps/web/app/admin/(cms)/projects/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-projects/{views/AdminProjectsEditor.tsx,components/{ProjectContentTab,ProjectCardFactsTab,ProjectMetricsTab,ProjectSeoTab,ProjectProperties}/*,hooks/use-admin-project.hook.ts}`, `packages/ui/src/components/ui/{calendar,popover,command}.tsx`.

**Thiết kế.** Figma `18:2` (đang mở tab Card & facts). Mockup `admin-editor.html`.

**Tiêu chí nghiệm thu.**
- [ ] Submit với title EN trống trả 400 và lỗi hiện trên input đó (roadmap p22).
- [ ] Chỉnh sửa hiện trên page public sau khi save (roadmap p22; sau T52 thì chỉ khi publish).
- [ ] Sửa trong hai tab thì tab thứ hai vào state Conflict.
- [ ] Login bằng `user`, cả sáu editor của case study đều chỉ đọc và page không gửi `PATCH` nào.
- [ ] Screenshot được so với `18:2`.

**Tiêu đề PR:** `feat(web): admin editors`

#### T44 · Editor post + experience

**Roadmap** p22 · **Spec** §5.9, §5.11 (takeaways) · **Phụ thuộc** T42 · **Cỡ** M

**Mục tiêu.** Editor cho post và experience trên shell dùng chung.

**Phạm vi.**
- Editor post (`AdminPostsEditor`): title, excerpt, body (`MarkdownField`, toolbar `full`) cho mỗi locale, textarea takeaways (≤ 5 dòng), multi-combobox tag có tạo mới, featured, field SEO; cảnh báo publish lint hiện inline, dùng `publishLint` từ contracts. Route `posts/new`, `posts/[id]`.
- Editor experience (`AdminAboutExperienceEditor`): company, URL, location, employment type, role, summary, highlights (`MarkdownField`, toolbar `compact`), ngày tháng chính xác tới tháng (`calendar`), skill. Route `experience/new`, `experience/[id]`.
- Cả hai editor truyền `readOnly` cho `EditorShell`, nên `user` nhận editor `editable: false`, input bị disable và không tạo được tag.

**File.** `apps/web/app/admin/(cms)/posts/{new,[id]}/page.tsx`, `apps/web/app/admin/(cms)/experience/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-posts/{views/AdminPostsEditor.tsx,components/*,hooks/use-admin-post.hook.ts}`, `apps/web/src/modules/admin-about/{views/AdminAboutExperienceEditor.tsx,components/ExperienceForm/*}`.

**Thiết kế.** Mockup `admin-editor.html` (cùng shell).

**Tiêu chí nghiệm thu.**
- [ ] Body có chứa `TODO` hiện cảnh báo publish lint trước khi save.
- [ ] Tạo tag từ combobox thì tag được thêm vào post.
- [ ] Login bằng `user`, cả hai editor đều chỉ đọc và không gửi thao tác ghi nào.

**Tiêu đề PR:** `feat(web): post and experience editors`

#### T45 · Admin cho site settings + profile

**Roadmap** p22 · **Spec** [§5.10](./design/portfolio-design-system.vi.md#s-5-10), §1.5 (`Profile`, `SiteSettings`) · **Phụ thuộc** T33, T42 · **Cỡ** L

**Mục tiêu.** Sửa site settings, navigation, social link, contact topic và profile ngay từ admin. Section của page giờ là block, sửa trong page builder (T45b).

**Phạm vi.**
- `app/admin/(cms)/site/page.tsx` → `admin-site/views/AdminSiteIndex.tsx` với các tab đồng bộ theo URL: Settings (form: SEO mặc định, footer note, contact intro, thời gian reply, contact email, availability, analytics, ambient effect, marquee), Navigation (table, label sửa inline được, picker `href` từ `routes.constant.ts` hoặc URL, move up/down), Social links (có `showInHeader`, `showInCta`), Contact topics.
- `app/admin/(cms)/profile/page.tsx` → `AdminSiteProfile`: headline + accent (preview `AccentHeadline` live, validate theo từng locale), hero kicker, subheadline, bio (`MarkdownField`, toolbar `compact`), ngày bắt đầu sự nghiệp, ngôn ngữ, thành phố, timezone, phone private. Picker avatar và resume có ở T51.

**File.** `apps/web/app/admin/(cms)/{site,profile}/page.tsx`, `apps/web/src/modules/admin-site/{views/{AdminSiteIndex,AdminSiteProfile}.tsx,components/{SettingsForm,NavTable,SocialTable,TopicsTable,ProfileForm}/*,hooks/*,services/*}`.

**Thiết kế.** Wireframe spec §5.10. Token: `text-ui`, kích thước control admin.

**Tiêu chí nghiệm thu.**
- [ ] Đổi tên một nav item trong admin thì header public thay đổi (dev: ngay lập tức; production: sau revalidation của T52).
- [ ] Accent không nằm trong headline hiện field error cho đúng locale đó.
- [ ] Reorder nav và social dùng endpoint order có transaction.

**Tiêu đề PR:** `feat(web): site and profile admin`

#### T45a · Form props sinh từ schema (zod → TanStack Form)

**Roadmap** p22 · **Spec** §4.6 (TanStack Form + zod), D26 · **Phụ thuộc** T41, T42 · **Cỡ** M

**Mục tiêu.** Một component vẽ ra form sửa được từ một zod schema, để một block type mới không cần viết tay form admin nào.

**Phạm vi.**
- `admin-core/utils/schema-to-fields.util.ts`: `z.toJSONSchema(schema, { io: 'input' })` → một cây field (`path`, `kind`, `required`, `min`/`max`, `enum`, `default`, `widget`, `label`). Nó đọc các key `.meta()` từ T10a và hỗ trợ object, string, number và integer, boolean, enum, array gồm object hoặc giá trị đơn, giá trị optional và default. Một shape nó không biết sẽ throw khi development và trong test, để một schema mới không thể âm thầm làm mất một field.
- `admin-core/components/SchemaForm/SchemaForm.tsx`: `useForm({ defaultValues, validators: { onChange: schema } })` (TanStack Form nhận thẳng zod 4 qua Standard Schema), một `form.Field` cho mỗi lá, `fieldErrors` từ server được map bằng `map-field-errors.util.ts` của T42, và `readOnly` disable mọi widget.
- Widget trong `SchemaForm/widgets/`, chọn theo `widget`, nếu không có thì theo type:
  - `text`, `textarea`, `number`, `switch`, `select` (enum);
  - `localized-text` và `localized-textarea`: input EN và VI cạnh nhau, giống mọi editor trong admin, có một chấm khi VI trống;
  - `markdown`: `MarkdownField` với toolbar `compact` (T42);
  - `icon` (`IconPicker`, T41), `hue` (`HuePicker`), `route` (từ `routes.constant.ts`);
  - `project`, `projects` (multi-combobox có search, giữ nguyên thứ tự, cho list `manual`), `stats`, `tag`.
  - Array có các nút thêm, xóa, và move up/down.
- Label và help text lấy từ `admin.blocks.*` trong `en.json` qua key `label`. Một unit test đi qua `BLOCK_REGISTRY` và fail khi thiếu key.
- Autosave: `SchemaForm` expose `onValuesChange` cho `use-autosave` (T42), nên builder lưu một block 1.5s sau khi ngừng gõ.
- Test: mọi type trong `BLOCK_REGISTRY` render được form mà không có field lạ; một giá trị sai hiện message của zod; `fieldErrors` từ server nằm dưới đúng input; `readOnly` không render input nào còn enable.

**Ngoài phạm vi.** Màn hình page builder (T45b). Drag and drop trong array (`SortableList`, T45b).

**File.** `apps/web/src/modules/admin-core/{utils/schema-to-fields.util.ts,utils/schema-to-fields.util.test.ts,components/SchemaForm/{SchemaForm.tsx,SchemaForm.test.tsx,widgets/*}}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{switch,select,command,popover}.tsx`.

**Thiết kế.** Properties pane của Figma `18:2` (dáng field, control 32px). Token: `text-ui`, `text-ui-meta`, `--input`, `--ring`, `--destructive`.

**Tiêu chí nghiệm thu.**
- [ ] Browser và API validate bằng cùng một zod schema: các fixture dùng chung mà form chấp nhận thì T32a cũng chấp nhận, và những cái form từ chối thì API trả đúng các field error đó (roadmap p22).
- [ ] Mọi type trong `BLOCK_REGISTRY` render form với đủ field và label (test).
- [ ] Một lỗi server trên `props.primaryCta.label.en` hiện dưới input label tiếng Anh.
- [ ] Với `readOnly`, không input nào enable.

**Tiêu đề PR:** `feat(web): schema-driven props form`

#### T45b · Page builder: block, drag and drop, layout

**Roadmap** p22 · **Spec** §4.3, §4.6 (optimistic reorder), §5.10, D26 · **Phụ thuộc** T33, T45a · **Cỡ** L

**Mục tiêu.** Trong `/admin/pages`, một `admin` sắp xếp từng page public: kéo block vào đúng thứ tự, thêm, nhân bản, ẩn và xóa block, chọn layout preset, và sửa props trong form được generate. Một `user` thấy cùng màn hình đó ở chế độ read-only.

**Phạm vi.**
- Dependency (`packages/ui`): `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`, đều MIT và miễn phí. Dùng dòng stable (`core` 6.x, `sortable` 10.x), không dùng `@dnd-kit/react` còn dưới 1.0. `check:deps` (T42) cũng fail nếu có package `@dnd-kit/*` nào không phải MIT.
- `SortableList` trong `packages/ui` (`'use client'`):
  - một list dọc trên `DndContext` + `SortableContext`, với `PointerSensor` (khoảng cách kích hoạt nhỏ, để click vẫn hoạt động) và `KeyboardSensor` với `sortableKeyboardCoordinates`;
  - một button drag handle có accessible name, `restrictToVerticalAxis`, và một `DragOverlay`;
  - `announcements` và `screenReaderInstructions` cho screen reader được truyền vào dưới dạng label, và `onReorder(ids)`;
  - item `disabled` (block H1) không di chuyển được, và không gì thả được lên trên nó.
  - Story có hướng dẫn dùng bàn phím.
- Route `app/admin/(cms)/pages/page.tsx` → `admin-pages/views/AdminPagesIndex.tsx` (năm page, số block, thời gian update) và `app/admin/(cms)/pages/[key]/page.tsx` → `AdminPagesEditor.tsx`. Một item "Pages" được thêm vào nhóm Site của sidebar.
- `AdminPagesEditor` trên `EditorShell` (T42), với list block ở cột chính và inspector ở properties pane:
  - `BlockList` (`SortableList`). Mỗi `BlockRow` hiện drag handle, icon và label của type, `key`, một badge layout, một `switch` visible (optimistic), và một row menu: Move up, Move down, Duplicate, và Delete với `alert-dialog`. Move up/down là cách thay cho kéo thả dành cho người dùng bàn phím và một-con-trỏ (WCAG 2.5.7). Một block không hợp lệ hoặc không biết type hiện thành một row `alert` kèm issues của nó và chỉ có Delete.
  - Reorder gọi `PATCH /admin/pages/:key/blocks/order` với optimistic update và rollback (`optimistic.util.ts` của T39). Reorder fail thì list được khôi phục và hiện một toast.
  - `AddBlockDialog`: một list `command` gồm các type được phép trên page này, mỗi cái có icon và một dòng mô tả. Type đã chạm `maxPerPage` bị disable, kèm lý do. Block mới được đặt sau block đang chọn.
  - Các tab của `BlockInspector`:
    - Props: `SchemaForm` cho type, autosave theo từng block kèm `updatedAt` của nó, cộng `SaveStatus` và các action Conflict của T42 khi gặp 409;
    - Layout: `LayoutPresetPicker`, một `toggle-group` gồm các preset của type với thumbnail cột nhỏ, và luật responsive bên dưới bằng `text-ui-meta`;
    - Appearance: `surface` plain hoặc band, kèm ghi chú rằng các band chạm nhau sẽ gộp lại;
    - Anchor: `key`, kèm URL public `/#key` của nó.
  - `PageSettingsSheet`: SEO title và description theo từng locale.
  - Header: một status "Draft" và một link "Open page" (dev hiện thay đổi ngay, D23). Publish, history và live preview có ở T52a.
- `admin-pages/constants/block-editor-meta.constant.ts`: `type` → `{ icon, labelKey, descriptionKey }`, `satisfies Record<BlockType, …>` (quy tắc 8).
- `services/admin-pages.service.ts`.
- `hooks/use-admin-page.hook.ts`: `useSuspenseQuery(qk.admin.pages.detail(key))`.
- `hooks/use-block-mutations.hook.ts`: add, update, duplicate, delete, reorder và toggle, mỗi cái patch hoặc invalidate query của page.
- Read-only (D7): không drag handle, không add, không item ghi nào trong row menu, và inspector ở `readOnly`. "Open page" vẫn hoạt động.
- Tab Sections của spec §5.10 giờ nằm ở đây; T45 không còn tab đó.

**Ngoài phạm vi.** Publish, version, live preview (T52a). Đặt block tự do trên grid và block nằm cạnh nhau (Q13).

**File.** `packages/ui/package.json`, `packages/ui/src/components/SortableList/{SortableList.tsx,SortableList.stories.tsx,SortableList.test.tsx}`, `apps/web/app/admin/(cms)/pages/{page.tsx,[key]/page.tsx}`, `apps/web/src/modules/admin-pages/{views/{AdminPagesIndex,AdminPagesEditor}.tsx,components/{BlockList,BlockRow,AddBlockDialog,BlockInspector,LayoutPresetPicker,PageSettingsSheet}/*,constants/block-editor-meta.constant.ts,hooks/{use-admin-page.hook.ts,use-block-mutations.hook.ts},services/admin-pages.service.ts}`, `apps/web/src/modules/admin-core/components/AdminSidebar/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `packages/ui/src/components/ui/{alert-dialog,toggle-group,sheet,tabs}.tsx` ([STRUCTURE của web: module](../apps/web/STRUCTURE.md#modules)).

**Thiết kế.** Chưa có Figma frame cho màn hình này. Dựng nó từ editor shell (`18:2`: list block nằm ở chỗ body của editor, inspector ở properties pane) và các row table của `15:2`, rồi đính kèm screenshot vào PR để Parker review. Token: `--card`, `--border`, `--sidebar-accent` (block đang chọn), `--muted` (drag overlay), `--shadow-2`, `--destructive-subtle` và `--destructive` (row không hợp lệ), `--ring`, `text-ui`, `text-ui-meta`, chiều cao control của admin.

**Tiêu chí nghiệm thu.**
- [ ] Kéo block `work` lên trên `featured`, bằng chuột và bằng bàn phím (Space, phím mũi tên, Space), lưu thứ tự mới trong một transaction; block H1 không thể bị di chuyển hay bị thả lên trên (roadmap p22 "block editor list").
- [ ] Ép reorder trả 500 thì thứ tự cũ được khôi phục (test optimistic rollback).
- [ ] Thêm một `case-grid`, chuyển nó sang `TWO` và lưu props của nó thì nó hiện trên home public ở dev (D23), với hai cột từ 768px.
- [ ] Một type đã chạm giới hạn bị disable trong add dialog, và API vẫn từ chối nó (T32a).
- [ ] Mọi action đều có cách làm không cần kéo (row menu), và screen reader đọc được các thông báo nhấc lên, di chuyển và thả.
- [ ] Đăng nhập bằng `user` thì builder ở chế độ read-only và không gửi thao tác ghi nào.
- [ ] `pnpm check:deps` pass với các package dnd-kit.

**Tiêu đề PR:** `feat(web): page builder`

#### T46 · Admin user (chỉ admin) + tự đổi password

**Roadmap** p22 (hoàn thiện M4) · **Spec** §4.3 (Users; "chỉ owner" thành chỉ admin theo D7), §1.5 (`User`) · **Phụ thuộc** T37 · **Cỡ** M

**Mục tiêu.** Một `admin` thêm được tài khoản, đặt role cho nó (`admin` hoặc `user`), khóa tài khoản và sign out tài khoản đó khỏi mọi nơi. Mọi tài khoản đã login đều tự đổi được password của mình.

**Phạm vi.**
- API `modules/users/admin-users.controller.ts`, `@Roles('admin')` trên class (ghi tường minh, dù đây cũng là mặc định):
  - `GET /admin/users` (list theo page: name, email, role, `isActive`, `lastLoginAt`), `POST /admin/users` (email, name, role, password ban đầu ít nhất 12 ký tự), `PATCH /admin/users/:id` (name, role, `isActive`).
  - `POST /admin/users/:id/sign-out-everywhere` (tăng `tokenVersion`; 204) và `POST /admin/users/:id/password` (admin đặt password mới; cũng tăng `tokenVersion`).
  - Đổi `role` hoặc `isActive` cũng tăng `tokenVersion`, để role cũ không refresh được nữa.
  - Rào chắn: admin không tự hạ role hay tự khóa chính mình được, và admin active cuối cùng không bị hạ role hay bị khóa được (409 `LAST_ADMIN`, check trong cùng transaction với lệnh update).
- API `PATCH /auth/password` (`@Roles('admin', 'user')`, `changePasswordSchema`: `currentPassword`, `newPassword` ít nhất 12 ký tự): verify password hiện tại, lưu hash argon2id mới, tăng `tokenVersion`, rồi set cặp cookie mới cho browser này để nó vẫn còn login.
- Contracts `users/`: admin user DTO (không bao giờ có `passwordHash` hay `tokenVersion`), `createUserSchema`, `updateUserSchema`, `setPasswordSchema`; `auth/auth.schema.ts` thêm `changePasswordSchema`.
- Web `admin-users`: `AdminUsersIndex` (`DataTable`: name, email, pill role, switch active, lần login cuối; menu của row có "Sign out everywhere" và "Set password" sau một `alert-dialog`) và `UserForm` trong một `sheet`. Route `app/admin/(cms)/users/page.tsx`; item sidebar được bọc trong `RoleGate allow={['admin']}`.
- Web `admin-auth/components/ChangePasswordDialog`, mở từ user menu trên topbar, cho cả hai role.

**File.** `apps/api/src/modules/users/{admin-users.controller.ts,users.service.ts,users.service.spec.ts,dto/*}`, `apps/api/src/modules/auth/{auth.controller.ts,auth.service.ts}`, `packages/contracts/src/users/*`, `packages/contracts/src/auth/auth.schema.ts`, `apps/api/test/users.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/admin/(cms)/users/page.tsx`, `apps/web/src/modules/admin-users/{views/AdminUsersIndex.tsx,components/{UsersTable,UserForm}/*,hooks/use-admin-users.hook.ts,services/admin-users.service.ts}`, `apps/web/src/modules/admin-auth/components/ChangePasswordDialog/*`, `apps/web/src/modules/admin-core/components/{AdminSidebar,Topbar}/*`.

**Thiết kế.** Pattern table admin (`15:2`).

**Các bước backend, giải thích.**
1. **Role trên class.** `@Roles('admin')` đặt trên class controller bảo vệ mọi route trong đó; `RolesGuard` từ T36 làm việc check. Ghi ra dù chỉ-admin đã là mặc định, để người đọc sau biết module này nhạy cảm.
2. **Hash khi create.** Password ban đầu đi qua cùng bước hash argon2id như login (T35); API không bao giờ trả nó về hay log nó.
3. **Sign out everywhere, không cần session.** Không có row session nào để xóa (D24). Tăng `tokenVersion` khiến mọi refresh token ký với số cũ fail ở lần refresh kế tiếp, nên user đó bị đẩy ra trong vòng một vòng đời access token (15 phút). Cần nhanh hơn? Giảm `JWT_ACCESS_TTL_SECONDS`.
4. **Rào chắn trong transaction.** "Đây có phải admin active cuối cùng không?" và lệnh update chạy trong cùng một `prisma.$transaction`, nên hai admin hạ role nhau cùng một lúc cũng không làm site mất hết admin.
5. **Tự đổi password.** Hỏi password hiện tại trước nghĩa là ai đó ngồi vào laptop đang mở cũng không khóa bạn ra ngoài được. Tăng `tokenVersion` sign out các thiết bị khác; cấp lại cookie giữ cho thiết bị này vẫn login.

**Tiêu chí nghiệm thu.**
- [ ] `user` gọi bất kỳ route `/admin/users` nào thì nhận 403, và không thấy item Users.
- [ ] Sau "Sign out everywhere", lần `POST /auth/refresh` tiếp theo của user đó trả 401 (e2e).
- [ ] Tự hạ role hay tự khóa mình, hoặc hạ role/khóa admin active cuối cùng, trả 409.
- [ ] Sau khi tự đổi password, password cũ login fail, refresh ở browser khác trả 401, và browser hiện tại vẫn còn login.
- [ ] Không response nào của users API chứa `passwordHash`, `tokenVersion` hay token.

**Tiêu đề PR:** `feat: users admin`

### M5 — Realtime, media, publish

#### T47 · API contact + inbox

**Roadmap** p23 · **Spec** §1.5 (`ContactMessage`), §1.6 (Rate limit), §5.6 · **Phụ thuộc** T36 · **Cỡ** M

**Mục tiêu.** Một public endpoint lưu contact message an toàn, và các admin endpoint để đọc và phân loại chúng.

**Phạm vi.**
- Model `ContactMessage` (`name`, `email`, `topicId?`, `message` Text, `locale`, `status` `NEW|READ|REPLIED|SPAM`, `ipHash`). Migration `add-contact`.
- Contracts `contact/`: `contactSchema` (dùng chung với form bên web: name, email, topic, giới hạn độ dài message, field honeypot `website`), admin DTO, list params (`status`).
- `public-contact.controller.ts`: `POST /public/contact` (`@Public()`, throttle 3 lần mỗi 10 phút cho mỗi IP). Honeypot bị điền thì vẫn trả 201 và lưu row dưới dạng `SPAM`. `ipHash` lấy từ `common/utils/ip-hash.util.ts` (SHA-256 của IP + salt theo ngày).
- `admin-contact.controller.ts`: `GET /admin/messages`, `GET /admin/messages/:id`, `PATCH /admin/messages/:id` (status), `GET /admin/messages/unread-count`. Tất cả chỉ cho admin (không có `@Roles()`, D7): message chứa email của khách, nên `user` nhận 403. Số chưa đọc trên dashboard (chỉ là một con số) vẫn đọc được bởi cả hai role.
- Phát một event trong process `contact.created` (`@nestjs/event-emitter`); T49 stream event này. Stats của dashboard có thêm số message chưa đọc.
- Log không bao giờ chứa email hay nội dung message.

**File.** `apps/api/prisma/schema.prisma` + migration `add-contact`, `apps/api/src/modules/contact/{contact.module.ts,public-contact.controller.ts,admin-contact.controller.ts,contact.service.ts,dto/*,entities/*}`, `apps/api/src/common/utils/ip-hash.util.ts` (+ spec), `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/contact/*`, `apps/api/test/contact.e2e-spec.ts`, `apps/api/api.http`.

**Thiết kế.** Spec §5.6 (các field).

**Các bước backend, giải thích.**
1. **Ghi từ public = input không tin được.** Validate bằng schema dùng chung, giới hạn độ dài, rate limit theo IP, và không bao giờ trả lại nội dung trong public response.
2. **Honeypot.** Một field ẩn mà người thật không bao giờ điền. Bot thì điền hết; vẫn trả 201 nên bot không biết mình đã bị bắt.
3. **Hash IP.** Rate limit và kiểm tra spam cần so sánh IP, không cần lưu IP. Salt đổi mỗi ngày nên không thể nối các hash qua nhiều ngày với nhau.
4. **Event.** Service thông báo "có message mới" mà không cần biết ai đang nghe. T49 thêm listener đẩy event đó tới admin.

**Tiêu chí nghiệm thu.**
- [ ] Message hợp lệ trả 201; input không hợp lệ trả 400 kèm `fieldErrors`; message thứ 4 trong cùng khung thời gian trả 429.
- [ ] Message dính honeypot được lưu là `SPAM` và không có trong list inbox mặc định.

**Tiêu đề PR:** `feat(api): contact + inbox endpoints`

#### T48 · Trang contact + Server Action

**Roadmap** p23 · **Spec** [§5.6](./design/portfolio-design-system.vi.md#s-5-6), §4.2 (`ContactForm`), §4.6 (dòng Contact form), §6 Day 20 · **Phụ thuộc** T14, T47 · **Cỡ** M

**Mục tiêu.** Trang contact với một form chạy được cả khi có và không có JavaScript.

**Phạm vi.**
- Route `app/[locale]/(site)/contact/page.tsx` → `contact/views/ContactIndex.tsx`. `ContactIndex` render `BlocksPage` cho `contact`. Block type mới `contact-form` (quy tắc 8; H1; layout `TWO` hoặc `ONE`) vẽ layout chia đôi trên nền grid mờ: bên trái là eyebrow, H1 và intro của block, `contactIntro`, `replyTimeNote`, các card kênh liên hệ (email với `CopyEmailButton`, địa chỉ chỉ hiện qua `mailto:`; GitHub; LinkedIn, lấy từ `socialLinks`); bên phải là `ContactForm` trên `--card-glass`.
- `ContactForm` (client): TanStack Form + `field`, validators = `contactSchema`; các field name, email, topic (`select`, ẩn khi không có topic nào), message, honeypot ẩn; validate khi blur, khi submit thì hiện error summary và summary đó nhận focus; submit thành công thì form được thay bằng một status panel; lỗi submit hiện một `alert` phía trên form và giữ nguyên các input.
- `contact/actions/contact.action.ts` (`'use server'`): validate bằng `contactSchema`, gọi `POST /public/contact` với `Origin: WEB_ORIGIN` và `x-forwarded-for` lấy từ request đến (để throttle thấy IP của visitor), trả `{ ok }` hoặc `{ fieldErrors }`. `<form action>` dùng trực tiếp action này (không JS, `useActionState`); khi có JS, một `useMutation` gọi cùng action đó.

**File.** `apps/web/app/[locale]/(site)/contact/page.tsx`, `apps/web/src/modules/contact/{views/ContactIndex.tsx,components/{ChannelCards,ContactForm}/*,actions/contact.action.ts,services/contact-topics.service.ts}`, `apps/web/src/modules/blocks/components/ContactFormBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/contact-form.block.ts,block-registry.constant.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `packages/ui/src/components/ui/{select,textarea}.tsx`.

**Thiết kế.** Figma `12:2`. Mockup `contact.html` (một field ở error state). Token: `--card-glass`, `--grid-line`, `--destructive`, `text-title`, `text-body`.

**Tiêu chí nghiệm thu.**
- [ ] Khi tắt JavaScript, form vẫn submit được và hiện kết quả (spec §6 Day 20).
- [ ] Lỗi field hiện dưới đúng input và trong summary; screen reader đọc được các lỗi đó.
- [ ] Không có địa chỉ email nào xuất hiện trong HTML, ngoại trừ trong link `mailto:` và handler copy.
- [ ] Screenshot đã so với `12:2`.

**Tiêu đề PR:** `feat(web): contact page`

#### T49 · SSE event + UI inbox + NotificationBell

**Roadmap** p23 · **Spec** §1.6 (Realtime), §4.3 (`NotificationBell`), §4.6 (dòng Realtime), §6 Day 17 · **Phụ thuộc** T39, T47 · **Cỡ** M

**Mục tiêu.** Contact message mới hiện trong admin chỉ sau vài giây, kèm toast và badge chưa đọc, và stream tự phục hồi sau khi restart.

**Phạm vi.**
- API `modules/events`: `events.controller.ts` (`GET /admin/events`, `@Sse()`, chỉ admin vì event có chứa tên người gửi), `events.service.ts` (một `Subject` nhận event từ `contact.created` và, từ T52, `content.published`); comment heartbeat mỗi 25s; header `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
- Web `admin-core/hooks/use-admin-events.hook.ts`: một `EventSource('/api/admin/events')` duy nhất trong admin layout; khi có `contact.created` → `setQueryData(qk.admin.inbox.unread, n => n + 1)`, invalidate list message, toast `sonner` "New message from {name}" với nút Open; đóng khi unmount; browser tự reconnect. Chỉ mount cho `admin`. Khi có `error`, nếu stream không mở lại trong 5s (access token hết hạn làm lần reconnect fail với 401, mà `EventSource` không đọc được status), gọi `refreshOnce()` từ `api-client.service.ts` rồi mở một `EventSource` mới; sau 3 lần refresh fail thì dừng và đưa user về login.
- `admin-core/components/NotificationBell` (ở topbar, badge chưa đọc, `aria-live="polite"`, không bao giờ cướp focus).
- `admin-inbox`: `AdminInboxIndex` (`DataTable`: filter theo status, mark read kiểu optimistic, mark spam) và `AdminInboxDetail`. Route `app/admin/(cms)/inbox/page.tsx`, `inbox/[id]/page.tsx`. Dashboard có thêm một card inbox (5 message mới nhất).
- Kiểm tra rằng rewrite của Next không buffer stream; ghi kết quả vào PR.

**File.** `apps/api/src/modules/events/*`, `apps/web/src/modules/admin-core/{hooks/use-admin-events.hook.ts,components/NotificationBell/*}`, `apps/web/src/modules/admin-inbox/*`, `apps/web/app/admin/(cms)/inbox/{page.tsx,[id]/page.tsx}`, `apps/web/src/modules/admin-dashboard/components/InboxCard/*`.

**Thiết kế.** Figma `14:2` (bell, card inbox). Mockup `admin-dashboard.html`.

**Các bước backend, giải thích.**
1. **Server-Sent Events.** Một HTTP response dài mà server cứ tiếp tục ghi thêm những dòng `data:` nhỏ vào. `EventSource` của browser đọc các dòng đó và tự reconnect. Notification chỉ cần một chiều là đủ.
2. **Heartbeat.** Proxy sẽ đóng connection nằm im lâu. Một dòng comment mỗi 25s giữ connection mở và giúp client nhận ra connection đã chết.
3. **Auth không tốn công, cho tới khi token hết hạn.** Đây là request cùng origin bình thường, nên cookie `access_token` và `JwtAuthGuard` vẫn áp dụng. Guard chỉ chạy một lần, lúc stream mở; một stream đang mở vẫn chạy tiếp sau khi token hết hạn. Chỉ lần reconnect mới cần token mới, vì vậy hook refresh trước khi mở lại.

**Tiêu chí nghiệm thu.**
- [ ] Submit form public thì row mới hiện trong inbox trong vòng 2s mà không cần reload (roadmap p23).
- [ ] Sau khi restart API, `EventSource` reconnect và heartbeat chạy lại (roadmap p23).

**Tiêu đề PR:** `feat: contact + sse inbox`

#### T50 · API media: upload, variant, quan hệ

**Roadmap** p24 · **Spec** §1.5 (`Media`, `ProjectImage`), §1.6 (Uploads) · **Phụ thuộc** T36 · **Cỡ** L

**Mục tiêu.** Upload an toàn, lưu trên volume, có variant WebP và alt text, được link tới các entity dùng image.

**Phạm vi.**
- Model `Media`, `ProjectImage`. Đổi các cột id thường thành relation: `SiteSettings.ogImage`, `Profile.avatar`, `Profile.resumeEn`, `Profile.resumeVi`, `Project.cover`, `Post.cover` (`onDelete: SetNull`). Migration `add-media`.
- `admin-media.controller.ts`: `POST /admin/media` (`FileInterceptor`, giới hạn 10 MB, allowlist JPG/PNG/WebP/AVIF/PDF kiểm tra bằng magic bytes, D14; `sharp` xóa metadata và ghi variant WebP ở các độ rộng 480/960/1600; tên lưu ngẫu nhiên trong `UPLOAD_DIR`), `GET /admin/media` (cursor pagination, D6; `@Roles('admin', 'user')`), `PATCH /admin/media/:id` (alt), `DELETE /admin/media/:id` (409 `IN_USE` khi đang được tham chiếu). Upload, patch và delete chỉ cho admin.
- `public-media.controller.ts`: `GET /public/media/:file` chỉ stream những file đã biết, cache header dài, `X-Content-Type-Options: nosniff`.
- Public DTO có thêm object image `{ url, srcset, width, height, alt }` (alt chọn theo locale). Admin project DTO có thêm `images` kèm caption và thứ tự.
- Content health có thêm mục "images missing alt text".
- `apps/api/uploads/` được git-ignore; `.env.example` có `UPLOAD_DIR`.

**File.** `apps/api/prisma/schema.prisma` + migration `add-media`, `apps/api/src/modules/media/{media.module.ts,admin-media.controller.ts,public-media.controller.ts,media.service.ts,image-variants.service.ts,dto/*,entities/*}`, `apps/api/src/modules/{projects,posts,profile,site-settings}/entities/*.mapper.ts`, `packages/contracts/src/media/*`, `apps/api/test/media.e2e-spec.ts`, `.env.example`.

**Thiết kế.** Không có (chỉ API).

**Các bước backend, giải thích.**
1. **Upload multipart.** File đến dưới dạng `multipart/form-data`. `FileInterceptor` (multer) parse nó và chặn giới hạn kích thước trước khi code của bạn chạy.
2. **Không bao giờ tin tên file hay type khai báo.** Đọc vài byte đầu của file để biết type thật, và lưu file dưới một tên ngẫu nhiên.
3. **Variant.** `sharp` resize một lần lúc upload; sau đó page chọn kích thước nhỏ nhất vừa đủ (`srcset`).
4. **File trên disk, metadata trong DB.** Row `Media` là nguồn sự thật; file chỉ là một blob trên Docker volume. Có interface `MediaService` nên sau này cloud storage thay được disk.

**Tiêu chí nghiệm thu.**
- [ ] Upload một JPG sẽ tạo các variant WebP, và public DTO có `srcset` và alt (roadmap p24).
- [ ] Upload 20 MB hoặc một file `.exe` đổi tên thành `.jpg` bị từ chối với 400 (roadmap p24).
- [ ] PDF được chấp nhận và không có variant; dữ liệu GPS EXIF đã bị xóa khỏi image được lưu.

**Tiêu đề PR:** `feat: media uploads`

#### T51 · UI media: library, uploader, picker

**Roadmap** p24 · **Spec** §4.3 (`MediaUploader`, `MediaLibrary`), §4.6 (infinite + virtual list), §6 Day 18 · **Phụ thuộc** T42, T50 · **Cỡ** M

**Mục tiêu.** Upload có progress và cancel, duyệt được library lớn, và chọn image ở mọi chỗ editor cần; page public render image responsive.

**Phạm vi.**
- `packages/ui` `MediaLibrary` (grid, cảnh báo thiếu alt) và `MediaUploader` (drop zone, `progress` cho từng file, cancel).
- `admin-media`: `AdminMediaIndex` (`useInfiniteQuery` + TanStack Virtual, sửa alt trong một sheet), `services/media-upload.service.ts` (XHR, vì `fetch` không có upload progress; cancel bằng `AbortController`), `components/MediaPickerDialog`.
- Picker trong các editor: cover và image kèm caption của project (T43), cover của post (T44), avatar và resume (T45 profile), OG image (T45 settings). `MarkdownEditor`: `@tiptap/extension-file-handler` (MIT, D25) khi paste và drop gọi `onUploadImage(file)`, chèn image với URL `/api/public/media/…` được trả về, và mở popover alt text (publish đòi hỏi alt, T52); button image trên toolbar mở `dialog` media picker.
- Public: `core/utils/image-loader.util.ts` (loader của `next/image`, map width → variant gần nhất); cover trên case study và featured card, avatar trên About, link cho card tải CV.

**File.** `packages/ui/src/components/{MediaLibrary,MediaUploader}/*`, `packages/ui/package.json` (`@tiptap/extension-file-handler`, cùng version với các `@tiptap/*` khác), `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,extensions/create-markdown-extensions.ts}`, `apps/web/src/modules/admin-core/components/MarkdownField/*`, `packages/ui/src/components/ui/progress.tsx`, `apps/web/src/modules/admin-media/*`, `apps/web/app/admin/(cms)/media/page.tsx`, `apps/web/src/modules/admin-{projects,posts,site}/components/*` (nối picker), `apps/web/src/modules/core/utils/image-loader.util.ts`, `apps/web/next.config.ts`, `apps/web/src/modules/{projects,about,home}/components/*`.

**Thiết kế.** Mockup `admin-editor.html` (field cover), `case-study.html` (cover 21:9). Token: `--radius-xl`, `--muted`, `--warning`.

**Tiêu chí nghiệm thu.**
- [ ] Upload hiện progress và cancel được (spec §6 Day 18).
- [ ] Các element `<img>` public có `srcset` và alt (roadmap p24).
- [ ] Library scroll mượt với 1,000 row media đã seed.

**Tiêu đề PR:** `feat(web): media library and pickers`

#### T52 · Luồng publish + revalidate + preview draft

**Roadmap** p25 · **Spec** §1.5 (status), §4.6 (tag, revalidate), §5.5, §6 Day 19 · **Phụ thuộc** T27, T28, T43, T44 · **Cỡ** L

**Mục tiêu.** Publish làm thay đổi lên live trong vài giây mà không cần redeploy; draft chỉ xem được trong preview khi đã đăng nhập.

**Phạm vi.**
- API `modules/publishing`: `publishing.service.ts` (`revalidate(tags)` → `POST ${WEB_INTERNAL_URL}/api/revalidate` với `x-revalidate-secret`; retry một lần; lỗi được log và không bao giờ chặn thao tác ghi), `tags.util.ts` (entity → tag: `site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`).
- Route (chỉ admin): `POST /admin/projects/:id/publish|unpublish`, `POST /admin/posts/:id/publish|unpublish`. Publish kiểm tra các field English bắt buộc, `publishLint`, và alt text trên các image được dùng → 400 kèm `fieldErrors`; set `status` và `publishedAt` (chỉ ở lần publish đầu); phát `content.published`.
- Mọi thao tác ghi trong admin làm thay đổi dữ liệu public đều gọi `revalidate` với tag của nó.
- Preview API: `GET /admin/preview/projects/:slug`, `GET /admin/preview/posts/:slug` (shape giống public DTO, status nào cũng được, `@Roles('admin', 'user')`).
- Web: `app/api/revalidate/route.ts` (kiểm tra secret, `revalidateTag` cho từng tag), `app/api/draft/route.ts` (kiểm tra access token qua `/auth/me` với `withAuth`, role nào cũng được; bật `draftMode()`, redirect tới page; `?exit=1` thì tắt). Khi draft mode bật, service dùng các preview endpoint với cookie `access_token` được forward và không cache; nếu cookie đã hết hạn, banner draft có link tới `/admin/login?next=` page hiện tại. Một banner draft có link để thoát.
- Nút publish trong editor và status trong properties pane (project, post); link preview.
- `.env.example`: `REVALIDATE_SECRET`, `WEB_INTERNAL_URL`.
- Page (D26) dùng lại draft mode này; publish, version và live preview của page nằm ở T52a.

**File.** `apps/api/src/modules/publishing/*`, `apps/api/src/modules/{projects,posts}/{admin-*.controller.ts,*.service.ts}`, `apps/api/src/modules/*/` (các lời gọi revalidate), `apps/api/test/publishing.e2e-spec.ts`, `apps/web/app/api/{revalidate,draft}/route.ts`, `apps/web/src/modules/core/{services/api-server.service.ts,components/DraftBanner/*}`, `apps/web/src/modules/{projects,notes}/services/*.service.ts`, `apps/web/src/modules/admin-{projects,posts}/components/*`, `.env.example`.

**Thiết kế.** Spec §5.9 (publish trên header), `StatusPill`.

**Các bước backend, giải thích.**
1. **Publish là một lần đổi state có luật.** Draft được phép chưa đầy đủ; publish kiểm tra luật một lần, ở một chỗ.
2. **Cache tag.** Web cache mỗi page public kèm tag. API biết cái gì vừa đổi, nên nó báo cho web "mọi thứ gắn tag `post:my-slug` đã cũ", và chỉ những page đó được build lại ở lượt truy cập tiếp theo.
3. **Shared secret.** Route revalidate là public trên web, nên nó đòi một secret header mà chỉ API biết.
4. **Draft mode.** `admin` hoặc `user` đã đăng nhập nhận một cookie khiến web bỏ qua cache và đọc từ preview endpoint; mọi người khác vẫn nhận 404 cho draft.

**Tiêu chí nghiệm thu.**
- [ ] Trên production build (`pnpm build && pnpm start`), publish làm thay đổi hiện trên page public trong dưới 5s mà không cần redeploy (roadmap p25).
- [ ] Draft chỉ xem được trong preview; URL public vẫn trả 404 (roadmap p25).
- [ ] Publish một post có chứa `TODO` trả 400 kèm `fieldErrors` (spec §6 Day 10 v2).
- [ ] Revalidate secret sai trả 401.

**Tiêu đề PR:** `feat: publish + on-demand revalidate`

#### T52a · Publish page, version, live preview

**Roadmap** p25 · **Spec** §4.6 (tag, revalidate), §1.5 (status), D26 · **Phụ thuộc** T45b, T52 · **Cỡ** L

**Mục tiêu.** Visitor thấy version đã publish của một page, không bao giờ thấy draft. Một `admin` publish bằng một click, restore được bất kỳ version nào trước đó, và xem draft live ngay cạnh builder trước khi publish.

**Phạm vi.**
- Model `PageVersion`: `pageId`, `version` (1, 2, 3… theo từng page), `snapshot Json` (`{ seo, blocks: [{ type, key, schemaVersion, props, layout, surface, isVisible, sortOrder }] }`), `note` `VarChar(200)?`, `createdById` → `User` (`onDelete: SetNull`), `createdAt`; `@@unique([pageId, version])`. `Page` có thêm `publishedVersionId` (unique, → `PageVersion`) và `publishedAt`. Migration `add-page-versions`. Seed publish v1 của mọi page.
- Public read chuyển sang snapshot: `GET /public/pages/:key` trả snapshot đã publish, mỗi block vẫn đi qua `parseBlock`, nên một snapshot cũ được migrate hoặc các block hỏng của nó bị bỏ, không bao giờ 500. Một page chưa từng publish trả `blocks: []` (shell vẫn render) và content health đánh dấu nó.
- Admin route (chỉ admin trừ khi có ghi chú):
  - `POST /admin/pages/:key/publish` `{ note? }`. Check trước:
    - các luật page của T32a;
    - `parseBlock` chặt trên mọi block visible (400 `INVALID_BLOCKS` kèm issues theo từng block; block không hợp lệ đang ẩn bị bỏ ra khỏi snapshot);
    - `publishLint` trên mọi giá trị text, và các field English bắt buộc.
    - Sau đó, trong một transaction, nó ghi version n+1 và set `publishedVersionId` và `publishedAt`.
    - Cuối cùng nó revalidate `page:{key}` qua publishing service của T52, phát `content.published`, và ghi một row audit `PUBLISH` khi T55 đã có.
  - `GET /admin/pages/:key/versions` (list theo page: version, ngày, tên tác giả, note, số block) và `GET /admin/pages/:key/versions/:version` (snapshot). Cả hai là `@Roles('admin', 'user')`.
  - `POST /admin/pages/:key/versions/:version/restore`: thay các row draft bằng snapshot đó trong một transaction (`deleteMany` + `createMany`). Nó không publish, nên "roll back" nghĩa là restore, rồi publish.
  - `POST /admin/pages/:key/discard`: restore version đã publish vào draft.
  - `GET /admin/preview/pages/:key?locale` (`@Roles('admin', 'user')`): draft theo shape public DTO, các block không hợp lệ được liệt kê riêng.
  - `GET /admin/pages` có thêm `publishedVersion` và `hasUnpublishedChanges` (`Page.updatedAt` muộn hơn `publishedAt`).
- Web public:
  - `blocks/services/pages.service.ts` đọc preview endpoint (forward `access_token`, không cache) khi `draftMode()` bật.
  - Trong draft mode, `BlockRenderer` thêm `data-block-id` vào mỗi block và hiện `UnknownBlockNotice` (một ô viền đứt kèm type và issues của nó) ở chỗ mà visitor không thấy gì.
- `core/components/PreviewBridge` (client, chỉ được site layout mount trong draft mode): nó xử lý các event `message` có `origin` bằng `location.origin`. `preview:refresh` gọi `router.refresh()` và giữ vị trí scroll; `preview:focus { blockId }` scroll tới block đó và viền nó lại.
- Builder (`admin-pages`):
  - `PagePreview`: một `iframe` của `/api/draft?path=/{locale}{route}` (draft route của T52; `path` phải là một route public).
    - Nó nằm cạnh list ở `xl` và trong một `sheet` khi nhỏ hơn.
    - Một toggle viewport (390, 768, 1440: chiều rộng iframe, scale cho vừa) để check luật responsive, và một toggle EN/VI để đổi locale.
    - Sau mỗi lần lưu thành công, builder post `preview:refresh`; chọn một block thì post `preview:focus`.
  - `PublishBar`: một badge "Unpublished changes", Publish (note optional) bên trong `RoleGate allow={['admin']}`, và Discard changes. Một 400 `INVALID_BLOCKS` highlight các row.
  - `sheet` `VersionHistory`: list các version; mở một version trong preview dưới dạng snapshot read-only; Restore nằm sau một `alert-dialog` (chỉ admin).
- Content health (T38) có thêm bốn check:
  - page chưa từng publish;
  - thay đổi chưa publish cũ hơn 7 ngày;
  - block fail validation trong draft hoặc trong version đã publish;
  - tham chiếu của block tới item bị thiếu hoặc chưa publish.
- Preview frame site public từ cùng origin, nên T59 set `frame-ancestors 'self'` thay vì `'none'`.
- e2e `test/page-versions.e2e-spec.ts`:
  - publish làm thay đổi hiện trên page public, và một lần sửa draft sau đó không làm nó đổi;
  - publish khi có một block visible không hợp lệ trả 400;
  - restore v1 rồi publish thì v1 quay lại;
  - một `user` nhận 403 khi publish và restore, và 200 với versions và preview.

**Ngoài phạm vi.** Publish theo lịch (Q4). So sánh hai version cạnh nhau.

**File.** `apps/api/prisma/schema.prisma` + migration `add-page-versions`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/src/modules/pages/{admin-pages.controller.ts,pages.service.ts,page-versions.service.ts,page-versions.service.spec.ts,entities/*}`, `apps/api/src/modules/publishing/tags.util.ts`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/pages/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/api/test/page-versions.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/api/draft/route.ts`, `apps/web/app/[locale]/(site)/layout.tsx`, `apps/web/src/modules/blocks/{services/pages.service.ts,components/{BlockRenderer,UnknownBlockNotice}/*}`, `apps/web/src/modules/core/components/PreviewBridge/*`, `apps/web/src/modules/admin-pages/{components/{PagePreview,PublishBar,VersionHistory}/*,hooks/use-page-versions.hook.ts,services/admin-pages.service.ts}`, `apps/web/src/modules/admin-dashboard/components/ContentHealthCard/*`.

**Thiết kế.** Spec §5.9 (publish trên header), `StatusPill`. Token: `--warning` và `--warning-subtle` (badge chưa publish), `--border`, `--muted` (nền của khung preview), `--shadow-2`, `--ring` (viền block đang focus).

**Các bước backend, giải thích.**
1. **Bản draft và bản đã publish.** Các row `PageBlock` là draft bạn sửa. Publish copy chúng vào một JSON snapshot (`PageVersion`) và cho page trỏ tới nó. Visitor chỉ đọc snapshot, nên một lần sắp xếp đang làm dở không bao giờ hiện ra.
2. **Sao lại là snapshot mà không phải status cho từng block?** Một page được publish trọn vẹn: thứ tự, layout và text đi cùng nhau. Một bản JSON cho mỗi lần publish dễ đọc, dễ restore, và nhỏ (vài KB).
3. **Số version.** `@@unique([pageId, version])`, với n+1 tính bên trong transaction, nghĩa là hai lần publish cùng lúc không thể cùng tạo version 4. Một cái fail và có thể thử lại.
4. **Restore giữ nguyên lịch sử.** Restore copy một snapshot cũ vào draft và không bao giờ xóa version nào. Publish sau đó tạo một version mới, nên lịch sử chỉ dài thêm.
5. **Draft mode cho page.** Preview chính là route public thật, render bởi cùng các server component, nhưng đọc draft qua một admin endpoint với cookie của bạn. Thứ bạn thấy trong đó chính xác là thứ visitor nhận được sau khi bạn publish.

**Tiêu chí nghiệm thu.**
- [ ] Trên production build, publish một home đã sắp xếp lại làm thứ tự mới hiện ra trong dưới 5s, và sửa mà không publish thì visitor không thấy gì thay đổi (roadmap p25).
- [ ] Live preview cập nhật khoảng một giây sau mỗi lần autosave, và ở 390px nó hiện mọi block thành một cột.
- [ ] Restore v1 rồi publish đưa page public về v1, và lịch sử giữ mọi version.
- [ ] Publish khi có một block visible không hợp lệ trả 400 và highlight nó; một snapshot cũ có block type đã bị bỏ vẫn render các block khác của nó.
- [ ] Visitor không có draft mode không bao giờ nhận block draft (`curl` page public trong lúc đang có thay đổi draft).
- [ ] Đăng nhập bằng `user` thì preview và history hoạt động; Publish, Discard và Restore bị ẩn và bị API từ chối.

**Tiêu đề PR:** `feat: page publish + versions + live preview`

### M6 — Chất lượng

#### T53 · SEO từ CMS

**Roadmap** p26 · **Spec** §5 phần mở đầu (pattern title, canonical, hreflang, JSON-LD, sitemap, RSS), §4.2 (`OgImage`), §4.5 (SEO) · **Phụ thuộc** T24, T25, T27, T28, T52a · **Cỡ** M

**Mục tiêu.** Mọi page public có metadata, structured data và OG image lấy từ field trong CMS, và search engine nhận được sitemap chỉ gồm content đã publish.

**Phạm vi.**
- `seo/utils/*-metadata.util.ts`: các builder cho site, home, about, list project, project, list note, post, contact. Title `{seoTitle} · {siteName}`; description lấy từ `seoDescription` → `excerpt`/`tagline` → `SiteSettings`; năm page dựng từ block đọc `seoTitle`/`seoDescription` từ version đã publish của page (D26), rồi title và intro của block H1, rồi `SiteSettings`; canonical; `alternates.languages` (en, vi, `x-default`); `metadataBase` lấy từ env.
- `seo/components/JsonLd`: `Person` (home, about), `CreativeWork` (case study), `BlogPosting` (post), `BreadcrumbList` (các page chi tiết); JSON được escape ký tự `<`.
- OG image: `opengraph-image.tsx` cho route home, project và post (`ImageResponse`, 1200×630, nền tối, Be Vietnam Pro, `VersionTag`, tên + domain).
- `app/sitemap.ts` (cả hai locale, lấy từ một `GET /public/sitemap` mới trong `public-site`: các slug đã publish + `updatedAt`), `app/robots.ts` (disallow `/admin`, `/api`), RSS `app/[locale]/(site)/rss.xml/route.ts`.

**File.** `apps/web/src/modules/seo/{utils/*-metadata.util.ts,components/JsonLd/*,utils/rss.util.ts}`, `apps/web/app/{sitemap.ts,robots.ts}`, `apps/web/app/[locale]/(site)/{opengraph-image.tsx,projects/[slug]/opengraph-image.tsx,notes/[slug]/opengraph-image.tsx,rss.xml/route.ts}`, `apps/web/app/[locale]/(site)/**/page.tsx` (`generateMetadata`), `apps/api/src/modules/public-site/*`.

**Thiết kế.** Spec §4.2 `OgImage`. Token: `--background` dark, `--primary`, font heading.

**Tiêu chí nghiệm thu.**
- [ ] Lighthouse SEO ra 100 trên home, một post và một project (roadmap p26).
- [ ] Sitemap chỉ liệt kê các slug đã publish (roadmap p26).
- [ ] OG preview hiện title lấy từ DB (spec §6 Day 20).

**Tiêu đề PR:** `feat(web): seo from cms`

#### T54 · Analytics + chart trên dashboard

**Roadmap** p27 · **Spec** §1.5 (`PageView`), §5.7, §6 Day 22 · **Phụ thuộc** T38, T49 · **Cỡ** M

**Mục tiêu.** Đếm page view không dùng cookie, hiện thành chart trên dashboard.

**Phạm vi.**
- Model `PageView` (`path`, `locale`, `referrerHost`, `device`, `visitorHash`). Migration `add-page-views`.
- `modules/analytics`: `POST /public/views` (`@Public()`, có throttle, nhận body từ `sendBeacon`, bỏ qua bot và khi `analyticsEnabled = false`, `visitorHash` = SHA-256 của IP + user agent + salt theo ngày từ `ANALYTICS_SALT_SECRET`; không set cookie nào).
- `GET /admin/stats` có thêm số view mỗi ngày (`GROUP BY DATE(createdAt)`), unique visitor, top page, top referrer trong khoảng thời gian.
- Web: `core/components/PageViewBeacon` (client, chạy khi đổi route, `navigator.sendBeacon('/api/public/views')`); `admin-insights/views/AdminInsightsAnalytics.tsx` (area chart `chart` kèm một data table ẩn, toggle chọn khoảng thời gian); sparkline trong các `StatCard` của dashboard.

**File.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/analytics/*`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/analytics/*`, `apps/web/src/modules/core/components/PageViewBeacon/*`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/analytics/page.tsx`, `packages/ui/src/components/ui/chart.tsx`, `packages/ui/src/components/Sparkline/*`, `.env.example`.

**Thiết kế.** Figma `14:2` (card view). Mockup `admin-dashboard.html`. Token: `--chart-1` … `--chart-5`.

**Các bước backend, giải thích.**
1. **Đếm không cần cookie.** Hash của IP + browser + salt của hôm nay đếm được unique visitor mỗi ngày mà không lưu họ là ai; salt của ngày mai khiến hash hôm qua không còn nối được với nhau.
2. **Aggregation.** `GROUP BY DATE(createdAt)` gom các row thành một con số cho mỗi ngày, làm trong SQL chứ không phải trong JavaScript.

**Tiêu chí nghiệm thu.**
- [ ] Page view tăng khi có lượt truy cập; `GET /admin/stats` hiện số mới (roadmap p27).
- [ ] Beacon không set cookie nào; dashboard hiện số view thật (spec §6 Day 22).

**Tiêu đề PR:** `feat: analytics`

#### T55 · Audit log

**Roadmap** p27 · **Spec** §1.5 (`AuditLog`), §4.3 (`ActivityFeed`), §4.6 (infinite + virtual), §6 Day 23 · **Phụ thuộc** T36, T38 · **Cỡ** M

**Mục tiêu.** Mỗi thao tác ghi trong admin để lại một row audit, xem được trong một list virtualized, kèm theo bulk action.

**Phạm vi.**
- Model `AuditLog` (`userId`, `action` `CREATE|UPDATE|PUBLISH|ARCHIVE|RESTORE|LOGIN`, `entityType`, `entityId`, `summary`). Migration `add-audit-log`.
- `modules/audit`: `audit.service.ts` `record(…)`, được gọi tường minh từ các service bên trong cùng transaction với thao tác ghi (kể cả publish page và restore version, T52a), và từ login. `GET /admin/audit` (cursor pagination, filter theo entity type và user; chỉ admin).
- Bulk update status cho project và post (`POST /admin/{entity}/bulk` với `{ ids, action }`, chỉ admin) trong một transaction, mỗi item một row audit; nối vào bulk bar của `DataTable`.
- Script `pnpm --filter @portfolio/api seed:audit` chèn 5,000 row audit (chỉ dùng khi dev).
- Web: `admin-insights/views/AdminInsightsAudit.tsx` (`useInfiniteQuery` + `useVirtualizer`, `AuditRow` hiện thời gian tương đối và tooltip thời gian tuyệt đối); card activity trên dashboard (8 mục mới nhất, nằm trong `RoleGate allow={['admin']}`). `packages/ui` `ActivityFeed`, `AuditRow`.

**File.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/audit/*`, `apps/api/src/modules/*/*.service.ts` (các lời gọi record), `apps/api/prisma/seed/audit.seed.ts`, `apps/api/test/audit.e2e-spec.ts`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/audit/page.tsx`, `apps/web/src/modules/admin-dashboard/components/ActivityCard/*`, `packages/ui/src/components/{ActivityFeed,AuditRow}/*`.

**Thiết kế.** Figma `14:2` (card activity). Mockup `admin-dashboard.html`.

**Các bước backend, giải thích.**
1. **Append-only.** Row audit chỉ được insert, app không bao giờ update hay delete chúng.
2. **Cùng transaction.** Ghi row audit bên trong transaction của thao tác ghi nghĩa là bạn không bao giờ có thay đổi mà thiếu bản ghi, hay bản ghi mà thiếu thay đổi.
3. **Cursor pagination.** "Cho mình 50 row cũ hơn id 1234" vẫn nhanh và ổn định khi row mới liên tục đến, điều mà số trang (page number) không làm được.

**Tiêu chí nghiệm thu.**
- [ ] Mỗi thao tác CRUD tạo đúng một row audit, xem được trong `/admin/audit` (roadmap p27).
- [ ] 5,000 row audit đã seed scroll mượt (spec §6 Day 23).

**Tiêu đề PR:** `feat: audit log`

#### T56 · Test + e2e trên CI

**Roadmap** p28 · **Spec** §6 (Day 21, Day 24) · **Phụ thuộc** T52a · **Cỡ** M

**Mục tiêu.** Một bộ test chứng minh các luồng chính chạy end to end, chạy trên mọi PR.

**Phạm vi.**
- Lấp các chỗ trống trong API e2e để module nào cũng có test happy path + validation.
- Playwright trong `apps/web/e2e/`: smoke public (home ở cả hai locale, điều hướng nav bằng bàn phím, page project và post, 404), submit contact, admin login → tạo project draft → publish → hiện trên page public → archive, và `user` login (tài khoản được tạo trong test setup qua `POST /admin/users`) → editor project mở ở chế độ chỉ đọc, không có nút Publish và không có item Inbox, Audit hay Users; page builder của admin → kéo block `work` của home lên trên `featured`, ẩn `marquee`, publish → home public hiện thứ tự mới không có marquee → restore version trước rồi publish → thứ tự cũ quay lại. Chạy trên production build của web và api với test DB và seed `demo`.
- CI: các job `lint-typecheck-unit`, `api-e2e` (MySQL service), `web-e2e` (MySQL service, build cả hai app, chạy Playwright, upload report).

**File.** `apps/web/e2e/{public.spec.ts,contact.spec.ts,admin-publish.spec.ts,admin-pages.spec.ts}`, `apps/web/playwright.config.ts`, `apps/api/test/*.e2e-spec.ts`, `.github/workflows/ci.yml`.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] `pnpm test` xanh ở local và trên CI (roadmap p28).
- [ ] e2e draft → publish → page public xanh (spec §6 Day 21), cho một project và cho một page.

**Tiêu đề PR:** `test: api + e2e smoke`

#### T57 · Audit accessibility + performance

**Roadmap** p29 · **Spec** §3, §3.4, §5, §6 (Days 14, 28, 29 + các dòng v2) · **Phụ thuộc** T53 · **Cỡ** M

**Mục tiêu.** Accessibility và performance được đo trên mọi màn hình chính, và các fix đã được merge.

**Phạm vi.**
- axe (`@axe-core/playwright`) trên home, about, projects, case study, notes, post, contact, admin login, dashboard và page builder; CI fail khi có issue mức serious.
- Lighthouse (mobile) trên home, projects, case study, post.
- Kiểm tra tay: bàn phím, screen reader trên 3 page, drag and drop bằng bàn phím trong page builder (Space, phím mũi tên, Space) và menu move up/down của nó, reduced motion và reduced transparency trên home, case study và post (fallback của từng effect).
- Fix: thứ tự focus, skip link, `priority` cho image LCP, `display` của font, orb trên một composited layer, CLS 0 từ count-up và reveal.
- Report trong `docs/audits/<date>-a11y-perf.md` với số liệu trước/sau.

**File.** `apps/web/e2e/a11y.spec.ts`, `docs/audits/<date>-a11y-perf.md`, các fix trong những file `apps/web` và `packages/ui` bị ảnh hưởng.

**Thiết kế.** Tất cả màn hình public (bản đồ thiết kế §5).

**Tiêu chí nghiệm thu.**
- [ ] axe báo 0 issue serious trên các màn hình được audit (roadmap p29).
- [ ] Lighthouse ra ít nhất 95 cho accessibility và performance trên mobile ở home (roadmap p29), khi bật ambient effect (spec §6 Day 14 v2).

**Tiêu đề PR:** `fix: a11y + perf audit`

### M7 — Ship

#### T58 · Compose cho production

**Roadmap** p30 · **Spec** §1.6 (rung 11), §6 Day 21 · **Phụ thuộc** T56 · **Cỡ** M

**Mục tiêu.** Cả stack chạy từ một file compose, với image nhỏ và không chạy bằng root.

**Phạm vi.**
- `apps/web/Dockerfile`: multi-stage, `output: 'standalone'`, build arg `NEXT_PUBLIC_BUILD_SHA`, user không phải root.
- `apps/api/Dockerfile`: multi-stage, `prisma generate`, entrypoint chạy `prisma migrate deploy` rồi mới start app, user không phải root.
- `compose.prod.yml`: `db` (không publish port, có volume), `api` (healthcheck `/api/health`, volume cho uploads, phụ thuộc db healthy), `web` (`API_URL=http://api:4000`, phụ thuộc api healthy), `caddy` (HTTP trên :80 ở local; TLS ở T61). Các file `.dockerignore`.
- Seed một lần: `docker compose -f compose.prod.yml run --rm api node dist/seed.js` với `SEED_PROFILE=baseline` (có ghi trong README).

**File.** `apps/web/Dockerfile`, `apps/api/Dockerfile`, `apps/api/docker-entrypoint.sh`, `compose.prod.yml`, `infra/caddy/Caddyfile`, `.dockerignore`, `apps/web/next.config.ts`, `README.md`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Multi-stage build.** Một stage cài đặt và build; stage cuối chỉ copy những gì cần để chạy, nên image luôn nhỏ.
2. **`migrate deploy` vs `migrate dev`.** `deploy` chỉ áp dụng các migration đã commit, không bao giờ tạo migration mới và không bao giờ reset dữ liệu. Đây là lệnh migrate duy nhất dùng cho production.
3. **Tên service là hostname.** Bên trong compose, web gọi API qua `http://api:4000`; ngoài Caddy ra không có gì bị expose.

**Tiêu chí nghiệm thu.**
- [ ] `docker compose -f compose.prod.yml up --build` serve toàn bộ site trên localhost (roadmap p30).
- [ ] Image web và api mỗi cái dưới 300 MB (roadmap p30).

**Tiêu đề PR:** `chore(infra): production compose`

#### T59 · Hardening + backup

**Roadmap** p31 · **Spec** §1.6, §6 Day 24 · **Phụ thuộc** T58 · **Cỡ** M

**Mục tiêu.** Header bảo mật, cookie an toàn, container chỉ có quyền tối thiểu, và backup mà bạn đã thực sự restore thử.

**Phạm vi.**
- Header bảo mật: CSP với nonce theo từng request, set trong `middleware.ts` (pattern của Next.js); HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'self'` trong Caddyfile (`'self'`, không phải `'none'`, vì live preview của page builder frame site public từ cùng origin, T52a; không site nào khác được frame nó).
- Xác nhận cookie `Secure` trên production; container không chạy bằng root, root filesystem read-only khi có thể; không CORS (D9).
- JWT secret cho production: `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` tạo bằng `openssl rand -base64 48`, khác với dev và khác nhau, chỉ nằm trong `.env` trên VPS và GitHub secrets; boot fail nếu chúng ngắn hoặc bằng nhau (T35). Ghi cách tạo và xoay vòng secret trong `docs/runbooks/secrets.md`.
- Service `backup` trong `compose.prod.yml`: `mysqldump` + gzip hằng ngày và một file tarball cho uploads, xoay vòng 7 ngày trên volume `backups`.
- `scripts/backup/restore.sh` và `docs/runbooks/restore.md`; chạy một buổi diễn tập restore vào một database mới.

**File.** `apps/web/middleware.ts`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `infra/backup/backup.sh`, `scripts/backup/restore.sh`, `docs/runbooks/{restore.md,secrets.md}`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **`mysqldump`.** Ghi toàn bộ database ra thành các câu lệnh SQL; pipe qua `gzip` để file nhỏ. Chạy nó bên trong network của `db` nên không phải expose port nào.
2. **Xoay vòng.** Giữ 7 file hằng ngày và xóa những file cũ hơn, nên disk không bao giờ đầy.
3. **Backup chỉ có giá trị khi đã restore được.** Buổi diễn tập load bản dump mới nhất vào một database trống, start API trỏ vào đó và kiểm tra site.
4. **Xoay vòng JWT secret.** Đổi `JWT_ACCESS_SECRET` làm mọi access token mất hiệu lực ngay; đổi `JWT_REFRESH_SECRET` sign out tất cả mọi người. Xoay vòng sau khi bị lộ, và chuẩn bị login lại. Không có row session nào cần dọn (D24).

**Tiêu chí nghiệm thu.**
- [ ] `scripts/backup/restore.sh` vào một DB mới đưa site chạy lại được (roadmap p31).
- [ ] securityheaders.com cho điểm A trên production origin, hoặc trên một Caddy local có cùng header (roadmap p31).

**Tiêu đề PR:** `chore: hardening + backups`

#### T60 · Dọn seed production + kiểm tra placeholder

**Roadmap** p32 · **Spec** §1.1–§1.5, §2 · **Phụ thuộc** T45, T51, T52a · **Cỡ** S (phần của agent) · **Phần của owner:** Parker nhập content

**Mục tiêu.** Production khởi đầu từ seed `baseline`, và có một bước kiểm tra chứng minh không placeholder nào lọt lên site live.

**Phạm vi.**
- Agent: `scripts/check-placeholders.mjs` (kết nối bằng `DATABASE_URL`, đếm các row có field text chứa marker placeholder mà seed dùng (`<email>`, `<phone>`, `Sample`, `Lorem`, `TODO`), kể cả text bên trong `PageBlock.props` và các snapshot `PageVersion` đã publish, và fail nếu có row nào đã publish hoặc nằm trong singleton); root script `check:placeholders`; review `baseline.seed.ts` theo spec §1.5 (chỉ draft, 0 post, không có message hay view demo); `docs/runbooks/content-entry.md` (checklist: profile, experience, project, post, bản dịch tiếng Việt, metric, alt text, email liên hệ thật đã nhập trong `/admin`).
- Parker: nhập content thật trong `/admin`; publish ít nhất hai case study và một post.

**File.** `scripts/check-placeholders.mjs`, `package.json`, `apps/api/prisma/seed/profiles/baseline.seed.ts`, `docs/runbooks/content-entry.md`.

**Thiết kế.** Không có.

**Tiêu chí nghiệm thu.**
- [ ] DB production trả về 0 row placeholder (roadmap p32).
- [ ] Web app không chứa chuỗi nào từ CV: `pnpm check:content` pass (roadmap p32).

**Tiêu đề PR:** `chore: production seed cleanup`

#### T61 · Deploy pipeline + launch checklist

**Roadmap** p33 · **Spec** §5, §1.6 · **Phụ thuộc** T58, T59, T60 · **Cỡ** M · **Phần của owner:** VPS, DNS, secret, uptime monitor

**Mục tiêu.** Một lần push lên `main` sẽ deploy lên VPS qua HTTPS, và một checklist xác nhận đã sẵn sàng launch.

**Phạm vi.**
- `.github/workflows/deploy.yml`: sau khi CI trên `main` chạy xong, build và push image web/api lên GHCR (tag: commit SHA và `latest`), SSH vào VPS, `docker compose -f compose.prod.yml pull && up -d`, rồi smoke-check `https://<domain>/api/health`.
- Caddy tự động bật HTTPS cho domain lấy từ env (`SITE_DOMAIN`).
- `docs/runbooks/deploy.md` (setup VPS lần đầu, danh sách secret, rollback theo image tag).
- `docs/launch-checklist.md`: DNS, TLS, backup và diễn tập restore, Lighthouse và axe, `check:content`, `check:placeholders`, OG preview, đã submit sitemap, đã bật analytics, đã đổi password admin, đã tạo mới `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` cho production (không dùng giá trị dev), page 404/500, mọi page đã publish và không có block không hợp lệ nào trong content health, đã cấu hình uptime ping.

**File.** `.github/workflows/deploy.yml`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `docs/runbooks/deploy.md`, `docs/launch-checklist.md`.

**Thiết kế.** Không có.

**Các bước backend, giải thích.**
1. **Registry.** CI build image một lần và push lên GHCR; VPS chỉ pull, nên không bao giờ cần source code hay tool build.
2. **Secret.** SSH key, host và các giá trị `.env` nằm trong GitHub Actions secrets và trên VPS, không bao giờ nằm trong git.
3. **Rolling forward.** `up -d` thay container bằng image mới; entrypoint của API áp dụng migration mới trước. Rollback nghĩa là deploy image tag trước đó.
4. **HTTPS.** Caddy tự xin và gia hạn TLS certificate cho domain ngay khi DNS trỏ về VPS.

**Tiêu chí nghiệm thu.**
- [ ] Custom domain serve HTTPS (`curl -I` trả 200) (roadmap p33).
- [ ] Deploy chạy khi push lên `main`, và đã cấu hình uptime ping (roadmap p33).

**Tiêu đề PR:** `chore: deploy pipeline`

<a id="8-owner-tasks-and-out-of-scope"></a>

## 8. Việc của owner và ngoài phạm vi

**Parker tự làm những việc này** (agent có thể chuẩn bị bản nháp hoặc checklist):

- T03 ghi chú SQL: giá trị học nằm ở việc tự tay gõ SQL.
- Nhập content thật (T60 bước 2): profile, experience, case study, post, bản dịch tiếng Việt, metric thật. Viết trong `/admin`, không bao giờ commit.
- Account và secret: domain, VPS, DNS, secret của GitHub Actions, uptime monitor.
- Trả lời các câu hỏi mở ở §9.

**Ngoài phạm vi của plan này:** comment, newsletter, full-text search engine (MySQL `LIKE` kèm index là đủ ở quy mô này), nhiều hơn hai ngôn ngữ, cloud object storage (interface `MediaService` giữ khả năng này cho sau), admin multi-tenant, mobile app, layout page tự do (kéo field hay block vào ô grid bất kỳ, Q13), page tùy chỉnh ở URL mới (Q12).

<a id="9-open-questions"></a>

## 9. Câu hỏi mở

Mỗi câu đều có một mặc định mà plan đang dùng, nên không task nào bị chặn.

| # | Câu hỏi | Mặc định trong plan này |
| --- | --- | --- |
| Q1 | Các gap ở spec §1.4: tên pháp lý có dấu, ngày làm việc chính xác (CMC Global / Kobizo chồng nhau), metric thật cho từng case study, job title ("Senior Frontend Engineer" hay "Frontend Engineer (5 yrs)") | Placeholder từ wireframe; Parker nhập giá trị thật ở T60 |
| Q2 | Domain name và nhà cung cấp VPS | `parker.dev` chỉ xuất hiện như placeholder; T61 đọc domain từ env |
| Q3 | Reorder bằng drag-and-drop trong các table của admin (`@dnd-kit/sortable`) hay chỉ dùng button move up/down | Page builder dùng dnd-kit (D26, T45b). Các table giữ move up/down (spec §5.10 ghi `button (move up/down)`); sau này chúng có thể dùng lại `SortableList` trên cùng các endpoint reorder |
| Q4 | Mockup admin table hiện status post "Scheduled", nhưng data model chỉ có `DRAFT/PUBLISHED/ARCHIVED` | Không implement. Sau này, một `publishedAt` ở tương lai có thể mang nghĩa "scheduled" nếu Parker muốn |
| Q5 | Accept-Language: spec ghi `vi` được "auto-suggested, never forced". Gợi ý đó trông như thế nào? | Một banner một dòng có thể dismiss trên `/en/*` cho browser `vi`, trạng thái dismiss lưu trong cookie (T14) |
| Q6 | URL LinkedIn | Row `SocialLink` với placeholder `url = "https://www.linkedin.com/in/<handle>"` |
| Q7 | Lật lại D3 (markdown thay vì JSON blocks), D6 (list theo page) hay D8 (check Origin thay vì CSRF token)? | Giữ các lựa chọn của spec |
| Q8 | Mockup `MigrationDiagram` gắn label cho node là `v1 · Vue 2` / `v2 · Nuxt 3`, và các decision card trong case study hiện `OPTIONS · CHOICE · WHY · COST`. Data model không có field riêng cho các thứ này. | Node của diagram hiện `versionFrom`/`versionTo` đúng như đã nhập, với tên skill làm các component node (T22). Decision được tách tại các heading `###` thành card có body là markdown, nên tác giả tự viết các label đó trong text (T23, T27) |
| Q9 | `user` được làm chính xác những gì? (D7) | Người review chỉ đọc: dashboard, đọc nội dung và media, analytics, xem trước draft, password của mình. Không ghi, không publish, không upload, không inbox, không audit log, không quản lý user. Mở rộng về sau chỉ là thêm một `@Roles('admin', 'user')` cho mỗi route cùng `RoleGate` tương ứng |
| Q10 | Thu hồi một refresh token bị lộ mà không sign out user đó khỏi mọi nơi? (D24) | Không. Việc đó cần một bảng lưu token (chính là session mà Parker đã bỏ). `tokenVersion` sign out user trên mọi thiết bị, đủ dùng cho vài tài khoản |
| Q11 | Editor có nên cho phép nhiều Markdown hơn allowlist dùng chung (D25, T23) không, ví dụ H4, task list, footnote, underline hay embed? | Không. Thêm một cái về sau nghĩa là thêm một mục trong `markdown.constant.ts`, extension Tiptap tương ứng và một component renderer, trong cùng một PR |
| Q12 | Page tùy chỉnh ở URL mới (ví dụ `/uses`) dựng từ block? (D26) | Không: block chỉ sắp xếp năm route page. Thêm nó nghĩa là cần `Page.slug`, một catch-all route, một entry trong nav và sitemap, và một action "New page" trong builder |
| Q13 | Layout tự do: kéo field hay block vào ô grid bất kỳ, hoặc đặt hai block cạnh nhau? (D26) | Không: mỗi hàng một block, với layout preset. Một bản mở rộng sau này có thể thêm một container block `columns` hoặc một `colSpan` cho từng block trên cùng grid 12 cột, lưu trong cùng JSON |
