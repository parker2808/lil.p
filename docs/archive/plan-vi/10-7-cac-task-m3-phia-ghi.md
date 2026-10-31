<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / M3 — Phía ghi); links re-pointed. Index: ../../PLAN.vi.md -->

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

**File.** `apps/api/package.json`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_auth/`, `apps/api/prisma/seed/profiles/*.seed.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts}`, `apps/api/src/modules/users/{users.module.ts,users.service.ts,users.service.spec.ts,entities/*}`, `apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,auth.service.spec.ts,token.service.ts,auth-cookies.util.ts,strategies/jwt.strategy.ts,strategies/jwt-refresh.strategy.ts,dto/*}`, `apps/api/src/common/guards/{jwt-auth.guard.ts,jwt-refresh.guard.ts}`, `apps/api/src/main.ts`, `packages/contracts/src/auth/{auth.enum.ts,auth.schema.ts,auth.type.ts}`, `apps/api/test/helpers/auth.helper.ts`, `apps/api/test/auth.e2e-spec.ts`, `.env.example`, `apps/api/api.http` ([api STRUCTURE: auth](../../../apps/api/STRUCTURE.md#auth-jwt)).

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

