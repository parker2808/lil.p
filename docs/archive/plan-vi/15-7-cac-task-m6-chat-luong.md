<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / M6 — Chất lượng); links re-pointed. Index: ../../PLAN.vi.md -->

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

