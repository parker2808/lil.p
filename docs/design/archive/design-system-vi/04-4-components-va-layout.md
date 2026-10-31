<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (4. Components và layout); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

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

 
