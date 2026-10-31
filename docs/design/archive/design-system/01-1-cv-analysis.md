<!-- Archived verbatim from docs/design/portfolio-design-system.md (1. CV analysis); links re-pointed. Index: ../../portfolio-design-system.md -->

<h2 id="s-1">1. CV analysis</h2>

> **In this chapter:** numbered sections below.

| § | Section |
| --- | --- |
| 1.1 | Positioning |
| 1.2 | The story the portfolio tells |
| 1.3 | Case studies to feature (in order) |
| 1.4 | Gaps to fill (ask Parker, or mark as TODO in the CMS) |
| 1.5 | Content model (DB/CMS) |
| 1.6 | Backend path for a backend beginner (one way to do each thing) |

<h3 id="s-1-1">1.1 Positioning</h3>

**Headline (en):** Senior Frontend Engineer. 5 years shipping data-dense product UIs in Vue, Nuxt and TypeScript, now building with Next.js.
**Headline (vi):** Senior Frontend Engineer. 5 năm xây dựng giao diện sản phẩm nhiều dữ liệu với Vue, Nuxt và TypeScript, hiện phát triển với Next.js.

**Sub-line:** Fintech (Web3/ReFi) · enterprise (Samsung SDS) · e-commerce tooling. Hanoi, works with Korean, US and UK teams.

Display name: **Parker Vu** with the legal name *Vu Van Hung* (`Vũ Văn H…ng`: confirm the diacritics with Parker before seeding) on About and in JSON-LD. GitHub: `parker2808`.

<h3 id="s-1-2">1.2 The story the portfolio tells</h3>

Every role on the CV is a **migration**: moving carts between Shopify/BigCommerce/WooCommerce/Magento (LitGroup), moving MSP App logic into the new MSP Advanced (Samsung SDS), leading Particula from v1 (Vue 2) to v2 (Nuxt 3, Vue 3, PrimeVue, TanStack Query). The thread is:

> "I move products forward without breaking them."

Three acts:
1. **Backend roots** (2021): APIs and data integrity for migrations across 4+ e-commerce platforms; talking to US/UK customers when data broke.
2. **Enterprise frontend** (2022–2024): Samsung SDS platforms with a Korean team, 5–15 people, reliability through tests and bug triage.
3. **Ownership** (2024–now): main frontend developer at Particula, led the v1→v2 rewrite, built core components, introduced Playwright specs.

The portfolio itself is act 4 and the answer to the CV's weakest line ("React/Next JS (a bit)", "Backend (basic)"): a production Next.js + NestJS app with a CMS, built in public.

<h3 id="s-1-3">1.3 Case studies to feature (in order)</h3>

| # | Case study | Why it leads | Angle |
| --- | --- | --- | --- |
| 1 | **Particula v2: Vue 2 → Nuxt 3 migration** (Kobizo, 2024–now) | Most senior signal: ownership, a migration strategy, a stack decision (Axios → TanStack Query), testing | Strangler vs big-bang decision, component library on PrimeVue, server-state cache, Playwright specs. Domain: RWA ratings across 20+ asset classes |
| 2 | **Cart migration tool** (LitGroup, 2021–2022) | Full-stack range: Flask/Laravel APIs, then the Vue 2 + TS + Pinia frontend for the same product | Large-dataset state, progress/error UX for long jobs, customer-facing error resolution |
| 3 | **Samsung SDS MSP Advanced + App Expansion** (CMC Global, 2022–2024) | Enterprise scale and cross-cultural delivery (Korean team, 15-person team) | Re-platforming logic into a new design, Jira-driven issue management UI, unit tests. **NDA-safe:** no screenshots, use redrawn diagrams |
| 4 | **This portfolio** (2026) | Proof of React/Next.js, NestJS, MySQL, auth, realtime | Architecture, rendering choices per route, CMS design, a11y/perf budgets met |

<h3 id="s-1-4">1.4 Gaps to fill (ask Parker, or mark as TODO in the CMS)</h3>

1. **No metrics anywhere.** Collect at least one number per case study: pages/routes migrated, components in the v2 library, LCP or bundle size before/after, number of Playwright specs and CI time, bug count trend, records or stores migrated per month, migration success rate, support tickets resolved.
2. **Years and title are out of date.** "4+" → "5 years"; Objective → a one-line positioning statement (1.1). Use "Senior Frontend Engineer" only if Parker is comfortable; otherwise "Frontend Engineer (5 yrs)".
3. **Date overlap.** CMC Global ends June 2024, Kobizo starts February 2024, and Particula says "main frontend since July 2024". Confirm the real dates; the timeline shows months, so overlaps are visible.
4. **Typos and naming.** "Particular" vs "Particula"; "we also using", "specifictly", "sometime". Explain internal names ("Lego framework" = Samsung internal UI framework; "MSP").
5. **Flat skills list.** Replace with grouped skills by depth: *Daily* (Vue 3, Nuxt 3, TypeScript, Pinia, TanStack Query, Tailwind, PrimeVue, Playwright), *Shipped before* (Vue 2/Vuex, Vitest, REST/GraphQL/OAuth, Flask, Laravel, MySQL), *Growing* (React, Next.js, NestJS). Drop GPA and "Version control" boilerplate.
6. **Missing evidence of seniority:** mentoring, code review, design decisions, RFCs. Ask for 2 concrete stories (these also feed lab Days 25–27).
7. **No links.** Live product URLs (Particula public site), GitHub repos, and later the blog. Add `<email>` and LinkedIn as placeholders.
8. **Responsibilities, not outcomes.** Rewrite bullets as *verb + what + result* ("Led the Vue 2 → Nuxt 3 rewrite of Particula's investor app; shipped N core components; replaced Axios with TanStack Query, cutting duplicate requests by X%").

<h3 id="s-1-5">1.5 Content model (DB/CMS)</h3>

**Rule: if a visitor can read it and it is about Parker or the site, it is a row in the database and editable in the admin.** Only these stay in code: design tokens, UI chrome strings (button and form labels, validation and generic empty/error messages, aria labels, "min read", date and number formats) in `apps/web/messages/{en,vi}.json`, and the list of routes. Section 4.5 explains how the UI enforces this.

**Conventions (simple on purpose).** One table per thing on the page; no clever patterns.

| Convention | What it means | Why (beginner view) |
| --- | --- | --- |
| `id Int @id @default(autoincrement())` | Every row gets 1, 2, 3… | Easy to read in a DB GUI and in URLs like `/admin/projects/3` |
| `createdAt`, `updatedAt` on every table | Prisma fills them in | Free history for sorting and "Updated 2d ago" |
| Two columns per translated text: `titleEn`, `titleVi` | English is required to publish, Vietnamese is optional | Only 2 languages, so no extra translation tables or joins. You see both values side by side in Adminer. A 3rd language would need one migration, which is fine |
| `sortOrder Int`, `isVisible Boolean` | Admin can reorder and hide rows | One pattern for every list (nav, skills, sections, projects) |
| `status` enum `DRAFT \| PUBLISHED \| ARCHIVED` + `publishedAt` | Only on projects and posts | Public API returns `PUBLISHED` only; "delete" in the UI means archive, so nothing is lost |
| Foreign key `projectId Int` + `@relation` | One project has many metrics (1-to-many) | The DB refuses metrics that point at a missing project |
| `skills Skill[]` on both sides | Many-to-many; Prisma creates the hidden join table | No join table to write by hand |
| `slug String @unique` | URL name like `particula-v2` | The DB guarantees two projects cannot share a URL |
| Long text as `@db.Text` | Markdown is stored as plain text | Rendered to HTML on the Next server, never stored as HTML |
| Singletons (`SiteSettings`, `Profile`) are a table with exactly one row, `id = 1` | Created by the seed | Same tools as every other table; no special config files |

Field shorthand below: `title{En,Vi}` means two columns `titleEn` and `titleVi`. `?` = optional. Every table also has `id`, `createdAt`, `updatedAt`.

| Group | Entity | Fields | Notes |
| --- | --- | --- | --- |
| Site | `SiteSettings` (1 row) | `siteName`, `domain`, `defaultLocale`, `seoTitle{En,Vi}`, `seoDescription{En,Vi}`, `ogImageId?`, `footerNote{En,Vi}`, `contactIntro{En,Vi}`, `replyTimeNote{En,Vi}`, `contactEmail` (`<email>`), `availability` (`OPEN \| NOT_LOOKING \| FREELANCE`), `availabilityNote{En,Vi}`, `analyticsEnabled` | Default SEO for any page without its own |
| Site | `NavItem` | `location` (`HEADER \| FOOTER`), `label{En,Vi}`, `href` (internal route like `/projects`, or a full URL), `sortOrder`, `isVisible` | Admin picks `href` from the list of real routes, or types a URL |
| Site | `SocialLink` | `kind` (`GITHUB \| LINKEDIN \| EMAIL \| RSS \| OTHER`), `label{En,Vi}`, `url`, `showInHeader`, `sortOrder`, `isVisible` | GitHub `parker2808`; email is `mailto:<email>` |
| Site | `PageSection` | `page` (`HOME \| ABOUT \| PROJECTS \| NOTES \| CONTACT`), `key` (e.g. `hero`, `featured`, `work`, `skills`, `notes`, `cta`), `title{En,Vi}?`, `intro{En,Vi}?`, `ctaLabel{En,Vi}?`, `sortOrder`, `isVisible`; unique on (`page`, `key`) | Seeded. Admin can reorder, hide and retitle sections; each `key` maps to one component in code, so admins cannot invent new section types |
| About | `Profile` (1 row) | `displayName`, `legalName`, `city`, `country`, `timezone`, `careerStartDate`, `headline{En,Vi}`, `subheadline{En,Vi}`, `bio{En,Vi}` (md), `languages{En,Vi}`, `avatarId?`, `resumeEnId?`, `resumeViId?`, `phone?` (`<phone>`, private) | "Years of experience" is computed from `careerStartDate`, so it never goes stale like the CV's "4+". The public API never returns `phone` |
| About | `Experience` | `company`, `companyUrl?`, `location`, `employmentType` (`FULL_TIME \| CONTRACT \| FREELANCE`), `role{En,Vi}`, `summary{En,Vi}`, `highlights{En,Vi}` (md bullet list), `startDate`, `endDate?` (empty = now), `sortOrder`, `isVisible`, `skills Skill[]` | LitGroup is 2 rows (Backend 2021, Frontend 2022); the timeline groups rows by `company` |
| About | `Education` | `school`, `degree{En,Vi}`, `major{En,Vi}`, `startDate`, `endDate`, `isVisible` | No GPA column |
| About | `Principle` | `title{En,Vi}`, `body{En,Vi}`, `sortOrder`, `isVisible` | "How I work" cards |
| About | `SkillCategory` | `name{En,Vi}`, `sortOrder` | Frontend, Testing, Backend, Data, Workflow |
| About | `Skill` | `name`, `slug @unique`, `categoryId`, `depth` (`DAILY \| SHIPPED \| GROWING`), `sortOrder`, `isVisible` | Linked to projects and experiences |
| Work | `Project` | `slug @unique`, `title{En,Vi}`, `tagline{En,Vi}`, `client`, `role{En,Vi}`, `teamSize?`, `startDate`, `endDate?`, `versionFrom?`, `versionTo?` (e.g. `v1`, `v2` for the version tag), `isFeatured`, `isConfidential`, `liveUrl?`, `repoUrl?`, `coverId?`, `problem{En,Vi}`, `constraints{En,Vi}`, `approach{En,Vi}`, `decisions{En,Vi}`, `outcome{En,Vi}`, `lessons{En,Vi}` (all md), `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`, `status`, `publishedAt?`, `sortOrder`, `experienceId?`, `skills Skill[]` | One column per case-study section keeps the editor a simple form |
| Work | `ProjectMetric` | `projectId`, `label{En,Vi}`, `before?`, `after?`, `value`, `sortOrder` | Drives the before → after stat |
| Work | `ProjectImage` | `projectId`, `mediaId`, `caption{En,Vi}?`, `sortOrder` | Hidden when `isConfidential` |
| Writing | `Post` | `slug @unique`, `title{En,Vi}`, `excerpt{En,Vi}`, `body{En,Vi}` (md), `seoTitle{En,Vi}?`, `seoDescription{En,Vi}?`, `coverId?`, `readingMinutes` (computed on save), `isFeatured`, `status`, `publishedAt?`, `tags Tag[]` | A post without `bodyVi` is listed on `/vi` with an "EN" badge |
| Writing | `Tag` | `slug @unique`, `name{En,Vi}` | |
| System | `Media` | `fileName` (stored name), `originalName`, `mimeType`, `sizeBytes`, `width?`, `height?`, `alt{En,Vi}`, `uploadedById` | Files on disk, metadata in DB. Alt text is required before anything using the image can publish |
| System | `ContactTopic` | `label{En,Vi}`, `sortOrder`, `isVisible` | Options of the contact form's Topic select |
| System | `ContactMessage` | `name`, `email`, `topicId?`, `message` (Text), `locale`, `status` (`NEW \| READ \| REPLIED \| SPAM`), `ipHash` | Never public |
| System | `User` | `email @unique`, `name`, `passwordHash`, `role` (`OWNER \| EDITOR \| VIEWER`), `isActive`, `lastLoginAt?` | Seed creates the owner from env vars |
| System | `Session` | `tokenHash @unique`, `userId`, `expiresAt`, `userAgent?` | One row per logged-in browser; logout deletes the row |
| System | `AuditLog` | `userId`, `action` (`CREATE \| UPDATE \| PUBLISH \| ARCHIVE \| LOGIN`), `entityType`, `entityId`, `summary` | Append-only, written by the API |
| System | `PageView` | `path`, `locale`, `referrerHost?`, `device`, `visitorHash` | Cookieless; hash uses a salt that changes daily |

**v2 additions (rich layer).** Everything the new sections show is still a row; nothing decorative carries content. New tables follow the same conventions (`sortOrder`, `isVisible`, `En`/`Vi` pairs).

| Group | Entity / field | Fields | Notes |
| --- | --- | --- | --- |
| About | `ProfileStat` (new) | `label{En,Vi}`, `value String?`, `suffix?` (e.g. `+`, `%`), `source` (`MANUAL \| YEARS_COMPUTED \| PROJECT_COUNT`), `iconKey`, `sortOrder`, `isVisible` | Home stats band. `YEARS_COMPUTED` reads `Profile.careerStartDate`, `PROJECT_COUNT` counts published projects, so the numbers never go stale. Seed: years, 4 shipped products, 2 framework migrations, 1 enterprise (Samsung SDS) |
| Work | `Domain` (new) | `slug @unique`, `name{En,Vi}`, `description{En,Vi}`, `hue` (`JADE \| AMBER \| BLUE \| VIOLET \| ROSE`), `iconKey`, `sortOrder`, `isVisible` | Home "Domains" cards, projects-list filter pills, case-study pill. Seed: Fintech / Web3 ReFi (amber), Enterprise platforms (blue), E-commerce tooling (violet), Developer experience & testing (jade) |
| Work | `Project.domainId?` (new FK) | `Domain 1──* Project` | One domain per project keeps filtering simple |
| Work | `Project.keyFacts{En,Vi}` | Text, one fact per line, 2–4 lines | Case-study `KeyFacts` 2×2 grid |
| Work | `Project.factChips{En,Vi}` | Text, comma-separated, ≤ 6 | Case-study `FactChips` (e.g. "Vue 2 → Nuxt 3, 0 downtime, 6 months") |
| About | `ProcessStep` (new) | `title{En,Vi}`, `caption{En,Vi}`, `iconKey`, `sortOrder`, `isVisible` | Home "How I migrate a frontend" flow. Seed (5): Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over |
| About | `Profile.heroKicker{En,Vi}?`, `Profile.headlineAccent{En,Vi}?` | Short strings | Kicker pill above the H1; the accent must be a substring of `headline` (validated on save) |
| About | `Principle.iconKey?` | | Icon tile on principle cards |
| About | `Skill.showInMarquee` | Boolean, default `false` | Tech marquee on home |
| Writing | `Post.takeaways{En,Vi}?` | Text, one per line, ≤ 5 | "Key takeaways" card at the end of a post |
| Site | `SocialLink.showInCta` | Boolean | Outline buttons in the CTA band (max 2) |
| Site | `SiteSettings.ambientEffects`, `SiteSettings.marqueeEnabled` | Boolean, default `true` | Kill switches for the grid/orbs/glow and the marquee animation (the marquee then renders as a static row) |
| Site | `PageSection.key` (new values) | `stats`, `marquee`, `domains`, `process`, `principles` | Seeded with titles; still one component per key |
| Site | `iconKey` (all of the above) | String from a fixed allowlist of ~40 lucide names in `packages/contracts/icons.ts` | zod rejects unknown keys; the admin shows an icon picker. No uploaded SVGs, so icons always match the theme |

Relationships at a glance:

```
SiteSettings(1)   Profile(1)   NavItem*   SocialLink*   PageSection*   Principle*   Education*
ProfileStat*   ProcessStep*   (v2)
SkillCategory 1──* Skill *──* Project 1──* ProjectMetric
                   Domain 1──* Project   (v2)
                         *──* Experience 1──* Project (optional link)
                                          Project 1──* ProjectImage *──1 Media
Post *──* Tag          ContactTopic 1──* ContactMessage
User 1──* Session      User 1──* AuditLog      User 1──* Media (uploadedBy)
```

Example of the conventions in `apps/api/prisma/schema.prisma`:

```prisma
model Project {
  id            Int             @id @default(autoincrement())
  slug          String          @unique
  titleEn       String
  titleVi       String?
  taglineEn     String
  taglineVi     String?
  problemEn     String          @db.Text
  problemVi     String?         @db.Text
  status        ContentStatus   @default(DRAFT)
  publishedAt   DateTime?
  sortOrder     Int             @default(0)
  metrics       ProjectMetric[]
  skills        Skill[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  @@index([status, sortOrder])
  @@map("project")
}
```

**Two API shapes.** Public endpoints (`GET /public/...?locale=vi`) pick the language on the server and return flat fields (`title`, not `titleEn`/`titleVi`), falling back to English with `lang: "en"` on the field group so the UI can set `lang` on that element. Admin endpoints return both columns for editing. Components therefore never contain locale logic.

Seed (`prisma/seed.ts`) loads the CV content: site settings, profile (placeholders for `<email>` / `<phone>`), nav, social links, page sections, 4 experience rows, education, ~25 skills in 5 categories, 4 projects in `DRAFT`, 3 principles, contact topics, the owner user. 0 posts. v2 adds 4 domains (each project linked), 4 profile stats, 5 process steps, `showInMarquee` on ~10 skills, `keyFacts`/`factChips` drafted for Particula, and the new `PageSection` keys.

<h3 id="s-1-6">1.6 Backend path for a backend beginner (one way to do each thing)</h3>

How the pieces talk:

```
Browser ──► Next.js (apps/web, :3000) ──/api/* rewrite──► NestJS (apps/api, :4000) ──Prisma──► MySQL (:3306, Docker)
            Server Components fetch                       controllers → services             data on a Docker volume
```

In development only MySQL and Adminer (a web UI to look inside the DB) run in Docker; Next and Nest run with `pnpm dev` so restarts and debugging stay fast. On Day 21 all three run in Compose, the same way they will in production.

| Choice | Pick | Why this one | Not chosen, and why |
| --- | --- | --- | --- |
| ORM | **Prisma** | One readable `schema.prisma` file is the source of truth; `prisma migrate dev` writes the SQL for you and you can read it; generated client autocompletes every query; Prisma Studio shows data; NestJS docs have an official Prisma recipe | TypeORM: decorator classes and the `synchronize: true` shortcut can silently change tables. Drizzle: excellent, but assumes you are already comfortable with SQL |
| Validation | **zod** schemas in `packages/contracts`, used by Next forms and by a small Nest `ZodValidationPipe` | One schema validates the contact form in the browser and again in the API | `class-validator` DTOs: Nest-only, so rules would be written twice |
| Auth | **Email + password, server-side sessions in MySQL**, password hashed with `argon2`, session id in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. `AuthGuard` loads the session; `@Roles('OWNER')` + `RolesGuard` checks `user.role` | Easiest model to reason about: logged in = a `Session` row exists; logout or "sign out everywhere" = delete rows. Next rewrites `/api/*` to Nest, so the browser sees one origin: no CORS setup and the cookie is first-party | JWT access + refresh tokens: refresh rotation and revocation are extra concepts with no benefit for 1–3 admin users. Auth.js/NextAuth: puts auth in Next while data rules live in Nest. Hosted auth (Clerk, Auth0): skips the learning goal |
| CSRF | `SameSite=Lax` cookie + API rejects mutating requests whose `Origin` is not the site | Two lines of middleware, no tokens to manage | Double-submit CSRF tokens: not needed with same-origin + Lax |
| Realtime | **Server-Sent Events** (`@Sse()` in Nest), proxied through Next | One-way server → browser is all notifications need; plain HTTP, cookie auth works automatically, browser reconnects by itself | WebSockets/Socket.IO: two-way protocol, separate auth handshake |
| Uploads | Nest `FileInterceptor` (multer) → files on a Docker volume `uploads/`, a `Media` row per file, served by Nest | No cloud account needed; swap to S3-compatible storage later behind the same `MediaService` | Direct-to-S3 presigned uploads: more moving parts on day one |
| Rate limit | `@nestjs/throttler` on login and contact | Built for Nest, one decorator | n/a |

Backend glossary (used in the lab days):

| Term | Plain meaning |
| --- | --- |
| Image / container | An image is a packaged program (MySQL 8); a container is a running copy of it |
| Volume | A folder Docker keeps outside the container, so data survives `docker compose down` |
| Port mapping `3306:3306` | Your laptop's port → the container's port |
| Environment variable | Config outside the code (`DATABASE_URL`, passwords); lives in `.env`, never committed |
| Migration | A versioned SQL file that changes the tables; run in order, committed to git |
| Seed | A script that fills the DB with starting data |
| Primary key / foreign key | The row's id / a column that points at another table's id |
| Index | A lookup structure that makes `WHERE` and `ORDER BY` on that column fast |
| Transaction | Several writes that succeed or fail together |
| Module / controller / service (Nest) | A feature folder / the class that maps URLs to methods / the class with the actual logic and DB calls |
| Pipe / guard (Nest) | Runs before the controller: a pipe validates or transforms input, a guard says yes/no (logged in? right role?) |
| Session / cookie | A server-side "this browser is logged in as X" row / the small value the browser sends back on every request |

The backend ladder (each rung needs only the ones below it; day numbers in section 6):

1. Docker: run MySQL + Adminer, understand volumes, ports, `.env`.
2. SQL by hand: create one table, insert, select, join, then throw it away.
3. Nest basics: one module, controller and service, `GET /health`.
4. Prisma: first models, a migration, a seed; read the generated SQL.
5. Read API: Nest + Prisma, public `GET` endpoints, error handling, validation.
6. Relations: 1-to-many and many-to-many, `include` vs `select`.
7. Write API: create, update, archive, reorder in a transaction; unique-constraint errors → `409`.
8. Performance basics: indexes, `EXPLAIN`, avoiding N+1 queries.
9. Auth: users, password hashing, sessions, guards, roles.
10. Features: contact + rate limit, uploads, publish → revalidate, SSE, audit log, analytics.
11. Ops: everything in Compose, health checks, `prisma migrate deploy`, backups with `mysqldump`.

---

