<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T36 · JWT guard global, role (admin/user), check Origin, throttle); links re-pointed. Index: ../../PLAN.vi.md -->

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

**Roadmap** p20 · **Spec** [§4.3](../../design/portfolio-design-system.vi.md#s-4-3), §4.6 (dòng Admin layout), §5.7, §5.11 · **Phụ thuộc** T11, T12, T36 · **Cỡ** L

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

**Roadmap** p20 · **Spec** [§5.7](../../design/portfolio-design-system.vi.md#s-5-7), §5.11, §5.0 (dòng Admin dashboard) · **Phụ thuộc** T37 · **Cỡ** M

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

**Roadmap** p21 · **Spec** [§5.8](../../design/portfolio-design-system.vi.md#s-5-8), §4.3 (`DataTable`, `FilterBar`), §4.6 (list điều khiển bằng URL, optimistic update) · **Phụ thuộc** T37 · **Cỡ** L

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

