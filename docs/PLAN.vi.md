# Kế hoạch triển khai portfolio

[English](./PLAN.md) · Cấu trúc: [root](../STRUCTURE.md) · [web](../apps/web/STRUCTURE.md) · [api](../apps/api/STRUCTURE.md) · Snapshot thiết kế: [docs/design/](./design/)

Plan này biến design của Parker (spec, Figma, mockup, practice roadmap) thành 67 task nhỏ. Mỗi task là một pull request mà một implementation agent, hoặc Parker, có thể tự làm xong và merge. Các task đi theo thứ tự của practice roadmap (p01–p33, milestone M0–M7), nên code lớn lên theo đúng nhịp của các bài học.


> **Agents:** this is the short index. Read only the piece you need.

Full content is split, verbatim, into `docs/archive/plan-vi/`. Search it with `rg` and open only the piece you need.

- [Mục lục](archive/plan-vi/01-muc-luc.md)
- [3. Quyết định](archive/plan-vi/02-3-quyet-dinh.md)
- [4. Kiến trúc tổng quan](archive/plan-vi/03-4-kien-truc-tong-quan.md)
- [5. Bản đồ thiết kế](archive/plan-vi/04-5-ban-do-thiet-ke.md)
- [6. Tổng quan task](archive/plan-vi/05-6-tong-quan-task.md)
- [7. Các task](archive/plan-vi/06-7-cac-task.md)
- [7. Các task / T09 · Package contracts + `GET /api/public/site`](archive/plan-vi/07-7-cac-task-t09-package-contracts-get-api-public-si.md)
- [7. Các task / T14 · Site shell + hero/CTA của home từ API + kiểm tra content](archive/plan-vi/08-7-cac-task-t14-site-shell-hero-cta-cua-home-tu-api.md)
- [7. Các task / T23 · Pipeline markdown + Prose + CodeBlock + công cụ hỗ trợ đọc](archive/plan-vi/09-7-cac-task-t23-pipeline-markdown-prose-codeblock-c.md)
- [7. Các task / M3 — Phía ghi](archive/plan-vi/10-7-cac-task-m3-phia-ghi.md)
- [7. Các task / T36 · JWT guard global, role (admin/user), check Origin, throttle](archive/plan-vi/11-7-cac-task-t36-jwt-guard-global-role-admin-user-ch.md)
- [7. Các task / T42 · Editor shell + Tiptap MarkdownEditor + autosave](archive/plan-vi/12-7-cac-task-t42-editor-shell-tiptap-markdowneditor-.md)
- [7. Các task / T46 · Admin user (chỉ admin) + tự đổi password](archive/plan-vi/13-7-cac-task-t46-admin-user-chi-admin-tu-doi-passwor.md)
- [7. Các task / M5 — Realtime, media, publish](archive/plan-vi/14-7-cac-task-m5-realtime-media-publish.md)
- [7. Các task / M6 — Chất lượng](archive/plan-vi/15-7-cac-task-m6-chat-luong.md)

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
| 4 | **Practice roadmap** p01–p33 | Thứ tự task, các bước học, done-check, commit message | [/practice](https://parker-interview-senior-fe.vercel.app/practice). Snapshot: [docs/design/roadmap.json](./design/archive/roadmap.json) |
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

<details><summary>Old section links</summary>

<a id="7-tasks"></a>[7-tasks](archive/plan-vi/05-6-tong-quan-task.md#7-tasks) ·
<a id="5-design-map"></a>[5-design-map](archive/plan-vi/03-4-kien-truc-tong-quan.md#5-design-map) ·
<a id="6-task-overview"></a>[6-task-overview](archive/plan-vi/04-5-ban-do-thiet-ke.md#6-task-overview) ·
<a id="0-how-to-use-this-plan"></a>[0-how-to-use-this-plan](archive/plan-vi/01-muc-luc.md#0-how-to-use-this-plan) ·
<a id="4-architecture-at-a-glance"></a>[4-architecture-at-a-glance](archive/plan-vi/02-3-quyet-dinh.md#4-architecture-at-a-glance) ·
<a id="8-owner-tasks-and-out-of-scope"></a>[8-owner-tasks-and-out-of-scope](archive/plan-vi/15-7-cac-task-m6-chat-luong.md#8-owner-tasks-and-out-of-scope) ·

</details>
