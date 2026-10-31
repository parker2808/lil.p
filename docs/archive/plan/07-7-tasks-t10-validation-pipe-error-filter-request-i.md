<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T10 · Validation pipe, error filter, request id, logging); links re-pointed. Index: ../../PLAN.md -->

#### T10 · Validation pipe, error filter, request id, logging

**Roadmap** p08 · **Spec** §1.6, §4.6 ("Error shape") · **Depends** T09 · **Size** M

**Goal.** Every bad input returns 400 with field errors, every error has the same body (D5) and a request id, and every request is logged without leaking data.

**Scope.**
- `common/pipes/zod-validation.pipe.ts`: `new ZodValidationPipe(schema)` for `@Query()`, `@Body()`, `@Param()`; on failure throws a 400 with `fieldErrors` keyed by path.
- `common/filters/all-exceptions.filter.ts` (global): `HttpException` → its status; zod error → 400 `VALIDATION_FAILED`; Prisma `P2002` → 409 `CONFLICT` with `fieldErrors` on the unique field; `P2025` → 404 `NOT_FOUND`; anything else → 500 `INTERNAL` with a generic message (stack logged, never returned).
- `common/middleware/request-id.middleware.ts`: reuse an incoming `x-request-id` or create one; return it as a header and in error bodies.
- `common/interceptors/logging.interceptor.ts`: one line per request (method, path, status, ms, request id). Never bodies, passwords, cookies or emails.
- `contracts/common/api-error.schema.ts`: final error body + `ErrorCode` enum. `@Locale()` now validates through the pipe.
- Unit tests for the filter mapping and the pipe.

**Files.** `apps/api/src/common/pipes/zod-validation.pipe.ts` (+ `.spec.ts`), `apps/api/src/common/filters/all-exceptions.filter.ts` (+ `.spec.ts`), `apps/api/src/common/middleware/request-id.middleware.ts`, `apps/api/src/common/interceptors/logging.interceptor.ts`, `apps/api/src/app.module.ts`, `apps/api/src/i18n/locale.decorator.ts`, `packages/contracts/src/common/api-error.schema.ts`.

**Design.** Spec §4.6 error shape.

**Backend steps, explained.**
1. **The request pipeline.** Read the diagram in [api STRUCTURE](../../../apps/api/STRUCTURE.md#how-a-request-flows): middleware → guards → pipes → controller → service, and the filter catches anything thrown along the way.
2. **Pipe.** Runs just before the controller, checks the input against a zod schema, and either passes the parsed value on or throws 400. Controllers can then trust their arguments.
3. **Filter.** One place that turns every error (yours, Nest's, Prisma's) into the same JSON body. The web's `ApiError` (T11) depends on this shape.
4. **Prisma error codes.** `P2002` means "unique constraint failed" (e.g. a duplicate slug) → 409. `P2025` means "record not found" → 404. Mapping them once means services do not need try/catch everywhere.
5. **Request id.** A random id per request, returned in the header and the error body and printed in the log, so a screenshot of an error can be matched to the log line.
6. **Logging.** Log what happened, never what was sent. Bodies can contain passwords and email addresses.

**Acceptance.**
- [ ] `GET /api/public/site?locale=fr` returns 400 with `fieldErrors.locale` in the shared shape (roadmap p08).
- [ ] An unknown route returns 404 in the same shape; a thrown `Error` returns 500 with no stack in the body.
- [ ] The `x-request-id` response header equals `requestId` in the error body.
- [ ] `@portfolio/contracts` types are imported by `apps/api`, and by `apps/web` from T11 (roadmap p08, adjusted by D2).

**PR title:** `feat(contracts): zod contracts + error filter`

#### T10a · Block registry contracts + `GET /api/public/pages/:key`

**Roadmap** p08 · **Spec** §1.5 (`PageSection`, replaced by D26), §4.5 (ordering and visibility), §5.0 · **Depends** T10 · **Size** M

**Goal.** One place in code that says which block types exist and what their props look like, and a public endpoint that returns a page's visible, valid blocks in one language, so one bad row can never break a page.

**Scope.**
- Contracts `packages/contracts/src/blocks/`:
  - `localized.schema.ts`: `localizedText({ max })` and `localizedMarkdown()` (a `{ en, vi }` pair; English required when the field is required, Vietnamese may be empty), `routeHref()` (a route from `routes.constant.ts`), `sectionHeadingSchema` (`eyebrow`, `title`, `intro`, `iconKey`, optional `link` with label + route).
  - `block-layout.constant.ts`: `LAYOUT_PRESETS` (`ONE`, `TWO`, `THREE`, `FOUR`, `SPLIT_8_4`, `SPLIT_4_8`, `SPLIT_7_5`) with their columns per breakpoint (the §4 table) and `BLOCK_SURFACES` (`PLAIN`, `BAND`).
  - `define-block.util.ts`: `defineBlock({ type, version, props, defaults, pages, layouts, maxPerPage, role, migrate, refs })`. `role` is `h1` (first, visible, never deleted), `required` (never deleted or hidden) or `optional`. `migrate(props, fromVersion)` upgrades props saved under an older `version`. `refs(props)` lists the ids the props point at (projects, stats, tags), so T32a can check they exist.
  - `definitions/hero.block.ts`, `definitions/page-header.block.ts`, `definitions/cta-band.block.ts`: the first three types (catalog in §4). Every field carries `.meta({ widget, label })`: `label` is an `admin.blocks.*` key in `en.json` (D22), never text, and `widget` tells the generated form which input to draw (T45a).
  - `block-registry.constant.ts`: `BLOCK_REGISTRY` (`type` → definition), `BlockType`, `blockTypeSchema`.
  - `block.schema.ts` + `block.type.ts`: `adminBlockSchema` (both languages, plus `issues` for an invalid row), `publicBlockSchema` (`{ id, type, key, layout, surface, props, lang }`), `blockKeySchema` (kebab-case, at most 48 characters).
  - `resolve-block.util.ts`: `parseBlock(row)` runs `migrate`, then the props schema, and returns `{ ok: true, block }` or `{ ok: false, reason: 'UNKNOWN_TYPE' | 'INVALID_PROPS', issues }`. `resolveBlockLocale(props, locale)` replaces every `{ en, vi }` pair with one string and applies D19 to the whole block (`lang: "en"` when any Vietnamese value is missing).
- Contracts `pages/`: `pages.enum.ts` (`PageKey`, `LayoutPreset`, `BlockSurface`, mirrored from Prisma), `pages.schema.ts` (`publicPageSchema`: `{ key, seo, blocks }`), `pages.type.ts`. Page keys are lowercase in URLs and cache tags (`/public/pages/home`, `page:home`).
- API `modules/pages/`: `pages.service.ts` loads the `Page` and its visible `PageBlock`s by `sortOrder` and passes every row through `parseBlock`. An unknown or invalid row is dropped and logged once as a warning with page key, block id, type and request id (never the props). `public-pages.controller.ts`: `GET /public/pages/:key?locale` (`:key` parsed with `PageKey` through the T10 pipe; unknown key → 404 `NOT_FOUND`). `entities/page.entity.ts`, `entities/page.mapper.ts` (locale per block, SEO group per D19).
- Seed: rows in `pages.data.ts` are checked with `parseBlock` for the types that exist. Rows of types added later stay in the seed and are dropped at read time until their task lands (T24, T25, T26, T28, T48).
- Tests: `resolve-block.util.test.ts` (unknown type, invalid props, `migrate` from an older `version`, locale fallback), `pages.service.spec.ts`; `api.http` with `?locale=en` and `?locale=vi`.

**Out of scope.** Rendering (T14). Writes (T32a). Versions and publishing (T52a): until then visitors see the current rows, like every other table before T52.

**Files.** `packages/contracts/src/blocks/{localized.schema.ts,block-layout.constant.ts,define-block.util.ts,block-registry.constant.ts,block.schema.ts,block.type.ts,resolve-block.util.ts,resolve-block.util.test.ts}`, `packages/contracts/src/blocks/definitions/{hero,page-header,cta-band}.block.ts`, `packages/contracts/src/pages/{pages.schema.ts,pages.type.ts,pages.enum.ts}`, `packages/contracts/src/index.ts`, `apps/api/src/modules/pages/{pages.module.ts,public-pages.controller.ts,pages.service.ts,pages.service.spec.ts,entities/page.entity.ts,entities/page.mapper.ts}`, `apps/api/src/app.module.ts`, `apps/api/prisma/seed/data/pages.data.ts`, `apps/api/api.http` ([root STRUCTURE: contracts](../../../STRUCTURE.md#package-layout-packagescontracts), [api: pages and blocks](../../../apps/api/STRUCTURE.md#pages-and-blocks)).

**Design.** §4 block catalog and layout presets. Spec §1.5 conventions (`sortOrder`, `isVisible`, En/Vi pairs, here as `{ en, vi }` inside JSON).

**Backend steps, explained.**
1. **A JSON column.** `PageBlock.props` is a MySQL `JSON` column, so every row can hold a different shape, which is what blocks need (a hero and a post list have different settings). MySQL only checks that the value is valid JSON. It does not know the shape, so the API checks it with zod on every write (T32a) *and* every read, because a row can also be changed by hand in Adminer or written by an older version of the code.
2. **The registry is code, the content is data.** Which block types exist and which props they take is decided in code and reviewed in PRs. Which blocks a page shows, in which order and with which text, is data in MySQL, edited in `/admin`. An admin can add more blocks of a known type but cannot invent a new type.
3. **Fail safe, not fail loud.** One broken block must not take the home page down. The service skips it, logs one warning you can find by request id, and returns the rest. The builder (T45b) shows the broken block to the admin so it gets fixed.
4. **Schema versions.** When a block's props change shape (a field is renamed), bump its `version` and write `migrate`. Old rows and old published snapshots are upgraded when they are read, so nothing in the DB has to be rewritten, and restoring an old version still works.
5. **References inside JSON have no foreign keys.** MySQL does not check `projectIds: [3, 7]` inside JSON, so a project can be archived while a block still points at it. The renderer skips missing ids, T32a checks ids on write, and content health lists the dangling ones (T52a).

**Acceptance.**
- [ ] `GET /api/public/pages/home?locale=vi` returns the visible blocks in `sortOrder`, with flat text props and a `lang` per block.
- [ ] A row with an unknown `type` or invalid `props`, inserted in Adminer, is missing from the response, the request still returns 200, and the log has one warning with its id.
- [ ] Clearing one Vietnamese value in a block makes only that block English with `lang: "en"`.
- [ ] Unit tests cover `parseBlock` (unknown type, invalid props, `migrate` from an older `version`) and `resolveBlockLocale`.
- [ ] `GET /api/public/pages/unknown` returns 404 in the shared error shape.

**PR title:** `feat(contracts): block registry + public pages`

#### T11 · Web data layer + next-intl + root layout

**Roadmap** p09 · **Spec** [§4.6](../../design/portfolio-design-system.md#s-4-6), §4.5, §5 intro · **Depends** T05, T09 · **Size** L

**Goal.** The web app reads the API on the server with cache tags, has the `/en` and `/vi` routes, and has the client data layer (TanStack Query, `ApiError`, `qk`) ready for islands and the admin.

**Scope.**
- next-intl: `i18n/routing.ts` (locales `en`, `vi`; default `en`; prefix always), `i18n/request.ts`, `i18n/navigation.ts` (`Link`, `redirect`, `usePathname`), `i18n/locales/en.json` + `vi.json` (first keys: `core.*`, `states.*`), `middleware.ts` (matcher skips `/api`, `/admin`, `/_next`, files). Use `proxy.ts` instead if on Next 16.
- Delete the temporary `app/layout.tsx`, `app/page.tsx` and `CoreSpecimen` from T05 (Storybook keeps the foundations). Add `app/[locale]/layout.tsx` (root layout: `<html lang>`, fonts, `Providers`, `generateStaticParams`, `setRequestLocale`), `app/[locale]/(site)/layout.tsx` (plain wrapper until T14), `app/[locale]/(site)/page.tsx` → `home/views/HomeIndex` (temporary: renders `profile.displayName` and `headline` with their `lang`; T14 replaces it).
- `next.config.ts`: rewrite `/api/:path*` → `${API_URL}/api/:path*` (default `afterFiles`, so `app/api/*` handlers added later win), `createNextIntlPlugin`.
- `core/services/api-server.service.ts` (`import 'server-only'`; `apiServer(path, { locale, tags, schema? })`; `revalidate` per D23; non-2xx → `ApiError`).
- `core/services/api-client.service.ts` (same-origin `/api`, forwards `signal`, throws `ApiError`).
- `core/services/site.service.ts` (`getSite(locale)`, tag `site`, wrapped in React `cache()`).
- `core/utils/api-error.util.ts` (`ApiError` with `status`, `code`, `requestId`, `fieldErrors`), `core/utils/query-client.util.ts` (`getQueryClient()` with the §4.6 defaults), `core/components/Providers/{Providers,QueryProvider}.tsx`.
- `packages/contracts/src/constants/query-keys.constant.ts`: the `qk` factory from §4.6.
- ESLint `react/jsx-no-literals` on `app/**`, `src/modules/**/components/**`, `src/modules/**/views/**` and `packages/ui/src/components/**` (allowlist: punctuation, `·`, `→`, `—`).
- Unit tests: `apiServer` error mapping, `apiClient` abort.

**Out of scope.** Header, footer, hero (T14). Admin root layout (T37).

**Files.** `apps/web/middleware.ts`, `apps/web/next.config.ts`, `apps/web/i18n/{routing.ts,request.ts,navigation.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `apps/web/app/[locale]/layout.tsx`, `apps/web/app/[locale]/(site)/{layout.tsx,page.tsx}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts,site.service.ts}`, `apps/web/src/modules/core/utils/{api-error.util.ts,query-client.util.ts}`, `apps/web/src/modules/core/components/Providers/{Providers.tsx,QueryProvider.tsx}`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `packages/contracts/src/constants/query-keys.constant.ts`, `eslint.config.mjs` ([web STRUCTURE: data](../../../apps/web/STRUCTURE.md#data-services-hooks-actions), [i18n](../../../apps/web/STRUCTURE.md#i18n)).

**Design.** None visible beyond the temporary home text.

**Acceptance.**
- [ ] `/` redirects to `/en`; `/en` and `/vi` render the seeded headline; `<html lang>` matches the locale.
- [ ] Changing a seed value and re-seeding changes the page (roadmap p09).
- [ ] `curl localhost:3000/api/health` returns the API's response (rewrite works).
- [ ] A literal string in a view fails `pnpm lint`.
- [ ] There is no `app/layout.tsx`.

**PR title:** `feat(web): data layer, i18n and locale layout`

#### T12 · UI primitives matching Figma component sets

**Roadmap** p09 (prep) · **Spec** [§4.0](../../design/portfolio-design-system.md#s-4-0), [§4.1](../../design/portfolio-design-system.md#s-4-1), §4.7 (`Eyebrow`, `KickerPill`) · **Depends** T06 · **Size** M

**Goal.** The base components every screen uses, matching the Figma component sets variant for variant, each with stories and tests.

**Scope.**
- shadcn (`pnpm --filter @portfolio/ui dlx shadcn@latest add …`): `button`, `badge`, `input`, `textarea`, `label`, `field`, `card`, `skeleton`, `separator`, `tooltip`, `kbd`, `spinner`.
- Customize per §4.0/§4.1 and the Figma sets (§5 table):
  - `button`: variants `default` (Primary), `secondary`, `outline`, `ghost`, `destructive`, `link` (underlined); sizes `sm` 28, `default` 32 (Admin), `lg` 40 (Public); `loading` prop (spinner, keeps width, `aria-busy`); 44px hit area on coarse pointers.
  - `badge`: variants `neutral`, `primary`, `success`, `warning`, `destructive`, `info`, `outline` + `hue` (`jade`, `amber`, `blue`, `violet`, `rose`, using `--hue-*` and `--hue-*-subtle`); `subtle` / `outline` styles.
  - `input` / `field`: states Default, Focus, Error (`aria-invalid`), Disabled; `FieldError` wired to `aria-describedby`.
  - `skeleton`: shimmer off under reduced motion.
- Custom product components: `Eyebrow` (tone `primary` | `subtle`, mono, `text-eyebrow`), `KickerPill` (`>_` glyph `aria-hidden`), `NavLink` (state default/active → `aria-current="page"`, `asChild` so the web passes next-intl `Link`), `VersionTag` (`from`, `to`, arrow label passed as a prop).
- One story per component showing every Figma variant in both themes; tests for `Button` loading, `NavLink` active, `Badge` hue.

**Out of scope.** State components and atmosphere (T13). Cards (T20).

**Files.** `packages/ui/src/components/ui/{button,badge,input,textarea,label,field,card,skeleton,separator,tooltip,kbd,spinner}.tsx`, `packages/ui/src/components/{Eyebrow,KickerPill,NavLink,VersionTag}/{Name.tsx,Name.stories.tsx,Name.test.tsx}`, stories for the shadcn primitives in `packages/ui/src/components/ui/*.stories.tsx`.

**Design.** Figma page `1:2`: sets Button (40), Badge/Pill (22), Eyebrow (4), Input (8), Kicker pill (2), Nav link (4). Mockup `foundations.html`. Tokens: `--primary`, `--primary-hover`, `--primary-subtle`, `--primary-foreground`, `--secondary`, `--destructive`, `--border`, `--border-strong`, `--input`, `--ring`, `--hue-*`, `--radius-sm`/`--radius-md`, `text-ui`, `text-body`, `text-meta`, `text-eyebrow`.

**Acceptance.**
- [ ] Every Figma variant has a story, in light and dark; screenshots compared with the Figma sets.
- [ ] Control heights: 28 / 32 / 40px; focus ring visible on every interactive primitive.
- [ ] Storybook a11y panel: 0 violations.
- [ ] Hue pills pass 4.5:1 text contrast in both themes (spec §7.2 acceptance (c)).

**PR title:** `feat(ui): primitives from figma component sets`

#### T13 · States + atmosphere components

**Roadmap** p09 · **Spec** [§4.5](../../design/portfolio-design-system.md#s-4-5), [§4.7](../../design/portfolio-design-system.md#s-4-7), §3.1b, §3.4, §4.3 (`StatusPill`) · **Depends** T12 · **Size** M

**Goal.** The components that handle loading, empty and error states, and the v2 atmosphere layer, so every section can be wrapped the same way.

**Scope.**
- shadcn: `alert`, `empty`.
- `SectionBoundary` (client): error boundary + `Suspense` + `isEmpty` check; props `fallback` (skeleton), `onReset`, `hideWhenEmpty`, `labels` (error text, retry). The web wraps it with TanStack's `QueryErrorResetBoundary` where needed, so `packages/ui` stays free of TanStack Query.
- `ErrorState` (message, request id, retry button), `StatusPill` (draft / published / archived, icon + text, labels as props), `Band` (full-width `--band` + `border-y`, `aria-labelledby`), `SectionHeader` (28px icon tile + H2 `text-heading` + intro + optional right link).
- `packages/contracts/src/constants/icons.constant.ts` (~40 allowlisted lucide names, `iconKeySchema`) and `Icon` in `packages/ui` (maps an `IconKey` to a lucide component; unknown key renders nothing).
- `Atmosphere` (`variant="hero" | "cta"`, `enabled`; masked `--grid-line` grid + 1–2 `--glow` orbs; `aria-hidden`, `pointer-events: none`), `AccentHeadline` (wraps the accent substring in `text-primary`; plain H1 if not found), `CtaBand` (layout: icon tile, H2, intro, action slots, `Atmosphere variant="cta"`).
- `hooks/use-in-view.hook.ts` + `Reveal` (fade/slide in; under reduced motion content is visible at once).
- Stories with reduced-motion and reduced-transparency toggles; tests for `AccentHeadline`, `SectionBoundary` states, `Icon` with an unknown key.

**Files.** `packages/ui/src/components/ui/{alert,empty}.tsx`, `packages/ui/src/components/{SectionBoundary,ErrorState,StatusPill,Band,SectionHeader,Icon,Atmosphere,AccentHeadline,CtaBand,Reveal}/*`, `packages/ui/src/hooks/use-in-view.hook.ts`, `packages/contracts/src/constants/icons.constant.ts`.

**Design.** Figma `21:2` (home loading), hero and CTA areas of `2:2`/`3:2`. Mockups `home-skeleton.html`, `home.html` (hero, CTA band, section headers). Spec §7.1 G1, G3, G4. Tokens: `--band`, `--grid-line`, `--glow`, `--card-glass`, `--shadow-glow`, `--primary-subtle`, `--muted`, motion easings.

**Acceptance.**
- [ ] Stories show loading, empty and error for `SectionBoundary`; the error story shows a request id and Retry.
- [ ] `Atmosphere` renders nothing when `enabled={false}` and is `aria-hidden` otherwise.
- [ ] With reduced motion on, nothing moves in any story (spec §6 Day 2 v2 check).
- [ ] `StatusPill` shows text in every state (never color only).

**PR title:** `feat(ui): state and atmosphere components`

#### T14 · Site shell + home hero/CTA from the API + content check

**Roadmap** p09 · **Spec** [§4.2](../../design/portfolio-design-system.md#s-4-2), §4.5, [§5.1](../../design/portfolio-design-system.md#s-5-1), §7.1 · **Depends** T11, T13 · **Size** L

**Goal.** The real public layout (header, footer, skip link, locale and theme switches, mobile menu, ⌘K) from `GET /public/site`, the block renderer, and the first home blocks (hero, CTA band) from `GET /public/pages/home`, plus the script that keeps content and personal data out of the code.

**Scope.**
- `core` components: `SiteShell`, `SiteHeader` (sticky, 80% `--background` + blur, `--shadow-1` after scroll; header `NavItem`s via `NavLink`; ⌘K button; `LocaleSwitch`; `ThemeToggle`; mobile `Sheet`), `SiteFooter` (one mono line: name, footer nav, social icons, `NEXT_PUBLIC_BUILD_SHA`), `SkipLink`, `LocaleSwitch` (VI/EN `toggle-group`, links to the same path in the other locale, `hreflang`), public `CommandPalette` (nav, theme, locale; post search added in T28), `CopyEmailButton` (copies `settings.contactEmail`, `sonner` toast), `LocaleSuggestBanner` (Q5 default). shadcn: `sheet`, `navigation-menu`, `toggle-group`, `command`, `dialog`, `sonner`.
- Routes: `app/[locale]/(site)/layout.tsx` → `SiteShell`; `app/[locale]/error.tsx` (chrome-only page, Retry, request id; no hard-coded name), `app/[locale]/(site)/error.tsx`, `app/[locale]/(site)/not-found.tsx`.
- `blocks` module (D26):
  - `services/pages.service.ts`: `getPage(key, locale)`, tag `page:{key}`, wrapped in React `cache()`; `qk.public.page(key, locale)` in contracts.
  - `components/BlockRenderer/BlockRenderer.tsx` (server). It:
    - skips a block whose `type` has no renderer;
    - puts neighbouring `BAND` blocks inside one `Band`;
    - wraps each block in `BlockLayout` and in `SectionBoundary` with that renderer's skeleton;
    - sets `id={block.key}` for anchors;
    - passes each block a `BlockContext` (`{ locale, searchParams, draft }`).
  - `constants/block-renderers.constant.ts`: the web registry, `type` → `{ component, skeleton }`, `satisfies Record<BlockType, BlockRendererEntry>` (rule 8).
  - `views/BlocksPage.tsx`: fetch the page, then `BlockRenderer`. `home/views/HomeIndex.tsx` renders `BlocksPage` for `home`.
- `packages/ui` `BlockLayout`: the T10a presets as CSS grid classes with the §4 responsive rules. Regions come in as children, and the section is `aria-labelledby` its heading.
- Renderers for the three T10a types (later blocks render nothing until their task):
  - `HeroBlock`: `Atmosphere variant="hero"` (if `ambientEffects`), `KickerPill` (`heroKicker`), `AccentHeadline` at `text-display`, sub-line at `text-prose`, availability badge (if `showAvailability`), and two buttons from `props.primaryCta` and `props.secondaryCta` (label → route). Layout `ONE` until the diagram arrives (T22, T24).
  - `CtaBandBlock`: `CtaBand` with the block's title and intro, `CopyEmailButton` (chrome label "Copy email") when `showEmail`, and up to 2 `SocialLink.showInCta` outline buttons when `showSocial`. Hidden if the block has no title.
  - `PageHeaderBlock`: eyebrow, H1 at `text-title`, intro (PROJECTS and NOTES use it from T26 and T28).
- `scripts/check-content.mjs` + root script `check:content` + CI step: (1) fails on email addresses and full phone numbers (8+ digits, with or without a `+84` prefix) anywhere in tracked files except the `<email>` / `<phone>` placeholders; (2) fails on CV strings (a denylist built from the seed data: names, companies, city) in `apps/web/**` and `packages/ui/src/components/**`, excluding `*.stories.tsx`, `*.test.tsx` and `packages/contracts/src/fixtures/`.

**Out of scope.** Other block types (T24, T25, T26, T28, T48). Admin (T37).

**Files.** `apps/web/app/[locale]/(site)/{layout.tsx,error.tsx,not-found.tsx}`, `apps/web/app/[locale]/error.tsx`, `apps/web/src/modules/core/components/{SiteShell,SiteHeader,SiteFooter,SkipLink,LocaleSwitch,CommandPalette,CopyEmailButton,LocaleSuggestBanner}/*`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `apps/web/src/modules/blocks/{components/{BlockRenderer,HeroBlock,CtaBandBlock,PageHeaderBlock}/*,constants/block-renderers.constant.ts,services/pages.service.ts,types/entities/block-context.type.ts,views/BlocksPage.tsx}`, `packages/ui/src/components/BlockLayout/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/{en,vi}.json`, `packages/ui/src/components/ui/{sheet,navigation-menu,toggle-group,command,dialog,sonner}.tsx`, `scripts/check-content.mjs`, `package.json`, `.github/workflows/ci.yml`.

**Design.** Figma `2:2`/`3:2` (header, hero, CTA band, footer), `8:2` (mobile header with hamburger, stacked CTA). Mockup `home.html` (+ `?dark=1`, and at 390px). Tokens: `text-display`, `text-prose`, `--primary`, `--primary-subtle`, `--glow`, `--grid-line`, `--band`, `--shadow-1`, `--z-header`, `--z-skip`.

**Acceptance.**
- [ ] Changing a seed value and re-seeding changes the home page (roadmap p09).
- [ ] With the API stopped, `/en` shows the chrome-only error page with Retry, not a crash or a blank page (roadmap p09).
- [ ] Setting `isVisible = 0` on the home `cta` block in Adminer removes the CTA band; changing its `sortOrder` moves it.
- [ ] `BlockRenderer` tests: a type with no renderer renders nothing, and a renderer that throws shows the inline error for that block only.
- [ ] The locale switch keeps the current path; Tab from the top focuses the skip link first; the mobile sheet traps focus and `Esc` closes it.
- [ ] `pnpm check:content` fails on a planted email-shaped string in a temporary file (output shown in the PR) and passes on the clean tree.
- [ ] Screenshots at 1440/390, light/dark, compared with `home.html` hero and footer.

**PR title:** `feat(web): home from api + states`

### M2 — Content graph

#### T15 · About content models + endpoints

**Roadmap** p10 (part 1) · **Spec** §1.5 (About group + v2 additions), §5.0 (About rows, stats band) · **Depends** T10 · **Size** M

**Goal.** The tables behind the About page and the home stats/process sections, with public read endpoints and computed stats that never go stale.

**Scope.**
- Models: `Experience` (all §1.5 fields; `skills` relation added in T17), `Education`, `Principle` (with `iconKey`), `ProfileStat` (`source`: `MANUAL` | `YEARS_COMPUTED` | `PROJECT_COUNT`), `ProcessStep`. Enums `EmploymentType`, `StatSource`. Migration `add-about-content`.
- Contracts: `experience/`, `education/`, `principles/`, `profile-stats/`, `process-steps/` (public DTOs; `iconKey` uses `iconKeySchema`).
- Modules (public controller + service + entity/mapper): `experience` (`GET /public/experience`), `education` (`GET /public/education`), `principles` (`GET /public/principles`), `process-steps` (`GET /public/process-steps`), `profile-stats` (no public route; its service resolves values). Visible rows only, ordered by `sortOrder` (experience by `startDate desc` then `sortOrder`).
- `GET /public/site` gains `profileStats` with resolved values: `YEARS_COMPUTED` = full years since `Profile.careerStartDate`; `PROJECT_COUNT` = published projects (returns 0 until T16 adds projects); `MANUAL` = `value`.
- Seed data (`prisma/seed/data/about.data.ts`): 4 experience rows (the employer grouping from the wireframe, with one company on 2 rows), 1 education row, 3 principles, 4 profile stats, 5 process steps. Placeholders only.

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_about_content/`, `apps/api/prisma/seed/data/about.data.ts`, `apps/api/src/modules/{experience,education,principles,profile-stats,process-steps}/*`, `apps/api/src/modules/public-site/public-site.service.ts`, `packages/contracts/src/{experience,education,principles,profile-stats,process-steps}/*`, `apps/api/api.http`.

**Design.** Spec §5.2 (About), §5.1 stats and process wireframes.

**Backend steps, explained.**
1. **Adding tables later.** Edit `schema.prisma`, run `migrate dev --name add-about-content`, read the new SQL file. The old migration stays untouched; migrations are a history, applied in order.
2. **Computed values.** "Years of experience" is not stored. The service computes it from `careerStartDate` on each request, so it is always right. Same for the project count.
3. **Ordering and visibility.** Every list has `sortOrder` and `isVisible`. Public queries always filter `isVisible: true` and `orderBy: { sortOrder: 'asc' }`.
4. **One module per table.** Five small modules with the same shape. Use the scaffold command from [api STRUCTURE](../../../apps/api/STRUCTURE.md#new-api-module).

**Acceptance.**
- [ ] Each endpoint returns seeded, localized rows in order; hidden rows are excluded.
- [ ] `profileStats` shows years computed from `careerStartDate`; changing the date in Adminer changes the value (spec §6 Day 8 v2 check).
- [ ] Unit tests for the stat resolver.

**PR title:** `feat(api): about content models`

