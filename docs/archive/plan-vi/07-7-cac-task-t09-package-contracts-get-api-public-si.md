<!-- Archived verbatim from docs/PLAN.vi.md (7. Các task / T09 · Package contracts + `GET /api/public/site`); links re-pointed. Index: ../../PLAN.vi.md -->

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

**File.** `packages/contracts/{package.json,tsconfig.json,tsup.config.ts}`, `packages/contracts/src/index.ts`, `packages/contracts/src/common/{locale.schema.ts,api-error.schema.ts}`, `packages/contracts/src/{site-settings,profile,navigation,social-links,public-site}/*`, `packages/contracts/src/constants/routes.constant.ts`, `apps/api/src/i18n/{locale.decorator.ts,pick-locale.util.ts,pick-locale.util.spec.ts}`, `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{[domain].module.ts,[domain].service.ts,entities/*}`, `apps/api/src/modules/public-site/{public-site.module.ts,public-site.controller.ts,public-site.service.ts}`, `apps/api/api.http` ([STRUCTURE ở root: contracts](../../../STRUCTURE.md#package-layout-packagescontracts), [module layout của api](../../../apps/api/STRUCTURE.md#module-layout)).

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
1. **Pipeline của một request.** Đọc diagram trong [STRUCTURE của api](../../../apps/api/STRUCTURE.md#how-a-request-flows): middleware → guards → pipes → controller → service, và filter bắt mọi thứ bị throw trên đường đi.
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

**File.** `packages/contracts/src/blocks/{localized.schema.ts,block-layout.constant.ts,define-block.util.ts,block-registry.constant.ts,block.schema.ts,block.type.ts,resolve-block.util.ts,resolve-block.util.test.ts}`, `packages/contracts/src/blocks/definitions/{hero,page-header,cta-band}.block.ts`, `packages/contracts/src/pages/{pages.schema.ts,pages.type.ts,pages.enum.ts}`, `packages/contracts/src/index.ts`, `apps/api/src/modules/pages/{pages.module.ts,public-pages.controller.ts,pages.service.ts,pages.service.spec.ts,entities/page.entity.ts,entities/page.mapper.ts}`, `apps/api/src/app.module.ts`, `apps/api/prisma/seed/data/pages.data.ts`, `apps/api/api.http` ([STRUCTURE ở root: contracts](../../../STRUCTURE.md#package-layout-packagescontracts), [api: page và block](../../../apps/api/STRUCTURE.md#pages-and-blocks)).

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

**Roadmap** p09 · **Spec** [§4.6](../../design/portfolio-design-system.vi.md#s-4-6), §4.5, phần mở đầu §5 · **Phụ thuộc** T05, T09 · **Cỡ** L

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

**File.** `apps/web/middleware.ts`, `apps/web/next.config.ts`, `apps/web/i18n/{routing.ts,request.ts,navigation.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `apps/web/app/[locale]/layout.tsx`, `apps/web/app/[locale]/(site)/{layout.tsx,page.tsx}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts,site.service.ts}`, `apps/web/src/modules/core/utils/{api-error.util.ts,query-client.util.ts}`, `apps/web/src/modules/core/components/Providers/{Providers.tsx,QueryProvider.tsx}`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `packages/contracts/src/constants/query-keys.constant.ts`, `eslint.config.mjs` ([STRUCTURE của web: data](../../../apps/web/STRUCTURE.md#data-services-hooks-actions), [i18n](../../../apps/web/STRUCTURE.md#i18n)).

**Thiết kế.** Không có gì nhìn thấy được ngoài text tạm thời ở home.

**Tiêu chí nghiệm thu.**
- [ ] `/` redirect tới `/en`; `/en` và `/vi` render headline đã seed; `<html lang>` khớp với locale.
- [ ] Đổi một giá trị seed rồi seed lại sẽ làm page thay đổi (roadmap p09).
- [ ] `curl localhost:3000/api/health` trả về response của API (rewrite hoạt động).
- [ ] Một string literal trong view làm `pnpm lint` fail.
- [ ] Không có `app/layout.tsx`.

**Tiêu đề PR:** `feat(web): data layer, i18n and locale layout`

#### T12 · UI primitive khớp với component set trong Figma

**Roadmap** p09 (chuẩn bị) · **Spec** [§4.0](../../design/portfolio-design-system.vi.md#s-4-0), [§4.1](../../design/portfolio-design-system.vi.md#s-4-1), §4.7 (`Eyebrow`, `KickerPill`) · **Phụ thuộc** T06 · **Cỡ** M

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

**Roadmap** p09 · **Spec** [§4.5](../../design/portfolio-design-system.vi.md#s-4-5), [§4.7](../../design/portfolio-design-system.vi.md#s-4-7), §3.1b, §3.4, §4.3 (`StatusPill`) · **Phụ thuộc** T12 · **Cỡ** M

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

