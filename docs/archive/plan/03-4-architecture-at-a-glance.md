<!-- Archived verbatim from docs/PLAN.md (4. Architecture at a glance); links re-pointed. Index: ../../PLAN.md -->

## 4. Architecture at a glance

```text
Browser ──► Next.js apps/web :3000 ──/api/* rewrite──► NestJS apps/api :4000 ──Prisma──► MySQL 8.4 :3306 (Docker)
               RSC + ISR (public)                         guards → pipe → controller → service
               TanStack Query (admin)                     → mapper → JSON
               app/api/revalidate, app/api/draft ◄──────── publishing module (secret header)
```

| Service | Dev | Port | Notes |
| --- | --- | --- | --- |
| `web` | `pnpm dev` | 3000 | Public `/en/*`, `/vi/*`; admin `/admin/*` |
| `api` | `pnpm dev` | 4000 | Prefix `/api`, bound to `127.0.0.1` |
| `db` | `docker compose up -d db` | 3306 (127.0.0.1) | MySQL 8.4, utf8mb4, named volume `db-data` |
| `adminer` | `docker compose up -d adminer` | 8080 (127.0.0.1) | Web UI to look inside the DB |
| `db-test` | `docker compose --profile test up -d db-test` | 3307 (127.0.0.1) | From T29, tmpfs, reset per test run |

**Environment (`.env.example`, grows task by task).** `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE=portfolio`, `MYSQL_USER=app`, `MYSQL_PASSWORD`, `DATABASE_URL`, `DATABASE_URL_TEST` (T29), `API_PORT=4000`, `API_HOST=127.0.0.1`, `WEB_ORIGIN=http://localhost:3000`, `API_URL=http://127.0.0.1:4000` (web → api), `WEB_INTERNAL_URL=http://127.0.0.1:3000` (api → web revalidate, T52), `REVALIDATE_SECRET` (T52), `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (T35, 32+ random characters each, different from each other), `JWT_ACCESS_TTL_SECONDS=900`, `JWT_REFRESH_TTL_SECONDS=604800` (T35), `ADMIN_EMAIL="<email>"`, `ADMIN_NAME`, `ADMIN_PASSWORD` (T35), `ANALYTICS_SALT_SECRET` (T54), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (T50; no `UPLOAD_DIR`), `SEED_PROFILE=demo`, `NEXT_PUBLIC_BUILD_SHA` (footer deploy hash).

**Rendering (spec [§4.6](../../design/portfolio-design-system.md#s-4-6)).** Public pages are React Server Components that call `apiServer()` with cache tags (`site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`). Publishing calls `POST /api/revalidate` on the web app, which runs `revalidateTag`. Client islands (notes search, contact form, marquee pause, ⌘K) are small `'use client'` files. The admin prefetches on the server, hydrates with `HydrationBoundary`, and reads with `useSuspenseQuery` using keys from `qk`.

**Pages and blocks (D26).** Each of the five route pages is a `Page` with an ordered list of `PageBlock` rows. `GET /api/public/pages/:key?locale` returns `{ key, seo, blocks }`, each block `{ id, type, key, layout, surface, props, lang }` with its text already in one language (D19 per block). The web looks up `type` in `blocks/constants/block-renderers.constant.ts` and renders that block's container, which fetches its own data (projects, posts, skills) with its own cache tags, inside its own `SectionBoundary`. Blocks store settings and references, never copies of content: a `case-grid` says *which* projects to show, and the projects stay in their table.

```text
Page(home) ─┬─ PageBlock key=hero   type=hero       layout=SPLIT_7_5  props={ primaryCta, secondaryCta, showDiagram }
            ├─ PageBlock key=stats  type=stat-band  surface=BAND      props={ heading, variant: "default" }
            ├─ PageBlock key=work   type=case-grid  layout=THREE      props={ heading, source: "latest", limit: 3 }
            └─ PageBlock key=cta    type=cta-band                     props={ title, intro, showEmail, showSocial }
PageVersion(home, v3) = a JSON snapshot of those rows; visitors read the published snapshot (T52a)
```

**Block catalog.** Defined in `packages/contracts/src/blocks/definitions/`, rendered by `apps/web/src/modules/blocks/`. "H1" blocks are first, visible and never deleted; "required" blocks are never deleted or hidden. `heading` is the shared `SectionHeader` group (`eyebrow`, `title`, `intro`, `iconKey`, optional `link`). Every text prop is an `{ en, vi }` pair.

| Type | Design-system components | Pages | Layouts (default first) | Main props | Task |
| --- | --- | --- | --- | --- | --- |
| `hero` | `KickerPill`, `AccentHeadline`, `Atmosphere`, `MigrationDiagram`, `Button` | HOME (H1) | `SPLIT_7_5`, `ONE` | `primaryCta`, `secondaryCta` (label + route), `showDiagram`, `showAvailability`; headline and kicker come from `Profile` | T10a, T14, T24 |
| `page-header` | `Eyebrow`, H1, intro | PROJECTS, NOTES (H1) | `ONE` | `eyebrow`, `title`, `intro` | T10a, T14 |
| `cta-band` | `CtaBand`, `CopyEmailButton` | all, max 1 | `ONE` | `title`, `intro`, `showEmail`, `showSocial` (`SocialLink.showInCta`) | T10a, T14 |
| `stat-band` | `StatBand` | HOME, ABOUT | `ONE` | `heading`, `variant` (`default` / `compact`), `statIds` (empty = all) | T24 |
| `tech-marquee` | `TechMarquee` | HOME, ABOUT | `ONE` | `heading` | T24 |
| `featured-case` | `CaseCard` (`featured`) | HOME | `ONE` | `heading`, `projectId` (empty = first featured) | T24 |
| `domain-grid` | `DomainCard` | HOME, PROJECTS | `FOUR`, `TWO` | `heading` | T24 |
| `case-grid` | `CaseCard` | HOME, ABOUT | `THREE`, `TWO`, `ONE` | `heading`, `source` (`latest` / `featured` / `manual`), `projectIds`, `domainSlug`, `limit` 1–6 | T24 |
| `process` | `FeatureCard`, `ProcessFlow` | HOME, ABOUT | `TWO`, `SPLIT_7_5` | `heading`, `showPrinciples` | T24 |
| `skill-groups` | `SkillGroup` | HOME, ABOUT | `THREE`, `ONE` | `heading` | T24 |
| `post-list` | `PostCard` | HOME, ABOUT, PROJECTS, CONTACT | `ONE`, `TWO`, `THREE` | `heading`, `limit` 1–6, `tag` | T24 |
| `about-intro` | avatar card, `Markdown` bio, availability `Badge` | ABOUT (H1) | `SPLIT_4_8` | `eyebrow`, `showCity`, `showAvailability`; name and bio come from `Profile` | T25 |
| `timeline` | `Timeline` | ABOUT | `ONE` | `heading` | T25 |
| `principle-list` | `PrincipleList` | ABOUT, HOME | `TWO`, `ONE` | `heading` | T25 |
| `education-list` | `card` list | ABOUT | `ONE`, `TWO` | `heading` | T25 |
| `cv-download` | CV card | ABOUT, CONTACT | `ONE` | `heading`, `intro` | T25 |
| `prose` | `Markdown` → `Prose`, `Callout`, `CodeBlock` | all | `ONE`, `SPLIT_8_4` | `heading`, `body`, `aside` (Markdown, D3) | T25 |
| `projects-browser` | `DomainFilter`, `TechFilter`, `CaseCard` grid, `pagination` | PROJECTS (required) | `TWO`, `THREE` | `showFeatured`, `pageSize` | T26 |
| `notes-browser` | `NotesSearch`, tag pills, `PostCard` rows | NOTES (required) | `ONE` | `showFeatured`, `pageSize` | T28 |
| `contact-form` | `ContactForm`, channel cards | CONTACT (H1) | `TWO`, `ONE` | `eyebrow`, `title`, `intro` | T48 |

**Layout presets.** A block picks one of its allowed presets; there is no free-form grid (D26, Q13). Presets sit on the spec's 4 / 8 / 12-column grid with 16 / 24 / 32px gutters (§4.4); breakpoints are `--breakpoint-md` (768px) and `--breakpoint-lg` (1024px).

| Preset | Below 768px | 768–1023px | 1024px and up | Used for |
| --- | --- | --- | --- | --- |
| `ONE` | 1 column | 1 | 1 | lists, prose at 66ch, bands |
| `TWO` | 1 | 2 | 2 | card grids; contact (details, form) |
| `THREE` | 1 | 2 | 3 | case and skill grids (mockup `.work-grid`) |
| `FOUR` | 1 | 2 | 4 | domain grid (mockup `.domain-grid`) |
| `SPLIT_8_4`, `SPLIT_4_8` | stacked | stacked | 8 + 4 or 4 + 8 of 12 | main + aside (prose with an aside, About intro) |
| `SPLIT_7_5` | stacked | stacked | 7 + 5 of 12 | hero text + diagram, process (mockup `.hero-grid`, `.featured-card`) |

Responsive rules for every preset:
- Columns render left to right in DOM order and stack in the same order. There is no CSS reordering, so focus order matches what you see.
- A grid with fewer items than columns keeps its column width.
- Neighbouring `BAND` blocks share one `Band`, so two bands never touch (spec §4.4).
- Atmosphere appears only on `hero` and `cta-band`.

**Page rules.** The API checks these on every write and at publish:
- each page has exactly one H1 block, always first and visible;
- required blocks are never deleted or hidden;
- `maxPerPage` is 1 for H1 blocks, browsers and `cta-band`;
- a type can be added only to its listed pages;
- a block `key` is kebab-case and unique on its page, and it is the anchor (`/#work`).

**Locale.** `en` (default) and `vi`, prefixed URLs (`/en/…`, `/vi/…`) via next-intl. Public API calls pass `?locale=`; the API picks columns (D19). The admin is English chrome and edits both columns side by side (`LocaleTabs`).

