# Portfolio implementation plan

[Tiếng Việt](./PLAN.vi.md) · Structure: [root](../STRUCTURE.md) · [web](../apps/web/STRUCTURE.md) · [api](../apps/api/STRUCTURE.md) · Design snapshot: [docs/design/](./design/)

This plan turns Parker's design (spec, Figma, mockups, practice roadmap) into 67 small tasks. Each task is one pull request that an implementation agent, or Parker, can finish and merge on its own. The tasks follow the practice roadmap order (p01–p33, milestones M0–M7), so the code grows the same way the lessons do.

## Contents

0. [How to use this plan](#0-how-to-use-this-plan)
1. [Sources of truth](#1-sources-of-truth)
2. [Ground rules and Definition of Done](#2-ground-rules-and-definition-of-done)
3. [Decisions](#3-decisions)
4. [Architecture at a glance](#4-architecture-at-a-glance)
5. [Design map](#5-design-map)
6. [Task overview](#6-task-overview)
7. [Tasks](#7-tasks)
8. [Owner tasks and out of scope](#8-owner-tasks-and-out-of-scope)
9. [Open questions](#9-open-questions)

---

## 0. How to use this plan

1. Pick the lowest-numbered task whose **Depends** are all merged. Tasks in the same milestone with no dependency on each other can run in parallel. A task with a letter suffix (T01a, T10a, T45b) was added later and sits right after its number: T01a comes after T01 and before T02.
2. Read, in this order: the task, the spec sections it cites, the Figma nodes and mockup it names, and the STRUCTURE.md files for the paths.
3. Work on a branch, open one PR per task, and use the task's **PR title**. Where the roadmap gives a commit message for that step, the PR title reuses it.
4. Copy the task's **Acceptance** list into the PR description as a checklist, plus the [Definition of Done](#2-ground-rules-and-definition-of-done). Tick each item with evidence (a command output, a screenshot, a test name).
5. If the spec, Figma and this plan disagree, follow the precedence in §1. If a question is still open, add it to §9 in the same PR and take the option marked "default".
6. Backend tasks have a **Backend steps, explained** block written for someone new to backend. Follow it in order. Each step names the one concept it teaches and links the spec glossary ([§1.6](./design/portfolio-design-system.md#s-1-6)).

Task size: **S** fits in a short session (one file group, no new concept); **M** adds one new concept or one screen; **L** is a full screen or a cross-cutting feature. No task is bigger than L; anything bigger was split.

## 1. Sources of truth

| # | Source | Decides | Where |
| --- | --- | --- | --- |
| 1 | **Spec** `portfolio-design-system.md` (+ `.vi.md`) | Token values, typography, components, behavior, data model, API, security | Canonical: private repo `parker2808/interview-fe-data`, `plans/`. Snapshot: [docs/design/portfolio-design-system.md](./design/portfolio-design-system.md) |
| 2 | **Figma** Design System v2 | Variable and component names (same names as the spec CSS), component variants | [figma.com/design/ULYJR56vSbNQhZE3JxvkRu](https://www.figma.com/design/ULYJR56vSbNQhZE3JxvkRu): 180 variables (Color Light/Dark, Spacing, Radius), 17 text styles (`Public/<token> · <px>`, `Admin/<token> · <px>`), 7 component sets / 84 variants, 14 screens |
| 3 | **Mockups** (frozen) and Figma screens | Layout, section order, visual density per screen | [docs/design/mockups/](./design/mockups/) (open `index.html`, add `?dark=1` on home and case study); gallery at [/practice/design](https://parker-interview-senior-fe.vercel.app/practice/design). The gallery says: "Match these screens, not a redesign." |
| 4 | **Practice roadmap** p01–p33 | Task order, learning steps, done-checks, commit messages | [/practice](https://parker-interview-senior-fe.vercel.app/practice). Snapshot: [docs/design/roadmap.json](./design/roadmap.json) |
| 5 | **STRUCTURE.md** files | Where every file goes, naming | [root](../STRUCTURE.md), [apps/web](../apps/web/STRUCTURE.md), [apps/api](../apps/api/STRUCTURE.md) |
| 6 | `colors.json` (Figma export) | Test oracle for the color tokens | [docs/design/colors.json](./design/colors.json): 58 tokens × light/dark, identical to spec §3.6 |

**Precedence when sources disagree:** the spec wins on values, behavior, data and API (1). Figma names follow the spec, so a mismatch in a value is a Figma bug: use the spec value and note it in the PR (2). Layout follows the mockups and Figma frames (3). Order and teaching follow the roadmap (4), except where a decision in §3 replaces a roadmap detail with the spec's choice. File paths follow STRUCTURE.md (5), which replaces the illustrative paths in the spec (see D20). A decision marked **Parker** in §3 is Parker's own call after the spec was written; it overrides every source above, including the spec (today: D7 and D24 for auth, D25 for the admin editor, D26 for block-based pages, D27 for repo-wide format hooks, D28 for Vercel + Render + TiDB + Cloudinary).

**Snapshot notes.**

- The snapshot in `docs/design/` was taken on 2026-10-25 from the public practice site, because the private repo was not readable from this environment. If the private repo has changed since, it wins. Refresh the snapshot in its own PR (`docs(design): refresh snapshot`).
- Only the Projects screen (Figma `13:2`) is fully bound to variables. For the other frames, read layout from Figma and values from the spec tokens.
- Figma frames `2:2`/`3:2` (home) and `4:2`/`5:2` (case study) are light/dark pairs, but which frame is which was not verified (the Figma API rate limit was reached). Check the frame name before comparing screenshots.

## 2. Ground rules and Definition of Done

**Ground rules (every task).**

1. **No hard-coded content.** Any text a visitor reads that is about Parker or the site comes from the API and is editable in `/admin`. Code holds only design tokens, fixed UI labels in `apps/web/i18n/locales/{en,vi}.json`, the route list, and the block registry (which block types exist and the zod schema of their props, never their content; D26) (spec [§1.5](./design/portfolio-design-system.md#s-1-5), [§4.5](./design/portfolio-design-system.md#s-4-5)).
2. **Privacy.** Never commit a real email address or phone number. Use `<email>` and `<phone>` in seeds, fixtures, tests, docs and `.env.example`. `pnpm check:content` (from T14) fails the build otherwise.
3. **Tokens only.** Colors, radii, shadows, spacing and font sizes come from `packages/ui/src/styles/globals.css`. No hex values, no arbitrary Tailwind values (`text-[17px]`, `bg-[#…]`) in components. Use only the 11 named text sizes: `text-display`, `text-title`, `text-heading`, `text-subheading`, `text-prose`, `text-body`, `text-meta`, `text-eyebrow`, `text-ui-title`, `text-ui`, `text-ui-meta` (spec [§3.2](./design/portfolio-design-system.md#s-3-2)).
4. **Readable type.** Body 16px / 1.6, prose 18px / 1.75 / max 66ch. "Richer" comes from surfaces and icons, never from smaller or lower-contrast text (spec §7.1 G8). Vietnamese line-height floors apply (1.2 headings, 1.5 UI).
5. **Files go where STRUCTURE.md says.** A task's **Files** list uses those paths. A new folder kind needs a STRUCTURE.md update in the same PR.
6. **Database safety.** Never edit an applied migration; add a new one. Never run `prisma db push` once migrations exist.
7. **One task, one PR.** Do not pull work forward from later tasks. If something is missing, stub it behind the smallest interface and note it.
8. **A block type is added in one PR, in every registry at once** (D26): its definition in `packages/contracts/src/blocks/definitions/` + `block-registry.constant.ts`, its renderer in `apps/web/src/modules/blocks/` + `block-renderers.constant.ts`, and, from T45b on, its admin entry in `apps/web/src/modules/admin-pages/constants/block-editor-meta.constant.ts` with its `admin.blocks.*` labels. The web registries are typed `satisfies Record<BlockType, …>`, so a missing entry fails `pnpm typecheck`.

**Definition of Done (copy into every PR).**

- [ ] `pnpm lint`, `pnpm format:check` (from T01a), `pnpm typecheck`, `pnpm test`, `pnpm build` pass locally and in CI.
- [ ] `pnpm check:content` passes (from T14 on).
- [ ] `pnpm check:deps` passes (from T42 on): no paid Tiptap packages (D25).
- [ ] Acceptance items of the task are ticked with evidence.
- [ ] UI tasks: screenshots at 1440 and 390, light and dark, attached to the PR and compared with the Figma node or mockup named in the task. Differences are listed and justified.
- [ ] UI tasks: keyboard pass (Tab order, visible focus ring, `Esc` closes overlays) and reduced-motion pass.
- [ ] Only tokens and the 11 text sizes are used; no real email or phone anywhere in the diff.
- [ ] Files are in the STRUCTURE.md locations; new requests are added to `apps/api/api.http` (API tasks).
- [ ] Migrations (if any) were created with `prisma migrate dev --name …` and the generated SQL was read and summarized in the PR.

## 3. Decisions

These settle the places where the sources disagree or say nothing. Each is the default; §9 lists the ones Parker may want to overturn.

| ID | Decision | Why / conflict resolved |
| --- | --- | --- |
| D1 | The repo root of `lil.p` is the monorepo. The roadmap's `portfolio/` folder means this repository. | The roadmap was written before the repo existed |
| D2 | Shared code lives in `packages/ui` and `packages/contracts`, not one `packages/shared`. | Spec §4.0 and §6 split them; roadmap p01/p08 says `packages/shared` |
| D3 | Long text (case-study sections, post bodies, bio) is **Markdown in `@db.Text`**, rendered on the Next server by one safe pipeline (no raw HTML, allowlisted elements, Shiki output converted to React, no `dangerouslySetInnerHTML`). This replaces roadmap p12 "JSON blocks"; p12's rules (zod-validated input, drafts invisible) still apply. Page composition does use JSON blocks (D26); long text inside a block is still Markdown. | Spec §1.5 and §4.3 (`MarkdownEditor`) |
| D4 | API routes follow the spec: `/api/public/*` (no auth), `/api/admin/*` (signed-in JWT, D24), `/api/auth/*`, plus one aggregate `GET /api/public/site?locale` for the layout. Roadmap URLs like `GET /settings`, `GET /posts` map onto these. | Spec §4.5, §5.0 |
| D5 | Every error uses one body: `{ statusCode, code, message, requestId, fieldErrors? }`. | Spec §4.6 |
| D6 | Lists use page-based pagination: request `?page&pageSize&sort&q&…`, response `{ items, page, pageSize, total }`, `pageSize` max 100. Only the audit log and media library use cursor pagination (`?cursor&limit`). The p13 checks still apply: paging through all rows gives no duplicates or gaps (sort always ends with `id`), and `pageSize=500` returns 400 with a field error. | The admin table mockup shows "1–5 of 5" and page sizes; spec §4.6 uses cursors only for infinite lists |
| D7 | **Parker.** Two roles only: `admin` and `user` (Prisma enum `Role { admin user }`, the same strings in `@Roles('admin')`). `admin` can do everything. `user` is a signed-in, read-only reviewer: dashboard, content lists and editors in read-only mode, analytics, draft preview, and their own password; no writes, publishing, uploads, inbox, audit log or users admin (full table in T36). A protected route without `@Roles()` is admin only, so forgetting the decorator fails safe. Login is by email + password, hashed with argon2id. The seed creates one `admin` from env (`ADMIN_EMAIL="<email>"` in `.env.example`); admins create other accounts in the admin-only users screen (T46). | Replaces spec §1.5 `User.role` (`OWNER\|EDITOR\|VIEWER`) and §4.3 "Users (owner only)" |
| D8 | CSRF protection is `SameSite=Lax` cookies + an `Origin` check on mutating requests, not double-submit tokens. It still applies with JWTs, because the tokens travel in cookies (D24). Roadmap p19's check "writes without the CSRF header → 403" becomes "writes with a foreign or missing `Origin` → 403". | Spec §1.6 |
| D9 | No CORS. The browser only talks to Next; `next.config.ts` rewrites `/api/*` to Nest. Roadmap p05's "CORS" item is skipped. The API binds to `127.0.0.1` until guards land (T36). | Spec §1.6, §6 |
| D10 | Many-to-many relations use Prisma implicit join tables (`skills Skill[]` on both sides). Roadmap p11's `ProjectSkill` check becomes "the `_ProjectToSkill` join rows are visible in Prisma Studio". | Spec §1.5 |
| D11 | Names: `ContactMessage` and `ContactTopic` (not `Message`), public route `/notes` (not `/blog`), `Domain`, `ProfileStat`, `ProcessStep`. | Spec §1.5, §5.5 |
| D12 | The first Prisma models (T08) are `SiteSettings`, `Profile`, `NavItem`, `SocialLink`, `Page`, `PageBlock` (D26). `Experience` arrives in T15. Roadmap p06's check "Studio shows SiteSettings, Profile, Experience" becomes "Studio shows SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock". | Spec §6 Day 4, the `GET /public/site` aggregate and the page blocks need these first |
| D13 | Two seed profiles in `apps/api/prisma/seed/profiles/`: **`demo`** (dev, CI, screenshots: projects `PUBLISHED`, 3 sample posts, sample messages and views — placeholder copy from the mockups) and **`baseline`** / **`owner`** (production first boot: `data/portfolio-data.json`, projects `DRAFT`, 0 posts). Chosen by `SEED_PROFILE`. Owner values are copied exactly; fields with no model live in `data/portfolio-unmapped.json`. Metrics shown in demo come only from the wireframes. | Spec §1.5 seeds drafts and 0 posts, but every public screen needs published data to build and test |
| D14 | Media accepts JPG, PNG, WebP, AVIF and **PDF** (resume files for `Profile.resumeEnId/ViId`). Images get WebP variants (480/960/1600); PDFs are stored as-is. Max 10 MB. **Parker (hosting):** files live on **Cloudinary**, not a local `UPLOAD_DIR` or Docker volume. The API stores metadata only (`Media.fileName` is the Cloudinary public id). Variants are Cloudinary URL transforms (`f_webp`). Tests and local boot without Cloudinary env use an in-memory storage that never writes disk. | Spec §1.5 links resumes to `Media`; owner free hosting (Render ephemeral disk) |
| D15 | Storybook lives in `packages/ui` (`@storybook/react-vite`, addon-a11y, a light/dark toolbar switch). Every product component ships a story. | Spec §6 Days 1–6 build components against fixtures |
| D16 | CI (GitHub Actions) starts in T01 with install + lint + typecheck + build and grows with each task (`format:check` T01a, tests T05+, Storybook build T06, API tests T29, e2e T56). | Roadmap p28 adds CI late; earlier CI keeps every PR mergeable |
| D17 | The test database is a second MySQL service under the compose profile `test` (port 3307), introduced in T29 with the first integration tests. | Roadmap p15/p28 |
| D18 | Default blocks per page, seeded as block `key` → block type (D26). **HOME:** `hero` → `hero`, `stats` → `stat-band`, `marquee` → `tech-marquee` (stats and marquee share one band), `featured` → `featured-case`, `domains` → `domain-grid`, `work` → `case-grid`, `process` → `process`, `skills` → `skill-groups`, `notes` → `post-list`, `cta` → `cta-band`. **ABOUT:** `intro` → `about-intro`, `stats` → `stat-band` (compact), `experience` → `timeline`, `principles` → `principle-list`, `skills` → `skill-groups`, `education` → `education-list`, `cv` → `cv-download`. **PROJECTS:** `header` → `page-header`, `projects` → `projects-browser`. **NOTES:** `header` → `page-header`, `notes` → `notes-browser`. **CONTACT:** `contact` → `contact-form`. The keys are the old `PageSection` keys, so anchors such as `/#work` keep working. | Spec §1.5 lists section examples; §5.1–5.6 need these. `header` fills the gap for list-page titles. CONTACT's heading lives inside `contact-form`, because the mockup puts it in the column next to the form |
| D19 | Locale fallback is per field group. A public DTO group (e.g. a project card, a post body) uses Vietnamese only when every translatable field that has an English value also has a Vietnamese value; otherwise the whole group is English with `lang: "en"`. | Spec §1.5 "falling back to English with `lang` on the field group" |
| D20 | STRUCTURE.md paths replace the spec's illustrative ones: `apps/web/messages/` → `apps/web/i18n/locales/`; `packages/contracts/icons.ts` → `src/constants/icons.constant.ts`; `query-keys.ts` → `src/constants/query-keys.constant.ts`; `fixtures/*` → `src/fixtures/*.fixture.ts`. | Parker's naming convention (kebab-case + suffix) |
| D21 | A shadcn primitive is added by the first task that uses it, not all at once. | Keeps PRs small and reviewable |
| D22 | Admin chrome strings live in `apps/web/i18n/locales/en.json` under `admin.*`. The admin UI is English only (spec §5 intro), so `vi.json` has no `admin` keys. | Keeps `react/jsx-no-literals` on for admin too |
| D23 | Public fetches use `revalidate: 3600` + tags in production and `revalidate: 0` in development (`NODE_ENV`), so seed changes show without waiting. | Roadmap p09 check "re-seeding changes the home page" |
| D24 | **Parker.** Auth uses **JWTs instead of MySQL sessions**: `@nestjs/jwt` signs, `passport-jwt` (via `@nestjs/passport`) verifies. A short **access token** (15 min, payload `{ sub, role }`) and a longer **refresh token** (7 days, payload `{ sub, ver }`), signed with two different secrets. Both live in `httpOnly` cookies set by the API (`access_token` on `Path=/`, `refresh_token` on `Path=/api/auth`), never in `localStorage` or JS memory; this works because Next proxies `/api/*`, so the cookies are first-party for the web origin (D9). There is no `Session` table: `User.tokenVersion` is the kill switch ("sign out everywhere", deactivate, password change bump it, and every refresh checks it). Trade-off, accepted: an access token already issued keeps working until it expires (at most 15 min), and plain logout clears this browser's cookies only. | Replaces spec §1.5 `Session`, §1.6 Auth row (which preferred sessions) and roadmap p18 "MySQL sessions"; p18's learning goals (hashing, httpOnly cookies, logout) stay |
| D25 | **Parker.** The admin `MarkdownEditor` is built on **Tiptap v3** (ProseMirror), using only free MIT packages from the public npm registry: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` and `@tiptap/extension-*`. No Tiptap Pro or paid extensions, no `@tiptap-pro/*` registry, no Tiptap Cloud, Collaboration, Comments or AI, no Tiptap account or token; `pnpm check:deps` enforces this in CI (T42). Storage does not change (D3): the editor loads with `contentType: 'markdown'` and saves `editor.getMarkdown()`. Its schema is the Markdown allowlist shared with the public renderer (`packages/contracts/src/constants/markdown.constant.ts`, T23), so the editor cannot produce what the public site would drop. Code blocks use `@tiptap/extension-code-block-lowlight` + `lowlight` while writing; the Preview mode shows the exact public Shiki output. | Replaces spec §4.0 and §4.3 `MarkdownEditor` (CodeMirror 6); the spec's toolbar, slash menu, image paste, modes, word count and `SaveStatus` stay |
| D26 | **Parker.** Public pages are **built from blocks managed in the admin**. Each of the five route pages (`HOME`, `ABOUT`, `PROJECTS`, `NOTES`, `CONTACT`) is an ordered list of `PageBlock` rows: `type`, `key` (anchor), `props` (MySQL `JSON`), a `layout` preset, `surface`, `sortOrder`, `isVisible`. Block types come only from a **code-side registry** of design-system components (`packages/contracts/src/blocks/`). Each type has a zod 4 props schema, which the API uses to validate every write and every read and which the admin turns into a TanStack Form (`z.toJSONSchema` + `.meta()` widget hints), plus its allowed pages, layouts and limits. Layout is chosen from presets only (`ONE`, `TWO`, `THREE`, `FOUR`, `SPLIT_8_4`, `SPLIT_4_8`, `SPLIT_7_5`) with fixed responsive rules (§4); there is no free-form per-field grid. The admin page builder (T45b) reorders blocks by drag and drop with `@dnd-kit/core` + `@dnd-kit/sortable` (MIT; move up/down stays as the keyboard and single-pointer alternative), adds, duplicates, removes and hides blocks, and edits props in the generated form. Each page has a draft (the rows) and published versions (`PageVersion` JSON snapshots): publish copies the draft into a new version, any version can be restored into the draft, and a live preview shows the draft through Next draft mode (T52a). Public pages stay React Server Components with cache tags (`page:{key}` + each block's data tags). An unknown type or invalid props never breaks a page: the API drops that block and logs it, the web renders nothing for a type it does not know, and each block has its own `SectionBoundary`. `PageSection` becomes `PageBlock`: the same order and visibility model, with its `title`, `intro` and `ctaLabel` columns moved into `props`, so there is no second model. Detail pages (`/projects/[slug]`, `/notes/[slug]`) keep their fixed templates, and long text stays Markdown (D3). | Replaces spec §1.5 `PageSection` (fixed keys, one component per key), the §4.5 ordering rule and the §5.10 Sections tab; brings back roadmap p14 `BlockRenderer` and p22 "block editor list" at page level. Free-form grid placement and side-by-side blocks are a possible future extension (Q13) |
| D27 | **Parker.** One root Prettier + Husky v9 toolchain for the whole monorepo (future `apps/web`, `apps/api`, `packages/*`): keep T01's `.prettierrc` and `eslint.config.mjs`, add `format` / `format:check`, lint-staged on pre-commit, commitlint (conventional commits, same shape as PR titles) on commit-msg, optional `pnpm typecheck` on pre-push, and `pnpm format:check` in CI. No per-app format/lint config unless a later app truly needs an override. | T01 shipped shared config but not git hooks or a repo-wide format check |
| D28 | **Parker.** Long-term **free** hosting: **Vercel** (Next.js web), **Render** free web service (Nest API), **TiDB Cloud Serverless** (MySQL; Prisma + local Docker MySQL unchanged), **Cloudinary** (media, D14). T61 implements this instead of the VPS / GHCR / Caddy-TLS path. Production enables CORS for `WEB_ORIGIN` and sets auth cookies `SameSite=None; Secure` when `CROSS_SITE_COOKIES=1` so the browser can call Render directly. D9 (no CORS, `127.0.0.1`) still applies locally and in `compose.prod.yml`. | Overrides T61 VPS/GHCR and the D9 "never CORS" reading for production only |

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

**Rendering (spec [§4.6](./design/portfolio-design-system.md#s-4-6)).** Public pages are React Server Components that call `apiServer()` with cache tags (`site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`). Publishing calls `POST /api/revalidate` on the web app, which runs `revalidateTag`. Client islands (notes search, contact form, marquee pause, ⌘K) are small `'use client'` files. The admin prefetches on the server, hydrates with `HydrationBoundary`, and reads with `useSuspenseQuery` using keys from `qk`.

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

## 5. Design map

Figma links use `https://www.figma.com/design/ULYJR56vSbNQhZE3JxvkRu/?node-id=<id>` (write `13:2` as `13-2`). Mockups are in `docs/design/mockups/`. Gallery ids are the screenshots on [/practice/design](https://parker-interview-senior-fe.vercel.app/practice/design).

| Screen | Figma node | Mockup | Gallery | Spec | Tasks |
| --- | --- | --- | --- | --- | --- |
| Cover & foundations (tokens, type, colors) | page `0:1` | `foundations.html`, `cover.html` | n/a | §3 | T04, T05, T06 |
| Components (Button, Badge/Pill, Eyebrow, Input, CaseCard, Kicker pill, Nav link) | page `1:2` | `foundations.html` | n/a | §4.1, §4.7 | T12, T13, T20 |
| Home, light / dark (pair, verify which) | `2:2`, `3:2` | `home.html`, `home.html?dark=1` | `01-home-light`, `02-home-dark` | §5.1, §7.2 | T14, T24 |
| Home, mobile 390 | `8:2` | `home.html` at 390px | `05-home-mobile-light` | §5.1 | T14, T24 |
| Home, loading | `21:2` | `home-skeleton.html` | `09-home-skeletons` | §5.0 | T13, T24 |
| About + timeline | `7:2` | `about.html` | `10-about-light` | §5.2 | T25 |
| Projects list (fully token-bound) | `13:2` | `projects.html` | `11-projects-light` | §5.3 | T26 |
| Case study, light / dark (pair, verify which) | `4:2`, `5:2` | `case-study.html`, `?dark=1` | `03-case-study-light`, `03b-case-study-dark` | §5.4 | T27 |
| Notes list | `9:2` | `notes.html` | `04b-blog-list-light` | §5.5 | T28 |
| Post | `10:2` | `post.html` | `04-blog-post-light` | §5.5 | T23, T28 |
| Contact | `12:2` | `contact.html` | `12-contact-light` | §5.6 | T48 |
| Admin dashboard (dark) | `14:2` | `admin-dashboard.html` | `06-admin-dashboard` | §5.7, §5.11 | T37, T38, T54 |
| Admin projects table | `15:2` | `admin-table.html` | `07-admin-projects-table` | §5.8, §5.11 | T39, T40, T41 |
| Admin project editor | `18:2` | `admin-editor.html` | `08-admin-project-editor` | §5.9, §5.11 | T42, T43, T44 |
| Admin page builder (no frame yet: compose from `18:2` and `15:2`) | none | none | n/a | §5.10, D26 | T45b, T52a |

**Figma component sets → code.**

| Figma set (variants) | Properties | Code |
| --- | --- | --- |
| Button (40) | Variant `Primary/Secondary/Outline/Ghost/Destructive` × State `Default/Hover` × Size `Public 40/Admin 32` × Theme | `packages/ui/src/components/ui/button.tsx` variants `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; sizes `sm` 28, `default` 32, `lg` 40 (T12) |
| Badge/Pill (22) | Hue `neutral/primary/success/warning/destructive/outline/jade/amber/blue/violet/rose` × Theme | `components/ui/badge.tsx` with a `hue` variant (T12) |
| Eyebrow (4) | Tone `Primary/Subtle` × Theme | `components/Eyebrow/` (T12) |
| Input (8) | State `Default/Focus/Error/Disabled` × Theme | `components/ui/input.tsx` + `field.tsx` (T12) |
| CaseCard (4) | State `Default/Hover` × Theme | `components/CaseCard/` (T20) |
| Kicker pill (2) | Theme | `components/KickerPill/` (T12) |
| Nav link (4) | State `Default/Active` × Theme | `components/NavLink/` (T12) |

## 6. Task overview

Paths: **web** = `apps/web`, **api** = `apps/api`, **ui** = `packages/ui`, **ct** = `packages/contracts`.

| ID | Task | Roadmap | Depends | Size | Main location |
| --- | --- | --- | --- | --- | --- |
| **M0** | **Groundwork** | | | | |
| T01 | Monorepo scaffold, toolchain, minimal CI | p01 | none | S | root |
| T01a | Prettier, Husky, lint-staged, commitlint | — (Parker, D27) | T01 | S | root |
| T02 | Docker Compose: MySQL 8.4 + Adminer | p02 | T01 | S | `docker-compose.yml`, `infra/mysql/` |
| T03 | SQL by hand notes (Parker) | p03 | T02 | S | `docs/sql-notes.sql` |
| T04 | Design tokens + shadcn theme in `packages/ui` | p04 | T01 | M | ui `styles/`, `lib/` |
| T05 | Next.js shell: fonts, theme toggle, type specimen | p04 | T04 | M | web `app/`, `src/modules/core/` |
| T06 | Storybook + Foundations stories | p04 | T04 | S | ui `.storybook/`, `src/stories/` |
| **M1** | **First API** | | | | |
| T07 | NestJS app + health + validated config | p05 | T01 | M | api `src/main.ts`, `config/`, `modules/health/` |
| T08 | Prisma: site layout models, first migration, seed profiles | p06 | T02, T07 | L | api `prisma/`, `src/prisma/` |
| T09 | Contracts package + `GET /api/public/site` | p07 | T08 | L | ct `src/`, api `modules/public-site/`, `i18n/` |
| T10 | Validation pipe, error filter, request id, logging | p08 | T09 | M | api `src/common/` |
| T10a | Block registry contracts + `GET /api/public/pages/:key` | p08 | T10 | M | ct `src/blocks/`, `src/pages/`, api `modules/pages/` |
| T11 | Web data layer + next-intl + locale layout | p09 | T05, T09 | L | web `app/[locale]/`, `i18n/`, `core/services/` |
| T12 | UI primitives matching Figma component sets | p09 | T06 | M | ui `components/ui/`, `components/[Name]/` |
| T13 | States + atmosphere components | p09 | T12 | M | ui `components/[Name]/`, `hooks/` |
| T14 | Site shell + home hero/CTA from the API + content check | p09 | T10a, T11, T13 | L | web `core/`, `blocks/`, `scripts/check-content.mjs` |
| **M2** | **Content graph** | | | | |
| T15 | About content models + endpoints | p10 | T10 | M | api `modules/experience/` … |
| T16 | Domains + projects + metrics (one-to-many) | p10 | T15 | L | api `modules/domains/`, `modules/projects/` |
| T17 | Skills (many-to-many) + project filters | p11 | T16 | M | api `modules/skills/` |
| T18 | Posts + tags (markdown, publish lint) | p12 | T17 | M | api `modules/posts/`, `modules/tags/` |
| T19 | List query contract (page, sort, search) | p13 | T18 | M | ct `common/list-params.schema.ts`, api services |
| T20 | Cards: DiffStat, CaseCard, DomainCard, PostCard | p14 | T13, T18 | M | ui `components/` |
| T21 | Rich sections: StatBand, TechMarquee, ProcessFlow, PrincipleList, FeatureCard, SkillGroup | p14 | T13, T17 | M | ui `components/` |
| T22 | MigrationDiagram | p14 | T13, T17 | M | ui `components/MigrationDiagram/` |
| T23 | Markdown pipeline + Prose + CodeBlock + reading aids | p14 | T11, T12 | L | web `modules/content/`, ui `components/` |
| T24 | Home v2 complete | p14 | T14, T19, T20, T21, T22 | L | web `modules/blocks/`, ct `blocks/definitions/` |
| T25 | About page + Timeline | p14 | T23, T24 | L | web `modules/blocks/`, `about/`, ui `Timeline/` |
| T26 | Projects list | p14 | T14, T19, T20 | M | web `modules/projects/` |
| T27 | Project case study | p14 | T23, T26 | L | web `modules/projects/` |
| T28 | Notes list + post | p14 | T19, T20, T23 | L | web `modules/notes/` |
| **M3** | **Write side** | | | | |
| T29 | Admin write API on projects + test DB | p15 | T19 | L | api `modules/projects/admin-*`, `test/` |
| T30 | Write API: posts, experience, education, principles, stats, process | p15 | T29 | M | api `modules/*/admin-*` |
| T31 | Write API: skills, categories, tags, domains | p15 | T29 | M | api `modules/*/admin-*` |
| T32 | Write API: site, profile, nav, social, contact topics | p15 | T29 | M | api `modules/*/admin-*` |
| T32a | Write API: pages and blocks | p15 | T10a, T29 | L | api `modules/pages/`, ct `pages/` |
| T33 | Transactional reorder + tag replace | p16 | T31, T32, T32a | M | api services, `common/utils/` |
| T34 | Indexes + EXPLAIN | p17 | T33 | S | api `prisma/`, `docs/sql-notes.sql` |
| **M4** | **Auth + admin CMS** | | | | |
| T35 | Users, argon2, JWT access + refresh cookies | p18 | T29 | L | api `modules/auth/`, `modules/users/` |
| T36 | Global JWT guard, roles (admin/user), Origin check, throttle | p19 | T35 | M | api `src/common/guards/` |
| T37 | Admin shell, login, ⌘K | p20 | T11, T12, T36 | L | web `modules/admin-core/`, `admin-auth/` |
| T38 | Admin dashboard v1 + stats endpoint | p20 | T37 | M | web `admin-dashboard/`, api `modules/dashboard/` |
| T39 | DataTable + admin projects list | p21 | T37 | L | ui `DataTable/`, web `admin-projects/` |
| T40 | Admin lists: posts, experience | p21 | T30, T39 | M | web `admin-posts/`, `admin-about/` |
| T41 | Admin lists: small entities + icon/hue pickers | p21 | T31, T32, T39 | M | web `admin-taxonomy/`, `admin-about/` |
| T42 | Editor shell + Tiptap MarkdownEditor + autosave | p22 | T39 | L | web `admin-core/`, ui `MarkdownEditor/` |
| T43 | Project editor | p22 | T42 | L | web `admin-projects/` |
| T44 | Post + experience editors | p22 | T42 | M | web `admin-posts/`, `admin-about/` |
| T45 | Site settings + profile admin | p22 | T33, T42 | L | web `admin-site/` |
| T45a | Schema-driven props form (zod → TanStack Form) | p22 | T41, T42 | M | web `admin-core/components/SchemaForm/` |
| T45b | Page builder: blocks, drag and drop, layouts | p22 | T33, T45a | L | web `admin-pages/`, ui `SortableList/` |
| T46 | Users admin (admin only) + change own password | p22 | T37 | M | web `admin-users/`, api `modules/users/` |
| **M5** | **Realtime, media, publishing** | | | | |
| T47 | Contact + inbox API | p23 | T36 | M | api `modules/contact/`, `contact-topics/` |
| T48 | Contact page + Server Action | p23 | T14, T47 | M | web `modules/contact/` |
| T49 | SSE events + inbox UI + NotificationBell | p23 | T39, T47 | M | api `modules/events/`, web `admin-inbox/` |
| T50 | Media API: upload, variants, relations | p24 | T36 | L | api `modules/media/` |
| T51 | Media UI: library, uploader, pickers | p24 | T42, T50 | M | web `admin-media/`, ui `MediaLibrary/` |
| T52 | Publish workflow + revalidate + draft preview | p25 | T27, T28, T43, T44 | L | api `modules/publishing/`, web `app/api/` |
| T52a | Page publish, versions, live preview | p25 | T45b, T52 | L | api `modules/pages/`, web `admin-pages/`, `blocks/` |
| **M6** | **Quality** | | | | |
| T53 | SEO from the CMS | p26 | T24, T25, T27, T28, T52a | M | web `modules/seo/`, `app/sitemap.ts` |
| T54 | Analytics + dashboard charts | p27 | T38, T49 | M | api `modules/analytics/`, web `admin-insights/` |
| T55 | Audit log | p27 | T36, T38 | M | api `modules/audit/`, web `admin-insights/` |
| T56 | Tests + CI e2e | p28 | T52a | M | web `e2e/`, `.github/workflows/` |
| T57 | Accessibility + performance audit | p29 | T53 | M | `docs/audits/` |
| **M7** | **Ship** | | | | |
| T58 | Production Compose | p30 | T56 | M | `compose.prod.yml`, `apps/*/Dockerfile` |
| T59 | Hardening + backups | p31 | T58 | M | `infra/caddy/`, `scripts/backup/` |
| T60 | Production seed cleanup + placeholder check | p32 | T45, T51, T52a | S | api `prisma/seed/`, `scripts/` |
| T61 | Deploy pipeline + launch checklist | p33 | T58, T59, T60 | M | `.github/workflows/deploy.yml`, `docs/` |

Roadmap coverage: every step p01–p33 maps to at least one task. p04 is split into T04–T06, p08 into T10–T10a, p09 into T11–T14, p14 into T20–T28, p15 into T29–T32a, p21 into T39–T41, p22 into T42–T46 (with T45a, T45b) and p25 into T52–T52a. T01a (Parker, D27) adds repo-wide format hooks after T01.

## 7. Tasks

Each task uses the same template: **Roadmap · Spec · Depends · Size**, then Goal, Scope, Out of scope, Files, Design, Backend steps explained (backend tasks only), Acceptance, PR title.

### M0 — Groundwork

#### T01 · Monorepo scaffold, toolchain, minimal CI

**Roadmap** p01 · **Spec** [§1.6](./design/portfolio-design-system.md#s-1-6), [§6](./design/portfolio-design-system.md#s-6) · **Depends** none · **Size** S

**Goal.** One pnpm workspace with a fixed layout, shared lint/format/TypeScript config, and a CI job that every later PR must pass.

**Scope.**
- Root `package.json`: `"private": true`, `"packageManager": "pnpm@<pinned>"` (enable with `corepack enable`), `"engines": { "node": ">=22" }`, scripts `dev`, `lint`, `typecheck`, `test`, `build`, `format` that run across workspaces with `pnpm -r` (use `--if-present` so empty packages pass).
- `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `.nvmrc` (`22`), `.editorconfig` (utf-8, lf, 2 spaces), `.gitignore` (`node_modules`, `.env`, `.next`, `dist`, `coverage`, `uploads`, `storybook-static`), `.npmrc` if needed.
- `tsconfig.base.json` (`strict`, `noUncheckedIndexedAccess`, `moduleResolution: "bundler"`), `eslint.config.mjs` (flat config, typescript-eslint, import sorting), Prettier config.
- `README.md`: prerequisites (Node 22, pnpm via corepack, Docker Desktop, git) and the root commands from [STRUCTURE.md](../STRUCTURE.md#root-commands).
- `.github/workflows/ci.yml`: checkout, `pnpm/action-setup`, `setup-node` 22 with pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` (D16).

**Out of scope.** Creating the apps or packages (T04, T05, T07, T09). Docker (T02).

**Files.** Root only: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `.editorconfig`, `.gitignore`, `tsconfig.base.json`, `eslint.config.mjs`, `.prettierrc`, `README.md`, `.github/workflows/ci.yml`. Keep the existing `STRUCTURE.md`, `apps/*/STRUCTURE.md` and `docs/`.

**Design.** None.

**Acceptance.**
- [ ] `node -v` prints 22.x; `pnpm -v` and `docker compose version` work (roadmap p01).
- [ ] `pnpm install`, `pnpm lint`, `pnpm typecheck` exit 0 on a fresh clone.
- [ ] CI runs on the PR and is green.
- [ ] The squash-merge commit message is `chore: init portfolio monorepo` (roadmap p01).

**PR title:** `chore: init portfolio monorepo`

#### T01a · Prettier, Husky, lint-staged, commitlint

**Roadmap** — (Parker, D27) · **Spec** — · **Depends** T01 · **Size** S

**Goal.** One root format and git-hook toolchain that covers future `apps/web`, `apps/api` and `packages/*` without per-app config.

**Scope.**
- Keep T01's root `.prettierrc` and `eslint.config.mjs`. Add `prettier-plugin-tailwindcss` so Tailwind classes sort when T04 adds them.
- `.prettierignore` for lockfiles, build output, uploads, Storybook static, Husky internals, and the frozen design snapshot.
- Root scripts `format` (`prettier --write .`) and `format:check` (`prettier --check .`) — one command for the whole tree, not `pnpm -r`.
- Husky v9 + `prepare` script. **pre-commit** → lint-staged (Prettier `--write` on staged `ts`/`tsx`/`js`/`json`/`md`/`css`/`yml`; ESLint `--fix` on JS/TS). **commit-msg** → commitlint (conventional commits, same shape as PR titles like `chore: …`). **pre-push** → `pnpm typecheck` (optional safety net).
- CI: add `pnpm format:check`.
- README + STRUCTURE.md: a short beginner section on the hooks.

**Out of scope.** Per-app Prettier/ESLint. Docker (T02). Creating apps or packages (T04, T05, T07, T09).

**Files.** Root: `package.json`, `pnpm-lock.yaml`, `.prettierrc`, `.prettierignore`, `commitlint.config.mjs`, `.husky/pre-commit`, `.husky/commit-msg`, `.husky/pre-push`, `.github/workflows/ci.yml`, `README.md`, `STRUCTURE.md`, `docs/PLAN.md`, `docs/PLAN.vi.md`.

**Design.** None.

**Acceptance.**
- [ ] `pnpm format:check` exits 0.
- [ ] `pnpm lint` and `pnpm typecheck` still exit 0.
- [ ] CI includes `pnpm format:check` and is green.
- [ ] A commit message that is not conventional is rejected by the commit-msg hook.
- [ ] No `apps/*` or `packages/*` Prettier/ESLint config.

**PR title:** `chore: add prettier, husky and commitlint`

#### T02 · Docker Compose: MySQL 8.4 + Adminer

**Roadmap** p02 · **Spec** §1.6 · **Depends** T01 · **Size** S

**Goal.** A local MySQL that survives restarts, plus Adminer to look inside it, started with one command.

**Scope.**
- `docker-compose.yml` with:
  - `db`: `mysql:8.4` (pinned tag), `command: --character-set-server=utf8mb4 --collation-server=utf8mb4_0900_ai_ci`, env from `.env`, `ports: ["127.0.0.1:3306:3306"]`, named volume `db-data:/var/lib/mysql`, `./infra/mysql/init:/docker-entrypoint-initdb.d:ro`, healthcheck `mysqladmin ping -h localhost`.
  - `adminer`: pinned tag, `127.0.0.1:8080:8080`, `depends_on: db: condition: service_healthy`.
- `infra/mysql/init/01-dev-grants.sql`: lets the app user create and drop databases, which Prisma's shadow database needs for `migrate dev` (avoids error P3014). Dev only.
- `.env.example` with the `MYSQL_*` and `DATABASE_URL` lines from §4 (placeholder passwords). `.env` stays git-ignored.
- Root scripts `db:up`, `db:down`, `db:logs`. README section "Database".

**Out of scope.** Test DB (T29), production compose (T58).

**Files.** `docker-compose.yml`, `infra/mysql/init/01-dev-grants.sql`, `.env.example`, `package.json` (scripts), `README.md`.

**Design.** None.

**Backend steps, explained.**
1. **Image vs container** (glossary §1.6). `mysql:8.4` is the packaged program; `docker compose up` starts a running copy of it. Pin the tag so everyone runs the same version.
2. **Port mapping.** `127.0.0.1:3306:3306` means "port 3306 on my laptop, reachable only from my laptop, goes to port 3306 in the container". Binding to `127.0.0.1` keeps the DB off your Wi-Fi network.
3. **Volume.** `db-data` is a folder Docker keeps outside the container. `docker compose down` deletes the container but not the volume, so data survives. `docker compose down -v` deletes the volume too (a full reset).
4. **Environment variables.** Passwords live in `.env`, never in git. `.env.example` shows which keys exist, with fake values.
5. **Init scripts.** Files in `/docker-entrypoint-initdb.d` run **only the first time** the volume is created. If you already had a volume, run the grant from `01-dev-grants.sql` by hand in Adminer, or reset with `down -v`.
6. **Healthcheck.** Compose pings MySQL until it answers, so other services (Adminer now, the API in T58) start only when the DB is ready.

**Acceptance.**
- [ ] `docker compose up -d db` reaches `healthy` in `docker compose ps` (roadmap p02).
- [ ] Create a scratch table in Adminer, run `docker compose down` then `up`: the table is still there (roadmap p02). Drop it afterwards.
- [ ] Adminer at `http://localhost:8080` logs in with the `.env` user.
- [ ] `docker compose ps` shows ports bound to `127.0.0.1`.
- [ ] `SHOW VARIABLES LIKE 'character_set_server'` returns `utf8mb4`.

**PR title:** `chore(infra): mysql via docker compose`

#### T03 · SQL by hand notes (Parker)

**Roadmap** p03 · **Spec** §1.5, §1.6 · **Depends** T02 · **Size** S · **Owner:** Parker (an agent may draft the outline only)

**Goal.** Learn tables, keys and joins by typing SQL before Prisma writes it for you.

**Scope.**
- Open a MySQL shell: `docker compose exec db mysql -u app -p portfolio`.
- Create scratch tables `profile` and `experience` (with `profile_id` foreign key), insert rows, `SELECT … JOIN`, `UPDATE`, `DELETE`.
- Try deleting a profile that has experiences: see the foreign key block it (`RESTRICT`), then recreate with `ON DELETE CASCADE` and explain in a comment which one you would pick and why.
- Drop the scratch tables at the end so Prisma (T08) starts from an empty database.

**Files.** `docs/sql-notes.sql` (also used by T34 for EXPLAIN notes).

**Design.** None.

**Acceptance.**
- [ ] A JOIN query returns the experiences for one profile (roadmap p03).
- [ ] The FK behavior (blocked or cascades) is explained in `docs/sql-notes.sql` (roadmap p03).
- [ ] The database has no scratch tables left.

**PR title:** `docs: sql fundamentals notes`

#### T04 · Design tokens + shadcn theme in `packages/ui`

**Roadmap** p04 · **Spec** [§3](./design/portfolio-design-system.md#s-3), [§3.6](./design/portfolio-design-system.md#s-3-6), [§3.7](./design/portfolio-design-system.md#s-3-7), §4.0 · **Depends** T01 · **Size** M

**Goal.** The single source of every color, font size, radius, shadow and motion value, wired into shadcn and Tailwind v4, with a test that fails if a token drifts from the design.

**Scope.**
- Create `packages/ui` (`@portfolio/ui`): `package.json` with an `exports` map (`./styles/globals.css`, `./components/*`, `./hooks/*`, `./utils/*`, `./lib/utils`), `tsconfig.json`, Vitest config.
- `src/styles/globals.css`: copy the spec §3.6 block (light `:root` + `.dark`) and the §3.7 `@theme inline` mapping **verbatim**, including v2 tokens (`--band`, `--border-strong`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), the 11 text sizes with their line-heights, radius, shadows, motion easings, z-index scale, `--container`, `--measure`, and the reduced-motion rules (§3.4). Add `@custom-variant dark (&:where(.dark, .dark *));`.
- `components.json` for shadcn: style `new-york`, `rsc: true`, `tsx: true`, `baseColor: neutral`, `cssVariables: true`, css path `src/styles/globals.css`, aliases `@portfolio/ui/components`, `@portfolio/ui/components/ui`, `@portfolio/ui/lib/utils`, `@portfolio/ui/hooks`.
- `src/lib/utils.ts`: `cn()` with `clsx` + `tailwind-merge`. Extend tailwind-merge's `font-size` group with the 11 custom sizes, otherwise `cn('text-title', 'text-primary')` drops one of them.
- `src/styles/globals.test.ts`: parse `:root` and `.dark` from `globals.css` and compare every key in `docs/design/colors.json` (58 tokens × 2 modes); assert the 11 text-size tokens exist.

**Out of scope.** Fonts and the web app (T05). Components (T12+). Storybook (T06).

**Files.** `packages/ui/package.json`, `packages/ui/tsconfig.json`, `packages/ui/vitest.config.ts`, `packages/ui/components.json`, `packages/ui/src/styles/globals.css`, `packages/ui/src/styles/globals.test.ts`, `packages/ui/src/lib/utils.ts`, `packages/ui/src/lib/utils.test.ts` ([root STRUCTURE: packages/ui](../STRUCTURE.md#package-layout-packagesui)).

**Design.** Figma page `0:1` (Cover & Foundations), variables Color Light/Dark, Spacing, Radius. Mockup `foundations.html`. Tokens: all of §3.6–3.7.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/ui test` passes; changing any hex in `globals.css` makes it fail.
- [ ] `cn('text-title', 'text-primary')` keeps both classes (unit test).
- [ ] `globals.css` diff against the spec block shows only formatting differences.

**PR title:** `feat(ui): design tokens and shadcn theme`

#### T05 · Next.js shell: fonts, theme toggle, type specimen

**Roadmap** p04 · **Spec** §3.1, §3.2, §3.4, §4.2 (`ThemeToggle`) · **Depends** T04 · **Size** M

**Goal.** A running Next.js app that loads the three fonts, switches light/dark/system without a flash, and shows a temporary specimen page to check tokens and Vietnamese rendering.

**Scope.**
- Scaffold with `create-next-app` (TypeScript, App Router, ESLint, Tailwind v4, **no** `src/app`, import alias `@/*` → `src/*`) into a temp folder, then move the files into `apps/web`. The tool refuses a non-empty folder and `apps/web/STRUCTURE.md` must stay.
- `package.json` name `@portfolio/web`; depend on `@portfolio/ui` (`workspace:*`); `next.config.ts` with `transpilePackages: ['@portfolio/ui', '@portfolio/contracts']`.
- `app/globals.css`: `@import "@portfolio/ui/styles/globals.css";` plus `@source "../src";` and `@source "../../../packages/ui/src";` (Tailwind v4 does not scan workspace packages on its own).
- `apps/web/components.json` pointing shadcn at `packages/ui` (monorepo setup).
- Fonts in `src/modules/core/utils/fonts.util.ts` via `next/font/google`: Be Vietnam Pro 600/700, Inter (variable), JetBrains Mono 400/600; `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`; CSS variables `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` (the token file maps them to `--font-heading`, `--font-sans`, `--font-mono`). Mono ligatures off.
- `ThemeProvider` (next-themes, `attribute="class"`, `defaultTheme="system"`, `disableTransitionOnChange`) and `ThemeToggle` (light / dark / system menu, `aria-pressed`). Adds shadcn `dropdown-menu` (D21).
- Temporary `app/layout.tsx` + `app/page.tsx` rendering `CoreSpecimen`: the 11 text sizes with the QA string `Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`, color swatches, a band stripe, hue swatches, eyebrows. T11 deletes these three files.
- Vitest + Testing Library in `apps/web`; a test for `ThemeToggle`.

**Out of scope.** next-intl, data fetching, locale layouts (T11). Real components (T12+).

**Files.** `apps/web/app/layout.tsx` (temporary), `apps/web/app/page.tsx` (temporary), `apps/web/app/globals.css`, `apps/web/next.config.ts`, `apps/web/components.json`, `apps/web/vitest.config.mts`, `apps/web/src/modules/core/utils/fonts.util.ts`, `apps/web/src/modules/core/components/Providers/ThemeProvider.tsx`, `apps/web/src/modules/core/components/ThemeToggle/ThemeToggle.tsx` (+ `.test.tsx`), `apps/web/src/modules/core/views/CoreSpecimen.tsx` (temporary), `packages/ui/src/components/ui/dropdown-menu.tsx` ([web STRUCTURE](../apps/web/STRUCTURE.md)).

**Design.** Figma page `0:1`; text styles `Public/*` and `Admin/*`. Mockup `foundations.html`. Tokens: `--font-*`, all text sizes, `--background`, `--foreground`, `--band`, `--hue-*`, `--primary`.

**Acceptance.**
- [ ] The `/` specimen renders in light and dark with AA contrast checked in DevTools (roadmap p04).
- [ ] Font sizes match the spec scale (`text-title`, `text-prose`, …) and Vietnamese marks on the QA string are not clipped (roadmap p04).
- [ ] Reloading in dark mode shows no light flash.
- [ ] The network panel shows at most 5 font files.
- [ ] Under `prefers-reduced-motion`, the theme switch has no transition.

**PR title:** `feat(web): next shell, tokens, theme`

#### T06 · Storybook + Foundations stories

**Roadmap** p04 (follow-up) · **Spec** §3, §3.2, §6 (Days 1–6) · **Depends** T04 · **Size** S

**Goal.** A Storybook in `packages/ui` where every component is built and checked in isolation, in both themes, with an accessibility panel (D15).

**Scope.**
- `@storybook/react-vite` in `packages/ui`, `@storybook/addon-a11y`, `@storybook/addon-themes` (`withThemeByClassName`, light/dark).
- `.storybook/preview.tsx` imports `globals.css` and a Storybook-only `fonts.css` that loads the same three families from `@fontsource` packages with the `vietnamese` subset (next/font does not run in Storybook) and sets the `--font-be-vietnam-pro`, `--font-inter`, `--font-jetbrains-mono` variables.
- Foundations stories: Colors (every token, both modes, with contrast ratio of the pairs listed in §3.1), Typography (each of the 11 sizes next to its Figma text style name, e.g. `Public/title · 48`, with the QA string), Spacing & Radius & Shadows, Motion (easings, reduced-motion demo).
- CI step `pnpm --filter @portfolio/ui build-storybook`.
- Add `src/stories/foundations/` to the `packages/ui` tree in the root `STRUCTURE.md` (rule 5).

**Files.** `packages/ui/.storybook/main.ts`, `packages/ui/.storybook/preview.tsx`, `packages/ui/.storybook/fonts.css`, `packages/ui/src/stories/foundations/{Colors,Typography,Spacing,Motion}.stories.tsx`, `.github/workflows/ci.yml`, `STRUCTURE.md`.

**Design.** Figma page `0:1`; mockup `foundations.html`.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/ui storybook` starts; every Foundations story renders in light and dark.
- [ ] The a11y panel shows 0 violations on the Foundations stories.
- [ ] Storybook builds in CI.

**PR title:** `chore(ui): storybook + foundations stories`

### M1 — First API

#### T07 · NestJS app + health + validated config

**Roadmap** p05 · **Spec** §1.6 · **Depends** T01 · **Size** M

**Goal.** A NestJS app at `:4000` with the `/api` prefix, config that fails fast on bad env values, and `GET /api/health`.

**Scope.**
- Scaffold with `nest new` (pnpm, strict) into a temp folder, then move into `apps/api` (keep `apps/api/STRUCTURE.md`). Package name `@portfolio/api`.
- `src/main.ts`: `setGlobalPrefix('api')`, `enableShutdownHooks()`, listen on `API_PORT` / `API_HOST` (`127.0.0.1`, D9). **No** `enableCors()` (D9).
- `src/config/`: `env.schema.ts` (zod: `NODE_ENV`, `API_PORT`, `API_HOST`, `WEB_ORIGIN`), `app-config.service.ts` (typed getters), `config.module.ts` (`@nestjs/config`, global, `validate: (raw) => envSchema.parse(raw)`, reads the root `.env`).
- `src/modules/health/`: `health.module.ts`, `health.controller.ts` (`GET /health` → `{ status: "ok" }`).
- Replace Jest with Vitest + `unplugin-swc` (Nest decorators need SWC's metadata), first test `health.controller.spec.ts`.
- `apps/api/api.http` with the health request. Root `pnpm dev` now runs web and api in parallel.

**Out of scope.** Prisma (T08), error filter (T10).

**Files.** `apps/api/package.json`, `apps/api/nest-cli.json`, `apps/api/tsconfig*.json`, `apps/api/vitest.config.ts`, `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts,config.module.ts}`, `apps/api/src/modules/health/{health.module.ts,health.controller.ts,health.controller.spec.ts}`, `apps/api/api.http`, `.env.example` ([api STRUCTURE](../apps/api/STRUCTURE.md)).

**Design.** None.

**Backend steps, explained.**
1. **What Nest gives you.** A *module* groups one feature. A *controller* maps a URL to a method. A *service* holds the logic. Nest creates these classes and hands them to each other (*dependency injection*): you ask for `AppConfigService` in a constructor and Nest passes it in.
2. **Bootstrap (`main.ts`).** Creates the app from `AppModule`, sets `/api` in front of every route, and starts listening. `127.0.0.1` means only your machine can call it until guards exist (T36).
3. **Config.** `.env` values are strings. The zod schema turns `API_PORT="4000"` into the number 4000 and stops the app at start-up if a value is missing or wrong, so you never debug a half-configured server.
4. **Health module.** `@Controller('health')` + `@Get()` = `GET /api/health`. Health checks are what Docker and uptime monitors call later (T58, T61).
5. **Try it.** `curl localhost:4000/api/health`, or click "Send Request" in `api.http`.
6. **Test it.** The spec file creates the controller and checks the return value. Vitest needs SWC because Nest reads TypeScript type metadata at runtime.

**Acceptance.**
- [ ] `curl localhost:4000/api/health` returns `{"status":"ok"}` (roadmap p05).
- [ ] Setting `API_PORT=abc` stops the app at start-up with a readable zod error.
- [ ] The API is not reachable on the machine's LAN IP.
- [ ] `pnpm --filter @portfolio/api test` is green in CI.

**PR title:** `feat(api): nest app + health`

#### T08 · Prisma: site layout models, first migration, seed profiles

**Roadmap** p06 · **Spec** [§1.5](./design/portfolio-design-system.md#s-1-5), §1.6 · **Depends** T02, T07 (T03 recommended) · **Size** L

**Goal.** The first five tables from the spec, created by a migration you can read, filled by an idempotent seed, and available to every service through `PrismaService`.

**Scope.**
- Install Prisma (pin the version). If Prisma 7+, add `prisma.config.ts` and the MariaDB driver adapter (it supports MySQL) as the Prisma docs describe for that version.
- `prisma/schema.prisma` with the §1.5 conventions (autoincrement `id`, `createdAt`/`updatedAt`, `En`/`Vi` column pairs, `sortOrder`/`isVisible`, `@@map` to snake_case, `@db.Text` for markdown):
  - `SiteSettings` (1 row): all §1.5 fields including `ambientEffects`, `marqueeEnabled`; `ogImageId` as a plain `Int?` until media exists (T50 adds the relation).
  - `Profile` (1 row): all §1.5 fields including `heroKicker{En,Vi}`, `headlineAccent{En,Vi}`, private `phone`; `avatarId`, `resumeEnId`, `resumeViId` as plain `Int?` for now.
  - `NavItem`, `SocialLink` (with `showInHeader`, `showInCta`).
  - The page pair (D26): `Page` (`key` enum `PageKey` `@unique`; `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`) and `PageBlock` (`pageId` → `Page` with `onDelete: Cascade`, `type` `VarChar(48)`, `key` `VarChar(48)`, `schemaVersion Int @default(1)`, `props Json`, `layout` enum `LayoutPreset`, `surface` enum `BlockSurface` (`PLAIN` | `BAND`), `sortOrder`, `isVisible`; `@@unique([pageId, key])`, `@@index([pageId, sortOrder])`). `type` is a plain string, not a DB enum, so a new block type later needs no migration; T10a checks it against the registry.
  - Enums `Availability`, `NavLocation`, `SocialKind`, `PageKey`, `LayoutPreset`, `BlockSurface`.
- First migration `pnpm prisma migrate dev --name init-site`.
- Seed (D13): `prisma/seed/seed.ts` reads `SEED_PROFILE` (`demo` | `baseline`) and runs `profiles/demo.seed.ts` or `profiles/baseline.seed.ts`; rows come from `prisma/seed/data/site.data.ts`. Placeholder values only: copy from the wireframes/mockups, `contactEmail: '<email>'`, `phone: '<phone>'`. Seed the five `Page` rows and their default blocks from D18 (`prisma/seed/data/pages.data.ts`: `type`, `key`, `layout`, `surface`, placeholder `props` with `{ en, vi }` text). Upsert on unique keys so running twice changes nothing.
- `src/prisma/prisma.module.ts` (`@Global`) and `prisma.service.ts` (extends `PrismaClient`, connects on module init).
- `GET /api/health` also returns `db: "ok"` after `SELECT 1`.
- Scripts `db:migrate`, `db:reset`, `db:seed`, `db:studio`.

**Out of scope.** Content tables (T15+), public endpoints (T09).

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_init_site/`, `apps/api/prisma/seed/seed.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/prisma/seed/data/{site,pages}.data.ts`, `apps/api/prisma.config.ts` (Prisma 7+), `apps/api/src/prisma/{prisma.module.ts,prisma.service.ts}`, `apps/api/src/modules/health/health.controller.ts`.

**Design.** Spec §1.5 tables "Site" and "About · Profile"; D18 default blocks, D26.

**Backend steps, explained.**
1. **ORM.** Prisma turns `schema.prisma` into SQL tables and a typed client. You write `prisma.profile.findUnique({ where: { id: 1 } })` instead of SQL, and TypeScript knows every column.
2. **Schema conventions.** Read the §1.5 conventions table first. Two columns per translated text (`headlineEn`, `headlineVi`) keeps things visible in Adminer; singletons are a table with one row, `id = 1`.
3. **Migration.** `migrate dev --name init-site` compares the schema with the DB and writes a SQL file in `prisma/migrations/`. **Open it and read it**: you will see `CREATE TABLE`, the unique index on `(page, key)`, and `utf8mb4`. That file is committed and never edited (rule 6). If you see error P3014, the shadow-database grant from T02 is missing.
4. **Seed.** A script that fills an empty DB. `upsert` (update-or-insert) makes it safe to run again. Two profiles: `demo` gives dev and CI a full site, `baseline` is what production starts with (D13).
5. **PrismaService.** One shared connection, registered as a global Nest provider, so any service can ask for it in its constructor instead of opening its own connection.
6. **Look at the data.** `pnpm db:studio` opens Prisma Studio; Adminer works too.
7. **A JSON column.** `PageBlock.props` is MySQL `JSON`: each row may have its own shape. Open one in Adminer to see it. MySQL does not check what is inside; T10a adds that check in code.

**Acceptance.**
- [ ] `pnpm --filter @portfolio/api prisma migrate reset` recreates the tables and seeds them (roadmap p06).
- [ ] Prisma Studio shows rows in SiteSettings, Profile, NavItem, SocialLink, Page, PageBlock (roadmap p06, adjusted by D12).
- [ ] Running the seed twice leaves the same row counts.
- [ ] The PR description summarizes the generated SQL.
- [ ] `rg` for email/phone patterns in `apps/api/prisma` finds only `<email>` and `<phone>`.
- [ ] `GET /api/health` returns `{"status":"ok","db":"ok"}`.

**PR title:** `feat(api): prisma schema + seed`

#### T09 · Contracts package + `GET /api/public/site`

**Roadmap** p07 · **Spec** §1.5 ("Two API shapes"), §4.5 ("Critical data"), §5.0 (Layout row) · **Depends** T08 · **Size** L

**Goal.** One public endpoint that returns everything the layout needs, already in the requested language, typed by a shared contracts package.

**Scope.**
- Create `packages/contracts` (`@portfolio/contracts`, depends on `zod` only; zod 4, because blocks use `.meta()` and `z.toJSONSchema`, D26). Build with `tsup` to `dist/` (ESM + CJS + types) so Nest can consume it; root `pnpm dev` runs `tsup --watch`.
- Contracts: `common/locale.schema.ts`, `common/api-error.schema.ts`, and public DTO schemas in `site-settings/`, `profile/`, `navigation/`, `social-links/`, `public-site/` (`[domain].schema.ts` + `[domain].type.ts` + `[domain].enum.ts`), `constants/routes.constant.ts` (real public routes for `NavItem.href`).
- API `src/i18n/`: `locale.decorator.ts` (`@Locale()` reads `?locale`, default `en`), `pick-locale.util.ts` implementing D19 (`pickGroup(row, ['headline', 'subheadline'], locale)` → `{ headline, subheadline, lang }`), with `pick-locale.util.spec.ts`.
- Owning modules (service + entity + mapper, no controllers yet): `site-settings`, `profile`, `navigation`, `social-links`. The profile mapper never outputs `phone`. Page blocks get their own module and endpoint in T10a.
- `modules/public-site/`: `public-site.controller.ts` (`GET /public/site`), `public-site.service.ts` (calls the four services in parallel; visible rows only, ordered by `sortOrder`). Response: `{ settings, profile, nav: { header, footer }, socialLinks }`. `profileStats` is added by T15.
- A missing singleton returns 404 `{ code: "NOT_SEEDED", message }`. T10 makes this the full error body.
- `api.http` request with `?locale=en` and `?locale=vi`.

**Out of scope.** Global validation and the error filter (T10). Web consumption (T11).

**Files.** `packages/contracts/{package.json,tsconfig.json,tsup.config.ts}`, `packages/contracts/src/index.ts`, `packages/contracts/src/common/{locale.schema.ts,api-error.schema.ts}`, `packages/contracts/src/{site-settings,profile,navigation,social-links,public-site}/*`, `packages/contracts/src/constants/routes.constant.ts`, `apps/api/src/i18n/{locale.decorator.ts,pick-locale.util.ts,pick-locale.util.spec.ts}`, `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{[domain].module.ts,[domain].service.ts,entities/*}`, `apps/api/src/modules/public-site/{public-site.module.ts,public-site.controller.ts,public-site.service.ts}`, `apps/api/api.http` ([root STRUCTURE: contracts](../STRUCTURE.md#package-layout-packagescontracts), [api module layout](../apps/api/STRUCTURE.md#module-layout)).

**Design.** Spec §5.0 "Layout: header, footer" row; §1.5 "Two API shapes".

**Backend steps, explained.**
1. **Contracts.** A zod schema describes a JSON shape once. The API uses it to check its output in tests, the web uses the inferred type, and later the admin form uses the same schema to validate input.
2. **One module per table.** `profile` owns the `Profile` table: only `ProfileService` queries it. `public-site` owns no table; it asks the four services and combines the results. This rule keeps queries in one place per table.
3. **Entity and mapper.** The entity file fixes which columns we load. The mapper turns the DB row into the public DTO: it picks `headlineVi` or `headlineEn` and drops private fields like `phone`.
4. **Locale fallback (D19).** If Vietnamese is missing for any field in a group, the whole group is English and carries `lang: "en"` so the page can mark it for screen readers and fonts.
5. **Parallel reads.** `Promise.all` runs the four queries at the same time instead of one after another.

**Acceptance.**
- [ ] `GET /api/public/site?locale=vi` returns flat fields (`headline`, not `headlineVi`) from the seed (roadmap p07).
- [ ] Clearing `Profile.subheadlineVi` in Adminer makes the profile group English with `lang: "en"`.
- [ ] Hidden nav items are not returned; order follows `sortOrder`.
- [ ] `phone` never appears in the response (mapper unit test).
- [ ] With an empty DB (`migrate reset --skip-seed`), the endpoint returns 404 with `code` + `message` (roadmap p07).

**PR title:** `feat(api): public read endpoints`

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
1. **The request pipeline.** Read the diagram in [api STRUCTURE](../apps/api/STRUCTURE.md#how-a-request-flows): middleware → guards → pipes → controller → service, and the filter catches anything thrown along the way.
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

**Files.** `packages/contracts/src/blocks/{localized.schema.ts,block-layout.constant.ts,define-block.util.ts,block-registry.constant.ts,block.schema.ts,block.type.ts,resolve-block.util.ts,resolve-block.util.test.ts}`, `packages/contracts/src/blocks/definitions/{hero,page-header,cta-band}.block.ts`, `packages/contracts/src/pages/{pages.schema.ts,pages.type.ts,pages.enum.ts}`, `packages/contracts/src/index.ts`, `apps/api/src/modules/pages/{pages.module.ts,public-pages.controller.ts,pages.service.ts,pages.service.spec.ts,entities/page.entity.ts,entities/page.mapper.ts}`, `apps/api/src/app.module.ts`, `apps/api/prisma/seed/data/pages.data.ts`, `apps/api/api.http` ([root STRUCTURE: contracts](../STRUCTURE.md#package-layout-packagescontracts), [api: pages and blocks](../apps/api/STRUCTURE.md#pages-and-blocks)).

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

**Roadmap** p09 · **Spec** [§4.6](./design/portfolio-design-system.md#s-4-6), §4.5, §5 intro · **Depends** T05, T09 · **Size** L

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

**Files.** `apps/web/middleware.ts`, `apps/web/next.config.ts`, `apps/web/i18n/{routing.ts,request.ts,navigation.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `apps/web/app/[locale]/layout.tsx`, `apps/web/app/[locale]/(site)/{layout.tsx,page.tsx}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts,site.service.ts}`, `apps/web/src/modules/core/utils/{api-error.util.ts,query-client.util.ts}`, `apps/web/src/modules/core/components/Providers/{Providers.tsx,QueryProvider.tsx}`, `apps/web/src/modules/home/views/HomeIndex.tsx`, `packages/contracts/src/constants/query-keys.constant.ts`, `eslint.config.mjs` ([web STRUCTURE: data](../apps/web/STRUCTURE.md#data-services-hooks-actions), [i18n](../apps/web/STRUCTURE.md#i18n)).

**Design.** None visible beyond the temporary home text.

**Acceptance.**
- [ ] `/` redirects to `/en`; `/en` and `/vi` render the seeded headline; `<html lang>` matches the locale.
- [ ] Changing a seed value and re-seeding changes the page (roadmap p09).
- [ ] `curl localhost:3000/api/health` returns the API's response (rewrite works).
- [ ] A literal string in a view fails `pnpm lint`.
- [ ] There is no `app/layout.tsx`.

**PR title:** `feat(web): data layer, i18n and locale layout`

#### T12 · UI primitives matching Figma component sets

**Roadmap** p09 (prep) · **Spec** [§4.0](./design/portfolio-design-system.md#s-4-0), [§4.1](./design/portfolio-design-system.md#s-4-1), §4.7 (`Eyebrow`, `KickerPill`) · **Depends** T06 · **Size** M

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

**Roadmap** p09 · **Spec** [§4.5](./design/portfolio-design-system.md#s-4-5), [§4.7](./design/portfolio-design-system.md#s-4-7), §3.1b, §3.4, §4.3 (`StatusPill`) · **Depends** T12 · **Size** M

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

**Roadmap** p09 · **Spec** [§4.2](./design/portfolio-design-system.md#s-4-2), §4.5, [§5.1](./design/portfolio-design-system.md#s-5-1), §7.1 · **Depends** T11, T13 · **Size** L

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
4. **One module per table.** Five small modules with the same shape. Use the scaffold command from [api STRUCTURE](../apps/api/STRUCTURE.md#new-api-module).

**Acceptance.**
- [ ] Each endpoint returns seeded, localized rows in order; hidden rows are excluded.
- [ ] `profileStats` shows years computed from `careerStartDate`; changing the date in Adminer changes the value (spec §6 Day 8 v2 check).
- [ ] Unit tests for the stat resolver.

**PR title:** `feat(api): about content models`

#### T16 · Domains + projects + metrics (one-to-many)

**Roadmap** p10 · **Spec** §1.5 (Work group + v2), §5.0 (projects, domains rows), §5.3, §5.4 · **Depends** T15 · **Size** L

**Goal.** Projects with their metrics, domain and optional experience link, readable through public list/detail endpoints, with domain project counts.

**Scope.**
- Models: `Domain` (`hue` enum `JADE|AMBER|BLUE|VIOLET|ROSE`, `iconKey`), `Project` (all §1.5 fields incl. `keyFacts{En,Vi}`, `factChips{En,Vi}`, `versionFrom/To`, `isFeatured`, `isConfidential`, `status`, `publishedAt`, `domainId?`, `experienceId?`; `coverId` as plain `Int?` until T50), `ProjectMetric`. Enums `ContentStatus`, `Hue`. Migration `add-projects`. `ProjectImage` waits for `Media` (T50).
- Contracts: `domains/`, `projects/` (list item DTO with domain + top metric; detail DTO with metrics, experience summary, domain; `keyFacts` → `string[]` by line, `factChips` → `string[]` by comma, max 6).
- Modules: `domains` (`GET /public/domains` with published project counts via `_count`), `projects` (`GET /public/projects?featured&domain`, `GET /public/projects/:slug`; `PUBLISHED` only; unknown or unpublished slug → 404). Confidential projects never return `liveUrl`, `repoUrl` or images.
- `PROJECT_COUNT` stat now counts published projects.
- Seed (`data/work.data.ts`): 4 domains (spec §1.5 v2 seed), 4 projects linked to domains and experiences, metrics from the wireframes. `demo` publishes them; `baseline` keeps them `DRAFT` (D13).

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_projects/`, `apps/api/prisma/seed/data/work.data.ts`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/src/modules/domains/*`, `apps/api/src/modules/projects/{projects.module.ts,public-projects.controller.ts,projects.service.ts,projects.service.spec.ts,entities/project.entity.ts,entities/project.mapper.ts}`, `apps/api/src/modules/profile-stats/profile-stats.service.ts`, `packages/contracts/src/{domains,projects}/*`, `apps/api/api.http`.

**Design.** Spec §5.3 and §5.4 data needs; Figma `13:2`, `4:2`/`5:2` (fields shown on cards and the case study).

**Backend steps, explained.**
1. **One-to-many.** One project has many metrics. `ProjectMetric.projectId` is a *foreign key*: the DB refuses a metric that points at a missing project. In Prisma you write the relation on both models.
2. **Read the SQL.** The migration shows `FOREIGN KEY … REFERENCES project(id)` and an index on `projectId` (MySQL adds one so joins stay fast).
3. **`include` vs `select`.** `include: { metrics: true }` adds related rows; `select` picks exact columns. The entity file fixes which one each endpoint uses, so the mapper always gets the same shape.
4. **Counting with `_count`.** `include: { _count: { select: { projects: { where: { status: 'PUBLISHED' } } } } }` gets domain counts in one query instead of one query per domain (avoids the "N+1" problem).
5. **Status filter.** Public queries always add `status: 'PUBLISHED'`. A draft must look exactly like a missing row (404), so nobody can guess unpublished slugs.

**Acceptance.**
- [ ] `GET /api/public/projects/:slug` includes the linked experience in one response (roadmap p10).
- [ ] The new migration SQL shows the foreign key and an index (roadmap p10); summarized in the PR.
- [ ] `GET /api/public/domains` returns project counts via `_count` (spec §6 Day 9 v2 check).
- [ ] With `SEED_PROFILE=baseline`, the list is empty and every detail URL returns 404.

**PR title:** `feat(api): projects relation`

#### T17 · Skills (many-to-many) + project filters

**Roadmap** p11 · **Spec** §1.5 (`SkillCategory`, `Skill`, `showInMarquee`), §5.0 (skills, marquee rows) · **Depends** T16 · **Size** M

**Goal.** Skills grouped by category and depth, linked to projects and experiences, with a skill filter on the projects list.

**Scope.**
- Models: `SkillCategory`, `Skill` (`slug @unique`, `depth` enum `DAILY|SHIPPED|GROWING`, `showInMarquee`, `sortOrder`, `isVisible`); implicit many-to-many `Project.skills` ↔ `Skill.projects` and `Experience.skills` ↔ `Skill.experiences` (D10). Migration `add-skills`.
- Contracts `skills/`. Module `skills`: `GET /public/skills` (grouped by depth, each with its category), `GET /public/skills?marquee=1` (flat list where `showInMarquee`).
- Project list/detail DTOs gain `skills` (tech chips). `GET /public/projects?skill=<slug>` filters with `skills: { some: { slug } }`.
- Seed (`data/skills.data.ts`): ~25 skills in 5 categories (spec §1.4 item 5 grouping), ~10 with `showInMarquee`, linked to projects and experiences.

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_skills/`, `apps/api/prisma/seed/data/skills.data.ts`, `apps/api/src/modules/skills/*`, `apps/api/src/modules/projects/{projects.service.ts,entities/*}`, `packages/contracts/src/skills/*`, `packages/contracts/src/projects/projects.schema.ts`.

**Design.** Spec §5.1 skills and marquee; §5.3 tech combobox.

**Backend steps, explained.**
1. **Many-to-many.** A project uses many skills and a skill appears in many projects. Writing `skills Skill[]` on `Project` and `projects Project[]` on `Skill` makes Prisma create a hidden join table `_ProjectToSkill` with two foreign keys.
2. **Filtering through a relation.** `where: { skills: { some: { slug: 'nuxt' } } }` means "projects with at least one skill whose slug is nuxt".
3. **Avoid N+1.** Load skills with the projects in the same query (`include`), never in a loop per project.

**Acceptance.**
- [ ] `GET /api/public/projects?skill=nuxt` returns only matching projects (roadmap p11).
- [ ] Join rows are visible in Prisma Studio (`_ProjectToSkill`, roadmap p11 adjusted by D10).
- [ ] `GET /api/public/skills?marquee=1` returns only marquee skills.

**PR title:** `feat(api): skills m2m + filters`

#### T18 · Posts + tags (markdown, publish lint)

**Roadmap** p12 · **Spec** §1.5 (Writing group, `Post.takeaways`), §5.5, §6 Day 10 · **Depends** T17 · **Size** M

**Goal.** Notes stored as markdown with tags, visible only when published, with the publish rules shared by the API and the admin.

**Scope.**
- Models: `Post` (all §1.5 fields + `takeaways{En,Vi}`; `coverId` plain `Int?` until T50), `Tag`; implicit `Post.tags` ↔ `Tag.posts`. Migration `add-posts`.
- Contracts: `posts/` (public list item, detail, and the admin input schema: slug format, `takeaways` ≤ 5 lines, required English title/excerpt/body), `tags/`, `common/publish-lint.util.ts` (rejects `{{`, `TODO`, `lorem` in English fields; returns `fieldErrors`).
- `common/utils/reading-time.util.ts` (+ spec): words / 220, rounded up; used by seed now and by the write API in T30.
- Modules: `posts` (`GET /public/posts?tag`, `GET /public/posts/:slug`; `PUBLISHED` only; on `vi`, a post without `bodyVi` falls back per D19 with `lang: "en"`), `tags` (`GET /public/tags` with published post counts).
- Seed (`data/posts.data.ts`): `demo` = 3 published sample posts (titles from the mockups, placeholder body with a code block and a callout); `baseline` = 0 posts. The seed validates rows with the contracts schema.

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_posts/`, `apps/api/prisma/seed/data/posts.data.ts`, `apps/api/src/modules/{posts,tags}/*`, `apps/api/src/common/utils/reading-time.util.ts` (+ `.spec.ts`), `packages/contracts/src/{posts,tags}/*`, `packages/contracts/src/common/publish-lint.util.ts` (+ `.test.ts`).

**Design.** Spec §5.5; mockups `notes.html`, `post.html`.

**Backend steps, explained.**
1. **Markdown in a text column (D3).** The body is plain text in `@db.Text`. The web renders it safely (T23). The DB never stores HTML.
2. **Validation at the edge.** The same zod schema checks seed rows now and admin input later. A bad row stops with a readable zod message, not a 500 page.
3. **Publish lint.** Placeholder text (`TODO`, `lorem`, `{{`) must never go live. The rule lives in contracts so the admin can warn before the API refuses.

**Acceptance.**
- [ ] A draft post is absent from `GET /api/public/posts`, and `GET /api/public/posts/:slug` returns 404 (roadmap p12).
- [ ] An invalid post row is rejected with a zod error at seed time, not a 500 (roadmap p12, adjusted by D3).
- [ ] `GET /api/public/posts?locale=vi` returns English with `lang: "en"` for a post without `bodyVi` (spec §6 Day 10).
- [ ] `publishLint` unit tests cover `TODO`, `lorem`, `{{`.

**PR title:** `feat(api): posts with markdown`

#### T19 · List query contract (page, sort, search)

**Roadmap** p13 · **Spec** §1.6, §4.6 (URL-driven lists) · **Depends** T18 · **Size** M

**Goal.** One list query format for every list endpoint (D6), validated by zod, with stable paging.

**Scope.**
- `packages/contracts/src/common/list-params.schema.ts`: `listParamsSchema` (`page` ≥ 1, `pageSize` 1–100, `sort` from a per-entity allowlist such as `-publishedAt`, `q` ≤ 100 chars) and `paginatedSchema(item)` → `{ items, page, pageSize, total }`. Entity extensions: `postListParamsSchema` (`tag`, `q`), `projectListParamsSchema` (`domain`, `skill`, `featured`).
- Apply to `GET /public/posts` and `GET /public/projects`. Every `orderBy` ends with `id` as a tiebreaker. `q` searches English and Vietnamese titles with `contains`. Count and rows run in one `$transaction`.
- `common/utils/paginate.util.ts` (skip/take + total).

**Files.** `packages/contracts/src/common/list-params.schema.ts` (+ `.test.ts`), `packages/contracts/src/{posts,projects}/*.schema.ts`, `apps/api/src/common/utils/paginate.util.ts`, `apps/api/src/modules/{posts,projects}/{*.service.ts,dto/*-list-query.dto.ts}`, `apps/api/api.http`.

**Design.** Admin table footer "1–5 of 5" (Figma `15:2`) shows why lists return `total`.

**Backend steps, explained.**
1. **Query params are input too.** `?pageSize=500` is user input. The zod schema caps it, so nobody can ask the DB for a million rows.
2. **Stable order.** Two posts with the same `publishedAt` can swap places between pages. Adding `id` as the last sort key makes the order unique, so pages never repeat or skip rows.
3. **Count and rows together.** `$transaction([count, findMany])` reads both from the same snapshot.

**Acceptance.**
- [ ] Paging through all posts with `pageSize=1` returns no duplicates or gaps, including two seeded posts with the same `publishedAt` (roadmap p13).
- [ ] `pageSize=500` returns 400 with a field error on `pageSize` (roadmap p13, adjusted by D6).
- [ ] Responses have the `{ items, page, pageSize, total }` shape.

**PR title:** `feat(api): list query contract`

#### T20 · Cards: DiffStat, CaseCard, DomainCard, PostCard

**Roadmap** p14 · **Spec** §4.2 (`DiffStat`), §4.7 (`CaseCard`, `DomainCard`, `PostCard`, `KeyFacts`, `FactChips`), §3.4, §7.1 G5–G6 · **Depends** T13, T18 · **Size** M

**Goal.** The cards that carry projects, domains and posts across home, lists and the admin preview, matching the Figma CaseCard set.

**Scope.**
- `DiffStat` (value + label; diff variant `before → after` in mono with `+`/`−` gutter; `tabular-nums`).
- `CaseCard` (variants `default` and `featured` (wide: cover left 7 cols, text right 5 on `lg`); domain pill = `Badge hue` + `Icon`; `↗` corner `aria-hidden`; title `text-subheading`; 2–3 line tagline; `DiffStat` line for the top metric; max 4 mono chips then "+N"; NDA pill when confidential; cover slot with a CSS-only `CoverPlaceholder` until media exists).
- `DomainCard` (hue-tinted icon tile, title, one-line description, mono count top-right, 2px hue top edge on hover; whole card links to `/projects?domain=slug`).
- `PostCard` (variants `row` and `featured`; mono `date · minutes`, title + `↗`, 2-line excerpt, `#tag` chips, "EN" badge when `lang` is `en`).
- `KeyFacts` (2×2 cards with hue dot) and `FactChips` (mono chip row).
- One-link cards: the title is the only link, stretched with `::after`; hover style also on `:focus-within`; no lift under reduced motion. Links render through a `renderLink` prop so the web passes next-intl `Link` (no `next/*` import in `packages/ui`).
- Chrome text arrives as props (`labels.nda`, `labels.minutes`, `labels.projects`).
- Fixtures: `packages/contracts/src/fixtures/{projects,domains,posts}.fixture.ts` (placeholder text only).

**Files.** `packages/ui/src/components/{DiffStat,CaseCard,CoverPlaceholder,DomainCard,PostCard,KeyFacts,FactChips}/*`, `packages/contracts/src/fixtures/{projects,domains,posts}.fixture.ts`.

**Design.** Figma set CaseCard (Default/Hover × Theme); cards in `13:2`, `2:2`/`3:2`, `9:2`. Mockups `projects.html`, `home.html`, `notes.html` (one card in `.is-hover`). Tokens: `--card`, `--border`, `--border-strong`, `--shadow-1`, `--shadow-2`, `--hue-*`, `--hue-*-subtle`, `--primary`, `text-subheading`, `text-body`, `text-meta`, `text-eyebrow`, `--ease-out`.

**Acceptance.**
- [ ] Each card has a single Tab stop and activates with Enter.
- [ ] Focus-within looks like hover (spec §6 Day 6 v2 check).
- [ ] CaseCard stories match the Figma set in both themes; "+N" overflow and NDA states have stories.
- [ ] Clamped text has `padding-block: 0.15em` so Vietnamese marks are not cut.

**PR title:** `feat(ui): case, domain and post cards`

#### T21 · Rich sections: StatBand, TechMarquee, ProcessFlow, PrincipleList, FeatureCard, SkillGroup

**Roadmap** p14 · **Spec** §4.7, §4.2 (`SkillGroup`), §3.4 · **Depends** T13, T17 · **Size** M

**Goal.** The pure components behind the home stats, marquee, process and skills sections and the About principles.

**Scope.**
- `StatBand` / `StatItem` (2×2 mobile, 4 columns desktop; icon tile, number `text-title` heading font `--primary` `tabular-nums`, mono label; optional count-up that keeps the final value in the accessible name and reserves width so there is no layout shift; `compact` variant for About).
- `TechMarquee` (client: two tracks, second `aria-hidden`, edge fade masks, pause button with `aria-pressed`; static row when `enabled={false}`, fewer than 6 items, or reduced motion).
- `ProcessFlow` (`<ol>` of step cards joined by `↓` connectors `aria-hidden`; middle step highlighted with `--primary-subtle`).
- `PrincipleList` (`<ol>`, 2 columns, mono `01 —` numbers).
- `FeatureCard` (icon tile + title + 2-line body on `--card-glass`).
- `SkillGroup` (columns by depth; depth headings passed as labels).
- Stories with fixtures; tests for marquee fallback rules and the stat accessible name.

**Files.** `packages/ui/src/components/{StatBand,TechMarquee,ProcessFlow,PrincipleList,FeatureCard,SkillGroup}/*`, `packages/contracts/src/fixtures/{profile-stats,skills,process-steps,principles}.fixture.ts`.

**Design.** Figma `2:2`/`3:2` (stats band, marquee, process band, skills), `7:2` (principles). Mockups `home.html`, `about.html`. Tokens: `--band`, `--card-glass`, `--primary`, `--primary-subtle`, `--muted`, `text-title`, `text-eyebrow`, `--ease-in-out`.

**Acceptance.**
- [ ] With reduced motion, the marquee is a static row and count-up shows final values at once.
- [ ] Marquee pause button toggles `aria-pressed` and stops the animation.
- [ ] Stories in both themes compared with the home and About frames.

**PR title:** `feat(ui): rich section components`

#### T22 · MigrationDiagram

**Roadmap** p14 · **Spec** §4.7 (`MigrationDiagram`), §5.1 hero · **Depends** T13, T17 · **Size** M

**Goal.** The hero SVG that shows a v1 → v2 migration built from the featured project's data.

**Scope.**
- `MigrationDiagram` (SVG): left node `versionFrom`, right node `versionTo`, 3–6 component nodes (skill names) rewiring between them, mono labels. Fallback when versions are missing: the `ProcessStep` names as a vertical chain. Node labels use the field values as they are (see Q8).
- `role="img"` with an `aria-label` passed in by the web (built from data with a chrome template), plus an `sr-only` text alternative.
- Rewiring animation off under reduced motion; scales down below the hero buttons on mobile.
- Stories: full data, fewer skills, fallback chain, both themes.

**Files.** `packages/ui/src/components/MigrationDiagram/*`.

**Design.** Figma `2:2`/`3:2` hero right column, `8:2` (below buttons). Mockup `home.html` hero. Tokens: `--card`, `--border`, `--primary`, `--primary-subtle`, `--muted-foreground`, `--font-mono`.

**Acceptance.**
- [ ] Screen readers announce one image with a data-built label; the `sr-only` text lists the nodes.
- [ ] Nothing moves under reduced motion.
- [ ] At 390px the diagram fits without horizontal scroll.

**PR title:** `feat(ui): migration diagram`

#### T23 · Markdown pipeline + Prose + CodeBlock + reading aids

**Roadmap** p14 · **Spec** §3.2 (long-form, code), §4.1 (`Prose`, `CodeBlock`), §4.2 (`SectionNav`), §4.7 (`ContentProgress`, `RequirementColumns`), §5.4, §5.5, D3 · **Depends** T11, T12 · **Size** L

**Goal.** One safe way to turn stored markdown into readable, accessible pages, and the reading aids used by case studies and posts.

**Scope.**
- `content` module (server only): `services/markdown.service.ts` runs `remark-parse` → `remark-gfm` → `remark-rehype` (no raw HTML) → `rehype-slug` → `rehype-sanitize` (schema built from the shared allowlist below) → Shiki (one CSS-variables theme via `createCssVariablesTheme`: token colors are `var(--shiki-token-*)`, so light and dark come from the palette; comments ≥ 4.5:1; only `MARKDOWN_CODE_LANGUAGES` are loaded, anything else renders as plain text) → `hast-util-to-jsx-runtime`, mapping elements to `packages/ui` components. GitHub-style alerts (`> [!NOTE]`, `> [!WARNING]`) become `Callout`. No `dangerouslySetInnerHTML`.
- Shared Markdown allowlist (D25), the one list both this renderer and the admin editor (T42) obey: `packages/contracts/src/constants/markdown.constant.ts` (`MARKDOWN_HEADING_LEVELS = [2, 3]`; `MARKDOWN_CALLOUT_KINDS = ['NOTE', 'WARNING']`; `MARKDOWN_CODE_LANGUAGES` = ts, tsx, js, jsx, json, bash, css, html, sql, prisma, yaml, md, diff, vue; `MARKDOWN_LINK_PROTOCOLS = ['http', 'https', 'mailto']` plus relative `/…` and `#…`; images only from `/api/public/media/`) and `packages/contracts/src/common/markdown-url.util.ts` (`isAllowedMarkdownUrl`, `isAllowedImageSrc`). Allowed constructs: paragraphs, H2/H3, bold, italic, strikethrough, inline code, links, bullet and ordered lists, blockquotes, callouts, fenced code with a language, horizontal rules, images with alt text, GFM tables, hard breaks. Everything else (raw HTML, H1, footnotes, task lists, embeds) is dropped or rendered as plain text. An H1 in stored Markdown renders as H2.
- Fixtures in `packages/contracts/src/fixtures/`: `markdown-kitchen-sink.fixture.ts` (every allowed construct once) and `markdown-unsafe.fixture.ts` (`<script>`, `<iframe>`, an `onerror` attribute, a `javascript:` link, an external image, an H1). T42 reuses both.
- `packages/ui/src/styles/code-syntax.css` (imported by `globals.css`): the `--shiki-foreground`, `--shiki-background` and `--shiki-token-*` variables as aliases of palette tokens only (default mapping: keyword → `--primary`, string → `--hue-jade`, constant → `--hue-amber`, function → `--hue-violet`, comment and punctuation → `--muted-foreground`, background → `--muted`; adjust inside the palette if a contrast check fails). The admin editor's highlighter reads the same variables (T42).
- `content` utils: `toc.util.ts` (h2/h3 → TOC items), `split-sections.util.ts` (splits a markdown field at `###` headings; used for requirement columns and decision cards), `constants/shiki-theme.constant.ts`.
- `content/components/Markdown/Markdown.tsx` (server component).
- `packages/ui`: `Prose` (`prose` / `compact`; every §3.2 long-form rule: 66ch, spacing, hanging `▹` bullets, underlined links, scrollable tables in a focusable region), `CodeBlock` (filename bar, language badge, copy button with `aria-live`, focusable horizontal scroll, wrap toggle), `Callout` (icon tile), `SectionNav` (sticky on `lg+`, scroll-spy with `aria-current`, `<details>` on mobile), `ContentProgress` (2px `--primary` bar, hidden under reduced motion), `RequirementColumns` (two cards, `▹` bullets), `DecisionCard` (title + compact prose), `TakeawaysCard` (`--primary-subtle`, `▹` bullets).
- Tests: every construct of the kitchen-sink fixture renders; nothing from the unsafe fixture renders (`<script>`, inline HTML, `javascript:` links, external images); headings get ids; TOC extraction; split utility.

**Files.** `apps/web/src/modules/content/services/markdown.service.ts`, `apps/web/src/modules/content/utils/{toc.util.ts,split-sections.util.ts}` (+ tests), `apps/web/src/modules/content/constants/shiki-theme.constant.ts`, `packages/contracts/src/constants/markdown.constant.ts`, `packages/contracts/src/common/markdown-url.util.ts` (+ test), `packages/contracts/src/fixtures/{markdown-kitchen-sink,markdown-unsafe}.fixture.ts`, `packages/ui/src/styles/{globals.css,code-syntax.css}`, `apps/web/src/modules/content/components/Markdown/Markdown.tsx`, `packages/ui/src/components/{Prose,CodeBlock,Callout,SectionNav,ContentProgress,RequirementColumns,DecisionCard,TakeawaysCard}/*`.

**Design.** Figma `10:2` (post), `4:2`/`5:2` (case study). Mockups `post.html`, `case-study.html`. Tokens: `text-prose`, `text-heading`, `text-subheading`, `text-meta`, `--measure`, `--muted`, `--subtle-foreground`, `--primary`, `--primary-subtle`, `--radius-lg`, `--font-mono`.

**Acceptance.**
- [ ] A markdown sample with `<script>`, an `onerror` attribute and a `javascript:` link renders none of them (test).
- [ ] Prose measures ≤ 66ch at 18px / 1.75; headings have anchor links.
- [ ] Code blocks are keyboard-scrollable, copy announces "Copied", and both themes meet contrast.
- [ ] TOC highlights the current section while scrolling; on mobile it is a `<details>`.

**PR title:** `feat(web): markdown pipeline and prose`

#### T24 · Home v2 complete

**Roadmap** p14 · **Spec** [§5.1](./design/portfolio-design-system.md#s-5-1), §5.0 (home rows), §4.4, §4.5, §7.2 (`01`, `02`, `05`, `09`) · **Depends** T14, T19, T20, T21, T22 · **Size** L

**Goal.** The whole home page built from the home blocks (D26), in their order, visibility and layout, matching the home frames.

**Scope.**
- Services (server, tagged): `projects/services/{projects,domains}.service.ts`, `about/services/skills.service.ts`, `home/services/process-steps.service.ts`, `notes/services/posts.service.ts`.
- Block types (rule 8: definition + renderer + registry entries):
  - `stat-band`: `StatBand`, hidden if fewer than 2 stats.
  - `tech-marquee`: `TechMarquee`, hidden if empty, static if fewer than 6 skills or `marqueeEnabled` is false.
  - `featured-case`: featured `CaseCard`, hidden if none.
  - `domain-grid`: `DomainCard`s; cards with 0 projects are hidden.
  - `case-grid`: `CaseCard`s by `source`. `manual` keeps the `projectIds` order and skips missing or unpublished ids.
  - `process`: `FeatureCard` 2×2 from principles + `ProcessFlow`, hidden if fewer than 3 steps.
  - `skill-groups`: `SkillGroup`.
  - `post-list`: `PostCard`s, with `limit` and an optional `tag`.
  - The hero gains `MigrationDiagram` in its aside when `layout` is `SPLIT_7_5` and `showDiagram` is on.
- The §5.1 bands come from the seeded `surface` values: stats + marquee (one shared band), domains, process. `SectionHeader` with eyebrow and icon tile on every block that has a `heading`. `Reveal` on scroll.
- Each block in `SectionBoundary` with a block-shaped skeleton (Figma `21:2`) and an inline error with Retry; an optional empty block disappears with its anchor.

**Files.** `apps/web/src/modules/blocks/components/{StatBandBlock,TechMarqueeBlock,FeaturedCaseBlock,DomainGridBlock,CaseGridBlock,ProcessBlock,SkillGroupsBlock,PostListBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `apps/web/src/modules/blocks/components/HeroBlock/HeroBlock.tsx`, `packages/contracts/src/blocks/definitions/{stat-band,tech-marquee,featured-case,domain-grid,case-grid,process,skill-groups,post-list}.block.ts`, `packages/contracts/src/blocks/{block-registry.constant.ts,definitions/hero.block.ts}`, `apps/web/src/modules/home/services/process-steps.service.ts`, `apps/web/src/modules/projects/services/{projects,domains}.service.ts`, `apps/web/src/modules/about/services/skills.service.ts`, `apps/web/src/modules/notes/services/posts.service.ts`, `apps/web/i18n/locales/{en,vi}.json`.

**Design.** Figma `2:2`/`3:2` (1440 light/dark), `8:2` (390), `21:2` (loading). Mockups `home.html` (+ `?dark=1`, 390px), `home-skeleton.html`. Tokens: all v2 tokens (`--band`, `--grid-line`, `--glow`, `--card-glass`, `--hue-*`), `text-display`, `text-title`, `text-heading`.

**Acceptance.**
- [ ] Every text on the page traces to an API field; `pnpm check:content` passes (roadmap p14).
- [ ] Block order follows `PageBlock.sortOrder`; hiding the `marquee` block in Adminer removes it (spec §6 Day 7 v2 check).
- [ ] Changing the `work` block's `layout` to `TWO` in Adminer gives 2 columns from 768px; at 390px every block is one column.
- [ ] Forcing one block's endpoint to fail shows an inline alert there while the rest renders.
- [ ] Keyboard-only pass: Tab order, visible focus, cards open with Enter (roadmap p14).
- [ ] No horizontal scroll at 390px; CLS 0 from count-up and reveal.
- [ ] Screenshots at 1440 light/dark and 390 compared with the Figma frames; loading state compared with `21:2`.

**PR title:** `feat(web): home v2 sections`

#### T25 · About page + Timeline

**Roadmap** p14 · **Spec** [§5.2](./design/portfolio-design-system.md#s-5-2), §4.2 (`Timeline`), §5.0 (About rows) · **Depends** T23, T24 · **Size** L

**Goal.** The About page built from the about blocks (D26): intro, stats strip, experience timeline, principles, skills, education and CV card, plus a free `prose` block for any page.

**Scope.**
- Route `app/[locale]/(site)/about/page.tsx` → `about/views/AboutIndex.tsx`, which renders `BlocksPage` for `about`.
- Services: `about/services/{experience,education,principles}.service.ts` (+ the existing skills service).
- Block types (rule 8):
  - `about-intro` (H1): avatar card with city and availability pill; the avatar shows initials until media exists; bio via `Markdown`.
  - `timeline`: `Timeline`.
  - `principle-list`, `education-list`.
  - `cv-download`: download card, hidden while `resumeEnId`/`resumeViId` are empty; links work after T51.
  - `prose`: a free Markdown `body` and optional `aside` through the T23 pipeline, allowed on every page; `SPLIT_8_4` puts the aside on the right.
  - `stat-band` (`compact`) and `skill-groups` from T24 are allowed on ABOUT.
- `packages/ui` `Timeline` / `TimelineItem`: year rail, rows grouped by `company`, role, `<time datetime>` month ranges, "now" label for a null `endDate` (chrome), highlights in an `accordion` (open by default under reduced motion), tech tags. `<ol>`.

**Files.** `apps/web/app/[locale]/(site)/about/page.tsx`, `apps/web/src/modules/about/views/AboutIndex.tsx`, `apps/web/src/modules/blocks/components/{AboutIntroBlock,TimelineBlock,PrincipleListBlock,EducationListBlock,CvDownloadBlock,ProseBlock}/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/definitions/{about-intro,timeline,principle-list,education-list,cv-download,prose}.block.ts`, `packages/contracts/src/blocks/block-registry.constant.ts`, `apps/web/src/modules/about/services/{experience,education,principles}.service.ts`, `packages/ui/src/components/Timeline/*`, `packages/ui/src/components/ui/{accordion,avatar}.tsx`.

**Design.** Figma `7:2`. Mockup `about.html`. Tokens: `--band`, `--card`, `--border`, `--primary`, `text-title`, `text-subheading`, `text-prose`, `text-meta`.

**Acceptance.**
- [ ] The company with two roles shows as one group with two items.
- [ ] Hidden or empty optional blocks disappear with their anchors; the empty timeline shows `empty`.
- [ ] A `prose` block holding the T23 unsafe fixture renders none of the unsafe items.
- [ ] On `/vi`, fallback groups carry `lang="en"` and the "EN" badge.
- [ ] Screenshots compared with `7:2`; keyboard pass.

**PR title:** `feat(web): about + timeline`

#### T26 · Projects list

**Roadmap** p14 · **Spec** [§5.3](./design/portfolio-design-system.md#s-5-3), §5.0 (Projects list row) · **Depends** T14, T19, T20 · **Size** M

**Goal.** The projects list with domain and tech filters as URL state, rendered on the server, matching the fully token-bound Figma frame.

**Scope.**
- Route `app/[locale]/(site)/projects/page.tsx` → `projects/views/ProjectsIndex.tsx`. URL params parsed with `projectListParamsSchema`.
- `ProjectsIndex` renders `BlocksPage` for `projects`, with `searchParams` in the `BlockContext`: `page-header` (T14), then the new `projects-browser` block (rule 8; required, one per page; props `showFeatured`, `pageSize`; layout `TWO` or `THREE` for the grid), which holds the list below.
- `DomainFilter` (pills with counts and hue dots, real links `?domain=`; horizontal scroll with edge fade on mobile), `TechFilter` (client island: `popover` + `command` combobox that navigates to `?skill=`), featured wide `CaseCard`, then a 2-column grid; `empty` with "Clear filters"; `pagination` when there are more rows than `pageSize`.

**Files.** `apps/web/app/[locale]/(site)/projects/page.tsx`, `apps/web/src/modules/projects/views/ProjectsIndex.tsx`, `apps/web/src/modules/projects/components/{DomainFilter,TechFilter,ProjectsGrid}/*`, `apps/web/src/modules/blocks/components/ProjectsBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/projects-browser.block.ts,block-registry.constant.ts}`, `packages/ui/src/components/ui/{popover,pagination}.tsx`.

**Design.** Figma `13:2` (fully bound: compare variables, not only pixels). Mockup `projects.html`. Tokens: `--hue-*`, `--card`, `--border-strong`, `--shadow-2`, `text-title`, `text-body`, `text-meta`.

**Acceptance.**
- [ ] `/en/projects?skill=nuxt` and `?domain=<slug>` filter on the server (spec §6 Day 12).
- [ ] Domain filter links work without JavaScript.
- [ ] Screenshots compared with `13:2` in light and dark at 1440 and 390.

**PR title:** `feat(web): projects list`

#### T27 · Project case study

**Roadmap** p14 · **Spec** [§5.4](./design/portfolio-design-system.md#s-5-4), §5.0 (Case study rows) · **Depends** T23, T26 · **Size** L

**Goal.** The case-study page in the §5.4 order, statically generated per published slug.

**Scope.**
- Route `app/[locale]/(site)/projects/[slug]/page.tsx` → `projects/views/ProjectsDetail.tsx`; `generateStaticParams` from published slugs; `notFound()` on 404.
- Order: back link → pills (domain, NDA, `VersionTag`) → H1 + tagline → meta grid with eyebrow labels (client, role, team, period, stack) → 21:9 cover (placeholder until T51) → `KeyFacts` → outcome metrics as `DiffStat` cards → sections with eyebrows: SUMMARY (problem), LIMITS (constraints), SCOPE (`RequirementColumns` from `### Functional` / `### Non-functional`), HOW (approach), TRADE-OFFS (decisions split at `###` into `DecisionCard`s), RESULT (outcome), RETRO (lessons) → `FactChips` → "More in <domain>" (2 `CaseCard`s) → prev/next by `sortOrder`.
- Sticky `SectionNav` with stack chips and live-site link (hidden when confidential); `ContentProgress`. Faint grid in the header area only.
- Eyebrow labels are chrome strings in `i18n/locales`.

**Files.** `apps/web/app/[locale]/(site)/projects/[slug]/page.tsx`, `apps/web/src/modules/projects/views/ProjectsDetail.tsx`, `apps/web/src/modules/projects/components/{CaseStudyHeader,CaseStudyMeta,CaseStudySections,OutcomeStats,RelatedProjects,PrevNext}/*`, `apps/web/src/modules/projects/services/projects.service.ts`, `packages/ui/src/components/ui/{breadcrumb,collapsible}.tsx`.

**Design.** Figma `4:2`/`5:2`. Mockup `case-study.html` (+ `?dark=1`). Tokens: `--grid-line`, `--hue-*`, `--primary-subtle`, `text-title`, `text-prose`, `text-eyebrow`, `--radius-xl`.

**Acceptance.**
- [ ] An unpublished or unknown slug returns the 404 page.
- [ ] A confidential project shows the NDA pill and no live/repo links or images.
- [ ] TOC and progress bar work; mobile TOC is a collapsible under the header.
- [ ] Screenshots compared with both case-study frames; keyboard pass.

**PR title:** `feat(web): project case study`

#### T28 · Notes list + post

**Roadmap** p14 · **Spec** [§5.5](./design/portfolio-design-system.md#s-5-5), §4.6 (notes search island) · **Depends** T19, T20, T23 · **Size** L

**Goal.** The notes list (server first page + client search) and the post page.

**Scope.**
- Routes `app/[locale]/(site)/notes/page.tsx` → `notes/views/NotesIndex.tsx`; `notes/[slug]/page.tsx` → `notes/views/NotesDetail.tsx` (`generateStaticParams`, `notFound()`).
- List: `NotesIndex` renders `BlocksPage` for `notes`: `page-header`, then the new `notes-browser` block (rule 8; required; props `showFeatured`, `pageSize`) holding `NotesSearch` (client: `role="search"`, debounced 200ms, URL-synced `?q=&tag=`, results count in a live region, `⌘K` hint), tag pills with counts from `GET /public/tags`, year groups of `PostCard` rows, featured post as a wide card, `pagination`.
  - `notes/hooks/use-notes-search.hook.ts`: `useQuery(qk.public.posts(params))`, `placeholderData: keepPreviousData`, `initialData` = server first page when `q` is empty, abort via `signal`. `notes/services/posts-client.service.ts` uses `apiClient`.
- Post: eyebrow `NOTE · #tag`, mono date · minutes, tags, H1, `Markdown` body, `TakeawaysCard` (if `takeaways`), prev/next `PostCard`s, `SectionNav`, `ContentProgress`.
- Public `CommandPalette` gains post search (same hook).

**Files.** `apps/web/app/[locale]/(site)/notes/page.tsx`, `apps/web/app/[locale]/(site)/notes/[slug]/page.tsx`, `apps/web/src/modules/notes/views/{NotesIndex,NotesDetail}.tsx`, `apps/web/src/modules/notes/components/{NotesSearch,TagFilter,PostList,PostHeader,PostPrevNext}/*`, `apps/web/src/modules/blocks/components/NotesBrowserBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/notes-browser.block.ts,block-registry.constant.ts}`, `apps/web/src/modules/notes/hooks/use-notes-search.hook.ts`, `apps/web/src/modules/notes/services/{posts.service.ts,posts-client.service.ts}`, `apps/web/src/modules/core/components/CommandPalette/*`, `packages/ui/src/components/ui/input-group.tsx`.

**Design.** Figma `9:2` (list), `10:2` (post). Mockups `notes.html`, `post.html`. Tokens: `text-prose`, `text-subheading`, `text-meta`, `--primary-subtle`, `--measure`.

**Acceptance.**
- [ ] Typing in search updates the URL and results without a full reload; an old request is aborted (visible as cancelled in DevTools, spec §6 Day 9).
- [ ] "No results for …" shows with a Clear action; with JS off, the server-rendered first page still works.
- [ ] A draft post URL returns 404.
- [ ] Screenshots compared with `9:2` and `10:2`; prose stays 18px / 1.75 / 66ch.

**PR title:** `feat(web): public pages from api`

### M3 — Write side

Admin routes in M3 have no login yet. They stay safe because the API listens on `127.0.0.1` only (D9) until T36 adds guards.

#### T29 · Admin write API on projects + test DB

**Roadmap** p15 · **Spec** §1.5, §1.6 (ladder rung 7), §4.6 (autosave `409`), §5.8, §5.9 · **Depends** T19 · **Size** L

**Goal.** The full admin read/write pattern on one entity (projects), proven by integration tests against a separate test database. Every later CRUD task copies this pattern.

**Scope.**
- `docker-compose.yml`: `db-test` service under profile `test` (MySQL 8.4, `127.0.0.1:3307`, `tmpfs` data). `.env.example`: `DATABASE_URL_TEST` (D17).
- Test harness: `apps/api/vitest.e2e.config.ts`, `test/helpers/{create-app.ts,reset-db.ts}` (runs `prisma migrate reset --force --skip-seed` against the test DB once, truncates tables between tests), script `test:e2e`. CI job with a MySQL service container.
- Contracts `projects/`: admin DTO (both language columns, relations as ids), `projectCreateSchema`, `projectUpdateSchema` (partial, optional `updatedAt`), `adminProjectListParamsSchema` (`status`, `domain`, `q`, `sort`).
- `admin-projects.controller.ts`: `GET /admin/projects`, `GET /admin/projects/:id`, `POST /admin/projects` (always `DRAFT`), `PATCH /admin/projects/:id` (fields, `skills` via `set`, `metrics` replaced by a nested write), `DELETE /admin/projects/:id` = archive (`status: ARCHIVED`). Status cannot be set to `PUBLISHED` here; T52 adds the publish route.
- Concurrency: if `PATCH` carries `updatedAt` and the row changed since, return 409 `STALE` (used by autosave, T42).
- `dto/` files re-export contracts schemas; `entities/project.mapper.ts` gains `toAdminDto`.
- `api.http`: every route, including a duplicate slug and a stale update.
- `test/projects.e2e-spec.ts`: create, list, update, duplicate slug → 409, stale `updatedAt` → 409, archive, unknown id → 404, invalid body → 400.

**Files.** `docker-compose.yml`, `.env.example`, `apps/api/vitest.e2e.config.ts`, `apps/api/test/helpers/{create-app.ts,reset-db.ts}`, `apps/api/test/projects.e2e-spec.ts`, `apps/api/src/modules/projects/{admin-projects.controller.ts,projects.service.ts,dto/create-project.dto.ts,dto/update-project.dto.ts,dto/project-list-query.dto.ts,entities/project.mapper.ts}`, `packages/contracts/src/projects/*`, `apps/api/api.http`, `.github/workflows/ci.yml`.

**Design.** Spec §5.8/§5.9 data needs; Figma `15:2`, `18:2`.

**Backend steps, explained.**
1. **REST verbs.** `GET` reads, `POST` creates (returns 201), `PATCH` changes some fields, `DELETE` removes. Here `DELETE` archives instead (spec §1.5: nothing is lost).
2. **Input DTOs.** The create schema lists required fields; the update schema makes them optional. The pipe validates both before the controller runs.
3. **Unique errors.** Two projects with the same slug make MySQL raise a unique-constraint error; the filter from T10 turns it into 409 with `fieldErrors.slug`, so the form can show it under the slug input.
4. **Nested writes.** `metrics: { deleteMany: {}, create: [...] }` inside one `update` replaces all metrics atomically: Prisma runs it as one transaction.
5. **Optimistic concurrency.** The client sends the `updatedAt` it loaded. If the row has a newer `updatedAt`, someone else saved first: return 409 instead of silently overwriting.
6. **Integration tests.** They start the real app and call it over HTTP against a throwaway database on port 3307, so they test the pipe, filter, service and SQL together. Never point tests at the dev database.

**Acceptance.**
- [ ] `api.http` exercises every create/update/delete route (roadmap p15).
- [ ] A duplicate slug returns 409 with a field error on `slug` (roadmap p15).
- [ ] `pnpm --filter @portfolio/api test:e2e` is green locally and in CI.
- [ ] A stale `updatedAt` returns 409 `STALE`.

**PR title:** `feat(api): crud endpoints`

#### T30 · Write API: posts, experience, education, principles, stats, process

**Roadmap** p15 · **Spec** §1.5, §5.8, §5.9 · **Depends** T29 · **Size** M

**Goal.** Admin CRUD for the content entities, using the T29 pattern.

**Scope.**
- `admin-*.controller.ts` + admin DTOs + create/update schemas + admin list params for: `posts` (archive on delete; `readingMinutes` recomputed on save; `tags` via `set`; publish lint runs only on publish in T52), `experience` (`skills` via `set`), `education`, `principles`, `profile-stats`, `process-steps` (hard delete with confirm in the UI).
- `updatedAt` conflict check on posts and experience (they get autosave editors).
- e2e spec per module: create, validation error, update, delete/archive, 404.

**Files.** `apps/api/src/modules/{posts,experience,education,principles,profile-stats,process-steps}/{admin-*.controller.ts,*.service.ts,dto/*,entities/*.mapper.ts}`, `packages/contracts/src/{posts,experience,education,principles,profile-stats,process-steps}/*`, `apps/api/test/{posts,experience,about-small}.e2e-spec.ts`, `apps/api/api.http`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Same shape, new entity.** Copy the projects module's admin controller, DTOs and mapper; change the fields. Repetition here is on purpose: every module looks the same, which makes the code easy to hand over.
2. **Derived fields.** `readingMinutes` is computed by the service on every save, never sent by the client.

**Acceptance.**
- [ ] `api.http` covers every new route.
- [ ] e2e tests green; invalid bodies return 400 with `fieldErrors`.

**PR title:** `feat(api): content crud endpoints`

#### T31 · Write API: skills, categories, tags, domains

**Roadmap** p15 · **Spec** §1.5, §5.11 · **Depends** T29 · **Size** M

**Goal.** Admin CRUD for the taxonomy that links content together.

**Scope.**
- `admin-skills.controller.ts` (`/admin/skills`, `/admin/skill-categories`), `admin-tags.controller.ts` (creatable from the editor: `POST` accepts a name and derives the slug with `common/utils/slug.util.ts`), `admin-domains.controller.ts` (`hue`, `iconKey` validated against the allowlist).
- Delete rules: deleting a skill or tag removes its links; deleting a domain sets `Project.domainId` to null (`onDelete: SetNull`, migration `domain-set-null`); deleting a category that still has skills returns 409 `IN_USE`.
- e2e tests including the delete rules.

**Files.** `apps/api/src/modules/{skills,tags,domains}/{admin-*.controller.ts,*.service.ts,dto/*,entities/*}`, `apps/api/src/common/utils/slug.util.ts` (+ `.spec.ts`), `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_domain_set_null/`, `packages/contracts/src/{skills,tags,domains}/*`, `apps/api/test/taxonomy.e2e-spec.ts`, `apps/api/api.http`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Referential actions.** `onDelete: SetNull` tells MySQL what to do with projects when their domain is deleted. Read the migration: it changes the foreign key.
2. **Guarded deletes.** Some deletes must be refused. Check in the service and return 409 with a clear `code`, instead of letting MySQL fail with a foreign-key error.

**Acceptance.**
- [ ] Deleting a domain leaves its projects with no domain; deleting a used category returns 409 `IN_USE`.
- [ ] An unknown `iconKey` returns 400 with `fieldErrors.iconKey`.

**PR title:** `feat(api): taxonomy crud endpoints`

#### T32 · Write API: site, profile, nav, social, contact topics

**Roadmap** p15 · **Spec** §1.5 (Site group), §5.10, §6 Day 6 · **Depends** T29 · **Size** M

**Goal.** Admin endpoints for everything that shapes the site around the content.

**Scope.**
- `GET/PATCH /admin/site` (`site-settings`), `GET/PATCH /admin/profile` (`profile`; admin DTO includes the private `phone`; `headlineAccent{En,Vi}` must be a substring of `headline{En,Vi}` → `fieldErrors`).
- `navigation` CRUD (`href` must be a route from `routes.constant.ts` or an absolute `https://` URL), `social-links` CRUD (at most 2 with `showInCta` → 400). Pages and blocks have their own write API (T32a).
- New module `contact-topics`: admin CRUD and `GET /public/contact-topics` (visible, ordered).
- e2e tests: invalid profile PATCH, accent not in headline, nav href rules, CTA limit.

**Files.** `apps/api/src/modules/{site-settings,profile,navigation,social-links}/{admin-*.controller.ts,*.service.ts,dto/*}`, `apps/api/src/modules/contact-topics/*`, `apps/api/prisma/schema.prisma` + migration `add-contact-topics`, `apps/api/prisma/seed/data/site.data.ts`, `packages/contracts/src/{site-settings,profile,navigation,social-links,contact-topics}/*`, `apps/api/test/site.e2e-spec.ts`, `apps/api/api.http`.

**Design.** Spec §5.10.

**Backend steps, explained.**
1. **Singletons.** `PATCH /admin/site` always updates row `id = 1`; there is no create or delete.
2. **Cross-field rules.** "Accent must appear in the headline" involves two fields, so it goes in the schema's `superRefine` and reports the error on `headlineAccentEn` or `headlineAccentVi`.

**Acceptance.**
- [ ] An invalid `PATCH /admin/profile` returns 400 with `fieldErrors` (spec §6 Day 6).
- [ ] An accent that is not part of the headline is rejected for that locale only.
- [ ] `GET /api/public/contact-topics` returns visible topics in order.

**PR title:** `feat(api): site crud endpoints`

#### T32a · Write API: pages and blocks

**Roadmap** p15 · **Spec** §1.5, §4.6 (autosave `409`), §5.10, D26 · **Depends** T10a, T29 · **Size** L

**Goal.** Admin endpoints to add, edit, hide, duplicate and delete the blocks of a page's draft, with every registry rule enforced by the API.

**Scope.**
- `admin-pages.controller.ts`:
  - `GET /admin/pages`: the five pages with key, block count and `updatedAt` (T52a adds the published version and `hasUnpublishedChanges`).
  - `GET /admin/pages/:key`: page SEO fields in both languages and every block, hidden ones included. Unknown or invalid rows are returned with `issues`, so the builder can show them.
  - `PATCH /admin/pages/:key`: SEO fields, with the `updatedAt` check.
  - `POST /admin/pages/:key/blocks` `{ type, afterId? }`: creates a block with the type's `defaults` and first layout, a unique `key` derived from the type (`case-grid`, `case-grid-2`), placed after `afterId` or at the end. 400 `BLOCK_NOT_ALLOWED` when the type is not allowed on this page; 409 `BLOCK_LIMIT` above `maxPerPage`.
  - `PATCH /admin/pages/:key/blocks/:id` `{ props?, layout?, surface?, isVisible?, key?, updatedAt }`: `props` parsed with the type's schema → 400 with `fieldErrors` keyed by path (`props.primaryCta.label.en`); `layout` must be one of the type's layouts; `refs` checked (an unknown project or stat id → 400 on that field); stale `updatedAt` → 409 `STALE`.
  - `POST /admin/pages/:key/blocks/:id/duplicate`: same props, new key, placed right after.
  - `DELETE /admin/pages/:key/blocks/:id`: hard delete of the draft row. A published version keeps the block until the next publish (T52a).
- Page rules in `pages-rules.util.ts` (unit-tested, reused by publish in T52a): the `h1` block is first, visible and cannot be deleted (409 `BLOCK_LOCKED`); `required` blocks cannot be deleted or hidden (409 `BLOCK_REQUIRED`); `maxPerPage`; allowed pages.
- Every write also updates `Page.updatedAt` in the same transaction, so the page knows it has draft changes.
- Contracts `pages/`: admin page DTO, `createBlockSchema`, `updateBlockSchema` (`props` is `unknown` here and parsed per type in the service, because one body schema cannot know every type), `updatePageSchema`. `ErrorCode` gains `BLOCK_NOT_ALLOWED`, `BLOCK_LIMIT`, `BLOCK_LOCKED`, `BLOCK_REQUIRED`.
- e2e `test/pages.e2e-spec.ts`: add every allowed type; invalid props → 400 with the field path; type not allowed → 400; over the limit → 409; delete the H1 block → 409; hide a required block → 409; stale update → 409; unknown project id in a `case-grid` → 400; a row with an unknown type (inserted with Prisma in the test) is listed with `issues` by the admin route and absent from the public one.

**Out of scope.** Reorder (T33). Publish, versions, preview (T52a). The builder UI (T45b).

**Files.** `apps/api/src/modules/pages/{admin-pages.controller.ts,pages.service.ts,pages-rules.util.ts,pages-rules.util.spec.ts,dto/*,entities/page.mapper.ts}`, `packages/contracts/src/pages/*`, `packages/contracts/src/common/api-error.schema.ts`, `apps/api/test/pages.e2e-spec.ts`, `apps/api/api.http`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Validate by type, in the service.** The body of `PATCH …/blocks/:id` depends on the block's type, which the server reads from the DB row. So the controller accepts `props` as unknown, and the service picks the type's zod schema and parses. A failure becomes the usual 400 with `fieldErrors`, so the generated form (T45a) shows each message under its input.
2. **Rules belong to the server.** The builder hides the buttons that would break a rule, but the API is what refuses them, with a clear `code`. A script or an old browser tab cannot delete the hero.
3. **Only the draft changes.** These endpoints edit the draft rows. Once T52a lands, visitors keep seeing the published version until someone publishes, so you can rearrange freely.
4. **Optimistic concurrency per block.** Each block has its own `updatedAt`, so two people editing two different blocks do not conflict; the same block open in two tabs does.

**Acceptance.**
- [ ] `api.http` covers every route, including the error cases (roadmap p15).
- [ ] Invalid props return 400 with `fieldErrors` on the exact path; a duplicate block `key` returns 409 with `fieldErrors.key`.
- [ ] Deleting the H1 block or hiding a required block returns 409 with its code.
- [ ] `pnpm --filter @portfolio/api test:e2e` is green, including the unknown-type case.

**PR title:** `feat(api): page blocks crud`

#### T33 · Transactional reorder + tag replace

**Roadmap** p16 · **Spec** §1.6 (transactions), §4.6 (optimistic reorder) · **Depends** T31, T32, T32a · **Size** M

**Goal.** Reordering any list and replacing a post's tags either fully succeed or change nothing.

**Scope.**
- `common/utils/reorder.util.ts`: given a model delegate and `ids: number[]`, checks the ids are exactly the current set, then writes `sortOrder = index` for each inside `prisma.$transaction(async (tx) => …)`.
- `PATCH /admin/{entity}/order` with body `{ ids }` for projects, experience, principles, profile stats, process steps, skills, skill categories, domains, nav items, social links, contact topics, and page blocks (`PATCH /admin/pages/:key/blocks/order`, per page; the H1 block must stay first, T32a).
- Post tag replacement and project skill/metric replacement moved into explicit interactive transactions with the field update.
- Forced-failure test: make the third update throw inside the transaction and assert `sortOrder` and tags are unchanged.

**Files.** `apps/api/src/common/utils/reorder.util.ts` (+ `.spec.ts`), `apps/api/src/modules/*/admin-*.controller.ts` (order routes), `apps/api/src/modules/{posts,projects,pages}/*.service.ts`, `packages/contracts/src/common/reorder.schema.ts`, `apps/api/test/reorder.e2e-spec.ts`, `apps/api/api.http`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Transaction.** Several writes that succeed or fail together. If the fifth `UPDATE` fails, MySQL rolls back the first four.
2. **Interactive transaction.** `$transaction(async (tx) => { … })` gives you `tx`; every query inside must use `tx`, not `this.prisma`, or it runs outside the transaction.
3. **Validate first.** Checking that `ids` matches the current rows stops a stale client from dropping or duplicating positions.

**Acceptance.**
- [ ] The forced-failure test leaves `sortOrder` and tags unchanged (roadmap p16).
- [ ] An `ids` list that is missing a row returns 400.

**PR title:** `feat(api): transactional reorder`

#### T34 · Indexes + EXPLAIN

**Roadmap** p17 · **Spec** §1.5, §1.6 (rung 8), §6 Day 14 · **Depends** T33 · **Size** S

**Goal.** The list queries use indexes, and one N+1 query is found and fixed.

**Scope.**
- Turn on Prisma query logging behind an env flag (`PRISMA_LOG_QUERIES=1`).
- Run `EXPLAIN` on: published posts list (`status`, `publishedAt desc`, `id`), posts by tag, published projects by domain and by skill, admin projects list.
- Add `@@index` where the plan shows `ALL` (e.g. `Post @@index([status, publishedAt])`, `Project @@index([status, sortOrder])`, `@@index([domainId])`); migration `add-list-indexes`.
- Find one N+1 in the logs (e.g. a mapper loading relations per row) and fix it with `include`.
- Write before/after plans in `docs/sql-notes.sql`.

**Files.** `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_list_indexes/`, `apps/api/src/prisma/prisma.service.ts`, `docs/sql-notes.sql`.

**Design.** None.

**Backend steps, explained.**
1. **Index.** A sorted lookup structure on columns. `WHERE status = ? ORDER BY publishedAt` is fast when an index starts with `(status, publishedAt)`.
2. **EXPLAIN.** Asks MySQL how it will run a query. `type: ALL` means it reads every row; `ref` or `range` with your index name means it uses the index.
3. **N+1.** One query for a list plus one query per row. The query log shows it as many near-identical lines.

**Acceptance.**
- [ ] `EXPLAIN` shows index use (no `ALL`) for the published post list query (roadmap p17).
- [ ] Before/after notes are saved in `docs/sql-notes.sql` (roadmap p17).

**PR title:** `perf(db): indexes for list queries`

### M4 — Auth + admin CMS

#### T35 · Users, argon2, JWT access + refresh cookies

**Roadmap** p18 (adjusted by D24) · **Spec** §1.5 (`User`), §1.6 (Auth row, replaced by D24), §6 Day 15 · **Depends** T29 · **Size** L

**Goal.** Email + password login that returns two JWTs in httpOnly cookies: a short access token that proves who you are on every request, and a longer refresh token that gets a new pair when the access token expires. Logout clears both cookies.

**Scope.**
- Packages: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` (+ `@types/passport-jwt`), `argon2`, `cookie-parser`.
- Model `User`: `id`, `email @unique`, `name`, `passwordHash`, `role Role @default(user)` with `enum Role { admin user }` (D7), `isActive @default(true)`, `tokenVersion Int @default(0)`, `lastLoginAt?`, timestamps. No `Session` model (D24). Migration `add-auth`.
- Contracts `auth/`: `auth.enum.ts` (`roleSchema = z.enum(['admin', 'user'])`, type `Role`), `auth.schema.ts` (`loginSchema`, `meSchema` = `{ id, email, name, role }`, never `passwordHash` or `tokenVersion`).
- Config (`src/config/env.schema.ts`): `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each at least 32 characters and not equal to each other, or boot fails), `JWT_ACCESS_TTL_SECONDS` (default 900 = 15 min), `JWT_REFRESH_TTL_SECONDS` (default 604800 = 7 days).
- `modules/users`: `users.service.ts` (find by email, find by id, create with an argon2id hash, `bumpTokenVersion`). The seed creates one `admin` from `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` only when all three are set; never a default password.
- `modules/auth`:
  - `token.service.ts`: `signAccess(user)` → `{ sub: String(user.id), role }` with `JWT_ACCESS_SECRET`, `expiresIn: JWT_ACCESS_TTL_SECONDS`; `signRefresh(user)` → `{ sub, ver: user.tokenVersion }` with `JWT_REFRESH_SECRET`, `expiresIn: JWT_REFRESH_TTL_SECONDS`. Both use `JwtService.signAsync(payload, { secret, expiresIn })`, algorithm HS256. No email, name or other personal data in a payload.
  - `auth-cookies.util.ts`: `setAuthCookies(res, tokens)` and `clearAuthCookies(res)` with the options in the table below (Express `maxAge` is in milliseconds: seconds × 1000).
  - `strategies/jwt.strategy.ts` (`PassportStrategy(Strategy, 'jwt')`): `jwtFromRequest` reads `req.cookies.access_token`, `ignoreExpiration: false`, `secretOrKey: JWT_ACCESS_SECRET`; `validate(payload)` returns `{ id: Number(payload.sub), role: payload.role }` without a DB query (this becomes `request.user`).
  - `strategies/jwt-refresh.strategy.ts` (`'jwt-refresh'`): reads `req.cookies.refresh_token` with `JWT_REFRESH_SECRET`; `validate` loads the user and rejects (401) when the user is missing, `isActive = false`, or `payload.ver !== user.tokenVersion`.
  - `auth.service.ts`: `login` (find by email, `argon2.verify`; the same `INVALID_CREDENTIALS` 401 for an unknown email, a wrong password and an inactive user; update `lastLoginAt`; issue both tokens), `refresh` (issue a new pair for the validated user: rotation), `me` (load the user by `request.user.id`; 401 if missing or inactive).
  - `auth.controller.ts`: `POST /auth/login` (body `loginSchema`; sets both cookies; returns `meSchema`, never the tokens), `POST /auth/refresh` (`@UseGuards(JwtRefreshGuard)`; sets a new pair; 204), `POST /auth/logout` (clears both cookies; 204, works even with an expired access token), `GET /auth/me` (`@UseGuards(JwtAuthGuard)`). T36 makes `JwtAuthGuard` global.
- `common/guards/jwt-auth.guard.ts` (`AuthGuard('jwt')`, `handleRequest` turns every failure into 401 `UNAUTHENTICATED`, D5) and `common/guards/jwt-refresh.guard.ts` (`AuthGuard('jwt-refresh')`).
- `cookie-parser` in `main.ts`. `.env.example`: the four `JWT_*` keys (empty secrets, with the comment "generate with `openssl rand -base64 48`"), `ADMIN_EMAIL="<email>"`, `ADMIN_NAME`, `ADMIN_PASSWORD`.
- `test/helpers/auth.helper.ts`: creates an `admin` and a `user` in the test DB and returns logged-in supertest agents (cookies kept between requests). `api.http`: login, me, refresh, logout (REST Client remembers cookies).
- e2e: login sets both cookies with the right flags; `me` returns the DTO with `role`; an expired access token (signed in the test with a past `exp`) → 401; refresh → 204 and new cookies; refresh after `tokenVersion` changes → 401; logout clears both cookies.

**Cookies (D24).**

| Cookie | Holds | `Path` | `Max-Age` | Flags |
| --- | --- | --- | --- | --- |
| `access_token` | access JWT `{ sub, role }` | `/` (Next server components read it on `/admin/*` and forward it, T37) | `JWT_ACCESS_TTL_SECONDS` (15 min) | `httpOnly`, `SameSite=Lax`, `Secure` in production |
| `refresh_token` | refresh JWT `{ sub, ver }` | `/api/auth` (sent only to refresh and logout) | `JWT_REFRESH_TTL_SECONDS` (7 days) | `httpOnly`, `SameSite=Lax`, `Secure` in production |

**Files.** `apps/api/package.json`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_auth/`, `apps/api/prisma/seed/profiles/*.seed.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts}`, `apps/api/src/modules/users/{users.module.ts,users.service.ts,users.service.spec.ts,entities/*}`, `apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,auth.service.spec.ts,token.service.ts,auth-cookies.util.ts,strategies/jwt.strategy.ts,strategies/jwt-refresh.strategy.ts,dto/*}`, `apps/api/src/common/guards/{jwt-auth.guard.ts,jwt-refresh.guard.ts}`, `apps/api/src/main.ts`, `packages/contracts/src/auth/{auth.enum.ts,auth.schema.ts,auth.type.ts}`, `apps/api/test/helpers/auth.helper.ts`, `apps/api/test/auth.e2e-spec.ts`, `.env.example`, `apps/api/api.http` ([api STRUCTURE: auth](../apps/api/STRUCTURE.md#auth-jwt)).

**Design.** None (API only).

**Backend steps, explained.**
1. **Hashing, not encryption.** A password hash cannot be turned back into the password. argon2id is slow on purpose, so guessing millions of passwords is expensive. `argon2.hash` on create, `argon2.verify` on login; the plain password is never stored or logged.
2. **What a JWT is.** Three base64url parts joined by dots: header (algorithm), payload (claims such as `sub` = user id, `role`, `exp` = expiry time) and a signature made with a secret only the API knows. Anyone can *read* the payload (it is not encrypted, so no email or secrets in it), but nobody can *change* it without breaking the signature. The API trusts a token because the signature checks out, not because a DB row exists.
3. **Why two tokens.** The access token is sent on every request and is checked without touching the DB, so it must die quickly (15 min) in case it leaks. The refresh token is sent only to `/api/auth/*` (its cookie `Path`), lives 7 days, and is checked against the DB (`isActive`, `tokenVersion`) each time it is used. Different secrets mean one can never be used as the other.
4. **Where they live: httpOnly cookies.** `httpOnly`: page JavaScript cannot read them, so an XSS bug cannot steal them (a token in `localStorage` can be stolen). `SameSite=Lax`: other sites cannot send them with form posts. `Secure`: HTTPS only (production). Because Next rewrites `/api/*` to Nest, the browser thinks it is talking to one site; the cookies set by Nest are first-party and the browser sends them back on every `/api/*` call with no extra code.
5. **`@nestjs/jwt` and `passport-jwt`.** `JwtService` (from `@nestjs/jwt`) *creates* tokens. A Passport *strategy* (from `passport-jwt`) *checks* them: it says where to find the token (the cookie), which secret verifies it, and `validate()` returns what goes on `request.user`. `AuthGuard('jwt')` runs that strategy before a route.
6. **Refresh and rotation.** When a request gets 401 because the access token expired, the web calls `POST /api/auth/refresh` once (T37). The API checks the refresh token, then sends a fresh access token *and* a fresh refresh token. While someone keeps using the admin, the 7 days keep sliding; after 7 idle days they log in again.
7. **Logout and the kill switch.** Logout clears both cookies in this browser. There is no session row to delete, so to cut off *every* device the API increments `User.tokenVersion`; every refresh token signed with the old `ver` now fails, and the user is out within 15 minutes (when their access token expires). T46 uses this for "sign out everywhere", deactivation and password changes.
8. **Same error for every failure.** "Invalid email or password" for an unknown email, a wrong password and an inactive account, so nobody can test which emails have accounts.

**Acceptance.**
- [ ] Login sets `access_token` and `refresh_token` as httpOnly cookies with the paths and lifetimes in the table, and `GET /auth/me` returns the user DTO with `role` (roadmap p18).
- [ ] An expired or tampered access token gives 401; `POST /auth/refresh` with a valid refresh cookie returns 204 and new cookies; after `tokenVersion` changes, refresh gives 401.
- [ ] Logout clears both cookies, and `GET /auth/me` then returns 401 (roadmap p18, adjusted by D24).
- [ ] The DB holds no plain passwords and no tokens; no response body or log line contains a token.

**PR title:** `feat(api): jwt auth` (roadmap p18 says `session auth`; changed by D24)

#### T36 · Global JWT guard, roles (admin/user), Origin check, throttle

**Roadmap** p19 · **Spec** §1.6 (Auth, CSRF, Rate limit), §6 Day 16 · **Depends** T35 · **Size** M

**Goal.** Every non-public route needs a valid access token and the right role; mutating requests must come from our site; login is rate-limited.

**Scope.**
- Register three global guards in `app.module.ts`, in this order (`APP_GUARD`): `JwtAuthGuard` → `RolesGuard` → `OriginGuard`.
- `JwtAuthGuard` (from T35) becomes global and reads `@Public()` with `Reflector`: public routes skip it; everything else needs a valid access token or gets 401. `@Public()` on health, `POST /auth/login`, `POST /auth/refresh` (it has its own `JwtRefreshGuard`), `POST /auth/logout` and every `public-*.controller.ts`.
- `common/decorators/roles.decorator.ts`: `@Roles(...roles: Role[])` with `Role = 'admin' | 'user'` from contracts.
- `common/guards/roles.guard.ts`: skips `@Public()` routes; reads `@Roles()` from the handler, then the class; **no `@Roles()` means `['admin']`**; `request.user.role` not in the list → 403 `FORBIDDEN`.
- Add `@Roles('admin', 'user')` to every read (`GET`) handler of the admin controllers that exist so far (T29–T32a) and to `GET /auth/me`. Writes keep no decorator, so they are admin only. Later tasks name their roles explicitly (see the table).
- `common/guards/origin.guard.ts`: for `POST/PUT/PATCH/DELETE`, `Origin` must equal `WEB_ORIGIN`; otherwise 403 `BAD_ORIGIN` (D8). Login, refresh and logout are included. Server-to-server calls from Next (contact Server Action, T48) send `Origin: WEB_ORIGIN` explicitly.
- `common/decorators/current-user.decorator.ts`: `@CurrentUser()` returns `request.user` (`{ id, role }`).
- `@nestjs/throttler`: login 5 per minute per IP + email → 429; refresh 30 per minute per IP. Trust the loopback proxy (`trust proxy`) so the client IP comes from `x-forwarded-for` set by Next.
- e2e: no token → 401; expired token → 401; `user` on any write → 403; `user` on an admin `GET` → 200; `admin` write → 2xx; foreign `Origin` → 403; 6th bad login → 429.

**What each role can do (D7).** The API enforces this; the web only hides what a role cannot use (T37 `RoleGate`).

| Area | `admin` | `user` | Routes (task) |
| --- | --- | --- | --- |
| Own account: me, logout, change own password | yes | yes | `/auth/*` (T35, T46) |
| Dashboard: counts, content health, analytics charts | read | read | `GET /admin/stats`, `GET /admin/health` (T38, T54) |
| Content: projects, posts, experience and other about tables, skills, tags, domains, site, profile, nav, social, contact topics, pages and blocks | read, create, edit, delete, reorder | read only (lists, editors and the page builder open read-only) | `/admin/*` (T29–T33, T39–T45b) |
| Publish, unpublish, bulk status changes; page publish, discard and version restore | yes | no | T52, T52a, T55 |
| Draft preview (including the page builder live preview) and page version history | yes | yes | `GET /admin/preview/*`, `/api/draft`, `GET /admin/pages/:key/versions` (T52, T52a) |
| Media: browse | yes | yes | `GET /admin/media` (T50) |
| Media: upload, edit alt text, delete | yes | no | T50 |
| Inbox (contact messages contain visitor emails) and live notifications | yes | no | `/admin/messages`, `/admin/events` (T47, T49) |
| Audit log | yes | no | `GET /admin/audit` (T55) |
| Users: create, change role, deactivate, sign out everywhere | yes | no | `/admin/users` (T46) |

**Files.** `apps/api/src/common/guards/{jwt-auth.guard.ts,roles.guard.ts,origin.guard.ts}` (+ specs), `apps/api/src/common/decorators/{public.decorator.ts,roles.decorator.ts,current-user.decorator.ts}`, `apps/api/src/app.module.ts`, `apps/api/src/main.ts`, `apps/api/src/modules/auth/auth.controller.ts`, every `public-*.controller.ts` (`@Public()`), every `admin-*.controller.ts` so far (`@Roles('admin', 'user')` on `GET` handlers), `apps/api/test/guards.e2e-spec.ts`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Guard.** Runs before the controller and answers yes or no. A global guard protects every route by default; `@Public()` opts a route out. Forgetting a decorator then fails safe (401), not open.
2. **Guard order.** First "who are you?" (`JwtAuthGuard` verifies the token and sets `request.user`), then "are you allowed?" (`RolesGuard`), then "did this come from our site?" (`OriginGuard`). Nest runs global guards in the order they are registered.
3. **Roles.** `@Roles('admin', 'user')` puts a label on the route; `RolesGuard` compares it with `request.user.role`, which comes from the verified token, so a user cannot fake it. No label means admin only. The web hides buttons too, but the server is what enforces it.
4. **Role changes and the 15 minutes.** The role is inside the access token, so a role change or deactivation (T46) takes effect at the next refresh, at most 15 minutes later. That is the price of not reading the DB on every request (D24).
5. **Origin check (CSRF).** A malicious page can make your browser send a request with your cookies. Browsers always send the `Origin` header on such requests, so rejecting other origins blocks it. JWTs in cookies need this exactly as session cookies do.
6. **Rate limit.** Counts requests per key in a time window and answers 429 when over the limit.

**Acceptance.**
- [ ] Writes without a token return 401; writes with a foreign or missing `Origin` return 403 (roadmap p19, adjusted by D8).
- [ ] The 6th bad login in a minute returns 429 (roadmap p19).
- [ ] Only `admin` can write: a `user` gets 403 on every admin `POST/PATCH/DELETE`, and 200 on admin `GET` routes (roadmap p19 "only the admin can write"; spec §6 Day 16).
- [ ] A new admin route without `@Roles()` is admin only (covered by a guard spec).

**PR title:** `feat(api): guards + csrf + throttle`

#### T37 · Admin shell, login, ⌘K

**Roadmap** p20 · **Spec** [§4.3](./design/portfolio-design-system.md#s-4-3), §4.6 (Admin layout row), §5.7, §5.11 · **Depends** T11, T12, T36 · **Size** L

**Goal.** A protected admin with a server-side token check, silent token refresh, role-aware UI, the Linear-style shell, the login page and the admin command palette.

**Scope.**
- `app/admin/layout.tsx`: root layout #2 (`<html lang="en">`, fonts, `Providers` with `QueryProvider`, `Toaster`, admin messages from `en.json` `admin.*`, D22).
- `middleware.ts` (extends the T11 file): for `/admin/*` except `/admin/login`, no `access_token` cookie → redirect to `/admin/login?next=<path>`. This is only a fast, no-network check (the cookie disappears when the token expires, T35); the real check is the layout below. Public routes keep the next-intl middleware.
- `app/admin/login/page.tsx` → `admin-auth/views/AdminAuthLogin.tsx`. On mount it tries `POST /api/auth/refresh` once (the browser sends `refresh_token` by itself); 204 → `router.replace(next)`; otherwise it shows `LoginForm` (TanStack Form + `field`, `loginSchema`, maps `fieldErrors`, shows the 429 message). `admin-auth/utils/safe-next.util.ts` accepts only paths starting with `/admin` (no open redirect).
- `app/admin/(cms)/layout.tsx`: server call `GET /auth/me` (`apiServer` option `withAuth`: forwards only the `access_token` cookie, `cache: 'no-store'`); 401 → `redirect('/admin/login')`; else `AdminShell` with the `me` DTO.
- `core/services/api-client.service.ts`: for `/api/admin/*` and `/api/auth/me`, a 401 triggers one `POST /api/auth/refresh` (single-flight: parallel 401s share one refresh promise) and retries the request once; if refresh fails → `window.location.assign('/admin/login?next=…')`. Exports `refreshOnce()` for the SSE hook (T49). Public calls never refresh.
- `admin-core`: `AdminShell` (shadcn `sidebar`, 240px, collapsible to a 56px rail, `[` toggles; groups and items from §4.3 plus Stats, Domains, Process (§5.11); mobile sheet), `Topbar` (breadcrumbs, page actions slot, user menu with name, role badge and logout), admin `CommandPalette` (jump to admin routes, "New project/post" for `admin` only), `RoleGate` (`<RoleGate allow={['admin']}>` renders children only for those roles), `stores/admin-ui.store.tsx` (`AdminUiProvider`, `useAdminUi`: sidebar collapsed, palette open), `services/auth.service.ts` (me, logout), `hooks/use-me.hook.ts` (`useMe()`, seeded from the layout's `me`; `useIsAdmin()`).
- Role-aware UI rule for every later admin task: write controls (New, Save, Delete, Publish, reorder, upload, bulk bar) are wrapped in `RoleGate allow={['admin']}`; the Inbox, Audit log and Users sidebar items are `admin` only; a `user` sees the rest read-only (T36 table).
- `app/admin/(cms)/page.tsx` → `AdminDashboardIndex` placeholder (filled by T38).

**Files.** `apps/web/middleware.ts`, `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/login/page.tsx`, `apps/web/app/admin/(cms)/{layout.tsx,page.tsx}`, `apps/web/src/modules/admin-auth/{views/AdminAuthLogin.tsx,components/LoginForm/*,utils/safe-next.util.ts}`, `apps/web/src/modules/admin-core/components/{AdminShell,AdminSidebar,Topbar,CommandPalette,RoleGate}/*`, `apps/web/src/modules/admin-core/{stores/admin-ui.store.tsx,services/auth.service.ts,hooks/use-me.hook.ts}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{sidebar,breadcrumb,avatar}.tsx`.

**Design.** Figma `14:2` (shell). Mockup `admin-dashboard.html`. Tokens: `--sidebar*`, `text-ui-title`, `text-ui`, `text-ui-meta`, admin control height 32 (28 compact). No atmosphere, bands or orbs in admin (§7.2 `06`).

**Token flow, explained.**
1. **The browser never touches a token.** Login, refresh and logout answer with `Set-Cookie`; the browser stores the httpOnly cookies and sends them on every `/api/*` call. Web code only sees the `me` DTO.
2. **Server components forward the cookie.** A Server Component runs on the Next server, not in the browser, so it must pass the cookie on by hand: `apiServer(..., { withAuth: true })` copies `access_token` from `cookies()` into the request to Nest.
3. **Refresh happens in one place.** In the browser, `apiClient` sees a 401, refreshes once and retries. On a full page load after the access token expired, the middleware sends you to the login page, which refreshes silently and sends you back. Only when the refresh token is also gone or revoked do you see the form.

**Acceptance.**
- [ ] Logged out, `/admin` redirects to login on the server: `curl -I` shows a redirect, no client flash (roadmap p20).
- [ ] With an expired access token but a valid refresh token, opening `/admin/projects` lands back on `/admin/projects` without showing the form; an admin request made after expiry succeeds after one automatic refresh.
- [ ] Signed in as `user`: no Inbox, Audit log or Users items, no New/Save/Delete/Publish buttons; the role badge says `user`.
- [ ] ⌘K navigates to an admin route (roadmap p20); `[` toggles the sidebar.
- [ ] Wrong credentials show the error under the form; the 6th attempt shows the rate-limit message.
- [ ] Screenshot compared with `14:2` (shell only).

**PR title:** `feat(web): admin shell`

#### T38 · Admin dashboard v1 + stats endpoint

**Roadmap** p20 · **Spec** [§5.7](./design/portfolio-design-system.md#s-5-7), §5.11, §5.0 (Admin dashboard row) · **Depends** T37 · **Size** M

**Goal.** A dashboard whose counts and content-health checks come from the API, one card at a time.

**Scope.**
- API `modules/dashboard`: `GET /admin/stats?range=7d|30d|90d` (content counts by status; fields for messages and views are added by T47 and T54), `GET /admin/health` (both `@Roles('admin', 'user')`; content-health checks: projects without a domain, case studies with fewer than 2 key facts, marquee with fewer than 6 skills, missing Vietnamese fields on published items, publish-lint issues; missing alt text is added by T50).
- Web `admin-dashboard`: `AdminDashboardIndex`, `StatCard` (in `packages/ui`: value, delta text + arrow, not color only), `ContentHealthCard` (each issue links to the item), period `toggle-group` stored in the URL. Server prefetch + `HydrationBoundary`; each card uses `useSuspenseQuery` inside its own `SectionBoundary` (per-card skeleton, empty and error).

**Files.** `apps/api/src/modules/dashboard/*`, `packages/contracts/src/dashboard/*`, `apps/web/app/admin/(cms)/page.tsx`, `apps/web/src/modules/admin-dashboard/{views/AdminDashboardIndex.tsx,components/{StatsCards,ContentHealthCard}/*,hooks/use-dashboard.hook.ts,services/dashboard.service.ts}`, `packages/ui/src/components/StatCard/*`.

**Design.** Figma `14:2`. Mockup `admin-dashboard.html` (content health v2 checks). Tokens: `--card`, `--success`, `--warning`, `--destructive`, `text-ui`, `text-ui-meta`.

**Acceptance.**
- [ ] Dashboard counts match the API (roadmap p20).
- [ ] Content health lists the v2 checks from the mockup, each linking to the item.
- [ ] One failing card shows its own error with Retry; the others still render.

**PR title:** `feat(web): admin dashboard`

#### T39 · DataTable + admin projects list

**Roadmap** p21 · **Spec** [§5.8](./design/portfolio-design-system.md#s-5-8), §4.3 (`DataTable`, `FilterBar`), §4.6 (URL-driven lists, optimistic update) · **Depends** T37 · **Size** L

**Goal.** One generic, keyboard-friendly server-driven table, first used for projects.

**Scope.**
- `packages/ui` `DataTable` (TanStack Table on shadcn `table`; `manualPagination/Sorting/Filtering`; sortable, resizable, hideable columns; row selection with shift-range; bulk actions bar; sticky header; density compact 32 / default 40; keys `j/k` move, `x` select, `Enter` open, `e` edit, `⌫` delete with confirm (edit, delete and the bulk bar only for `admin`, via a `canWrite` prop); states: skeleton rows, empty with create action, no results with clear filters, error with Retry; card list below `md`) and `FilterBar` (chips, add-filter menu).
- `admin-core/hooks/use-list-params.hook.ts` (URL ↔ `ListParams` via zod), `admin-core/utils/optimistic.util.ts` (snapshot / restore helpers for `onMutate`/`onError`).
- `admin-projects`: `services/admin-projects.service.ts`, `hooks/use-admin-projects.hook.ts` (list with `useSuspenseQuery` and `keepPreviousData`, archive with optimistic removal and rollback, status toggle, reorder with move up/down), `views/AdminProjectsIndex.tsx`. Columns: title, domain (hue pill), status (`StatusPill`), key facts count, updated, row actions. Prefetch detail on row hover/focus after 100ms.
- Route `app/admin/(cms)/projects/page.tsx` with server prefetch + `HydrationBoundary`.

**Files.** `packages/ui/src/components/{DataTable,FilterBar}/*`, `packages/ui/src/components/ui/{table,checkbox,alert-dialog}.tsx`, `apps/web/src/modules/admin-core/{hooks/use-list-params.hook.ts,utils/optimistic.util.ts}`, `apps/web/src/modules/admin-projects/{services/admin-projects.service.ts,hooks/use-admin-projects.hook.ts,views/AdminProjectsIndex.tsx,components/ProjectsTable/*}`, `apps/web/app/admin/(cms)/projects/page.tsx`.

**Design.** Figma `15:2`. Mockup `admin-table.html` (Domain column, key facts count, "1–5 of 5"). Tokens: `text-ui`, `text-ui-meta`, `--border`, `--muted`, `--hue-*`, `--sidebar-accent`.

**Acceptance.**
- [ ] Sort, search and paging send new API requests and update the URL (roadmap p21).
- [ ] A failed archive restores the row (optimistic rollback), shown by a test with a mocked 500 (roadmap p21).
- [ ] Keyboard shortcuts work and are listed in the help dialog.
- [ ] Screenshot compared with `15:2`; the table is usable at 360px.

**PR title:** `feat(web): admin data table`

#### T40 · Admin lists: posts, experience

**Roadmap** p21 · **Spec** §5.8 · **Depends** T30, T39 · **Size** M

**Goal.** The posts and experience tables on the shared `DataTable`.

**Scope.**
- `admin-posts`: service, hooks, `AdminPostsIndex` (columns: title, status, tags, reading minutes, published date, updated; filters status/tag; archive optimistic). Route `app/admin/(cms)/posts/page.tsx`.
- `admin-about`: experience table (`AdminAboutExperienceIndex`: company, role, dates, visible switch (optimistic), move up/down). Route `app/admin/(cms)/experience/page.tsx`.

**Files.** `apps/web/src/modules/admin-posts/{services,hooks,views,components}/*`, `apps/web/src/modules/admin-about/{services/experience.service.ts,hooks/use-admin-experience.hook.ts,views/AdminAboutExperienceIndex.tsx}`, `apps/web/app/admin/(cms)/{posts,experience}/page.tsx`.

**Design.** Figma `15:2` pattern; mockup `admin-table.html`.

**Acceptance.**
- [ ] Both lists sort, filter and page through the API with URL state.
- [ ] Toggling `isVisible` is optimistic and rolls back on error.

**PR title:** `feat(web): posts and experience lists`

#### T41 · Admin lists: small entities + icon/hue pickers

**Roadmap** p21 · **Spec** §5.11, §6 Day 13 v2 · **Depends** T31, T32, T39 · **Size** M

**Goal.** Tables with sheet editors for the small entities, including the icon and hue pickers.

**Scope.**
- `packages/ui`: `IconPicker` (popover + command over the icon allowlist, previews `Icon`), `HuePicker` (toggle group of the 5 hues with a `Badge` preview).
- `admin-about`: education, principles, profile stats, process steps. `admin-taxonomy`: skills (category, depth, marquee switch), skill categories, tags, domains (hue + icon). Each: `DataTable` + a `Sheet` with a TanStack Form editor (zod schema from contracts, both language fields side by side), move up/down reorder, delete with `alert-dialog`.
- Routes under `app/admin/(cms)/` for each list (`education`, `principles`, `stats`, `process`, `skills`, `tags`, `domains`).

**Files.** `packages/ui/src/components/{IconPicker,HuePicker}/*`, `apps/web/src/modules/admin-about/{components,hooks,services,views}/*`, `apps/web/src/modules/admin-taxonomy/{components,hooks,services,views}/*`, `apps/web/app/admin/(cms)/{education,principles,stats,process,skills,tags,domains}/page.tsx`, `packages/ui/src/components/ui/{sheet,select,switch}.tsx`.

**Design.** Mockup `admin-dashboard.html` sidebar items; spec §5.11. Tokens: `--hue-*`, `text-ui`.

**Acceptance.**
- [ ] Reordering domains changes the home order (immediately in dev per D23; after publish revalidation from T52) (spec §6 Day 13 v2).
- [ ] The icon picker offers only allowlisted icons; the hue picker shows each hue's pill.

**PR title:** `feat(web): admin taxonomy lists`

#### T42 · Editor shell + Tiptap MarkdownEditor + autosave

**Roadmap** p22 · **Spec** [§5.9](./design/portfolio-design-system.md#s-5-9), §4.3 (`MarkdownEditor`, `SaveStatus`, `LocaleTabs`, `PropertyList`), §4.6 (Autosave), D25 · **Depends** T39 · **Size** L

**Goal.** The shared editor frame every entity editor uses: a Tiptap rich-text editor that reads and writes Markdown, a toolbar built from shadcn parts, a preview that is exactly the public renderer, locale tabs, a properties pane, autosave with conflict detection, a dirty guard, and a read-only mode for `user`.

**Scope.**
- **Dependencies** (`packages/ui`, every `@tiptap/*` pinned to the same exact version and upgraded together, because their peer dependencies require it): `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`, `@tiptap/extensions` (`Placeholder`, `CharacterCount`), `@tiptap/extension-code-block-lowlight` + `lowlight` + `highlight.js` (BSD-3-Clause, free), `@tiptap/extension-image`, `@tiptap/extension-table`, `@tiptap/suggestion` + `@floating-ui/dom`. All MIT except highlight.js. Nothing from `@tiptap-pro/*` or the Tiptap private registry (D25).
- **`scripts/check-deps.mjs`** + root script `check:deps`, run in CI: fails if `pnpm-lock.yaml` contains `@tiptap-pro/` or `@tiptap-cloud/`, if any `.npmrc` points at `registry.tiptap.dev`, or if an installed `@tiptap/*` package's `license` is not `MIT`.
- **`packages/ui` `MarkdownEditor`** (`'use client'`). Props: `value` (Markdown), `onChange(markdown)`, `onBlur`, `editable`, `variant` (`full` | `compact`), `labels` (chrome strings, since `packages/ui` has no i18n), `renderPreview(markdown)` (slot filled by the web), `onUploadImage?` (wired in T51).
  - `useEditor({ extensions: createMarkdownExtensions(), content: value, contentType: 'markdown', editable, immediatelyRender: false })`. `immediatelyRender: false` is required with Next.js server rendering, otherwise hydration fails.
  - `extensions/create-markdown-extensions.ts` is the editor's schema, and it follows the T23 allowlist exactly: `StarterKit.configure({ heading: { levels: MARKDOWN_HEADING_LEVELS }, underline: false, codeBlock: false, link: { openOnClick: false, autolink: true, isAllowedUri: isAllowedMarkdownUrl } })`, `Markdown`, `CodeBlockLowlight` (a `lowlight` instance with only `MARKDOWN_CODE_LANGUAGES` registered), `Image` (`isAllowedImageSrc`, `alt` attribute), the Table extensions, `Placeholder`, `CharacterCount`, plus the three custom extensions below. Nothing outside the allowlist is registered, so pasted HTML is reduced to allowed nodes by ProseMirror's schema and unknown Markdown HTML stays as plain text.
  - `extensions/heading-clamp.extension.ts`: extends `Heading` so that an H1 in loaded Markdown becomes H2, matching the public renderer.
  - `extensions/callout.extension.ts`: a block node `callout` (`kind`: `NOTE` | `WARNING`) with a `markdownTokenizer` for `> [!NOTE]` / `> [!WARNING]` and a `renderMarkdown` that writes the same syntax back; rendered through `ReactNodeViewRenderer` with the public `Callout` look.
  - `extensions/slash-command.extension.ts`: `@tiptap/suggestion` on `/`, listing Heading 2, Heading 3, bullet list, ordered list, quote, Note, Warning, code block, image, table and divider; the menu is shadcn `command` in a floating panel.
  - Code blocks: a `ReactNodeViewRenderer` header with a language `select` (`MARKDOWN_CODE_LANGUAGES` + "Plain text") and the same filename/language look as the public `CodeBlock`. Highlight colors come from `packages/ui/src/styles/editor.css`, which maps `.hljs-*` classes to the T23 `--shiki-token-*` variables, so writing and reading use one palette. The Preview mode shows the exact Shiki output.
  - Pasting plain text that looks like Markdown inserts it as Markdown (`insertContent(text, { contentType: 'markdown' })`), through a small `handlePaste` in `extensions/markdown-paste.extension.ts` if `@tiptap/markdown` has no built-in option for it.
  - Modes on shadcn `tabs`: **Write** (the editor), **Split** (editor and preview side by side on `resizable`, `xl` and up), **Preview** (`renderPreview`, debounced 500ms), **Markdown** (read-only `<pre>` of `getMarkdown()`: exactly what will be stored). Word count from `CharacterCount` in the footer.
  - `editable: false`: the toolbar, slash menu and paste/drop handling are off, the placeholder is hidden, `aria-readonly="true"`, links open on click. `useEffect` calls `editor.setEditable(editable)` when the prop changes.
  - Stories: empty, kitchen-sink fixture, read-only, compact, dark.
- **Toolbar** (`MarkdownEditor/components/EditorToolbar`): `role="toolbar"` with arrow-key roving focus, sticky at the top of the editor; every icon button has a `tooltip` showing its shortcut in `kbd`; groups split by a vertical `separator`. `variant="compact"` (experience highlights, bio) shows only bold, italic, link and lists; the schema stays the same, so no stored content is lost.

| Control | shadcn parts | Markdown it writes | Shortcut |
| --- | --- | --- | --- |
| Undo, redo | `button` (`ghost`, `sm`) | n/a | `Mod-Z`, `Shift-Mod-Z` |
| Block type: Paragraph, Heading 2, Heading 3 | `dropdown-menu` | `## `, `### ` | `Mod-Alt-0/2/3` |
| Bold, italic, strikethrough, inline code | `toggle-group` (`multiple`, `aria-pressed`) | `**…**`, `*…*`, `~~…~~`, `` `…` `` | `Mod-B`, `Mod-I`, `Mod-Shift-S`, `Mod-E` |
| Link | `popover` + `input` + `button` (Apply, Remove); URL checked with `isAllowedMarkdownUrl` | `[text](url)` | `Mod-K` |
| Bullet list, ordered list, quote | `toggle` | `- `, `1. `, `> ` | `Mod-Shift-8/7/B` |
| Callout: Note, Warning | `dropdown-menu` | `> [!NOTE]`, `> [!WARNING]` | `/note`, `/warning` |
| Code block | `button`; language `select` in the block header | fenced block with language | `Mod-Alt-C` |
| Image | `button` → `popover` (URL + required alt) until T51, then the media picker `dialog` | `![alt](url)` | `/image` |
| Table | `dropdown-menu` (insert 3×3, add/remove row or column, delete table) | GFM table | `/table` |
| Mode | `tabs` (Write, Split, Preview, Markdown) | n/a | n/a |

- **Web `admin-core/components/MarkdownField`**: binds a TanStack Form field to `MarkdownEditor`. It loads the editor with `next/dynamic` (`ssr: false`, skeleton while loading), so Tiptap ships only in admin chunks. It passes `labels` from `admin.editor.*` in `en.json`, `renderPreview` (calls `content/actions/preview.action.ts`) and `editable={!readOnly}`.
- **Autosave integration** (`hooks/use-autosave.hook.ts`):
  - On every Tiptap `update`, `getMarkdown()` runs debounced 250ms and calls `field.handleChange(markdown)`. The form listener then debounces 1.5s and sends `PATCH` with `updatedAt`. Blur, a locale tab switch and leaving the page flush both debounces at once.
  - **No save on open.** `@tiptap/markdown` may normalize hand-written Markdown (for example `*` bullets become `-`). Right after load, `MarkdownField` stores `baseline = editor.getMarkdown()`, and the field is dirty only when the current Markdown differs from that baseline, not from the raw DB string.
  - **Outside changes** ("Load latest" after a 409 conflict, an offline copy restored, a locale switch) call `editor.commands.setContent(value, { contentType: 'markdown', emitUpdate: false })`, but only when `value` differs from the last emitted Markdown, so the cursor never jumps while typing.
  - 409 → `SaveStatus` "Conflict" with "Load latest" / "Overwrite"; offline → the Markdown string is kept in `localStorage` per entity and locale. Neither keeps editor JSON.
- **Read-only mode** (D7): `EditorShell` `readOnly` is true when `useIsAdmin()` is false. Then every `MarkdownField` gets `editable: false`, other fields are disabled, autosave and the dirty guard are off, the publish slot is hidden, and the header shows a "Read only" badge. Every editor in T43–T45 passes it through.
- **`packages/ui`**: also `SaveStatus` (`Saving…`, `Saved 12s ago`, `Offline, changes kept locally`, `Conflict: newer version` with Load latest / Overwrite), `LocaleTabs` (EN/VI with completeness dots), `PropertyList`.
- **`content`**: split the T23 pipeline into `markdown-to-hast` (server) and `hast-to-react.util.ts` (shared); `content/actions/preview.action.ts` (Server Action that returns sanitized HAST for the preview pane, with the same sanitize schema and Shiki theme as the public pages).
- **`admin-core`**: `EditorShell` (header with title, `SaveStatus`, publish slot; editor; properties pane 320px on `lg`; live preview column on `2xl`; properties in a `sheet`/`drawer` on mobile), `hooks/use-dirty-guard.hook.ts`, `utils/map-field-errors.util.ts` (`ApiError.fieldErrors` → form field errors).
- **Tests**:
  - `MarkdownEditor` round-trip with the T23 kitchen-sink fixture: load → `getMarkdown()` → load → `getMarkdown()` gives the same string, and every construct survives.
  - The unsafe fixture through the editor: the output has no `<script>`, `<iframe>`, `onerror`, `javascript:` or external image, and no H1.
  - That editor output through the public pipeline renders every kitchen-sink element.
  - Callout and code-block language Markdown round-trips.
  - Opening a document does not mark it dirty.
  - The autosave state machine, field error mapping, and read-only mode (no `PATCH` is sent, `editor.isEditable` is false).

**Files.** `packages/ui/package.json`, `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,MarkdownEditor.stories.tsx,MarkdownEditor.test.tsx,components/{EditorToolbar,SlashMenu,LinkPopover,CodeBlockView,CalloutView}/*,extensions/{create-markdown-extensions.ts,heading-clamp.extension.ts,callout.extension.ts,slash-command.extension.ts,markdown-paste.extension.ts}}`, `packages/ui/src/styles/{globals.css,editor.css}`, `packages/ui/src/components/{SaveStatus,LocaleTabs,PropertyList}/*`, `packages/ui/src/components/ui/{tabs,resizable,drawer,toggle,toggle-group,tooltip,kbd,dropdown-menu,popover,command,select,separator}.tsx`, `apps/web/src/modules/content/{services/markdown.service.ts,utils/hast-to-react.util.ts,actions/preview.action.ts}`, `apps/web/src/modules/admin-core/{components/EditorShell/*,components/MarkdownField/*,hooks/use-autosave.hook.ts,hooks/use-dirty-guard.hook.ts,utils/map-field-errors.util.ts}`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `package.json`, `.github/workflows/ci.yml` ([root STRUCTURE: packages/ui](../STRUCTURE.md#package-layout-packagesui)).

**Design.** Figma `18:2`. Mockup `admin-editor.html` (toolbar `B I H1 H2 🔗 </> 🖼 callout [Split]`, slash menu). The mockup's "H1 H2" buttons map to Heading 2 and Heading 3, because the page title is the only H1. Tokens:
- toolbar: `--card` background, `--border` bottom border, controls 28px (`sm`), `text-ui`, active toggle `--accent` / `--accent-foreground`, focus `--ring`;
- menus and popovers: `--popover`, `--shadow-2`, `--z-dropdown`, `--radius-md`;
- writing surface: `Prose` (`text-prose`, `--measure`), so line length matches the public page; placeholder `--muted-foreground`; selection `--primary-subtle`;
- code blocks: `--muted`, `--font-mono`, `--shiki-token-*`; callouts: `--info-subtle` (Note) and `--warning-subtle` (Warning);
- word count: `text-ui-meta`; save states: `--success`, `--warning`.

**Acceptance.**
- [ ] Typing `## `, `- ` or a code fence turns into the block, and the Markdown tab shows the matching Markdown; the stored value in the DB is Markdown, never HTML or JSON (D3).
- [ ] The kitchen-sink fixture round-trips unchanged, and the unsafe fixture loses every disallowed item (tests).
- [ ] Opening an item never triggers a `PATCH`; autosave fires 1.5s after typing stops and shows `Saved …`; a stale save shows `Conflict` with both actions (tested).
- [ ] Leaving with unsaved changes asks for confirmation.
- [ ] Signed in as `user`, an editor opens read-only (`editable: false`, no toolbar) and sends no writes.
- [ ] Preview output uses the same sanitized pipeline and Shiki theme as the public site (shared fixtures).
- [ ] `pnpm check:deps` passes, and fails when a `@tiptap-pro/` package is added in a test branch.
- [ ] `next build` shows no growth in First Load JS for public routes (Tiptap only in `/admin` chunks).
- [ ] Toolbar keyboard pass: Tab reaches the toolbar once, arrows move between controls, every control has an accessible name and shows its shortcut.

**PR title:** `feat(web): editor shell + markdown editor`

#### T43 · Project editor

**Roadmap** p22 · **Spec** §5.9, §5.11 ("Card & facts"), §4.6 (TanStack Form field arrays) · **Depends** T42 · **Size** L

**Goal.** Create and edit projects with every case-study field, metrics, and a live `CaseCard` preview.

**Scope.**
- Routes `app/admin/(cms)/projects/new/page.tsx` and `projects/[id]/page.tsx` → `admin-projects/views/AdminProjectsEditor.tsx`.
- Tabs: Content (title, tagline, the six case-study markdown fields per locale, each a `MarkdownField` (T42); only the active locale's editors are mounted; Scope and Trade-offs show the hint "Use `###` headings to split into columns/cards", because T23's `split-sections.util.ts` splits on H3), Card & facts (domain select, key facts textarea with 2–4 line counter, fact chips input with max 6, live `CaseCard` preview), Metrics (field array: label, before, after, value; reorder), SEO.
- Properties pane: status, slug, dates, featured, confidential, experience link, skills multi-combobox, version from/to, live/repo URLs. Cover picker comes in T51; publish button in T52.
- Autosave via `use-autosave`; create redirects to the edit route.
- Read-only for `user`: `AdminProjectsEditor` passes `readOnly` to `EditorShell`, every `MarkdownField` gets `editable: false`, and the metric field array hides add, remove and reorder.

**Files.** `apps/web/app/admin/(cms)/projects/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-projects/{views/AdminProjectsEditor.tsx,components/{ProjectContentTab,ProjectCardFactsTab,ProjectMetricsTab,ProjectSeoTab,ProjectProperties}/*,hooks/use-admin-project.hook.ts}`, `packages/ui/src/components/ui/{calendar,popover,command}.tsx`.

**Design.** Figma `18:2` (Card & facts tab active). Mockup `admin-editor.html`.

**Acceptance.**
- [ ] Submitting an empty EN title returns 400 and the error shows on that input (roadmap p22).
- [ ] Edits show on the public page after save (roadmap p22; after T52 only on publish).
- [ ] Editing in two tabs produces the Conflict state in the second.
- [ ] Signed in as `user`, all six case-study editors are read-only and the page sends no `PATCH`.
- [ ] Screenshot compared with `18:2`.

**PR title:** `feat(web): admin editors`

#### T44 · Post + experience editors

**Roadmap** p22 · **Spec** §5.9, §5.11 (takeaways) · **Depends** T42 · **Size** M

**Goal.** Editors for posts and experience on the shared shell.

**Scope.**
- Post editor (`AdminPostsEditor`): title, excerpt, body (`MarkdownField`, `full` toolbar) per locale, takeaways textarea (≤ 5 lines), tags multi-combobox with create, featured, SEO fields; publish-lint warnings shown inline using `publishLint` from contracts. Routes `posts/new`, `posts/[id]`.
- Experience editor (`AdminAboutExperienceEditor`): company, URL, location, employment type, role, summary, highlights (`MarkdownField`, `compact` toolbar), month-precision dates (`calendar`), skills. Routes `experience/new`, `experience/[id]`.
- Both editors pass `readOnly` to `EditorShell`, so a `user` gets `editable: false` editors, disabled inputs and no tag creation.

**Files.** `apps/web/app/admin/(cms)/posts/{new,[id]}/page.tsx`, `apps/web/app/admin/(cms)/experience/{new,[id]}/page.tsx`, `apps/web/src/modules/admin-posts/{views/AdminPostsEditor.tsx,components/*,hooks/use-admin-post.hook.ts}`, `apps/web/src/modules/admin-about/{views/AdminAboutExperienceEditor.tsx,components/ExperienceForm/*}`.

**Design.** Mockup `admin-editor.html` (same shell).

**Acceptance.**
- [ ] A body containing `TODO` shows a publish-lint warning before saving.
- [ ] Creating a tag from the combobox adds it to the post.
- [ ] Signed in as `user`, both editors are read-only and send no writes.

**PR title:** `feat(web): post and experience editors`

#### T45 · Site settings + profile admin

**Roadmap** p22 · **Spec** [§5.10](./design/portfolio-design-system.md#s-5-10), §1.5 (`Profile`, `SiteSettings`) · **Depends** T33, T42 · **Size** L

**Goal.** Edit site settings, navigation, social links, contact topics and the profile from the admin. Page sections are now blocks, edited in the page builder (T45b).

**Scope.**
- `app/admin/(cms)/site/page.tsx` → `admin-site/views/AdminSiteIndex.tsx` with URL-synced tabs: Settings (form: SEO defaults, footer note, contact intro, reply time, contact email, availability, analytics, ambient effects, marquee), Navigation (table, inline-editable label, `href` picker from `routes.constant.ts` or URL, move up/down), Social links (with `showInHeader`, `showInCta`), Contact topics.
- `app/admin/(cms)/profile/page.tsx` → `AdminSiteProfile`: headline + accent (live `AccentHeadline` preview, validation per locale), hero kicker, subheadline, bio (`MarkdownField`, `compact` toolbar), career start date, languages, city, timezone, private phone. Avatar and resume pickers come in T51.

**Files.** `apps/web/app/admin/(cms)/{site,profile}/page.tsx`, `apps/web/src/modules/admin-site/{views/{AdminSiteIndex,AdminSiteProfile}.tsx,components/{SettingsForm,NavTable,SocialTable,TopicsTable,ProfileForm}/*,hooks/*,services/*}`.

**Design.** Spec §5.10 wireframe. Tokens: `text-ui`, admin control sizes.

**Acceptance.**
- [ ] Renaming a nav item in the admin changes the public header (dev: immediately; production: after T52 revalidation).
- [ ] An accent that is not in the headline shows the field error for that locale.
- [ ] Nav and social reorder use the transactional order endpoint.

**PR title:** `feat(web): site and profile admin`

#### T45a · Schema-driven props form (zod → TanStack Form)

**Roadmap** p22 · **Spec** §4.6 (TanStack Form + zod), D26 · **Depends** T41, T42 · **Size** M

**Goal.** One component that draws an editable form from a zod schema, so a new block type needs no hand-written admin form.

**Scope.**
- `admin-core/utils/schema-to-fields.util.ts`: `z.toJSONSchema(schema, { io: 'input' })` → a field tree (`path`, `kind`, `required`, `min`/`max`, `enum`, `default`, `widget`, `label`). It reads the `.meta()` keys from T10a and supports objects, strings, numbers and integers, booleans, enums, arrays of objects or scalars, optional and default values. A shape it does not know throws in development and in tests, so a new schema cannot silently lose a field.
- `admin-core/components/SchemaForm/SchemaForm.tsx`: `useForm({ defaultValues, validators: { onChange: schema } })` (TanStack Form takes zod 4 directly through Standard Schema), one `form.Field` per leaf, server `fieldErrors` mapped with T42's `map-field-errors.util.ts`, and `readOnly` disables every widget.
- Widgets in `SchemaForm/widgets/`, chosen by `widget`, otherwise by type:
  - `text`, `textarea`, `number`, `switch`, `select` (enums);
  - `localized-text` and `localized-textarea`: EN and VI inputs side by side, like every admin editor, with a dot when VI is empty;
  - `markdown`: `MarkdownField` with the `compact` toolbar (T42);
  - `icon` (`IconPicker`, T41), `hue` (`HuePicker`), `route` (from `routes.constant.ts`);
  - `project`, `projects` (searchable multi-combobox that keeps the order, for `manual` lists), `stats`, `tag`.
  - Arrays get add, remove, and move up/down buttons.
- Labels and help text come from `en.json` `admin.blocks.*` through the `label` key. A unit test walks `BLOCK_REGISTRY` and fails on a missing key.
- Autosave: `SchemaForm` exposes `onValuesChange` for `use-autosave` (T42), so the builder saves a block 1.5s after typing stops.
- Tests: every type in `BLOCK_REGISTRY` renders a form with no unknown field; an invalid value shows the zod message; server `fieldErrors` land under the right input; `readOnly` renders no enabled input.

**Out of scope.** The page builder screen (T45b). Drag and drop in arrays (`SortableList`, T45b).

**Files.** `apps/web/src/modules/admin-core/{utils/schema-to-fields.util.ts,utils/schema-to-fields.util.test.ts,components/SchemaForm/{SchemaForm.tsx,SchemaForm.test.tsx,widgets/*}}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{switch,select,command,popover}.tsx`.

**Design.** Figma `18:2` properties pane (field look, 32px controls). Tokens: `text-ui`, `text-ui-meta`, `--input`, `--ring`, `--destructive`.

**Acceptance.**
- [ ] The browser and the API validate with the same zod schema: shared fixtures that the form accepts are accepted by T32a, and the ones it rejects get the same field errors from the API (roadmap p22).
- [ ] Every type in `BLOCK_REGISTRY` renders its form with all fields and labels (test).
- [ ] A server error on `props.primaryCta.label.en` shows under the English label input.
- [ ] With `readOnly`, no input is enabled.

**PR title:** `feat(web): schema-driven props form`

#### T45b · Page builder: blocks, drag and drop, layouts

**Roadmap** p22 · **Spec** §4.3, §4.6 (optimistic reorder), §5.10, D26 · **Depends** T33, T45a · **Size** L

**Goal.** In `/admin/pages`, an `admin` arranges each public page: drags blocks into order, adds, duplicates, hides and deletes them, picks a layout preset, and edits props in the generated form. A `user` sees the same screen read-only.

**Scope.**
- Dependencies (`packages/ui`): `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `@dnd-kit/modifiers`, all MIT and free. Use the stable line (`core` 6.x, `sortable` 10.x), not the pre-1.0 `@dnd-kit/react`. `check:deps` (T42) also fails if any `@dnd-kit/*` package is not MIT.
- `packages/ui` `SortableList` (`'use client'`):
  - a vertical list on `DndContext` + `SortableContext`, with `PointerSensor` (a small activation distance, so clicks still work) and `KeyboardSensor` with `sortableKeyboardCoordinates`;
  - a drag-handle button with an accessible name, `restrictToVerticalAxis`, and a `DragOverlay`;
  - screen-reader `announcements` and `screenReaderInstructions` passed in as labels, and `onReorder(ids)`;
  - `disabled` items (the H1 block) cannot move, and nothing can be dropped above them.
  - Stories include the keyboard instructions.
- Routes `app/admin/(cms)/pages/page.tsx` → `admin-pages/views/AdminPagesIndex.tsx` (the five pages, block count, updated time) and `app/admin/(cms)/pages/[key]/page.tsx` → `AdminPagesEditor.tsx`. A "Pages" item joins the sidebar's Site group.
- `AdminPagesEditor` on `EditorShell` (T42), with the block list in the main column and the inspector in the properties pane:
  - `BlockList` (`SortableList`). Each `BlockRow` shows the drag handle, type icon and label, `key`, a layout badge, a visible `switch` (optimistic), and a row menu: Move up, Move down, Duplicate, and Delete with `alert-dialog`. Move up/down is the alternative to dragging for keyboard and single-pointer users (WCAG 2.5.7). An invalid or unknown block shows as an `alert` row with its issues and only Delete.
  - Reorder calls `PATCH /admin/pages/:key/blocks/order` with an optimistic update and rollback (T39 `optimistic.util.ts`). A failed reorder restores the list and shows a toast.
  - `AddBlockDialog`: a `command` list of the types allowed on this page, each with an icon and a one-line description. Types already at their `maxPerPage` are disabled, with the reason. The new block goes after the selected one.
  - `BlockInspector` tabs:
    - Props: `SchemaForm` for the type, autosaved per block with its `updatedAt`, plus `SaveStatus` and T42's Conflict actions on 409;
    - Layout: `LayoutPresetPicker`, a `toggle-group` of the type's presets with small column thumbnails, and the responsive rule underneath in `text-ui-meta`;
    - Appearance: `surface` plain or band, with the note that touching bands merge;
    - Anchor: the `key`, with its public URL `/#key`.
  - `PageSettingsSheet`: SEO title and description per locale.
  - Header: a "Draft" status and an "Open page" link (dev shows edits at once, D23). Publish, history and live preview come in T52a.
- `admin-pages/constants/block-editor-meta.constant.ts`: `type` → `{ icon, labelKey, descriptionKey }`, `satisfies Record<BlockType, …>` (rule 8).
- `services/admin-pages.service.ts`.
- `hooks/use-admin-page.hook.ts`: `useSuspenseQuery(qk.admin.pages.detail(key))`.
- `hooks/use-block-mutations.hook.ts`: add, update, duplicate, delete, reorder and toggle, each patching or invalidating the page query.
- Read-only (D7): no drag handles, no add, no write items in the row menu, and the inspector is `readOnly`. "Open page" still works.
- The spec §5.10 Sections tab lives here now; T45 no longer has one.

**Out of scope.** Publish, versions, live preview (T52a). Free-form grid placement and side-by-side blocks (Q13).

**Files.** `packages/ui/package.json`, `packages/ui/src/components/SortableList/{SortableList.tsx,SortableList.stories.tsx,SortableList.test.tsx}`, `apps/web/app/admin/(cms)/pages/{page.tsx,[key]/page.tsx}`, `apps/web/src/modules/admin-pages/{views/{AdminPagesIndex,AdminPagesEditor}.tsx,components/{BlockList,BlockRow,AddBlockDialog,BlockInspector,LayoutPresetPicker,PageSettingsSheet}/*,constants/block-editor-meta.constant.ts,hooks/{use-admin-page.hook.ts,use-block-mutations.hook.ts},services/admin-pages.service.ts}`, `apps/web/src/modules/admin-core/components/AdminSidebar/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/web/i18n/locales/en.json`, `scripts/check-deps.mjs`, `packages/ui/src/components/ui/{alert-dialog,toggle-group,sheet,tabs}.tsx` ([web STRUCTURE: modules](../apps/web/STRUCTURE.md#modules)).

**Design.** There is no Figma frame for this screen. Build it from the editor shell (`18:2`: the block list where the editor body is, the inspector in the properties pane) and the table rows of `15:2`, and attach screenshots to the PR for Parker's review. Tokens: `--card`, `--border`, `--sidebar-accent` (selected block), `--muted` (drag overlay), `--shadow-2`, `--destructive-subtle` and `--destructive` (invalid row), `--ring`, `text-ui`, `text-ui-meta`, admin control heights.

**Acceptance.**
- [ ] Dragging the `work` block above `featured`, with the mouse and with the keyboard (Space, arrows, Space), saves the new order in one transaction; the H1 block cannot be moved or dropped above (roadmap p22 "block editor list").
- [ ] A forced 500 on reorder restores the previous order (optimistic rollback test).
- [ ] Adding a `case-grid`, switching it to `TWO` and saving its props shows it on the public home in dev (D23), with two columns from 768px.
- [ ] A type at its limit is disabled in the add dialog, and the API refuses it anyway (T32a).
- [ ] Every action has a non-drag path (row menu), and a screen reader hears the pick-up, move and drop announcements.
- [ ] Signed in as `user`, the builder is read-only and sends no writes.
- [ ] `pnpm check:deps` passes with the dnd-kit packages.

**PR title:** `feat(web): page builder`

#### T46 · Users admin (admin only) + change own password

**Roadmap** p22 (rounding out M4) · **Spec** §4.3 (Users; "owner only" becomes admin only by D7), §1.5 (`User`) · **Depends** T37 · **Size** M

**Goal.** An `admin` can add accounts, set their role (`admin` or `user`), deactivate them and sign them out everywhere. Every signed-in account can change its own password.

**Scope.**
- API `modules/users/admin-users.controller.ts`, `@Roles('admin')` on the class (explicit, though it is also the default):
  - `GET /admin/users` (page list: name, email, role, `isActive`, `lastLoginAt`), `POST /admin/users` (email, name, role, initial password of at least 12 characters), `PATCH /admin/users/:id` (name, role, `isActive`).
  - `POST /admin/users/:id/sign-out-everywhere` (increments `tokenVersion`; 204) and `POST /admin/users/:id/password` (admin sets a new password; also increments `tokenVersion`).
  - A change of `role` or `isActive` also increments `tokenVersion`, so the old role cannot be refreshed.
  - Guardrails: an admin cannot demote or deactivate themselves, and the last active admin cannot be demoted or deactivated (409 `LAST_ADMIN`, checked inside the same transaction as the update).
- API `PATCH /auth/password` (`@Roles('admin', 'user')`, `changePasswordSchema`: `currentPassword`, `newPassword` with at least 12 characters): verifies the current password, stores the new argon2id hash, increments `tokenVersion`, then sets a fresh cookie pair for this browser so it stays signed in.
- Contracts `users/`: admin user DTO (never `passwordHash` or `tokenVersion`), `createUserSchema`, `updateUserSchema`, `setPasswordSchema`; `auth/auth.schema.ts` gains `changePasswordSchema`.
- Web `admin-users`: `AdminUsersIndex` (`DataTable`: name, email, role pill, active switch, last login; row menu with "Sign out everywhere" and "Set password" behind an `alert-dialog`) and `UserForm` in a `sheet`. Route `app/admin/(cms)/users/page.tsx`; the sidebar item is wrapped in `RoleGate allow={['admin']}`.
- Web `admin-auth/components/ChangePasswordDialog`, opened from the topbar user menu for both roles.

**Files.** `apps/api/src/modules/users/{admin-users.controller.ts,users.service.ts,users.service.spec.ts,dto/*}`, `apps/api/src/modules/auth/{auth.controller.ts,auth.service.ts}`, `packages/contracts/src/users/*`, `packages/contracts/src/auth/auth.schema.ts`, `apps/api/test/users.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/admin/(cms)/users/page.tsx`, `apps/web/src/modules/admin-users/{views/AdminUsersIndex.tsx,components/{UsersTable,UserForm}/*,hooks/use-admin-users.hook.ts,services/admin-users.service.ts}`, `apps/web/src/modules/admin-auth/components/ChangePasswordDialog/*`, `apps/web/src/modules/admin-core/components/{AdminSidebar,Topbar}/*`.

**Design.** Admin table pattern (`15:2`).

**Backend steps, explained.**
1. **Role on the class.** `@Roles('admin')` on the controller class protects every route in it; the `RolesGuard` from T36 does the check. Writing it out, even though admin-only is the default, tells the next reader this module is sensitive.
2. **Hash on create.** The initial password goes through the same argon2id hashing as login (T35); the API never returns it or logs it.
3. **Sign out everywhere, without sessions.** There are no session rows to delete (D24). Incrementing `tokenVersion` makes every refresh token signed with the old number fail at the next refresh, so that user is out within one access-token lifetime (15 min). Need it faster? Lower `JWT_ACCESS_TTL_SECONDS`.
4. **Guardrails in a transaction.** "Is this the last active admin?" and the update run in one `prisma.$transaction`, so two admins demoting each other at the same moment cannot leave the site with no admin.
5. **Changing your own password.** Asking for the current password first means someone at an unlocked laptop cannot lock you out. Bumping `tokenVersion` signs out other devices; re-issuing cookies keeps this one signed in.

**Acceptance.**
- [ ] A `user` calling any `/admin/users` route gets 403, and does not see the Users item.
- [ ] After "Sign out everywhere", that user's next `POST /auth/refresh` returns 401 (e2e).
- [ ] Demoting or deactivating yourself, or the last active admin, returns 409.
- [ ] After changing your own password, the old password fails at login, another browser's refresh returns 401, and the current browser stays signed in.
- [ ] No users API response contains `passwordHash`, `tokenVersion` or a token.

**PR title:** `feat: users admin`

### M5 — Realtime, media, publishing

#### T47 · Contact + inbox API

**Roadmap** p23 · **Spec** §1.5 (`ContactMessage`), §1.6 (Rate limit), §5.6 · **Depends** T36 · **Size** M

**Goal.** A public endpoint that stores contact messages safely, and admin endpoints to read and triage them.

**Scope.**
- Model `ContactMessage` (`name`, `email`, `topicId?`, `message` Text, `locale`, `status` `NEW|READ|REPLIED|SPAM`, `ipHash`). Migration `add-contact`.
- Contracts `contact/`: `contactSchema` (shared with the web form: name, email, topic, message length limits, honeypot field `website`), admin DTO, list params (`status`).
- `public-contact.controller.ts`: `POST /public/contact` (`@Public()`, throttled 3 per 10 minutes per IP). A filled honeypot returns 201 and stores the row as `SPAM`. `ipHash` from `common/utils/ip-hash.util.ts` (SHA-256 of IP + daily salt).
- `admin-contact.controller.ts`: `GET /admin/messages`, `GET /admin/messages/:id`, `PATCH /admin/messages/:id` (status), `GET /admin/messages/unread-count`. All admin only (no `@Roles()`, D7): messages hold visitor emails, so a `user` gets 403. The dashboard's unread count (a number only) stays readable by both roles.
- Emit an in-process event `contact.created` (`@nestjs/event-emitter`); T49 streams it. Dashboard stats gain the unread count.
- Logs never include the email or message body.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-contact`, `apps/api/src/modules/contact/{contact.module.ts,public-contact.controller.ts,admin-contact.controller.ts,contact.service.ts,dto/*,entities/*}`, `apps/api/src/common/utils/ip-hash.util.ts` (+ spec), `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/contact/*`, `apps/api/test/contact.e2e-spec.ts`, `apps/api/api.http`.

**Design.** Spec §5.6 (fields).

**Backend steps, explained.**
1. **Public write = untrusted input.** Validate with the shared schema, cap lengths, rate-limit by IP, and never echo the content back in public responses.
2. **Honeypot.** A hidden field humans never fill. Bots fill everything; answering 201 anyway means they do not learn they were caught.
3. **Hashing the IP.** Rate limits and spam checks need to compare IPs, not store them. A daily salt means hashes cannot be linked across days.
4. **Events.** The service announces "a message arrived" without knowing who listens. T49 adds the listener that pushes it to the admin.

**Acceptance.**
- [ ] A valid message returns 201; invalid input returns 400 with `fieldErrors`; the 4th message in the window returns 429.
- [ ] Honeypot messages are stored as `SPAM` and excluded from the default inbox list.

**PR title:** `feat(api): contact + inbox endpoints`

#### T48 · Contact page + Server Action

**Roadmap** p23 · **Spec** [§5.6](./design/portfolio-design-system.md#s-5-6), §4.2 (`ContactForm`), §4.6 (Contact form row), §6 Day 20 · **Depends** T14, T47 · **Size** M

**Goal.** The contact page with a form that works with and without JavaScript.

**Scope.**
- Route `app/[locale]/(site)/contact/page.tsx` → `contact/views/ContactIndex.tsx`. `ContactIndex` renders `BlocksPage` for `contact`. New block type `contact-form` (rule 8; H1; layout `TWO` or `ONE`) draws the split layout on the faint grid: left the block's eyebrow, H1 and intro, `contactIntro`, `replyTimeNote`, channel cards (email with `CopyEmailButton`, address shown only via `mailto:`; GitHub; LinkedIn, from `socialLinks`); right `ContactForm` on `--card-glass`.
- `ContactForm` (client): TanStack Form + `field`, validators = `contactSchema`; fields name, email, topic (`select`, hidden when there are no topics), message, hidden honeypot; validate on blur, error summary on submit that receives focus; success replaces the form with a status panel; a submit error shows an `alert` above the form and keeps the inputs.
- `contact/actions/contact.action.ts` (`'use server'`): validates with `contactSchema`, calls `POST /public/contact` with `Origin: WEB_ORIGIN` and `x-forwarded-for` from the incoming request (so throttling sees the visitor's IP), returns `{ ok }` or `{ fieldErrors }`. The `<form action>` uses it directly (no JS, `useActionState`); with JS, a `useMutation` calls the same action.

**Files.** `apps/web/app/[locale]/(site)/contact/page.tsx`, `apps/web/src/modules/contact/{views/ContactIndex.tsx,components/{ChannelCards,ContactForm}/*,actions/contact.action.ts,services/contact-topics.service.ts}`, `apps/web/src/modules/blocks/components/ContactFormBlock/*`, `apps/web/src/modules/blocks/constants/block-renderers.constant.ts`, `packages/contracts/src/blocks/{definitions/contact-form.block.ts,block-registry.constant.ts}`, `apps/web/i18n/locales/{en,vi}.json`, `packages/ui/src/components/ui/{select,textarea}.tsx`.

**Design.** Figma `12:2`. Mockup `contact.html` (one field in its error state). Tokens: `--card-glass`, `--grid-line`, `--destructive`, `text-title`, `text-body`.

**Acceptance.**
- [ ] With JavaScript disabled, the form submits and shows the result (spec §6 Day 20).
- [ ] Field errors appear under the right inputs and in the summary; screen readers announce them.
- [ ] No email address appears in the HTML except inside the `mailto:` link and the copy handler.
- [ ] Screenshot compared with `12:2`.

**PR title:** `feat(web): contact page`

#### T49 · SSE events + inbox UI + NotificationBell

**Roadmap** p23 · **Spec** §1.6 (Realtime), §4.3 (`NotificationBell`), §4.6 (Realtime row), §6 Day 17 · **Depends** T39, T47 · **Size** M

**Goal.** A new contact message appears in the admin within seconds, with a toast and an unread badge, and the stream recovers after restarts.

**Scope.**
- API `modules/events`: `events.controller.ts` (`GET /admin/events`, `@Sse()`, admin only because events carry sender names), `events.service.ts` (a `Subject` fed by `contact.created` and, from T52, `content.published`); heartbeat comment every 25s; headers `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
- Web `admin-core/hooks/use-admin-events.hook.ts`: one `EventSource('/api/admin/events')` in the admin layout; on `contact.created` → `setQueryData(qk.admin.inbox.unread, n => n + 1)`, invalidate the messages list, `sonner` toast "New message from {name}" with Open; closes on unmount; the browser reconnects on its own. Mounted only for `admin`. On `error`, if the stream does not reopen within 5s (an expired access token makes the reconnect fail with 401, which `EventSource` cannot read), call `refreshOnce()` from `api-client.service.ts` and open a new `EventSource`; after 3 failed refreshes stop and send the user to login.
- `admin-core/components/NotificationBell` (topbar, unread badge, `aria-live="polite"`, never steals focus).
- `admin-inbox`: `AdminInboxIndex` (`DataTable`: status filter, mark read optimistic, mark spam) and `AdminInboxDetail`. Routes `app/admin/(cms)/inbox/page.tsx`, `inbox/[id]/page.tsx`. Dashboard gains an inbox card (latest 5).
- Check that the Next rewrite does not buffer the stream; note the result in the PR.

**Files.** `apps/api/src/modules/events/*`, `apps/web/src/modules/admin-core/{hooks/use-admin-events.hook.ts,components/NotificationBell/*}`, `apps/web/src/modules/admin-inbox/*`, `apps/web/app/admin/(cms)/inbox/{page.tsx,[id]/page.tsx}`, `apps/web/src/modules/admin-dashboard/components/InboxCard/*`.

**Design.** Figma `14:2` (bell, inbox card). Mockup `admin-dashboard.html`.

**Backend steps, explained.**
1. **Server-Sent Events.** One long HTTP response that the server keeps writing small `data:` lines to. The browser's `EventSource` reads them and reconnects by itself. One-way is enough for notifications.
2. **Heartbeats.** Proxies close idle connections. A comment line every 25s keeps it open and lets the client notice a dead connection.
3. **Auth works for free, until the token expires.** It is a normal same-origin request, so the `access_token` cookie and `JwtAuthGuard` apply. The guard runs once, when the stream opens; an open stream keeps flowing after the token expires. Only a reconnect needs a fresh token, which is why the hook refreshes before reopening.

**Acceptance.**
- [ ] Submitting the public form shows the new row in the inbox without a reload within 2s (roadmap p23).
- [ ] After an API restart, `EventSource` reconnects and heartbeats resume (roadmap p23).

**PR title:** `feat: contact + sse inbox`

#### T50 · Media API: upload, variants, relations

**Roadmap** p24 · **Spec** §1.5 (`Media`, `ProjectImage`), §1.6 (Uploads) · **Depends** T36 · **Size** L

**Goal.** Safe uploads stored on a volume, with WebP variants and alt text, linked to the entities that use images.

**Scope.**
- Models `Media`, `ProjectImage`. Turn the plain id columns into relations: `SiteSettings.ogImage`, `Profile.avatar`, `Profile.resumeEn`, `Profile.resumeVi`, `Project.cover`, `Post.cover` (`onDelete: SetNull`). Migration `add-media`.
- `admin-media.controller.ts`: `POST /admin/media` (`FileInterceptor`, 10 MB limit, allowlist JPG/PNG/WebP/AVIF/PDF checked by magic bytes, D14; `sharp` strips metadata and writes WebP variants at 480/960/1600 widths; random stored names under `UPLOAD_DIR`), `GET /admin/media` (cursor pagination, D6; `@Roles('admin', 'user')`), `PATCH /admin/media/:id` (alt), `DELETE /admin/media/:id` (409 `IN_USE` when referenced). Upload, patch and delete are admin only.
- `public-media.controller.ts`: `GET /public/media/:file` streams known files only, long cache headers, `X-Content-Type-Options: nosniff`.
- Public DTOs gain image objects `{ url, srcset, width, height, alt }` (alt picked by locale). Admin project DTO gains `images` with captions and order.
- Content health gains "images missing alt text".
- `apps/api/uploads/` git-ignored; `.env.example` `UPLOAD_DIR`.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-media`, `apps/api/src/modules/media/{media.module.ts,admin-media.controller.ts,public-media.controller.ts,media.service.ts,image-variants.service.ts,dto/*,entities/*}`, `apps/api/src/modules/{projects,posts,profile,site-settings}/entities/*.mapper.ts`, `packages/contracts/src/media/*`, `apps/api/test/media.e2e-spec.ts`, `.env.example`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Multipart upload.** Files arrive as `multipart/form-data`. `FileInterceptor` (multer) parses it and enforces the size limit before your code runs.
2. **Never trust the file name or the declared type.** Check the first bytes of the file to find its real type, and store it under a random name.
3. **Variants.** `sharp` resizes once at upload time; pages then pick the smallest size that fits (`srcset`).
4. **Files on disk, metadata in the DB.** The `Media` row is the source of truth; the file is a blob on a Docker volume. A `MediaService` interface means cloud storage can replace the disk later.

**Acceptance.**
- [ ] Uploading a JPG creates the WebP variants, and the public DTO has `srcset` and alt (roadmap p24).
- [ ] A 20 MB upload or an `.exe` renamed to `.jpg` is rejected with 400 (roadmap p24).
- [ ] A PDF is accepted without variants; GPS EXIF data is gone from stored images.

**PR title:** `feat: media uploads`

#### T51 · Media UI: library, uploader, pickers

**Roadmap** p24 · **Spec** §4.3 (`MediaUploader`, `MediaLibrary`), §4.6 (infinite + virtual list), §6 Day 18 · **Depends** T42, T50 · **Size** M

**Goal.** Upload with progress and cancel, browse a large library, and pick images wherever the editors need them; public pages render responsive images.

**Scope.**
- `packages/ui` `MediaLibrary` (grid, alt-missing warning) and `MediaUploader` (drop zone, per-file `progress`, cancel).
- `admin-media`: `AdminMediaIndex` (`useInfiniteQuery` + TanStack Virtual, alt editing in a sheet), `services/media-upload.service.ts` (XHR, because `fetch` has no upload progress; `AbortController` cancel), `components/MediaPickerDialog`.
- Pickers in editors: project cover and images with captions (T43), post cover (T44), avatar and resumes (T45 profile), OG image (T45 settings). `MarkdownEditor`: `@tiptap/extension-file-handler` (MIT, D25) on paste and drop calls `onUploadImage(file)`, inserts the image with the returned `/api/public/media/…` URL, and opens the alt-text popover (publish requires alt, T52); the toolbar image button opens the media picker `dialog`.
- Public: `core/utils/image-loader.util.ts` (`next/image` loader that maps width → nearest variant); covers on case study and featured card, avatar on About, CV download card links.

**Files.** `packages/ui/src/components/{MediaLibrary,MediaUploader}/*`, `packages/ui/package.json` (`@tiptap/extension-file-handler`, same version as the other `@tiptap/*`), `packages/ui/src/components/MarkdownEditor/{MarkdownEditor.tsx,extensions/create-markdown-extensions.ts}`, `apps/web/src/modules/admin-core/components/MarkdownField/*`, `packages/ui/src/components/ui/progress.tsx`, `apps/web/src/modules/admin-media/*`, `apps/web/app/admin/(cms)/media/page.tsx`, `apps/web/src/modules/admin-{projects,posts,site}/components/*` (picker wiring), `apps/web/src/modules/core/utils/image-loader.util.ts`, `apps/web/next.config.ts`, `apps/web/src/modules/{projects,about,home}/components/*`.

**Design.** Mockup `admin-editor.html` (cover field), `case-study.html` (21:9 cover). Tokens: `--radius-xl`, `--muted`, `--warning`.

**Acceptance.**
- [ ] Upload shows progress and can be cancelled (spec §6 Day 18).
- [ ] Public `<img>` elements have `srcset` and alt (roadmap p24).
- [ ] The library scrolls smoothly with 1,000 seeded media rows.

**PR title:** `feat(web): media library and pickers`

#### T52 · Publish workflow + revalidate + draft preview

**Roadmap** p25 · **Spec** §1.5 (status), §4.6 (tags, revalidate), §5.5, §6 Day 19 · **Depends** T27, T28, T43, T44 · **Size** L

**Goal.** Publishing makes a change live in seconds without a redeploy; drafts are visible only in a signed-in preview.

**Scope.**
- API `modules/publishing`: `publishing.service.ts` (`revalidate(tags)` → `POST ${WEB_INTERNAL_URL}/api/revalidate` with `x-revalidate-secret`; one retry; failures are logged and never block the write), `tags.util.ts` (entity → tags: `site`, `page:{key}`, `projects`, `project:{slug}`, `posts`, `post:{slug}`, `skills`, `domains`).
- Routes (admin only): `POST /admin/projects/:id/publish|unpublish`, `POST /admin/posts/:id/publish|unpublish`. Publish checks required English fields, `publishLint`, and alt text on used images → 400 with `fieldErrors`; sets `status` and `publishedAt` (first publish only); emits `content.published`.
- Every admin write that changes public data calls `revalidate` with its tags.
- Preview API: `GET /admin/preview/projects/:slug`, `GET /admin/preview/posts/:slug` (public DTO shape, any status, `@Roles('admin', 'user')`).
- Web: `app/api/revalidate/route.ts` (checks the secret, `revalidateTag` per tag), `app/api/draft/route.ts` (checks the access token via `/auth/me` with `withAuth`, either role; enables `draftMode()`, redirects to the page; `?exit=1` disables it). Services use the preview endpoints with the forwarded `access_token` cookie and no cache when draft mode is on; if it has expired, the draft banner links to `/admin/login?next=` the current page. A draft banner with an exit link.
- Editor publish button and status in the properties pane (projects, posts); preview link.
- `.env.example`: `REVALIDATE_SECRET`, `WEB_INTERNAL_URL`.
- Pages (D26) reuse this draft mode; their publish, versions and live preview are T52a.

**Files.** `apps/api/src/modules/publishing/*`, `apps/api/src/modules/{projects,posts}/{admin-*.controller.ts,*.service.ts}`, `apps/api/src/modules/*/` (revalidate calls), `apps/api/test/publishing.e2e-spec.ts`, `apps/web/app/api/{revalidate,draft}/route.ts`, `apps/web/src/modules/core/{services/api-server.service.ts,components/DraftBanner/*}`, `apps/web/src/modules/{projects,notes}/services/*.service.ts`, `apps/web/src/modules/admin-{projects,posts}/components/*`, `.env.example`.

**Design.** Spec §5.9 (publish in header), `StatusPill`.

**Backend steps, explained.**
1. **Publish is a state change with rules.** Drafts can be incomplete; publishing checks the rules once, in one place.
2. **Cache tags.** The web caches each public page with tags. The API knows what changed, so it tells the web "everything tagged `post:my-slug` is stale", and only those pages rebuild on the next visit.
3. **Shared secret.** The revalidate route is public on the web, so it requires a secret header known only to the API.
4. **Draft mode.** A signed-in `admin` or `user` gets a cookie that makes the web skip the cache and read the preview endpoints; everyone else still gets 404 for drafts.

**Acceptance.**
- [ ] On a production build (`pnpm build && pnpm start`), publishing shows the change on the public page in under 5s without a redeploy (roadmap p25).
- [ ] A draft is visible only in preview; the public URL still returns 404 (roadmap p25).
- [ ] Publishing a post containing `TODO` returns 400 with `fieldErrors` (spec §6 Day 10 v2).
- [ ] A wrong revalidate secret returns 401.

**PR title:** `feat: publish + on-demand revalidate`

#### T52a · Page publish, versions, live preview

**Roadmap** p25 · **Spec** §4.6 (tags, revalidate), §1.5 (status), D26 · **Depends** T45b, T52 · **Size** L

**Goal.** Visitors see a page's published version, never its draft. An `admin` publishes with one click, can restore any earlier version, and watches the draft live next to the builder before publishing.

**Scope.**
- Model `PageVersion`: `pageId`, `version` (1, 2, 3… per page), `snapshot Json` (`{ seo, blocks: [{ type, key, schemaVersion, props, layout, surface, isVisible, sortOrder }] }`), `note` `VarChar(200)?`, `createdById` → `User` (`onDelete: SetNull`), `createdAt`; `@@unique([pageId, version])`. `Page` gains `publishedVersionId` (unique, → `PageVersion`) and `publishedAt`. Migration `add-page-versions`. The seed publishes v1 of every page.
- Public read switches to snapshots: `GET /public/pages/:key` serves the published snapshot, each block still through `parseBlock`, so an old snapshot is migrated or its bad blocks are dropped, never a 500. A page that was never published returns `blocks: []` (the shell still renders) and content health flags it.
- Admin routes (admin only unless noted):
  - `POST /admin/pages/:key/publish` `{ note? }`. Checks first:
    - the T32a page rules;
    - strict `parseBlock` on every visible block (400 `INVALID_BLOCKS` with issues per block; hidden invalid blocks are left out of the snapshot);
    - `publishLint` on every text value, and English required fields.
    - Then, in one transaction, it writes version n+1 and sets `publishedVersionId` and `publishedAt`.
    - Afterwards it revalidates `page:{key}` through the T52 publishing service, emits `content.published`, and records an audit `PUBLISH` row once T55 lands.
  - `GET /admin/pages/:key/versions` (page-based list: version, date, author name, note, block count) and `GET /admin/pages/:key/versions/:version` (snapshot). Both are `@Roles('admin', 'user')`.
  - `POST /admin/pages/:key/versions/:version/restore`: replaces the draft rows with that snapshot in one transaction (`deleteMany` + `createMany`). It does not publish, so "roll back" means restore, then publish.
  - `POST /admin/pages/:key/discard`: restores the published version into the draft.
  - `GET /admin/preview/pages/:key?locale` (`@Roles('admin', 'user')`): the draft in the public DTO shape, with invalid blocks listed separately.
  - `GET /admin/pages` gains `publishedVersion` and `hasUnpublishedChanges` (`Page.updatedAt` later than `publishedAt`).
- Web public:
  - `blocks/services/pages.service.ts` reads the preview endpoint (forwarded `access_token`, no cache) when `draftMode()` is on.
  - In draft mode, `BlockRenderer` adds `data-block-id` to each block and shows `UnknownBlockNotice` (a dashed box with the type and its issues) where a visitor sees nothing.
- `core/components/PreviewBridge` (client, mounted by the site layout only in draft mode): it handles `message` events whose `origin` equals `location.origin`. `preview:refresh` calls `router.refresh()` and keeps the scroll position; `preview:focus { blockId }` scrolls to that block and outlines it.
- Builder (`admin-pages`):
  - `PagePreview`: an `iframe` of `/api/draft?path=/{locale}{route}` (the T52 draft route; `path` must be a public route).
    - It sits next to the list on `xl` and in a `sheet` below that.
    - A viewport toggle (390, 768, 1440: the iframe width, scaled to fit) checks the responsive rules, and an EN/VI toggle switches locale.
    - After each successful save the builder posts `preview:refresh`; selecting a block posts `preview:focus`.
  - `PublishBar`: an "Unpublished changes" badge, Publish (optional note) inside `RoleGate allow={['admin']}`, and Discard changes. A 400 `INVALID_BLOCKS` highlights the rows.
  - `VersionHistory` `sheet`: the versions list; open one in the preview as a read-only snapshot; Restore behind an `alert-dialog` (admin only).
- Content health (T38) gains four checks:
  - pages never published;
  - unpublished changes older than 7 days;
  - blocks that fail validation in a draft or in the published version;
  - block references to missing or unpublished items.
- The preview frames the public site from the same origin, so T59 sets `frame-ancestors 'self'` instead of `'none'`.
- e2e `test/page-versions.e2e-spec.ts`:
  - publishing shows the change on the public page, and a later draft edit leaves it unchanged;
  - publishing with an invalid visible block returns 400;
  - restoring v1 and publishing brings v1 back;
  - a `user` gets 403 on publish and restore, and 200 on versions and preview.

**Out of scope.** Scheduled publishing (Q4). Comparing two versions side by side.

**Files.** `apps/api/prisma/schema.prisma` + migration `add-page-versions`, `apps/api/prisma/seed/profiles/{demo,baseline}.seed.ts`, `apps/api/src/modules/pages/{admin-pages.controller.ts,pages.service.ts,page-versions.service.ts,page-versions.service.spec.ts,entities/*}`, `apps/api/src/modules/publishing/tags.util.ts`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/pages/*`, `packages/contracts/src/constants/query-keys.constant.ts`, `apps/api/test/page-versions.e2e-spec.ts`, `apps/api/api.http`, `apps/web/app/api/draft/route.ts`, `apps/web/app/[locale]/(site)/layout.tsx`, `apps/web/src/modules/blocks/{services/pages.service.ts,components/{BlockRenderer,UnknownBlockNotice}/*}`, `apps/web/src/modules/core/components/PreviewBridge/*`, `apps/web/src/modules/admin-pages/{components/{PagePreview,PublishBar,VersionHistory}/*,hooks/use-page-versions.hook.ts,services/admin-pages.service.ts}`, `apps/web/src/modules/admin-dashboard/components/ContentHealthCard/*`.

**Design.** Spec §5.9 (publish in the header), `StatusPill`. Tokens: `--warning` and `--warning-subtle` (unpublished badge), `--border`, `--muted` (preview frame background), `--shadow-2`, `--ring` (focused block outline).

**Backend steps, explained.**
1. **Draft and published copies.** The `PageBlock` rows are the draft you edit. Publishing copies them into one JSON snapshot (`PageVersion`) and points the page at it. Visitors only ever read snapshots, so a half-finished rearrangement never shows.
2. **Why a snapshot and not a status per block?** A page is published as a whole: order, layout and text belong together. One JSON copy per publish is easy to read, easy to restore, and small (a few KB).
3. **Version numbers.** `@@unique([pageId, version])`, with n+1 computed inside the transaction, means two publishes at the same moment cannot both create version 4. One fails and can retry.
4. **Restore keeps the history.** Restoring copies an old snapshot into the draft and never deletes a version. Publishing after it creates a new version, so the history only grows.
5. **Draft mode for pages.** The preview is the real public route, rendered by the same server components, but reading the draft through an admin endpoint with your cookie. What you see in it is exactly what visitors get after you publish.

**Acceptance.**
- [ ] On a production build, publishing a reordered home shows the new order in under 5s, and editing without publishing changes nothing for visitors (roadmap p25).
- [ ] The live preview updates about a second after each autosave, and at 390px it shows every block in one column.
- [ ] Restoring v1 and publishing brings the public page back to v1, and the history keeps every version.
- [ ] Publishing with an invalid visible block returns 400 and highlights it; an old snapshot whose block type was removed still renders its other blocks.
- [ ] A visitor without draft mode never receives draft blocks (`curl` the public page while a draft change exists).
- [ ] Signed in as `user`, preview and history work; Publish, Discard and Restore are hidden and refused by the API.

**PR title:** `feat: page publish + versions + live preview`

### M6 — Quality

#### T53 · SEO from the CMS

**Roadmap** p26 · **Spec** §5 intro (title pattern, canonical, hreflang, JSON-LD, sitemap, RSS), §4.2 (`OgImage`), §4.5 (SEO) · **Depends** T24, T25, T27, T28, T52a · **Size** M

**Goal.** Every public page gets metadata, structured data and an OG image from CMS fields, and search engines get a sitemap of published content only.

**Scope.**
- `seo/utils/*-metadata.util.ts`: builders for site, home, about, projects list, project, notes list, post, contact. Title `{seoTitle} · {siteName}`; description from `seoDescription` → `excerpt`/`tagline` → `SiteSettings`; the five block pages read `seoTitle`/`seoDescription` from the page's published version (D26), then the H1 block's title and intro, then `SiteSettings`; canonical; `alternates.languages` (en, vi, `x-default`); `metadataBase` from env.
- `seo/components/JsonLd`: `Person` (home, about), `CreativeWork` (case study), `BlogPosting` (post), `BreadcrumbList` (detail pages); JSON escaped for `<`.
- OG images: `opengraph-image.tsx` for home, project and post routes (`ImageResponse`, 1200×630, dark background, Be Vietnam Pro, `VersionTag`, name + domain).
- `app/sitemap.ts` (both locales, from a new `GET /public/sitemap` in `public-site`: published slugs + `updatedAt`), `app/robots.ts` (disallow `/admin`, `/api`), RSS `app/[locale]/(site)/rss.xml/route.ts`.

**Files.** `apps/web/src/modules/seo/{utils/*-metadata.util.ts,components/JsonLd/*,utils/rss.util.ts}`, `apps/web/app/{sitemap.ts,robots.ts}`, `apps/web/app/[locale]/(site)/{opengraph-image.tsx,projects/[slug]/opengraph-image.tsx,notes/[slug]/opengraph-image.tsx,rss.xml/route.ts}`, `apps/web/app/[locale]/(site)/**/page.tsx` (`generateMetadata`), `apps/api/src/modules/public-site/*`.

**Design.** Spec §4.2 `OgImage`. Tokens: dark `--background`, `--primary`, heading font.

**Acceptance.**
- [ ] Lighthouse SEO prints 100 on home, a post and a project (roadmap p26).
- [ ] The sitemap lists published slugs only (roadmap p26).
- [ ] An OG preview shows the title from the DB (spec §6 Day 20).

**PR title:** `feat(web): seo from cms`

#### T54 · Analytics + dashboard charts

**Roadmap** p27 · **Spec** §1.5 (`PageView`), §5.7, §6 Day 22 · **Depends** T38, T49 · **Size** M

**Goal.** Cookieless page-view counts shown as charts on the dashboard.

**Scope.**
- Model `PageView` (`path`, `locale`, `referrerHost`, `device`, `visitorHash`). Migration `add-page-views`.
- `modules/analytics`: `POST /public/views` (`@Public()`, throttled, accepts the `sendBeacon` body, skips bots and `analyticsEnabled = false`, `visitorHash` = SHA-256 of IP + user agent + daily salt from `ANALYTICS_SALT_SECRET`; sets no cookie).
- `GET /admin/stats` gains views per day (`GROUP BY DATE(createdAt)`), unique visitors, top pages, top referrers for the range.
- Web: `core/components/PageViewBeacon` (client, on route change, `navigator.sendBeacon('/api/public/views')`); `admin-insights/views/AdminInsightsAnalytics.tsx` (`chart` area chart with a hidden data table, period toggle); sparklines in dashboard `StatCard`s.

**Files.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/analytics/*`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/analytics/*`, `apps/web/src/modules/core/components/PageViewBeacon/*`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/analytics/page.tsx`, `packages/ui/src/components/ui/chart.tsx`, `packages/ui/src/components/Sparkline/*`, `.env.example`.

**Design.** Figma `14:2` (views card). Mockup `admin-dashboard.html`. Tokens: `--chart-1` … `--chart-5`.

**Backend steps, explained.**
1. **Cookieless counting.** A hash of IP + browser + today's salt counts unique visitors per day without storing who they are; tomorrow's salt makes yesterday's hashes unlinkable.
2. **Aggregation.** `GROUP BY DATE(createdAt)` turns rows into one count per day, done in SQL rather than in JavaScript.

**Acceptance.**
- [ ] Page views increase on visits; `GET /admin/stats` shows the new count (roadmap p27).
- [ ] No cookie is set by the beacon; the dashboard shows real views (spec §6 Day 22).

**PR title:** `feat: analytics`

#### T55 · Audit log

**Roadmap** p27 · **Spec** §1.5 (`AuditLog`), §4.3 (`ActivityFeed`), §4.6 (infinite + virtual), §6 Day 23 · **Depends** T36, T38 · **Size** M

**Goal.** Every admin write leaves one audit row, browsable in a virtualized list, plus bulk actions.

**Scope.**
- Model `AuditLog` (`userId`, `action` `CREATE|UPDATE|PUBLISH|ARCHIVE|RESTORE|LOGIN`, `entityType`, `entityId`, `summary`). Migration `add-audit-log`.
- `modules/audit`: `audit.service.ts` `record(…)`, called explicitly from services inside the same transaction as the write (including page publish and version restore, T52a), and from login. `GET /admin/audit` (cursor pagination, filters entity type and user; admin only).
- Bulk status update for projects and posts (`POST /admin/{entity}/bulk` with `{ ids, action }`, admin only) in one transaction, one audit row per item; wired to the `DataTable` bulk bar.
- Script `pnpm --filter @portfolio/api seed:audit` that inserts 5,000 audit rows (dev only).
- Web: `admin-insights/views/AdminInsightsAudit.tsx` (`useInfiniteQuery` + `useVirtualizer`, `AuditRow` with relative time and absolute tooltip); dashboard activity card (latest 8, inside `RoleGate allow={['admin']}`). `packages/ui` `ActivityFeed`, `AuditRow`.

**Files.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/audit/*`, `apps/api/src/modules/*/*.service.ts` (record calls), `apps/api/prisma/seed/audit.seed.ts`, `apps/api/test/audit.e2e-spec.ts`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/audit/page.tsx`, `apps/web/src/modules/admin-dashboard/components/ActivityCard/*`, `packages/ui/src/components/{ActivityFeed,AuditRow}/*`.

**Design.** Figma `14:2` (activity card). Mockup `admin-dashboard.html`.

**Backend steps, explained.**
1. **Append-only.** Audit rows are inserted, never updated or deleted by the app.
2. **Same transaction.** Writing the audit row inside the write's transaction means you never get a change without its record, or a record without its change.
3. **Cursor pagination.** "Give me 50 rows older than id 1234" stays fast and stable while new rows arrive, which page numbers do not.

**Acceptance.**
- [ ] Every CRUD action creates one audit row, visible in `/admin/audit` (roadmap p27).
- [ ] 5,000 seeded audit rows scroll smoothly (spec §6 Day 23).

**PR title:** `feat: audit log`

#### T56 · Tests + CI e2e

**Roadmap** p28 · **Spec** §6 (Day 21, Day 24) · **Depends** T52a · **Size** M

**Goal.** A test suite that proves the main flows end to end, running on every PR.

**Scope.**
- Fill API e2e gaps so every module has happy-path + validation tests.
- Playwright in `apps/web/e2e/`: public smoke (home in both locales, nav by keyboard, project and post pages, 404), contact submit, admin login → create draft project → publish → visible on the public page → archive, and `user` login (account created in the test setup through `POST /admin/users`) → a project editor opens read-only with no Publish button and no Inbox, Audit or Users items; admin page builder → drag the home `work` block above `featured`, hide `marquee`, publish → the public home shows the new order without the marquee → restore the previous version and publish → the old order is back. Runs on the `demo` seed. Runs against production builds of web and api with the test DB and the `demo` seed.
- CI: jobs `lint-typecheck-unit`, `api-e2e` (MySQL service), `web-e2e` (MySQL service, builds both apps, runs Playwright, uploads the report).

**Files.** `apps/web/e2e/{public.spec.ts,contact.spec.ts,admin-publish.spec.ts,admin-pages.spec.ts}`, `apps/web/playwright.config.ts`, `apps/api/test/*.e2e-spec.ts`, `.github/workflows/ci.yml`.

**Design.** None.

**Acceptance.**
- [ ] `pnpm test` is green locally and in CI (roadmap p28).
- [ ] The draft → publish → public page e2e is green (spec §6 Day 21), for a project and for a page.

**PR title:** `test: api + e2e smoke`

#### T57 · Accessibility + performance audit

**Roadmap** p29 · **Spec** §3, §3.4, §5, §6 (Days 14, 28, 29 + v2 rows) · **Depends** T53 · **Size** M

**Goal.** Measured accessibility and performance on every key screen, with the fixes merged.

**Scope.**
- axe (`@axe-core/playwright`) on home, about, projects, case study, notes, post, contact, admin login, dashboard and the page builder; fail CI on serious issues.
- Lighthouse (mobile) on home, projects, case study, post.
- Manual: keyboard, screen reader on 3 pages, the page builder's keyboard drag and drop (Space, arrows, Space) and its move up/down menu, reduced motion and reduced transparency on home, case study and post (every effect's fallback).
- Fixes: focus order, skip link, LCP image `priority`, font `display`, orbs on a composited layer, CLS 0 from count-up and reveal.
- Report in `docs/audits/<date>-a11y-perf.md` with before/after numbers.

**Files.** `apps/web/e2e/a11y.spec.ts`, `docs/audits/<date>-a11y-perf.md`, fixes in the affected `apps/web` and `packages/ui` files.

**Design.** All public screens (§5 design map).

**Acceptance.**
- [ ] axe reports 0 serious issues on the audited screens (roadmap p29).
- [ ] Lighthouse prints at least 95 for accessibility and performance on mobile for home (roadmap p29), with ambient effects on (spec §6 Day 14 v2).

**PR title:** `fix: a11y + perf audit`

### M7 — Ship

#### T58 · Production Compose

**Roadmap** p30 · **Spec** §1.6 (rung 11), §6 Day 21 · **Depends** T56 · **Size** M

**Goal.** The whole stack runs from one compose file with small, non-root images.

**Scope.**
- `apps/web/Dockerfile`: multi-stage, `output: 'standalone'`, `NEXT_PUBLIC_BUILD_SHA` build arg, non-root user.
- `apps/api/Dockerfile`: multi-stage, `prisma generate`, entrypoint runs `prisma migrate deploy` then starts the app, non-root user.
- `compose.prod.yml`: `db` (no published port, volume), `api` (healthcheck `/api/health`, uploads volume, depends on healthy db), `web` (`API_URL=http://api:4000`, depends on healthy api), `caddy` (HTTP on :80 locally; TLS in T61). `.dockerignore` files.
- One-off seed: `docker compose -f compose.prod.yml run --rm api node dist/seed.js` with `SEED_PROFILE=baseline` (documented in README).

**Files.** `apps/web/Dockerfile`, `apps/api/Dockerfile`, `apps/api/docker-entrypoint.sh`, `compose.prod.yml`, `infra/caddy/Caddyfile`, `.dockerignore`, `apps/web/next.config.ts`, `README.md`.

**Design.** None.

**Backend steps, explained.**
1. **Multi-stage builds.** One stage installs and builds; the final stage copies only what runs, so images stay small.
2. **`migrate deploy` vs `migrate dev`.** `deploy` only applies committed migrations, never creates new ones and never resets data. It is the only migrate command for production.
3. **Service names as hostnames.** Inside compose, the web reaches the API at `http://api:4000`; nothing but Caddy is exposed.

**Acceptance.**
- [ ] `docker compose -f compose.prod.yml up --build` serves the full site on localhost (roadmap p30).
- [ ] The web and api images are under 300 MB each (roadmap p30).

**PR title:** `chore(infra): production compose`

#### T59 · Hardening + backups

**Roadmap** p31 · **Spec** §1.6, §6 Day 24 · **Depends** T58 · **Size** M

**Goal.** Secure headers, safe cookies, least-privilege containers, and backups you have actually restored.

**Scope.**
- Security headers: CSP with a per-request nonce set in `middleware.ts` (Next.js pattern); HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'self'` in the Caddyfile (`'self'`, not `'none'`, because the page builder's live preview frames the public site from the same origin, T52a; no other site may frame it).
- Confirm `Secure` cookies in production; containers non-root with read-only root filesystems where possible; no CORS (D9).
- Production JWT secrets: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` generated with `openssl rand -base64 48`, different from dev and from each other, kept only in the VPS `.env` and GitHub secrets; boot fails if they are short or equal (T35). Document generation and rotation in `docs/runbooks/secrets.md`.
- `backup` service in `compose.prod.yml`: daily `mysqldump` + gzip and an uploads tarball, 7-day rotation on a `backups` volume.
- `scripts/backup/restore.sh` and `docs/runbooks/restore.md`; run a restore drill into a fresh database.

**Files.** `apps/web/middleware.ts`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `infra/backup/backup.sh`, `scripts/backup/restore.sh`, `docs/runbooks/{restore.md,secrets.md}`.

**Design.** None.

**Backend steps, explained.**
1. **`mysqldump`.** Writes the whole database as SQL statements; piping it through `gzip` keeps files small. Run it inside the `db` network so no port is exposed.
2. **Rotation.** Keep 7 daily files and delete older ones, so the disk never fills up.
3. **A backup only counts once restored.** The drill loads the latest dump into an empty database, starts the API against it and checks the site.
4. **Rotating JWT secrets.** Changing `JWT_ACCESS_SECRET` makes every access token invalid at once; changing `JWT_REFRESH_SECRET` signs everyone out. Rotate after a leak, and expect to log in again. There are no session rows to clean up (D24).

**Acceptance.**
- [ ] `scripts/backup/restore.sh` into a fresh DB brings the site back (roadmap p31).
- [ ] securityheaders.com gives grade A on the production origin, or on a local Caddy with the same headers (roadmap p31).

**PR title:** `chore: hardening + backups`

#### T60 · Production seed cleanup + placeholder check

**Roadmap** p32 · **Spec** §1.1–§1.5, §2 · **Depends** T45, T51, T52a · **Size** S (agent part) · **Owner part:** Parker enters the content

**Goal.** Production starts from the `baseline` seed, and a check proves no placeholder reaches the live site.

**Scope.**
- Agent: `scripts/check-placeholders.mjs` (connects with `DATABASE_URL`, counts rows whose text fields contain placeholder markers used by the seed (`<email>`, `<phone>`, `Sample`, `Lorem`, `TODO`), including the text inside `PageBlock.props` and published `PageVersion` snapshots, and fails if any are published or in singletons); root script `check:placeholders`; review `baseline.seed.ts` against spec §1.5 (drafts only, 0 posts, no demo messages or views); `docs/runbooks/content-entry.md` (checklist: profile, experience, projects, posts, Vietnamese translations, metrics, alt texts, real contact email entered in `/admin`).
- Parker: enter real content in `/admin`; publish at least two case studies and one post.

**Files.** `scripts/check-placeholders.mjs`, `package.json`, `apps/api/prisma/seed/profiles/baseline.seed.ts`, `docs/runbooks/content-entry.md`.

**Design.** None.

**Acceptance.**
- [ ] The production DB returns 0 placeholder rows (roadmap p32).
- [ ] The web app contains no CV strings: `pnpm check:content` passes (roadmap p32).

**PR title:** `chore: production seed cleanup`

#### T61 · Deploy pipeline + launch checklist

**Roadmap** p33 · **Spec** §5, §1.6 · **Depends** T58, T59, T60 · **Size** M · **Owner part:** Vercel/Render/TiDB/Cloudinary accounts, DNS, secrets, uptime monitor

**Parker override (D28).** Do not implement the VPS / GHCR / Caddy-TLS path below. Ship `render.yaml` (free Docker web, `prisma migrate deploy` then start, `PORT`, health `/api/health`), TiDB TLS via `DATABASE_URL?sslaccept=strict`, production CORS + `SameSite=None; Secure`, a FE warm-up ping to `/api/health`, and `docs/DEPLOY.md` (+ vi). Local Docker MySQL stays. See D28.

**Goal.** A push to `main` deploys to the VPS over HTTPS, and a checklist confirms launch readiness.

**Scope.**
- `.github/workflows/deploy.yml`: after CI on `main`, build and push web/api images to GHCR (tags: commit SHA and `latest`), SSH to the VPS, `docker compose -f compose.prod.yml pull && up -d`, then smoke-check `https://<domain>/api/health`.
- Caddy automatic HTTPS for the domain from env (`SITE_DOMAIN`).
- `docs/runbooks/deploy.md` (first-time VPS setup, secrets list, rollback by image tag).
- `docs/launch-checklist.md`: DNS, TLS, backups and restore drill, Lighthouse and axe, `check:content`, `check:placeholders`, OG previews, sitemap submitted, analytics on, admin password rotated, production `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` generated fresh (not the dev values), 404/500 pages, every page published with no invalid blocks in content health, uptime ping configured.

**Files.** `.github/workflows/deploy.yml`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `docs/runbooks/deploy.md`, `docs/launch-checklist.md`.

**Design.** None.

**Backend steps, explained.**
1. **Registry.** CI builds the images once and pushes them to GHCR; the VPS only pulls, so it never needs the source code or build tools.
2. **Secrets.** SSH key, host and `.env` values live in GitHub Actions secrets and on the VPS, never in git.
3. **Rolling forward.** `up -d` replaces containers with the new image; the API entrypoint applies new migrations first. Rolling back means deploying the previous image tag.
4. **HTTPS.** Caddy requests and renews the TLS certificate for the domain automatically once DNS points at the VPS.

**Acceptance.**
- [ ] The custom domain serves HTTPS (`curl -I` shows 200) (roadmap p33).
- [ ] The deploy runs from a push to `main`, and an uptime ping is configured (roadmap p33).

**PR title:** `chore: deploy pipeline`

## 8. Owner tasks and out of scope

**Parker does these himself** (an agent may prepare drafts or checklists):

- T03 SQL notes: the learning value is in typing the SQL.
- Real content entry (T60 step 2): profile, experience, case studies, posts, Vietnamese translations, real metrics. Written in `/admin`, never committed.
- Accounts and secrets: domain, VPS, DNS, GitHub Actions secrets, uptime monitor.
- Answers to the open questions in §9.

**Out of scope for this plan:** comments, newsletter, full-text search engine (MySQL `LIKE` with an index is enough at this scale), more than two languages, cloud object storage (the `MediaService` interface keeps this possible later), multi-tenant admin, a mobile app, free-form page layout (dragging fields or blocks into arbitrary grid cells, Q13), custom pages at new URLs (Q12).

## 9. Open questions

Each has a default the plan already uses, so no task is blocked.

| # | Question | Default in this plan |
| --- | --- | --- |
| Q1 | Spec §1.4 gaps: legal name with diacritics, exact employment dates (CMC Global / Kobizo overlap), real metrics per case study, job title ("Senior Frontend Engineer" or "Frontend Engineer (5 yrs)") | Placeholders from the wireframes; Parker enters real values in T60 |
| Q2 | Domain name and VPS provider | `parker.dev` appears as a placeholder only; T61 reads the domain from env |
| Q3 | Drag-and-drop reordering in the admin tables (`@dnd-kit/sortable`) or move up/down buttons only | The page builder uses dnd-kit (D26, T45b). Tables keep move up/down (spec §5.10 lists `button (move up/down)`); they can reuse `SortableList` later on the same reorder endpoints |
| Q4 | The admin table mockup shows a "Scheduled" post status, but the data model has only `DRAFT/PUBLISHED/ARCHIVED` | Not implemented. A future `publishedAt` in the future could mean "scheduled" if Parker wants it |
| Q5 | Accept-Language: spec says `vi` is "auto-suggested, never forced". What does the suggestion look like? | A dismissible one-line banner on `/en/*` for `vi` browsers, dismissal stored in a cookie (T14) |
| Q6 | LinkedIn URL | `SocialLink` row with `url = "https://www.linkedin.com/in/<handle>"` placeholder |
| Q7 | Overturn D3 (markdown instead of JSON blocks), D6 (page-based lists) or D8 (Origin check instead of CSRF tokens)? | Keep the spec's choices |
| Q8 | The `MigrationDiagram` mockup labels nodes `v1 · Vue 2` / `v2 · Nuxt 3`, and case-study decision cards show `OPTIONS · CHOICE · WHY · COST`. The data model has no dedicated fields for these. | Diagram nodes show `versionFrom`/`versionTo` as entered, with skill names as the component nodes (T22). Decisions are split at `###` headings into cards whose body is markdown, so the author writes those labels in the text (T23, T27) |
| Q9 | What exactly may a `user` do? (D7) | Read-only reviewer: dashboard, content and media read, analytics, draft preview, own password. No writes, publishing, uploads, inbox, audit log or users. Widening it later is one `@Roles('admin', 'user')` per route plus the matching `RoleGate` |
| Q10 | Revoke one stolen refresh token without signing that user out everywhere? (D24) | No. That needs a stored token table (the sessions Parker dropped). `tokenVersion` signs the user out on every device, which is enough for a handful of accounts |
| Q11 | Should the editor allow more Markdown than the shared allowlist (D25, T23), for example H4, task lists, footnotes, underline or embeds? | No. Adding one later means one entry in `markdown.constant.ts`, the matching Tiptap extension and a renderer component, in the same PR |
| Q12 | Custom pages at new URLs (for example `/uses`) built from blocks? (D26) | No: blocks arrange the five route pages only. Adding it means `Page.slug`, a catch-all route, a nav and sitemap entry, and a "New page" action in the builder |
| Q13 | Free-form layout: drag fields or blocks into any grid cell, or put two blocks side by side? (D26) | No: one block per row, with layout presets. A later extension can add a `columns` container block or a `colSpan` per block on the same 12-column grid, stored in the same JSON |
