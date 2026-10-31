<!-- Archived verbatim from docs/design/portfolio-design-system.md (4. Components and layout); links re-pointed. Index: ../../portfolio-design-system.md -->

<h2 id="s-4">4. Components and layout</h2>

> **In this chapter:** Primitives are shadcn/ui (Radix behavior, our tokens) as listed in 4.0; product components compose them.

| § | Section |
| --- | --- |
| 4.0 | Base layer: shadcn/ui + TanStack |
| 4.1 | Primitive contract: variants, states, a11y (`packages/ui`) |
| 4.2 | Public site |
| 4.3 | Admin (Linear-style) |
| 4.4 | Layout and grid rules |
| 4.5 | Data-driven UI: no hard-coded content |
| 4.6 | Data fetching: Next App Router + TanStack Query |
| 4.7 | Rich-layer components (v2) |

Primitives are shadcn/ui (Radix behavior, our tokens) as listed in 4.0; product components compose them. Every interactive component has `default / hover / focus-visible / active / disabled` plus the listed extra states, and a Storybook-or-Ladle story per state (light + dark).

<h3 id="s-4-0">4.0 Base layer: shadcn/ui + TanStack</h3>

Primitives are **shadcn/ui** components (Radix UI + Tailwind), copied into `packages/ui/src/components/ui/*` with `pnpm dlx shadcn@latest add …` and owned by us. Behavior and a11y come from Radix; styling comes from the tokens in section 3. Product components (`ProjectCard`, `Timeline`, `DataTable`, …) live in `packages/ui/src/components/*` and compose the shadcn ones. TanStack provides the data layer: **Query** (server state against the Nest API), **Table** (admin tables, headless), **Form** (contact form and admin editors, with zod via Standard Schema), **Virtual** (long lists only).

| shadcn component | Used for | Customisation |
| --- | --- | --- |
| `button`, `button-group` | All actions | Sizes `sm 28`, `default 32`, `lg 40`; add `loading` prop (keeps width, `aria-busy`, `spinner`); `link` variant underlined |
| `input`, `textarea`, `input-group`, `label`, `field` | All forms | `field` (library-agnostic) wraps TanStack Form fields: `FieldLabel`, `FieldDescription`, `FieldError` wired to `aria-describedby` / `aria-invalid`. shadcn's RHF-based `form` is **not** used |
| `select`, `checkbox`, `radio-group`, `switch`, `toggle-group` | Inputs, locale switch, period picker (7d/30d/90d) | none |
| `popover` + `command` | Combobox, multi-select tags/skills (shadcn combobox recipe), `⌘K` palette (`command` in `dialog`) | Creatable option for tags |
| `calendar` + `popover` | Date pickers (experience dates, publish date) | Month-precision mode for experience |
| `dialog`, `alert-dialog`, `sheet`, `drawer` | Modals, confirm delete, mobile nav, admin properties on mobile | `alert-dialog` for destructive; `drawer` (vaul) only on mobile |
| `dropdown-menu`, `context-menu` | Row actions, user menu, theme menu | Shortcut hints with `kbd` |
| `tabs` | Admin locale tabs (EN/VI), editor Write/Preview | Completeness dot per tab |
| `table` | Base markup for TanStack Table | Density `compact 32` / `default 40`, sticky header |
| `pagination` | Public notes list, admin tables | Admin uses prev/next + page size |
| `badge` | Tags, status, `VersionTag` base | Variants `neutral`, `primary`, `success`, `warning`, `destructive`, `info`; `subtle` / `outline` |
| `card` | Project cards, stat cards, settings groups | Flat (`--shadow-0`), hover `--shadow-1` on links |
| `skeleton` | All loading states | Shimmer off under reduced motion |
| `empty` | All empty states | Icon + one line + action |
| `alert` | Inline error states, NDA callout, "missing translation" warnings | Variants `info`, `warning`, `destructive` |
| `sonner` | Toasts, realtime notifications | Themed; `role="status"`; errors use `role="alert"` |
| `tooltip`, `kbd` | Icon buttons, shortcut hints | 500ms delay |
| `sidebar` | Admin shell | Collapsible to icon rail (`collapsible="icon"`), `[` toggles |
| `breadcrumb`, `separator`, `avatar`, `scroll-area` | Admin topbar, case-study header, media grid | none |
| `navigation-menu` | Public header (desktop) | Plain links, no mega-menu |
| `accordion`, `collapsible` | Timeline highlights, mobile TOC, FAQ-like settings | Open by default under reduced motion |
| `progress` | Upload progress | With text percentage |
| `chart` (Recharts) | Dashboard area chart, sparklines | Uses `--chart-*`; hidden data table for screen readers |
| `resizable` | Admin editor split (write / preview) | Keyboard-resizable handle |
| `spinner` | Button loading, background refetch indicator | none |

Not from shadcn (custom, built on the above): `Prose`, `CodeBlock` (Shiki), `MarkdownEditor` (CodeMirror 6), `Timeline`, `DiffStat`, `VersionTag`, `StatusPill`, `SaveStatus`, `SectionBoundary`, `DataTable` (TanStack Table + shadcn `table`), `MediaLibrary`.

<h3 id="s-4-1">4.1 Primitive contract: variants, states, a11y (`packages/ui`)</h3>

| Component | Variants | Extra states | A11y |
| --- | --- | --- | --- |
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `link`; sizes `sm 28`, `md 32`, `lg 40`; `icon` | `loading` (spinner, keeps width, `aria-busy`) | `<button>` always; icon-only needs `aria-label`; disabled via `aria-disabled` when it must stay focusable for a tooltip |
| `Input`, `Textarea` | `md`, `lg`; with prefix/suffix icon | `invalid`, `readOnly` | `<label for>`, error via `aria-describedby` + `aria-invalid`; never placeholder-as-label |
| `Select`, `Combobox`, `MultiCombobox` (tags) | single, multi, creatable | `loading`, `empty` | ARIA combobox pattern, typeahead, `Esc` closes and restores focus |
| `Checkbox`, `Radio`, `Switch` | sm, md | `indeterminate` (checkbox) | Native inputs under the hood; switch uses `role="switch"` |
| `Badge` / `Tag` | `neutral`, `accent`, `success`, `warning`, `danger`; `solid` / `subtle` / `outline` | removable (tag) | Status never by color alone: text label always present |
| `VersionTag` | `from`, `to` (renders `v1 → v2`) | n/a | Mono font; arrow has `aria-label="to"` |
| `Kbd` | sm | n/a | `<kbd>`; shortcuts also listed in a help dialog |
| `Tooltip` | top/right/bottom/left | n/a | Supplementary only, opens on focus too, 500ms delay, `Esc` dismisses |
| `Dialog`, `ConfirmDialog`, `Sheet` | `sm 400`, `md 560`, `lg 720`; sheet right/bottom | `submitting` | Focus trap, returns focus to trigger, `aria-labelledby`; destructive confirm requires typing the slug for deletes |
| `DropdownMenu`, `ContextMenu` | with icons, shortcuts, submenus | `checked` items | Roving tabindex, arrow keys, typeahead |
| `Tabs` | `underline`, `pill` | n/a | `tablist` pattern; URL-synced in admin |
| `Toast` | `info`, `success`, `warning`, `danger`, `action` | stacked, paused on hover | `role="status"` (polite) / `role="alert"` for errors only; ≥ 5s, pauses on focus |
| `CommandPalette` (`⌘K` / `Ctrl K`) | public (nav, theme, locale, search posts) / admin (create, jump, actions) | `loading`, `empty` | Dialog + listbox; results announced via live region |
| `Skeleton`, `EmptyState`, `ErrorState` | inline, block, page | retry | Skeletons `aria-hidden`; container `aria-busy="true"`; error has a retry button and a request id |
| `Avatar` | 24/32/40/96 | fallback initials | `alt` = name or empty when decorative |
| `Prose` | `prose` (long-form), `compact` (excerpts) | n/a | Applies the long-form rules in 3.2 to markdown output: headings with anchor links, tables scroll in a focusable region |
| `CodeBlock` | with filename, line highlight, diff (`+`/`-`) | copied | Copy button with `aria-live` confirmation; Shiki at build time, both themes |

<h3 id="s-4-2">4.2 Public site</h3>

| Component | Notes |
| --- | --- |
| `SkipLink` | First focusable, jumps to `<main id="content">` |
| `SiteHeader` | Logo wordmark, nav from `NavItem` rows (seed: Work, About, Notes, Contact), `⌘K` button, `LocaleSwitch`, `ThemeToggle`. Sticky, translucent `--background` 80% + backdrop blur, `--shadow-1` after scroll. Mobile: menu button opens a full-height `Sheet` |
| `LocaleSwitch` | `VI / EN` segmented; links to the same page in the other locale (or the locale's index if missing), `hreflang` set |
| `ThemeToggle` | light / dark / system menu; `aria-pressed` on the active option |
| `Hero` | Name, headline, sub-line, 2 CTAs (View work, Contact), availability badge |
| `MetricStat` / `DiffStat` | Value + label; diff variant shows `before → after` in mono with `+/-` gutter like a diff row. Numbers use `tnum` |
| `ProjectCard` | Cover (16:10), title, tagline, client, period, `VersionTag`, 3 tech tags; whole card is one link (title is the link, card uses the `::after` stretch) with hover `--shadow-1` and cover scale 1.02 (no scale under reduced motion). `confidential` shows a diagram cover + NDA badge |
| `Timeline` / `TimelineItem` | Vertical rail, company, role, dates (`Feb 2024 — now`), phases nested, highlights, tech tags. `<ol>` with `<time datetime>` |
| `SkillGroup` | Grouped by `depth` (Daily / Shipped / Growing), not progress bars |
| `CaseStudyHeader` | Breadcrumb, title, tagline, meta grid (client, role, team, period, stack), cover |
| `SectionNav` (TOC) | Sticky on `lg+`, scroll-spy with `aria-current="true"`; collapses into a `<details>` on mobile |
| `PostCard`, `PostMeta` | Title, excerpt, date, reading time, tags |
| `SearchField` + `TagFilter` | Search is a `role="search"` form, debounced 200ms, URL-synced (`?q=&tag=`), results count in a live region |
| `Pagination` | Prev/next + page numbers, `nav aria-label="Pagination"` |
| `ContactForm` | Name, email, subject (select), message, honeypot, submit; inline validation on blur, summary on submit; success replaces form with a status panel |
| `SiteFooter` | Social links, RSS, "Built with Next.js + NestJS, source on GitHub", last deploy hash in mono |
| `OgImage` | Route handler template: 1200×630, dark `--background`, title in Be Vietnam Pro, `VersionTag`, name + domain |

<h3 id="s-4-3">4.3 Admin (Linear-style)</h3>

| Component | Notes |
| --- | --- |
| `AppShell` | Sidebar 240px (collapsible to 56px rail, `[` toggles), topbar 48px, content. Mobile: sidebar is a `Sheet` |
| `Sidebar` | Workspace switcher (Parker), search (`⌘K`), groups: Dashboard, Inbox (unread count); Content: Projects, Posts, Experience, Skills; Site: Site settings (nav, sections, social, contact topics), Profile, Media; Insights: Analytics, Audit log; Users (owner only). Built on shadcn `sidebar`; active item `--sidebar-accent` + primary left bar |
| `Topbar` | Breadcrumbs, page actions, `NotificationBell`, user menu |
| `DataTable` | TanStack Table (headless) on shadcn `table`. Columns sortable, resizable, hideable; row selection with shift-range; bulk actions bar slides up; sticky header; density `compact 32 / default 40`; keyboard: `j/k` move, `x` select, `Enter` open, `e` edit, `⌫` delete (confirm). Server pagination, filters in URL. States: loading (skeleton rows), empty (with create CTA), no results (clear filters), error |
| `FilterBar` | Chips: `Status is Draft`, `Tag is react`; add-filter menu; saved views |
| `StatusPill` | `draft` (neutral, hollow circle), `published` (success, filled circle), `archived` (subtle, archive icon). Icon + text. Built on `badge` |
| `PropertyList` | Right-pane key/value editor (status, slug, dates, tags, featured, locale completeness) like Linear's issue properties |
| `LocaleTabs` | `EN ●` / `VI ○` with completeness dot; switching keeps scroll; missing required fields block publish for that locale only |
| `MarkdownEditor` | CodeMirror 6, toolbar (heading, bold, link, code, image, callout), slash menu, paste/drop image → upload, split/preview/write modes, word count, autosave every 2s idle, `SaveStatus` |
| `SaveStatus` | `Saving…` / `Saved 12s ago` / `Offline, changes kept locally` / `Conflict: newer version` (with compare) |
| `MediaUploader`, `MediaLibrary` | Drop zone, per-file progress + cancel (AbortController), grid with alt-text-missing warning, select dialog |
| `StatCard`, `Sparkline`, `AreaChart` | Value, delta vs previous period (text + arrow, not color only), sparkline with `<title>` and a hidden data table |
| `ActivityFeed` / `AuditRow` | Actor avatar, verb, entity link, relative time with absolute in tooltip; diff expander |
| `NotificationBell` + realtime toast | SSE (`EventSource`, section 4.6); new contact message → toast "New message from Ana" with Open action, unread badge increments. `aria-live="polite"`, never steals focus |
| `RoleGate` | Hides or disables actions by role; server still enforces |
| `EmptyState` (admin) | Illustration-free: icon, one line, primary action, keyboard hint |

<h3 id="s-4-4">4.4 Layout and grid rules</h3>

- **Public container:** `max-width: var(--container)` (1120px), page padding 20px → 32px (`md`) → 40px (`lg`). Prose max `var(--measure)` (66ch). Grid: 4 / 8 / 12 columns, gutters 16 / 24 / 32px.
- **Bands (v2):** full-width `Band` sections (`--band` + `border-y`) alternate with the plain background so long pages have rhythm; content inside stays in the container. Never two bands in a row; never a band inside prose. Atmosphere (grid/orbs) only in the home hero and the CTA band.
- **Vertical rhythm:** section gap 64px mobile, 96px desktop (inside a band: 64/80px padding); within a section, heading → content 24px; card grid gap 24px.
- **Home and lists:** project grid 1 col (`base`), 2 cols (`md`), featured project spans full width on `lg` (cover left 7 cols, text right 5).
- **Case study / post:** 12-col on `lg`: content cols 1–8, sticky TOC cols 10–12. Full-bleed media allowed to break out to the container width, never to the viewport.
- **Admin:** fluid; sidebar 240 + content. Lists are full-width tables. Editor: `lg` = editor + properties pane (320px); `2xl` = editor + live preview + properties. Never horizontally scroll the page, only the table region (focusable, `aria-label`).
- **Touch:** every target ≥ 44×44px on coarse pointers (`@media (pointer: coarse)` enlarges admin controls to 40px and hit areas to 44px).
- **Content width per locale:** vi text runs ~10–15% longer; buttons and nav must fit the vi labels without truncation at 360px.

<h3 id="s-4-5">4.5 Data-driven UI: no hard-coded content</h3>

- **Where text comes from.** Content (everything in section 1.5) comes from the API. UI chrome comes from `apps/web/messages/{en,vi}.json` via `next-intl` (`t('contact.send')`). Nothing else. Enforced with `react/jsx-no-literals` (allowlist: punctuation, `·`, `→`) on `apps/web/app/**` and `packages/ui/src/components/**`.
- **Components are pure.** Product components receive typed props from `packages/contracts` (`HeroSection({ profile, settings })`) and never fetch. Pages and section containers fetch and pass data down. Fixtures in `packages/contracts/fixtures/*` are used only by stories and tests; seed data (section 1.5) is the only source of real content.
- **Ordering and visibility.** Home and About render `sections.filter(s => s.isVisible).sort(bySortOrder).map(s => <SectionBoundary key={s.key} …>{registry[s.key](s)}</SectionBoundary>)`. `registry` maps each `PageSection.key` to a container component in code.
- **Every data-driven section has 3 non-happy states**, wrapped by one component, `SectionBoundary` = `<ErrorBoundary>` (with TanStack `QueryErrorResetBoundary` on the client) + `<Suspense fallback={skeleton}>` + an `isEmpty` check:

| State | Public site | Admin |
| --- | --- | --- |
| Loading | Section-shaped `skeleton` with the same height as the real section (no layout shift). Server-rendered sections stream in behind `Suspense` | Skeleton rows/cards; background refetch shows a `spinner` in the header, never replaces data with a skeleton |
| Empty | Optional sections (featured, notes, skills, principles) are **hidden**, and the section's nav anchor too. Main lists (projects, notes) show `empty` with a chrome message ("No notes yet") | `empty` with a create action and shortcut ("New post · C") |
| Error | Inline `alert` (chrome text "Couldn't load this section" + Retry) inside the section frame; the rest of the page still renders. ISR keeps serving the last good page if a background revalidation fails | `alert` with Retry (`refetch` / `reset`) and the request id from the API error body |
| Partial translation | vi page shows the English field with `lang="en"` and a small "EN" badge | Locale tab shows a warning dot; publish blocked only if English is missing |

- **Critical data.** `GET /public/site` (settings, profile, nav, social links, sections) feeds the layout. If it fails, `app/[locale]/error.tsx` renders a minimal chrome-only page ("Something went wrong", Retry); there is no hard-coded name or headline fallback.
- **SEO.** `generateMetadata` reads the entity's `seoTitle`/`seoDescription`, falling back to `title`/`excerpt`, then `SiteSettings`. OG images render from the same data.

<h3 id="s-4-6">4.6 Data fetching: Next App Router + TanStack Query</h3>

**Rule of thumb: public pages are server-rendered from the API and cached; the admin is a client app powered by TanStack Query.**

| Surface | How it renders | Fetching | Cache / freshness |
| --- | --- | --- | --- |
| Public layout, home, about, projects list, case study, notes list (first page), post | React Server Components, static or ISR | `apiServer()` = `fetch(API_URL + path, { next: { tags, revalidate: 3600 } })` in Server Components. No TanStack on these renders | Tags per entity (`site`, `projects`, `project:{slug}`, `posts`, `post:{slug}`). On publish/update the API calls `POST /api/revalidate` (secret header) → `revalidateTag(...)`. Pages update within seconds, no rebuild |
| Notes search + tag filter (client island) | Client component under the server-rendered list | `useQuery({ queryKey: qk.public.posts({ locale, q, tag, page }), placeholderData: keepPreviousData })`; `initialData` = server-rendered first page when `q` is empty | `staleTime: 60s`; input debounced 200ms; request aborted via the `signal` TanStack passes to `queryFn` |
| Contact form | Client component (TanStack Form) | `useMutation({ mutationFn: submitContact })`, where `submitContact` is a **Server Action** that validates with the shared zod schema and calls `POST /public/contact` | No cache. Works without JS (form `action` = the same Server Action) |
| Page-view beacon | Client | `navigator.sendBeacon('/api/public/views')` | n/a |
| Admin layout | Server Component | Reads the session cookie, calls `GET /auth/me`; redirects to `/admin/login` on `401` | `cache: 'no-store'` |
| Admin pages (lists, editors, dashboard) | Server Component prefetch + client components | Server: `queryClient.prefetchQuery(...)` then `<HydrationBoundary state={dehydrate(queryClient)}>`. Client: `useSuspenseQuery` with the same key and `queryFn`, so first paint has data and later navigation is client-side | Defaults below |

Query client defaults (admin): `staleTime: 30_000`, `gcTime: 5 * 60_000`, `refetchOnWindowFocus: true`, `retry: (n, err) => err.status >= 500 && n < 2` (never retry 4xx), mutations `retry: 0`. One `QueryClient` per request on the server, one per browser tab on the client (`getQueryClient()` helper from the TanStack Next.js guide).

Query keys (`packages/contracts/src/query-keys.ts`), one factory so invalidation is predictable:

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

Patterns:

| Pattern | Where | How |
| --- | --- | --- |
| URL-driven lists | Every admin table | Sort, filters, page and page size live in the URL (`?status=DRAFT&sort=-updatedAt&page=2`). The URL is parsed with the zod `ListParams` schema → query key → TanStack Table runs with `manualPagination`, `manualSorting`, `manualFiltering`; `placeholderData: keepPreviousData` keeps rows while the next page loads |
| Optimistic update | Status toggle (draft ↔ published), reorder (`sortOrder`), mark message read, toggle `isVisible` | `onMutate`: cancel queries for the key, snapshot, `setQueryData` with the change. `onError`: restore the snapshot, error toast. `onSettled`: `invalidateQueries(qk.admin.all(entity))` |
| Non-optimistic write | Create, delete/archive, upload, publish with validation | Show `loading` on the button; on success `setQueryData(detail)` from the response + invalidate the list; navigate or toast |
| Autosave | Editors | TanStack Form `onChange` listener, debounced 1.5s → `useMutation(PATCH)`; body carries `updatedAt` as a version. API returns `409` if the row changed elsewhere → `SaveStatus` shows "Conflict" with "Load latest / Overwrite". Success writes the response into `qk.admin.detail` |
| Realtime | Inbox, dashboard | One `EventSource('/api/admin/events')` in the admin layout. On `contact.created`: `setQueryData(qk.admin.inbox.unread, n => n + 1)`, `invalidateQueries(qk.admin.list('messages', …))`, `sonner` toast with "Open". On `content.published`: invalidate that entity |
| Infinite + virtual list | Audit log, media library (hundreds to thousands of rows) | `useInfiniteQuery` (cursor = last id) + `useVirtualizer` from **TanStack Virtual**; fetch next page when the last virtual row is visible. Normal admin tables are paginated (25/50/100) and do **not** virtualise |
| Prefetch on intent | Admin rows, sidebar links | `queryClient.prefetchQuery(qk.admin.detail(...))` on hover/focus after 100ms |
| Error shape | All API errors | Nest returns `{ statusCode, code, message, requestId, fieldErrors? }`. `apiClient` throws `ApiError`; forms map `fieldErrors` onto TanStack Form fields; boundaries show `message` + `requestId` |

TanStack Form usage: contact form, login, every admin editor (profile, settings, project, post, experience, skill), and inline-editable cells (nav label, sort). Field arrays for `ProjectMetric` rows and nav items. Validators are the zod schemas from `packages/contracts` (`validators: { onChange: schema, onSubmit: schema }`), the same ones the Nest `ZodValidationPipe` runs.

<h3 id="s-4-7">4.7 Rich-layer components (v2)</h3>

All are product components in `packages/ui`, fed by props (section 4.5), each with skeleton / empty / error handled by `SectionBoundary`.

| Component | Data | Anatomy | States | A11y |
| --- | --- | --- | --- | --- |
| `Atmosphere` | `SiteSettings.ambientEffects` | Absolutely positioned layer: masked `--grid-line` grid + 1–2 orbs; `variant="hero" \| "cta"` | Off → renders nothing | `aria-hidden`, `pointer-events: none`; never inside `Prose` |
| `Band` | none | Full-width section wrapper with `--band` background and `border-y` | n/a | Section landmark with `aria-labelledby` its H2 |
| `SectionHeader` | `PageSection.title/intro`, `iconKey` | Icon tile (28px, `--muted` bg, `--primary` icon) + H2 (`text-heading`) + one-line intro (`text-body`, muted) + optional right link | No intro → title only | Icon `aria-hidden` |
| `Eyebrow` | chrome or `PageSection` | Mono, `text-eyebrow`, uppercase, `--primary` | n/a | Plain text, not a heading |
| `KickerPill` | `Profile.heroKicker` | Mono `>_` prompt glyph + text in a `--primary-subtle` pill, 28px tall | Missing → hidden | Prompt glyph `aria-hidden` |
| `AccentHeadline` | `Profile.headline`, `headlineAccent` | H1 with the accent substring wrapped in `<span class="text-primary">` | Accent not found in headline → plain H1 (admin validates) | One H1 per page |
| `MigrationDiagram` | featured `Project.versionFrom/To`, up to 6 `Skill` | SVG: left node `v1 · Vue 2`, right node `v2 · Nuxt 3`, 3–6 component nodes rewiring between them, labels in mono | Missing versions → shows the `ProcessStep` names as a vertical chain | `role="img"` + `aria-label` built from data ("Migration from Vue 2 to Nuxt 3: …"); text alternative under it in `sr-only` |
| `StatBand` / `StatItem` | `ProfileStat[]` | 2×2 (mobile) / 4-col (desktop): icon tile, number (`text-title`, heading font, `--primary`, `tabular-nums`), mono uppercase label | < 2 visible stats → section hidden | Number + label in one element; count-up does not change `aria-label` |
| `TechMarquee` | `Skill[]` where `showInMarquee` | Mono chips (`--card`, `--border`, 28px), 2 tracks; edge fade masks; pause button at the right end | < 6 skills → static row | Second track `aria-hidden`; pause button `aria-pressed`; static under reduced motion |
| `DomainCard` | `Domain` + project count | Icon tile tinted with hue, title, one-line description, mono count ("2 projects") top-right, 2px top edge in the hue on hover | 0 projects → card hidden | Whole card links to `/projects?domain=slug` |
| `PrincipleList` | `Principle[]` | 2-col list: mono `01 —` number + title (600) + body | Hidden if empty | `<ol>` |
| `ProcessFlow` | `ProcessStep[]` | Vertical chain of step cards joined by `↓` connectors; active step (the middle one) uses `--primary-subtle` and a glowing icon | < 3 steps → hidden | `<ol>`, connectors `aria-hidden` |
| `FeatureCard` (2×2) | `Principle` or `ProcessStep` | Icon tile + title + 2-line body on `--card-glass` | n/a | Not a link unless `href` |
| `CaseCard` | `Project` + `Domain` + top metric | Domain pill (icon + name, hue tint), `↗` corner icon, title (`text-subheading`), 2–3 line tagline, `DiffStat` line (top metric), mono tech chips (max 4, "+2") | No metric → chips only; confidential → "NDA" pill | Card is one link (title link + stretched `::after`); `↗` `aria-hidden` |
| `KeyFacts` | `Project.keyFacts` (2–4 lines) | 2×2 grid of small cards, each with a hue dot and one sentence | < 2 → hidden | `<ul>` |
| `FactChips` | `Project.factChips` | Mono chips row (`text-meta`, `--muted` bg) | Empty → hidden | `<ul>` |
| `RequirementColumns` | `Project.constraints` split by `### Functional` / `### Non-functional` in md | Two cards side by side, ▹ bullets in `--primary` | One heading → single card | Headings stay `h3` |
| `PostCard` | `Post` | Card row: mono date · minutes, title (`text-subheading`) + `↗`, 2-line excerpt, `#tag` mono chips | n/a | Title is the link |
| `CtaBand` | `PageSection(HOME, cta)` + `SocialLink.showInCta` | Centered: sparkle icon tile, H2, intro, primary button + up to 2 outline buttons; `Atmosphere variant="cta"` behind | No title → hidden | Email as "Copy email" button with toast; address only in `mailto:` |
| `ContentProgress` | none | 2px `--primary` bar under the header on case study and post, width = scroll progress | Hidden under reduced motion | `aria-hidden` (TOC is the accessible navigation) |

---

