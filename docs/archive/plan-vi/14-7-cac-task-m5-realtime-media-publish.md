<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / M5 — Realtime, media, publish); links re-pointed. Index: ../../PLAN.vi.md -->

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

**Roadmap** p23 · **Spec** [§5.6](../../design/portfolio-design-system.vi.md#s-5-6), §4.2 (`ContactForm`), §4.6 (dòng Contact form), §6 Day 20 · **Phụ thuộc** T14, T47 · **Cỡ** M

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

