# UI module conventions (Next.js)

Monorepo map and package rules: **[../../STRUCTURE.md](../../STRUCTURE.md)**. Build plan: [docs/PLAN.md](../../docs/PLAN.md).

This file covers how `apps/web` is laid out. It follows the conventions of Parker's Nuxt project ([interview-senior-fe/STRUCTURE.md](https://github.com/parker2808/interview-senior-fe/blob/main/STRUCTURE.md)), adapted to the Next.js App Router. Differences are listed at the end.

## Overview

```text
app/                      # thin route files (page.tsx, layout.tsx, route.ts) → module views
src/modules/              # feature UI (one folder per feature)
i18n/                     # next-intl config + locales/{en,vi}.json (fixed UI labels only)
e2e/                      # Playwright: public, contact, admin-publish, admin-pages, a11y, lighthouse
playwright.config.ts      # Chromium, one worker, starts Nest + Next against the test DB
proxy.ts                  # Next 16 (stands in for middleware.ts): locale routing, admin cookie guard, CSP nonce (T59); skips the cookie redirect when NEXT_PUBLIC_API_URL is set (D28)
next.config.ts            # standalone output, /api/* rewrite to NestJS, transpilePackages
Dockerfile                # multi-stage production image (compose.prod.yml)
components.json           # shadcn: points at packages/ui
```

Content (every visible string about Parker or the site) comes from the API. Shared visual components live in `packages/ui`, and request/response types come from `@portfolio/contracts`.

## Module layout

```text
src/modules/[module-name]/
├── components/               # PascalCase folders/files: block renderers, forms, islands
├── hooks/                    # use-*.hook.ts (TanStack Query wrappers, UI hooks)
├── services/                 # *.service.ts: calls to the NestJS API
├── actions/                  # *.action.ts: Server Actions ('use server'), only when a form needs one
├── stores/                   # *.store.tsx: React context for UI-only state (rare)
├── enums/                    # *.enum.ts
├── constants/                # *.constant.ts
├── types/entities/           # *.type.ts: view models only; API types come from contracts
├── utils/                    # *.util.ts
└── views/                    # page-level components (PascalCase), rendered by app/**/page.tsx
```

Create only the folders a module needs.

## Modules

| Module            | Owns                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Screens (spec §)                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `core`            | Site shell (`SiteHeader`, `SiteFooter`, `SkipLink`, `LocaleSwitch`, `ThemeToggle`, public `CommandPalette`), providers (theme nonce from `requestNonce`, `ApiWarmup` ping to `/api/health`), API clients (`NEXT_PUBLIC_API_URL` for Render), error and metadata utils, `PageViewBeacon` (`sendBeacon` to `/api/public/views`), `image-loader.util.ts` (next/image custom loader → 480/960/1600), `DraftBanner` (draft mode), `PreviewBridge` (T52a), `csp.util.ts` (T59 nonce CSP)                                                                                                                                                                                 | layout, `error.tsx` (§4.2, §4.5)        |
| `content`         | Markdown → React pipeline (server, Shiki): `services/markdown-to-hast.ts` + `utils/hast-to-react.util.ts` + `services/markdown.service.ts`, `components/Markdown/Markdown.tsx`, `utils/{toc,split-sections}.util.ts`, `constants/shiki-theme.constant.ts`; sanitize schema built from `@portfolio/contracts` `markdown.constant.ts`; admin preview Server Action `actions/preview.action.ts`                                                               | case study and post bodies (§3.2, §4.1) |
| `blocks`          | Public block rendering (PLAN D26): `BlocksPage` view, `BlockRenderer` (band grouping, `BlockLayout`, one `SectionBoundary` per block, skips unknown types), the renderer registry `constants/block-renderers.constant.ts` (`satisfies Record<BlockType, …>`), one `[Name]Block` container per block type (`HeroBlock`, `CaseGridBlock`, `ProseBlock`, `ProjectsBrowserBlock`, …), `UnknownBlockNotice` (draft mode), `pages.service.ts` (tag `page:{key}`) | §5.1–§5.6                               |
| `home`            | `HomeIndex` view (renders `BlocksPage` for `home`); `process-steps.service.ts`                                                                                                                                                                                                                                                                                                                                                                             | §5.1                                    |
| `about`           | `AboutIndex` (renders `BlocksPage` for `about`); experience, education, principles and skills services                                                                                                                                                                                                                                                                                                                                                     | §5.2                                    |
| `projects`        | `ProjectsIndex`, `ProjectsDetail`, filters island, case-study header/meta/sections/TOC; `projects.service.ts` + `domains.service.ts`                                                                                                                                                                                                                                                                                                                       | §5.3, §5.4                              |
| `notes`           | `NotesIndex`, `NotesDetail`, search island (TanStack Query), `notes-browser`; `posts.service.ts` + `posts-client.service.ts`                                                                                                                                                                                                                                                                                                                               | §5.5                                    |
| `contact`         | `ContactIndex` (`BlocksPage` for `contact`), `ContactFormBlock` (H1 + channels + form), `ContactForm` (TanStack Form + Server Action, works without JS), `ChannelCards` (email only in `mailto:` / copy handler)                                                                                                                                                                                                                                           | §5.6                                    |
| `seo`             | `generateMetadata` builders (site/home/about/projects/project/notes/post/contact), `JsonLd` (Person/CreativeWork/BlogPosting/BreadcrumbList), `OgImage` (1200×630), sitemap + RSS builders; `GET /public/sitemap` client                                                                                                                                                                                                                                  | §5 intro                                |
| `admin-core`      | `AdminShell`, sidebar, topbar, admin `CommandPalette`, `NotificationBell`, `EditorShell`, `PublishActions` (status pill + publish/unpublish + draft preview link), `MarkdownField` (TanStack Form field ↔ Tiptap `MarkdownEditor`, loaded with `next/dynamic` `ssr: false` so Tiptap stays out of public bundles), `RoleGate` (shows children for `admin` or `user` only), `useMe`/`useIsAdmin`, SSE hook, URL list-params hook, autosave hook, dirty guard, `SchemaForm` (`schema-to-fields` + zod 4 `toJSONSchema`) | §4.3                                    |
| `admin-auth`      | `AdminAuthLogin` view (silent refresh, then login form), `ChangePasswordDialog`, `safe-next.util.ts`                                                                                                                                                                                                                                                                                                                                                       | §4.6                                    |
| `admin-dashboard` | `AdminDashboardIndex`, stat/health/inbox/activity/chart cards                                                                                                                                                                                                                                                                                                                                                                                              | §5.7, §5.11                             |
| `admin-projects`  | projects table + editor (incl. "Card & facts", metrics, live preview)                                                                                                                                                                                                                                                                                                                                                                                      | §5.8, §5.9, §5.11                       |
| `admin-posts`     | posts table + editor                                                                                                                                                                                                                                                                                                                                                                                                                                       | §5.8, §5.9                              |
| `admin-about`     | experience, education, principles, profile stats, process steps                                                                                                                                                                                                                                                                                                                                                                                            | §5.8, §5.11                             |
| `admin-taxonomy`  | skills, skill categories, tags, domains (hue + icon pickers)                                                                                                                                                                                                                                                                                                                                                                                               | §5.11                                   |
| `admin-site`      | settings, profile, navigation, social links, contact topics                                                                                                                                                                                                                                                                                                                                                                                                | §5.10                                   |
| `admin-pages`     | page builder + T52a publish: `BlockList`, `AddBlockDialog`, `BlockInspector`, `PageSettingsSheet`, `PublishBar`, `VersionHistory`, `PagePreview` (iframe of `/api/draft`), `block-editor-meta.constant.ts`                                                                                                                                                                                                                                                | §5.10 (Sections), D26                   |
| `admin-media`     | media library (`AdminMediaIndex` + infinite/virtual grid), XHR `media-upload.service` (progress + cancel), `MediaPickerDialog` / `MediaField` used by project/post/profile/settings and `MarkdownField`                                                                                                                                                                                                                                                    | §4.3                                    |
| `admin-inbox`     | contact messages list/detail (`AdminInboxIndex`, `AdminInboxDetail`, optimistic mark read/spam). SSE + unread badge live in `admin-core` (`useAdminEvents`, `NotificationBell`)                                                                                                                                                                                                                                                                          | §4.3                                    |
| `admin-insights`  | `AdminInsightsAnalytics` (area chart + hidden table + period toggle); `AdminInsightsAudit` (infinite + virtual audit list + entity/user filters); bulk archive helpers for projects/posts                                                                                                                                                                                                                                                                  | §5.7                                    |
| `admin-users`     | users table + sheet form: role (`admin`/`user`), active switch, sign out everywhere, set password (admin only). Change-own-password lives in `admin-auth/ChangePasswordDialog`                                                                                                                                                                                                                                                                             | §4.3                                    |

## Routes ↔ views

`app/` only wires the route. The UI lives in the module view:

```tsx
// app/[locale]/(site)/projects/[slug]/page.tsx
import { ProjectsDetail } from '@/modules/projects/views/ProjectsDetail';
import { buildProjectMetadata } from '@/modules/seo/utils/build-project-metadata.util';

export const generateMetadata = buildProjectMetadata;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  return <ProjectsDetail locale={locale} slug={slug} />;
}
```

A route file may export Next's route-level hooks (`generateMetadata`, `generateStaticParams`, `revalidate`), read `params`, and render one view. Nothing else goes in it.

```text
app/
├── [locale]/                      # root layout #1: <html lang>, fonts, providers
│   ├── layout.tsx
│   └── (site)/
│       ├── layout.tsx             # → core SiteShell (header, footer, beacon)
│       ├── page.tsx               # → home/views/HomeIndex + generateMetadata
│       ├── opengraph-image.tsx    # 1200×630 ImageResponse from CMS
│       ├── about/page.tsx         # → about/views/AboutIndex
│       ├── projects/page.tsx      # → projects/views/ProjectsIndex
│       ├── projects/[slug]/page.tsx + opengraph-image.tsx
│       ├── notes/page.tsx         # → notes/views/NotesIndex
│       ├── notes/[slug]/page.tsx + opengraph-image.tsx
│       ├── contact/page.tsx       # → contact/views/ContactIndex
│       ├── error.tsx, not-found.tsx
│       └── rss.xml/route.ts
├── admin/                         # root layout #2: admin is English chrome, not localized
│   ├── layout.tsx
│   ├── login/page.tsx             # → admin-auth/views/AdminAuthLogin (tries POST /api/auth/refresh first)
│   └── (cms)/
│       ├── layout.tsx             # server check GET /auth/me (forwards access_token) → redirect; → admin-core AdminShell
│       ├── page.tsx               # → admin-dashboard/views/AdminDashboardIndex
│       ├── projects/page.tsx, projects/new/page.tsx, projects/[id]/page.tsx
│       ├── posts/page.tsx, posts/new/page.tsx, posts/[id]/page.tsx
│       ├── experience/page.tsx, experience/new/page.tsx, experience/[id]/page.tsx
│       ├── education/page.tsx, principles/page.tsx, stats/page.tsx, process/page.tsx
│       ├── skills/page.tsx, tags/page.tsx, domains/page.tsx
│       ├── site/page.tsx, profile/page.tsx
│       ├── pages/page.tsx         # → admin-pages/views/AdminPagesIndex
│       ├── pages/[key]/page.tsx   # → admin-pages/views/AdminPagesEditor (page builder)
│       ├── inbox/page.tsx, inbox/[id]/page.tsx
│       ├── analytics/page.tsx     # → admin-insights/views/AdminInsightsAnalytics
│       ├── audit/page.tsx         # → admin-insights/views/AdminInsightsAudit
│       └── …                      # one folder per admin module
├── api/revalidate/route.ts        # the only Next-owned /api routes (handlers win over the rewrite)
├── api/draft/route.ts
├── sitemap.ts, robots.ts
└── globals.css                    # imports @portfolio/ui tokens + Tailwind @source for packages/ui
```

There is no `app/layout.tsx`. `[locale]/layout.tsx` and `admin/layout.tsx` are the two root layouts.

## Components: where they go

1. **`packages/ui/src/components/ui/`**: shadcn primitives (`button`, `dialog`, …). Never edited for one feature.
2. **`packages/ui/src/components/[Name]/`**: shared, pure product components (`CaseCard`, `StatBand`, `Prose`, `DataTable`). They take props only, never fetch, and import nothing from Next.
3. **`src/modules/core/components/`**: app-wide components that need Next, next-intl or next-themes (`SiteHeader`, `LocaleSwitch`).
4. **`src/modules/[module]/components/`**: used by one feature only (`StatBandBlock`, `ProjectEditorForm`).

Move a component up a level only when a second feature needs it.

**Server vs client.** Files are Server Components by default. A file that uses state, effects, browser APIs or TanStack hooks starts with `'use client'`. Keep client files small: islands (`NotesSearch`, `ContactForm`, `TechMarquee` pause button) inside server-rendered views.

## Data: services, hooks, actions

- **`services/*.service.ts`** are plain async functions that call the API. Two kinds:
  - **Server services** (public site) start with `import 'server-only'` and use `apiServer()` from `core/services/api-server.service.ts` (`fetch` with `next.tags`, spec §4.6). Views and block containers `await` them directly.
  - **Client services** (admin, notes search) use `apiClient()` from `core/services/api-client.service.ts` (same-origin `/api/*`, throws `ApiError`). For admin calls, a 401 triggers one shared `POST /api/auth/refresh` and one retry.
  - **Auth tokens are never handled in web code.** The API sets them as httpOnly cookies (`access_token`, `refresh_token`) and the browser sends them through the `/api/*` rewrite. Server code that calls admin routes uses `apiServer(path, { withAuth: true })`, which forwards only `access_token` from `cookies()`. No token in `localStorage`, state or props.
- **`hooks/use-*.hook.ts`** wrap client services in TanStack Query/Form, using keys from `qk` in `@portfolio/contracts` (`use-admin-projects.hook.ts` → `useAdminProjects(params)`).
- **`actions/*.action.ts`** are Server Actions, used only where a form must work without JS (contact).
- Never `fetch` in a component or in `useEffect`.

## State

- Server data lives in TanStack Query (client) or in the RSC render (server). It is not copied into a store.
- URL state (filters, sort, page, `?q=`) lives in the URL and is parsed with the zod `ListParams` schema.
- UI-only state that several components share (admin sidebar collapsed, palette open) goes in `stores/*.store.tsx`: a React context + `useReducer`, exported as `AdminUiProvider` and `useAdminUi()`. No global store library.

## i18n

- Locales: `en` (default), `vi`. Public URLs are prefixed (`/en/projects`, `/vi/projects`). `/admin` is not localized.
- `i18n/locales/{en,vi}.json` holds fixed UI labels only (buttons, form labels, validation, empty/error messages, aria labels, "min read"). Keys are grouped by module: `{ "contact": { "send": "…" } }`.
- `i18n/routing.ts` (locales, default) and `i18n/request.ts` (loads messages) are next-intl config.
- Content arrives already localized from `/api/public/*?locale=`. Components never pick `titleEn`/`titleVi`. When the API falls back to English it sends `lang: "en"`, and the component sets `lang` on that element.
- `react/jsx-no-literals` fails the lint on hard-coded text in `app/**` and `src/modules/**/components|views`.

## Naming

- **React components / views**: PascalCase folder + file (`SiteHeader/SiteHeader.tsx`); views are `[Module][Screen].tsx` (`ProjectsIndex.tsx`, `ProjectsDetail.tsx`, `AdminProjectsEditor.tsx`)
- **Everything else**: kebab-case + suffix (`use-notes-search.hook.ts`, `projects.service.ts`, `contact.action.ts`, `block-renderers.constant.ts`, `admin-ui.store.tsx`)
- **Module dirs**: kebab-case (`admin-projects/`)
- **Tests**: next to the file, `*.test.ts(x)` (Vitest + Testing Library); browser flows in `e2e/*.spec.ts`
- **Alias**: `@/*` → `src/*`
- **Named exports** everywhere except Next route files (which need `export default`)

## New UI module

```bash
MODULE_NAME="your-module-name" && mkdir -p "src/modules/$MODULE_NAME"/{components,hooks,services,constants,utils,views,types/entities}
```

Add `actions/`, `stores/` or `enums/` only when the module needs them.

## Differences from the Nuxt project

| Nuxt (interview-senior-fe)          | Next.js (here)                                                                            | Why                                                                                                                                     |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/*.vue` thin wrappers         | `app/**/page.tsx` thin wrappers                                                           | Same idea. Next route files also carry `generateMetadata` / `generateStaticParams`, so they may export those besides rendering the view |
| `layouts/default.vue`               | `app/[locale]/(site)/layout.tsx` → `core` `SiteShell`                                     | Next layouts are nested route files, not a separate folder                                                                              |
| `composables/*.composable.ts`       | `hooks/*.hook.ts`                                                                         | React calls them hooks; the rules (`use` prefix, top-level calls) differ from composables                                               |
| `useState` / composable singletons  | `stores/*.store.tsx` (React context) or TanStack Query                                    | React has no built-in shared reactive state; server data stays in Query                                                                 |
| `plugins/*.client.ts`               | `core/components/Providers/` (`ThemeProvider`, `QueryProvider`, `NextIntlClientProvider`) | React wires app-wide behavior through provider components                                                                               |
| `server/api/` (Nitro)               | NestJS in `apps/api`; Next keeps only `app/api/revalidate` and `app/api/draft`            | The backend is a separate app                                                                                                           |
| `$fetch` in services                | `apiServer()` (RSC, cache tags) / `apiClient()` (browser)                                 | Server Components fetch on the server with Next's cache                                                                                 |
| `@nuxtjs/i18n`, `no_prefix`, cookie | next-intl, `/[locale]` prefix                                                             | The spec requires `hreflang` and per-locale URLs for SEO                                                                                |
| —                                   | `actions/*.action.ts`, `'use client'`                                                     | Next-only concepts: Server Actions and the server/client component split                                                                |
| Components in the module            | Shared, pure components in `packages/ui`                                                  | The admin live preview renders the same components, and Storybook tests them in isolation                                               |
