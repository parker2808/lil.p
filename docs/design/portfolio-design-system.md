# Portfolio design system and UI spec (Parker)

Design and planning only. This doc feeds the LAB tab of the 30-day plan (`plans/study-plan-30d-redesign.md`): the lab becomes one continuous project, Parker's full-stack portfolio.

- Stack: Next.js App Router + TypeScript (`apps/web`) with **shadcn/ui** (Radix + Tailwind v4) and **TanStack** Query, Table, Form and Virtual; NestJS (`apps/api`); MySQL 8 in Docker Compose; **Prisma** as the one ORM; server-side sessions for auth; shared zod schemas, types and query keys in `packages/contracts`; components in `packages/ui`.
- Principles: typography first (3.2); no hard-coded content, everything visible comes from the API/CMS (1.5, 4.5); backend decisions are explained for a backend beginner and built bottom-up (1.6, 6).
- v2 revision: after reviewing the v1 mockups ("too bare"), the visual layer was enriched using [longpham.tech](https://www.longpham.tech/) as a reference: analysis in 2.1–2.2, new tokens in 3.1–3.1b, motion in 3.4, components in 4.7, wireframes in 5.1–5.6, admin additions in 5.11, rebuild brief in 7.
- Source: Parker's CV (dated, says "4+ years"; he now has ~5 years with Vue/Nuxt/TypeScript).
- Privacy: contact details are `<email>` / `<phone>` everywhere, including seeds and fixtures. The CV file itself is not committed.
- **§ refs:** Headings are `<h2 id="s-N">N. Title</h2>` (chapter) and `<h3 id="s-N-M">N.M Title</h3>` (section; a letter suffix is allowed, e.g. `3.1b`). `§1.5` maps to the heading whose text starts with `1.5 `, and to the explicit HTML id `s-1-5` (`s-` + digits/letters with `.` → `-`). Prefer `#s-1-5` over GitHub auto-slugs, which drop the dots (`15-content-model-dbcms`).

---

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

<h2 id="s-2">2. Design direction</h2>

> **In this chapter:** Concept (v2): "Readable release notes, with atmosphere." A typography-first, Linear-calm interface where each project reads like a well-edited changelog entry: version tags, before → after diffs and mono metadata.

| § | Section |
| --- | --- |
| 2.1 | Reference analysis: longpham.tech (captured 1440 and 390, Oct 2026) |
| 2.2 | What we adopt, adapt or skip for Parker |

**Concept (v2): "Readable release notes, with atmosphere."** A typography-first, Linear-calm interface where each project reads like a well-edited changelog entry: version tags, before → after diffs and mono metadata. v2 adds a quiet *atmosphere layer* (jade-tinted surfaces, a masked grid, soft glow, scroll reveals) and richer section types (stats, tech marquee, domain cards, a migration-flow diagram) so the page feels alive without hurting reading.

- **Typography is still the design.** The atmosphere sits *behind* content and never under body text; long-form pages (case study, post) keep a plain background behind the 66ch measure. A recruiter skims headings and numbers in 10 seconds; an engineer reads 2,000 words of case study without strain (section 3.2).
- **Why release notes:** the CV's through-line is migrations (v1 → v2). Version and diff motifs turn that into a visual language, and the same restraint scales to a dense admin.
- **Accent:** jade/teal. A nod to Vue green (his roots) and to Particula's ReFi/carbon domain. v2 uses it more boldly in three places only: the hero accent phrase, stat numbers and the primary CTA (with glow in dark mode). Everywhere else it stays sparing: links, focus, one highlight per card.
- **References:** [longpham.tech](https://www.longpham.tech/) (atmosphere, section rhythm, stats + marquee, domain cards, case-study card and page structure; see 2.1), Linear (admin density, command palette, status pills), Vercel Geist and Stripe docs (type hierarchy, prose, code blocks), Practical Typography (measure, line-height), Raycast and Linear changelogs (versioned entries), GitHub diff view.
- **Tone:** confident, specific, quiet. Short sentences, real numbers, no "passionate developer". Motion is functional or ambient-and-slow, never attention-grabbing, and always off under `prefers-reduced-motion`. Light and dark are both first-class; the atmosphere layer has a light variant (2.2).

<h3 id="s-2-1">2.1 Reference analysis: longpham.tech (captured 1440 and 390, Oct 2026)</h3>

**What it is.** A Next.js + Tailwind v4 site (Geist + Geist Mono), dark-only, green-tinted (`#06110C` background, `#4ADE80` primary), about 5,000px tall on desktop. Sticky header, then: hero → stats band → tech marquee → domain cards → numbered principles → feature split with flow diagram → certification cards → featured case-study cards → CTA band → minimal footer. Case-study pages and a blog list follow the same card language.

**Why it feels rich while ours feels bare (same restraint, different density):**

| Ingredient | Reference | Our v1 mockups |
| --- | --- | --- |
| Surface depth | Three tinted surfaces (`background`, `surface`, `surface-2`) + alternating full-width **bands** with `border-y` | One flat background, cards only |
| Atmosphere | Grid pattern masked by a radial gradient under the hero; 2 large blurred **orbs** floating (14s / 18s); radial glow behind the CTA | None |
| Hero | Terminal-style **kicker pill** (`>_ Solution Architect · 13+ years`), 60px H1 with a **colored accent phrase**, glowing primary button, animated **SVG diagram** (nodes pulse) on the right | Name + paragraph + small git-log card |
| Proof at a glance | **Stats band**: 4 big numbers in primary, icon tiles, mono uppercase labels | Two diff lines inside the featured block |
| Breadth | Infinite **tech marquee** of mono pills; **domain cards** with icon tile, count ("2 systems"), per-domain hue | One row of skill badges |
| Section headers | Icon + H2 + one-line muted subtitle; mono **eyebrows** ("SUMMARY", "SCOPE") on inner pages | Bare H2 |
| Cards | Category pill in domain hue, `↗` corner arrow, title turns primary, lift −2px + brighter border + shadow on hover, mono tech chips | Static cards, gray badges |
| Process | Numbered principles (`01 —` in mono); a vertical **flow diagram** (Ingest → Core → Guardrails → Action) beside 2×2 feature cards | Not present |
| Case study page | Back link, category + "Confidential" pills, meta grid with mono labels, **key-facts 2×2 cards**, eyebrow per section, ▹ bullets in primary, requirement cards side by side, mono **fact chips**, "More in <domain>" | Plainer version of the same |
| Motion | `reveal-in` (fade + 16px rise, 0.5s) per section, orb float, node/ring pulse, icon bob, marquee; all disabled under reduced motion | Hover only |
| CTA + footer | Centered CTA band with sparkle icon, glow, primary + outline buttons; one-line mono footer | Plain band |

**Weak spots to avoid:** dark-only (no light mode); a lot of muted green-gray text at 12–14px; visible `{{TODO: …}}` placeholders on a live case study (needs a publish check); decorative animations (icon bob, ring pulse) that run forever; email shown as plain text; very long pages without in-page navigation; certification images are screenshots of PDFs.

<h3 id="s-2-2">2.2 What we adopt, adapt or skip for Parker</h3>

| Idea | Decision | How it maps to Parker and our constraints |
| --- | --- | --- |
| Tinted surfaces + bands | **Adopt** | Dark neutrals tinted toward jade (3.1); a `--band` surface for alternating full-width sections on Home and About. Light mode gets a faint warm-jade band. |
| Masked grid + orbs + glow | **Adapt** | Only on the home hero and the CTA band, never behind prose. Light: grid at 6% jade, one orb at 10%. Dark: grid at 8%, two orbs at 18%. Orbs float slowly (20s / 26s), stop when off-screen and under reduced motion. Owner can turn effects off (`SiteSettings.ambientEffects`). |
| Kicker pill + accent phrase | **Adopt** | Kicker from `Profile.heroKicker` (e.g. `> Senior Frontend · 5 yrs · Vue/Nuxt/TS`); accent phrase from `Profile.headlineAccent`, solid `--primary` (no gradient text, so contrast stays measurable). |
| Hero diagram | **Adapt** | Instead of a generic architecture graph: a **migration diagram** (`v1 Vue 2` node → `v2 Nuxt 3` node with a component tree that "rewires"), built from the featured project's `versionFrom`/`versionTo` + up to 6 skills. SVG, CSS-animated, static under reduced motion. |
| Stats band | **Adopt** | `ProfileStat` rows: years (computed from `careerStartDate`), products shipped (computed from published projects), framework migrations, enterprise platforms (seed values in 1.5). Numbers count up once on first view. |
| Tech marquee | **Adapt** | From `Skill.showInMarquee`. Pauses on hover/focus, has a visible pause button, is `aria-hidden` for the duplicated half, and becomes a static wrapped list under reduced motion. |
| Domain cards | **Adopt** | `Domain` entity: Fintech / Web3 (ReFi), Enterprise platforms (Samsung SDS), E-commerce tooling, Developer experience & testing. Icon tile, hue, project count, one-line description. |
| Numbered principles | **Adopt** | Existing `Principle` rows rendered as `01 — Migrate in slices` with mono numbers. |
| Flow diagram + 2×2 features | **Adapt** | "How I migrate a frontend": `ProcessStep` rows (Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over) as a vertical flow beside 4 feature cards (from `Principle`). |
| Certifications | **Skip** | Parker has none to show; the slot becomes "Worked with" (teams/companies as text chips) only if content exists. |
| Case-study cards | **Adopt** | Domain-hued pill, `↗` arrow, hover lift, mono tech chips, plus our `DiffStat` line (the thing the reference lacks: numbers). |
| Case-study page structure | **Adopt** | Back link, pills, meta grid, key-facts 2×2, eyebrows, ▹ bullets, decision cards, fact chips, "More in <domain>". Keep our sticky TOC (the reference has none). |
| Blog list as cards | **Adapt** | Card rows with mono date · minutes and `#tag` chips; keep the year grouping and search. |
| CTA band + footer | **Adopt** | CTA band with glow, a primary "Copy email" button (the address is never shown as visible text) and up to 2 outline buttons from `SocialLink.showInCta`. Footer stays one line + mono build hash. |
| Dark-only, forever animations, TODO leaks | **Reject** | Light + dark; ambient motion only in 2 places; publish validation blocks `{{TODO` and empty required fields. |

---

<h2 id="s-3">3. Design tokens</h2>

> **In this chapter:** Tokens use shadcn/ui's variable names (`--background`, `--primary`, `--muted-foreground`, …) as the semantic layer, plus a few extensions (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`).

| § | Section |
| --- | --- |
| 3.1 | Color (semantic, shadcn names) |
| 3.1b | Atmosphere and domain hues (v2) |
| 3.2 | Typography (the core of the design) |
| 3.3 | Spacing, radius, elevation |
| 3.4 | Motion |
| 3.5 | Breakpoints and z-index |
| 3.6 | shadcn theme: CSS variables (`packages/ui/src/styles/globals.css`) |
| 3.7 | Tailwind v4 mapping (same file, `@theme inline`) |

Tokens use **shadcn/ui's variable names** (`--background`, `--primary`, `--muted-foreground`, …) as the semantic layer, plus a few extensions (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`). One naming scheme means shadcn components work unmodified and our custom components use the same utilities (`bg-primary`, `text-muted-foreground`).

All color pairs below were measured with the WCAG 2.x relative luminance formula. Text needs ≥ 4.5:1 (normal) and ≥ 3:1 (≥ 24px, or ≥ 18.66px bold). Input borders and focus rings need ≥ 3:1 (SC 1.4.11). Decorative dividers (`--border`) are exempt and are never the only boundary of a control.

<h3 id="s-3-1">3.1 Color (semantic, shadcn names)</h3>

v2 change: dark neutrals are **tinted toward jade** (hue ≈ 165°) instead of pure gray, which gives depth without adding colors. Light stays warm neutral. All dark pairs were re-measured.

| Token | Light | Dark (v2) | Use | Contrast (measured, light / dark) |
| --- | --- | --- | --- | --- |
| `--background` / `--foreground` | `#FAFAF9` / `#18181B` | `#0A0F0E` / `#E8EFED` | Page and body text | 16.96 / 16.55 ✅ |
| `--card` / `--card-foreground` | `#FFFFFF` / `#18181B` | `#111817` / `#E8EFED` | Cards, inputs, tables | ≥ 16 / ≥ 15 ✅ |
| `--popover` / `--popover-foreground` | `#FFFFFF` / `#18181B` | `#172120` / `#E8EFED` | Menus, dialogs, command palette | ≥ 16 / 14.12 ✅ |
| `--band` (ext, v2) | `#F3F5F3` | `#0D1412` | Alternating full-width section bands | muted-fg on band 7.05 / 8.20, subtle 4.82, primary 5.00 ✅ |
| `--muted` | `#F2F2EF` | `#172120` | Code bg, table hover, skeleton base, icon tiles | n/a |
| `--muted-foreground` | `#52525B` | `#9DB0AB` | Secondary text | 7.40 bg, 6.89 muted / 8.49 bg, 7.91 card, 7.24 muted ✅ |
| `--subtle-foreground` (ext) | `#6B6B74` | `#809590` | Meta, placeholders, timestamps | 5.05 bg, 4.70 muted / 6.09 bg, 5.67 card, 5.19 muted ✅ |
| `--primary` / `--primary-foreground` | `#0F766E` / `#FFFFFF` | `#2DD4BF` / `#042F2B` | Links, primary button, accent phrase, stat numbers | primary on bg 5.24 / 10.37, on card 5.47 / 9.67; fg on primary 5.47 / 7.80 ✅ |
| `--primary-hover` (ext) | `#115E59` | `#5EEAD4` | Hover/pressed | white on it 7.58 ✅ |
| `--primary-subtle` / `--primary-subtle-foreground` (ext) | `#E3F2EF` / `#115E59` | `#0F2E2B` / `#5EEAD4` | Selected rows, active tag, kicker pill | 6.58 / 9.82 ✅ |
| `--secondary`, `--accent` (+ foregrounds) | `#F2F2EF` / `#18181B` | `#172120` / `#E8EFED` | Secondary button; shadcn hover bg (not the brand color) | 15.80 / 14.12 ✅ |
| `--destructive` / `--destructive-foreground` | `#B42318` / `#FFFFFF` | `#F97066` / `#0A0F0E` | Errors, destructive actions | 6.29 / 6.93; fg on it 6.57 / 6.93 ✅ |
| `--success` on `--success-subtle` (ext) | `#067647` on `#E6F1EC` | `#47CD89` on `#1A2F25` | Published, sent | 5.45 bg, 4.92 subtle / 9.53, 7.01 ✅ |
| `--warning` on `--warning-subtle` (ext) | `#93370D` on `#F4EBE7` | `#FDB022` on `#3A2F18` | Warnings, missing translation | 7.20, 6.40 / 10.49, 7.13 ✅ |
| `--info` on `--info-subtle` (ext) | `#1D4ED8` on `#E8EDFB` | `#7AA2F7` on `#1B2540` | Info callouts | 6.42, 5.72 / 7.67, 6.02 ✅ |
| `--destructive-subtle` (ext) | `#F7E9E8` | `#3A1F1F` | Error panels | destructive on it 5.56 / 5.40 ✅ |
| `--border` | `#E4E4E0` | `#233230` | Dividers, card outlines (decorative) | decorative only |
| `--border-strong` (ext, v2) | `#CFCFC9` | `#2F4542` | Card border on hover, band edges | decorative only (hover also lifts + shadows) |
| `--input` | `#8A8A93` | `#62807A` | Input, checkbox, switch borders | 3.42 on card / 4.19 on card ✅ |
| `--ring` | `#0F766E` | `#2DD4BF` | Focus ring, 2px + 2px offset | 5.24 / 10.37 ✅ |
| `--chart-1…5` | `#0F766E`, `#1D4ED8`, `#93370D`, `#6B6B74`, `#067647` | `#2DD4BF`, `#7AA2F7`, `#FDB022`, `#809590`, `#47CD89` | Charts, always labelled | ≥ 3:1 vs bg ✅ |
| `--sidebar` family | `--sidebar: #F4F4F2`, `--sidebar-accent: #EAEAE6`, `--sidebar-primary: #0F766E`, `--sidebar-border: #E4E4E0` | `--sidebar: #0C1211`, `--sidebar-accent: #172120`, `--sidebar-primary: #2DD4BF`, `--sidebar-border: #233230` | shadcn `Sidebar` (admin) | muted-fg on sidebar 7.02 / 8.32 ✅ |

Theme switching: `next-themes` with `attribute="class"` (shadcn default, `.dark` on `<html>`), default `system`, `disableTransitionOnChange`. Theme choice is a UI preference, not content.

<h3 id="s-3-1b">3.1b Atmosphere and domain hues (v2)</h3>

**Atmosphere tokens** (decorative; never carry text, never behind body copy):

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--grid-line` | `rgb(15 118 110 / .06)` | `rgb(45 212 191 / .08)` | 44px grid on the home hero and CTA band, masked with `radial-gradient(80% 60% at 50% 0, #000 40%, transparent)` |
| `--glow` | `rgb(15 118 110 / .10)` | `rgb(45 212 191 / .18)` | Orbs (blur 80px) and the radial glow behind the CTA |
| `--glow-button` | `none` (uses `--shadow-1`) | `0 0 24px -6px rgb(45 212 191 / .55)` | Primary button in hero and CTA only |
| `--card-glass` | `rgb(255 255 255 / .72)` | `rgb(17 24 23 / .72)` | Cards that sit on top of the grid (+ `backdrop-filter: blur(8px)`); solid `--card` fallback when `prefers-reduced-transparency: reduce` or no `backdrop-filter` support |

**Domain hues** (for `Domain.hue`, used on domain cards, case-study pills and the card's top-edge accent). Pills always show an icon + text label; hue is never the only cue. Tint = hue at 10% over `#FFFFFF` (light) / 14% over `--card` (dark).

| Hue key | Light text / tint | Dark text / tint | Contrast (text on tint, light / dark) | Suggested domain |
| --- | --- | --- | --- | --- |
| `jade` | `#0F766E` / `#E7F1F1` | `#2DD4BF` / `#15322F` | 4.76 / 7.38 ✅ | Developer experience & testing |
| `amber` | `#8A4B08` / `#F3EDE6` | `#FBBF24` / `#322F19` | 5.85 / 8.08 ✅ | Fintech / Web3 (ReFi) |
| `blue` | `#1D4ED8` / `#E8EDFB` | `#7AA2F7` / `#202B36` | 5.72 / 5.71 ✅ | Enterprise platforms |
| `violet` | `#6D28D9` / `#F0EAFB` | `#C4B5FD` / `#2A2E37` | 6.04 / 7.37 ✅ | E-commerce tooling |
| `rose` | `#B4235A` / `#F8E9EF` | `#FDA4C4` / `#322C2F` | 5.38 / 7.34 ✅ | Spare (e.g. "This portfolio") |

<h3 id="s-3-2">3.2 Typography (the core of the design)</h3>

**Goals, in order:** (1) every Vietnamese diacritic renders cleanly at every size, (2) long-form case studies and notes are comfortable to read for 10+ minutes, (3) hierarchy is obvious with few sizes, (4) code is unambiguous.

**Families (3, each with a job).**

| Role | Family | Weights loaded | Why |
| --- | --- | --- | --- |
| Headings (public H1–H3) | **Be Vietnam Pro** | 600, 700 | Designed in Vietnam for Vietnamese: marks like `ế ộ ữ ẳ` are drawn as part of the letter, not stacked, so headings stay crisp. Slightly wider than Inter, which helps heading/body contrast |
| Body and all UI (incl. admin) | **Inter** | 400, 500, 600 (variable) | Full `vietnamese` subset, tall x-height, very legible at 14–18px, tabular figures (`tnum`) for metrics and tables, character variants `cv05` (`l` with a tail) and `cv08` (`I` with serifs) so `Il1` never look alike |
| Code, version tags, kbd | **JetBrains Mono** | 400, 600 | Has a `vietnamese` subset (vi code comments render), tall x-height, clear `0/O`, `1/l/I`. Ligatures **off** (`font-variant-ligatures: none`) so `!==` and `=>` look like what you type |

Loaded with `next/font/google`, `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`, `adjustFontFallback` on (metric-matched fallback, no layout shift). Exposed as `--font-heading`, `--font-sans`, `--font-mono`. Nothing else is loaded; total ≤ 5 font files.

**Scale: 8 public sizes (each with one job), 3 admin sizes.** v2 adds `text-display` (home hero only) and `text-eyebrow` (mono labels only). Hierarchy uses size *and* weight *and* space; do not add more sizes, change weight or spacing instead.

| Token | Size (mobile → desktop) | Line-height | Weight · family | Use |
| --- | --- | --- | --- | --- |
| `text-display` (v2) | 40px → 64px (`clamp(2.5rem, 1.5rem + 4vw, 4rem)`) | 1.1 en / 1.2 vi | 700 · heading, `-0.02em` | Home hero H1 only (with accent phrase) |
| `text-title` | 34px → 48px (`clamp(2.125rem, 1.6rem + 2.2vw, 3rem)`) | 1.2 (1.25 for vi) | 700 · heading | Page H1, stat numbers, CTA band H2 |
| `text-heading` | 26px → 30px | 1.3 | 600 · heading | H2 (sections, markdown `##`) |
| `text-subheading` | 20px | 1.4 | 600 · heading | H3, card titles, markdown `###` |
| `text-prose` | 18px | 1.75 | 400 · sans | Long-form: case studies, notes, bio, hero sub-line |
| `text-body` | 16px | 1.6 | 400/500 · sans | UI and short copy, card descriptions |
| `text-meta` | 14px | 1.5 | 500 · sans (mono for dates, versions, chips) | Meta, captions, tags, chips |
| `text-eyebrow` (v2) | 12px | 1.4 | 500 · mono, uppercase, `0.08em` tracking, `--primary` or `--subtle-foreground` | Eyebrows ("CASE STUDY", "OUTCOME"), stat labels. Max 4 words; never sentences |
| admin `text-ui-title` | 20px | 1.4 | 600 · sans | Admin page titles |
| admin `text-ui` | 14px | 1.5 | 400/500 · sans | All admin UI, tables, inputs |
| admin `text-ui-meta` | 12.5px | 1.4 | 500 · sans | Timestamps, counts, kbd |

Markdown `####` and deeper render as `text-prose` 600 (no new size). Posts and case studies start at `##`; the page title is the only H1.

**Long-form rules (`Prose` component).**
- **Measure:** max `66ch` (≈ 680px at 18px Inter); never wider than 75ch, never narrower than 45ch on mobile (20px page padding).
- **Spacing:** paragraphs `1.1em` apart; `##` gets `2.2em` above and `0.6em` below; `###` `1.6em` / `0.5em`. Space above a heading is always larger than below, so it binds to its own content.
- **Lists:** `0.4em` between items, hanging bullets (`padding-inline-start: 1.25em`).
- **Links:** `--primary`, underline always on in prose (`text-underline-offset: 0.2em`, `text-decoration-thickness: 1px`, 2px on hover). Color is never the only cue.
- **Emphasis:** bold 600, italic real italics; no ALL CAPS paragraphs.
- **Numbers:** `font-variant-numeric: tabular-nums` in metrics, tables and dates.
- **Quotes and callouts:** 3px left border, same size as body, `--muted-foreground` text; no oversized pull quotes.
- **Images:** full measure width, caption in `text-meta` below.

**Code.**
- Blocks: JetBrains Mono 15px (`0.875em` of 17–18px prose), line-height 1.65, `--muted` background, `rounded-lg` (8px), 16px padding, optional filename bar, horizontal scroll (focusable region with `aria-label`), wrap toggle. Max designed width ~80 characters. Shiki with a light and dark theme tuned to the palette (comments use `--subtle-foreground`, ≥ 4.5:1).
- Inline: `0.9em`, `--muted` background, 0.15em × 0.35em padding, `rounded-sm` (4px), no color change.

**Vietnamese safety.**
- Line-height never below 1.2 (headings) or 1.5 (UI text); stacked marks (`Ỗ`, `ặ`) clip below that.
- Letter-spacing ≥ `-0.015em` on headings, `0` on body; never track Vietnamese body text.
- Any `overflow: hidden` or `line-clamp` container gets `padding-block: 0.15em` so the top and bottom marks are not cut.
- `lang` is set on `<html>` per locale, and on any element showing fallback English inside a vi page.
- vi strings run ~10–15% longer: buttons, nav and table headers must fit vi at 360px without truncation.
- QA string used in every type story: `Hưởng ứng — Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`.

<h3 id="s-3-3">3.3 Spacing, radius, elevation</h3>

| Spacing | `0` 0 · `0.5` 2px · `1` 4px · `1.5` 6px · `2` 8px · `3` 12px · `4` 16px · `5` 20px · `6` 24px · `8` 32px · `10` 40px · `12` 48px · `16` 64px · `24` 96px · `32` 128px (4px base) |
| --- | --- |
| Radius (shadcn, from `--radius: 0.5rem`) | `rounded-sm` 4px (badges, kbd, inline code) · `rounded-md` 6px (inputs, buttons) · `rounded-lg` 8px (cards, menus, code blocks) · `rounded-xl` 12px (dialogs, media) · `rounded-full` (avatars, pills) |
| Control heights | public 40px (44px touch target on mobile) · admin 32px default, 28px compact; icon buttons 32/28 with a 44px hit area on touch |

| Elevation | Light | Dark | Use |
| --- | --- | --- | --- |
| `--shadow-0` | none | none | Flat (most surfaces; use borders) |
| `--shadow-1` | `0 1px 2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .06)` | Sticky header, resting cards on a band |
| `--shadow-2` | `0 4px 12px -2px rgb(16 24 40 / .10), 0 2px 4px -2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .08), 0 8px 24px rgb(0 0 0 / .5)` | Popovers, dropdowns, toasts, card hover (v2) |
| `--shadow-3` | `0 16px 40px -8px rgb(16 24 40 / .18)` | `0 0 0 1px rgb(255 255 255 / .10), 0 24px 48px rgb(0 0 0 / .6)` | Dialogs, command palette |

Dark mode expresses elevation with a lighter surface plus a 1px inner hairline, not with shadow alone.

<h3 id="s-3-4">3.4 Motion</h3>

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 80ms | Press, checkbox tick |
| `--dur-fast` | 140ms | Hover, color, focus |
| `--dur-base` | 200ms | Menus, tooltips, toasts in |
| `--dur-slow` | 320ms | Dialog, sheet, page section reveal |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Leaving (use 0.75× duration) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moving/reordering |

Rules (v2):

- Animate only `opacity` and `transform` (plus `box-shadow`/`border-color` on hover). No scroll-jacking, no parallax tied to scroll position, no cursor-follow effects.
- Every effect below is CSS-only except the reveal and count-up, which use one shared `IntersectionObserver` hook (`useInView`, `once: true`). No animation library.
- Ambient animations run **only** on the home hero and the CTA band, pause when off-screen (`animation-play-state: paused` via the same observer) and when the tab is hidden.

| Effect | Where | Spec | Reduced-motion fallback |
| --- | --- | --- | --- |
| Section reveal | Home and About sections, case-study key-facts, card grids | `opacity 0 → 1`, `translateY(12px) → 0`, `--dur-slow` (320ms) `--ease-out`, once, when 15% visible. Grids stagger 60ms per item, max 6 items (later items appear with the 6th) | Content visible immediately, no transform |
| Card hover / focus-within | Project, domain, post cards | Border → `--border-strong`, `translateY(-2px)`, `--shadow-2`, title → `--primary`, `↗` arrow moves 2px up-right; `--dur-fast` | Color and border change only, no lift |
| Button hover | Primary buttons | Background → `--primary-hover`; in dark hero/CTA also `--glow-button` intensifies | Same, no glow change |
| Orbs | Hero (2), CTA (1) | 320–420px circles of `--glow`, `filter: blur(80px)`, float ±24px over 20s / 26s `ease-in-out infinite` | Static, same position |
| Hero migration diagram | Home hero | Nodes fade in in order (60ms stagger), connector stroke draws once (`stroke-dashoffset`, 900ms), then node "pulse" opacity .6 ↔ 1 every 3s on the active (`v2`) node only | Fully drawn, no pulse |
| Stat count-up | Stats band | Numbers count from 0 to value once, 700ms `--ease-out`, `tabular-nums` so width does not jump; real value is in the DOM from the start (`aria-label` = final value) | Final values shown |
| Tech marquee | Below stats | Two identical tracks translate −50% over 40s linear infinite; pauses on hover and keyboard focus; visible pause/play button (`aria-pressed`); second track `aria-hidden` | Single static, wrapped list of chips |
| Theme switch | Global | No transition (`disableTransitionOnChange`) | n/a |
| Route transition | Projects list ↔ case study | View Transitions API: cover image morph, 320ms | Instant |

- Never animate: body text, prose, code, table rows, admin UI (admin keeps only menu/dialog/toast transitions from shadcn).
- `@media (prefers-reduced-motion: reduce)`: all of the above fall back as listed; durations → `0.01ms` except opacity fades at `--dur-fast`; the timeline renders fully expanded.
- `@media (prefers-reduced-transparency: reduce)`: `--card-glass` → solid `--card`, orbs hidden.

<h3 id="s-3-5">3.5 Breakpoints and z-index</h3>

| Breakpoint | Min width | Layout |
| --- | --- | --- |
| `base` | 0 | 4-col grid, 16px gutter, 20px page padding |
| `sm` | 640px | 4-col, larger type |
| `md` | 768px | 8-col, 24px gutter; admin sidebar becomes a rail |
| `lg` | 1024px | 12-col, 32px gutter; admin sidebar full |
| `xl` | 1280px | Container caps at 1120px (public) |
| `2xl` | 1536px | Admin editor shows 3 panes |

| z-index token | Value | Use |
| --- | --- | --- |
| `--z-base` | 0 | Content |
| `--z-raised` | 10 | Sticky table header, sticky TOC |
| `--z-header` | 100 | Site header, admin topbar |
| `--z-sidebar` | 200 | Admin mobile sidebar |
| `--z-dropdown` | 300 | Menus, combobox, tooltip |
| `--z-overlay` | 400 | Dialog/sheet backdrop |
| `--z-modal` | 500 | Dialog, sheet, command palette |
| `--z-toast` | 600 | Toasts, realtime notifications |
| `--z-skip` | 700 | Skip link (focused) |

<h3 id="s-3-6">3.6 shadcn theme: CSS variables (`packages/ui/src/styles/globals.css`)</h3>

shadcn/ui (Tailwind v4, `new-york` style, `baseColor: neutral`, `cssVariables: true`) is initialised in `packages/ui` with the monorepo setup (`components.json` in both `packages/ui` and `apps/web`). The generated `globals.css` is replaced by the block below; shadcn components then pick up our palette with no per-component color edits. Hex is used instead of shadcn's default OKLCH so the values match the contrast table exactly.

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.5rem;

  --background: #FAFAF9;  --foreground: #18181B;
  --card: #FFFFFF;        --card-foreground: #18181B;
  --popover: #FFFFFF;     --popover-foreground: #18181B;
  --primary: #0F766E;     --primary-foreground: #FFFFFF;
  --secondary: #F2F2EF;   --secondary-foreground: #18181B;
  --muted: #F2F2EF;       --muted-foreground: #52525B;
  --accent: #F2F2EF;      --accent-foreground: #18181B;
  --destructive: #B42318; --destructive-foreground: #FFFFFF;
  --border: #E4E4E0;      --input: #8A8A93;  --ring: #0F766E;
  --chart-1: #0F766E; --chart-2: #1D4ED8; --chart-3: #93370D; --chart-4: #6B6B74; --chart-5: #067647;
  --sidebar: #F4F4F2; --sidebar-foreground: #18181B;
  --sidebar-primary: #0F766E; --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #EAEAE6; --sidebar-accent-foreground: #18181B;
  --sidebar-border: #E4E4E0; --sidebar-ring: #0F766E;

  /* extensions */
  --subtle-foreground: #6B6B74;
  --primary-hover: #115E59;
  --primary-subtle: #E3F2EF; --primary-subtle-foreground: #115E59;
  --success: #067647; --success-subtle: #E6F1EC;
  --warning: #93370D; --warning-subtle: #F4EBE7;
  --info: #1D4ED8;    --info-subtle: #E8EDFB;
  --destructive-subtle: #F7E9E8;

  /* v2: bands, atmosphere, domain hues */
  --band: #F3F5F3; --border-strong: #CFCFC9;
  --grid-line: rgb(15 118 110 / .06); --glow: rgb(15 118 110 / .10);
  --glow-button: var(--shadow-1); --card-glass: rgb(255 255 255 / .72);
  --hue-jade: #0F766E;   --hue-jade-subtle: #E7F1F1;
  --hue-amber: #8A4B08;  --hue-amber-subtle: #F3EDE6;
  --hue-blue: #1D4ED8;   --hue-blue-subtle: #E8EDFB;
  --hue-violet: #6D28D9; --hue-violet-subtle: #F0EAFB;
  --hue-rose: #B4235A;   --hue-rose-subtle: #F8E9EF;

  --shadow-1: 0 1px 2px rgb(16 24 40 / .06);
  --shadow-2: 0 4px 12px -2px rgb(16 24 40 / .10), 0 2px 4px -2px rgb(16 24 40 / .06);
  --shadow-3: 0 16px 40px -8px rgb(16 24 40 / .18);

  --dur-instant: 80ms; --dur-fast: 140ms; --dur-base: 200ms; --dur-slow: 320ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  --z-raised: 10; --z-header: 100; --z-sidebar: 200; --z-dropdown: 300;
  --z-overlay: 400; --z-modal: 500; --z-toast: 600; --z-skip: 700;

  --container: 1120px; --measure: 66ch;
}

.dark {
  --background: #0A0F0E;  --foreground: #E8EFED;
  --card: #111817;        --card-foreground: #E8EFED;
  --popover: #172120;     --popover-foreground: #E8EFED;
  --primary: #2DD4BF;     --primary-foreground: #042F2B;
  --secondary: #172120;   --secondary-foreground: #E8EFED;
  --muted: #172120;       --muted-foreground: #9DB0AB;
  --accent: #172120;      --accent-foreground: #E8EFED;
  --destructive: #F97066; --destructive-foreground: #0A0F0E;
  --border: #233230;      --input: #62807A;  --ring: #2DD4BF;
  --chart-1: #2DD4BF; --chart-2: #7AA2F7; --chart-3: #FDB022; --chart-4: #809590; --chart-5: #47CD89;
  --sidebar: #0C1211; --sidebar-foreground: #E8EFED;
  --sidebar-primary: #2DD4BF; --sidebar-primary-foreground: #042F2B;
  --sidebar-accent: #172120; --sidebar-accent-foreground: #E8EFED;
  --sidebar-border: #233230; --sidebar-ring: #2DD4BF;

  --subtle-foreground: #809590;
  --primary-hover: #5EEAD4;
  --primary-subtle: #0F2E2B; --primary-subtle-foreground: #5EEAD4;
  --success: #47CD89; --success-subtle: #1A2F25;
  --warning: #FDB022; --warning-subtle: #3A2F18;
  --info: #7AA2F7;    --info-subtle: #1B2540;
  --destructive-subtle: #3A1F1F;

  --band: #0D1412; --border-strong: #2F4542;
  --grid-line: rgb(45 212 191 / .08); --glow: rgb(45 212 191 / .18);
  --glow-button: 0 0 24px -6px rgb(45 212 191 / .55); --card-glass: rgb(17 24 23 / .72);
  --hue-jade: #2DD4BF;   --hue-jade-subtle: #15322F;
  --hue-amber: #FBBF24;  --hue-amber-subtle: #322F19;
  --hue-blue: #7AA2F7;   --hue-blue-subtle: #202B36;
  --hue-violet: #C4B5FD; --hue-violet-subtle: #2A2E37;
  --hue-rose: #FDA4C4;   --hue-rose-subtle: #322C2F;

  --shadow-1: 0 0 0 1px rgb(255 255 255 / .06);
  --shadow-2: 0 0 0 1px rgb(255 255 255 / .08), 0 8px 24px rgb(0 0 0 / .5);
  --shadow-3: 0 0 0 1px rgb(255 255 255 / .10), 0 24px 48px rgb(0 0 0 / .6);
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-instant: 0.01ms; --dur-base: 0.01ms; --dur-slow: 0.01ms; }
  *, *::before, *::after { scroll-behavior: auto !important; }
  .marquee-track, .orb, .diagram-pulse { animation: none !important; }
}

@media (prefers-reduced-transparency: reduce) {
  :root, .dark { --card-glass: var(--card); }
  .orb { display: none; }
}
```

<h3 id="s-3-7">3.7 Tailwind v4 mapping (same file, `@theme inline`)</h3>

`@theme inline` turns every variable into utilities that follow the active theme: `bg-background`, `text-muted-foreground`, `text-subtle-foreground`, `bg-primary-subtle`, `border-input`, `ring-ring`, `rounded-lg`, `shadow-2`, `font-heading`, `text-prose`, `bg-band`, `border-border-strong`, `bg-hue-amber-subtle text-hue-amber`, `text-display`, `text-eyebrow`, `z-modal`, `duration-base`, `ease-out`.

```css
@theme inline {
  --color-background: var(--background);   --color-foreground: var(--foreground);
  --color-card: var(--card);               --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);         --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);         --color-primary-foreground: var(--primary-foreground);
  --color-primary-hover: var(--primary-hover);
  --color-primary-subtle: var(--primary-subtle);
  --color-primary-subtle-foreground: var(--primary-subtle-foreground);
  --color-secondary: var(--secondary);     --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);             --color-muted-foreground: var(--muted-foreground);
  --color-subtle-foreground: var(--subtle-foreground);
  --color-accent: var(--accent);           --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-subtle: var(--destructive-subtle);
  --color-success: var(--success);         --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning);         --color-warning-subtle: var(--warning-subtle);
  --color-info: var(--info);               --color-info-subtle: var(--info-subtle);
  --color-border: var(--border);           --color-input: var(--input);   --color-ring: var(--ring);
  --color-band: var(--band);               --color-border-strong: var(--border-strong);
  --color-card-glass: var(--card-glass);
  --color-hue-jade: var(--hue-jade);       --color-hue-jade-subtle: var(--hue-jade-subtle);
  --color-hue-amber: var(--hue-amber);     --color-hue-amber-subtle: var(--hue-amber-subtle);
  --color-hue-blue: var(--hue-blue);       --color-hue-blue-subtle: var(--hue-blue-subtle);
  --color-hue-violet: var(--hue-violet);   --color-hue-violet-subtle: var(--hue-violet-subtle);
  --color-hue-rose: var(--hue-rose);       --color-hue-rose-subtle: var(--hue-rose-subtle);
  --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);                         --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);         --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);           --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);           --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm: calc(var(--radius) - 4px);   /* 4px  badges, kbd, inline code */
  --radius-md: calc(var(--radius) - 2px);   /* 6px  buttons, inputs */
  --radius-lg: var(--radius);               /* 8px  cards, menus, code blocks */
  --radius-xl: calc(var(--radius) + 4px);   /* 12px dialogs, media */

  --font-heading: var(--font-be-vietnam-pro), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;

  --text-display: clamp(2.5rem, 1.5rem + 4vw, 4rem);     --text-display--line-height: 1.1;
  --text-title: clamp(2.125rem, 1.6rem + 2.2vw, 3rem);   --text-title--line-height: 1.2;
  --text-heading: clamp(1.625rem, 1.5rem + 0.5vw, 1.875rem); --text-heading--line-height: 1.3;
  --text-subheading: 1.25rem;  --text-subheading--line-height: 1.4;
  --text-prose: 1.125rem;      --text-prose--line-height: 1.75;
  --text-body: 1rem;           --text-body--line-height: 1.6;
  --text-meta: 0.875rem;       --text-meta--line-height: 1.5;
  --text-eyebrow: 0.75rem;     --text-eyebrow--line-height: 1.4;  --text-eyebrow--letter-spacing: 0.08em;
  --text-ui-title: 1.25rem;    --text-ui-title--line-height: 1.4;
  --text-ui: 0.875rem;         --text-ui--line-height: 1.5;
  --text-ui-meta: 0.78125rem;  --text-ui-meta--line-height: 1.4;

  --shadow-1: var(--shadow-1); --shadow-2: var(--shadow-2); --shadow-3: var(--shadow-3);
  --shadow-glow: var(--glow-button);
  --ease-out: var(--ease-out); --ease-in: var(--ease-in); --ease-in-out: var(--ease-in-out);
  --z-index-raised: var(--z-raised); --z-index-header: var(--z-header); --z-index-sidebar: var(--z-sidebar);
  --z-index-dropdown: var(--z-dropdown); --z-index-overlay: var(--z-overlay);
  --z-index-modal: var(--z-modal); --z-index-toast: var(--z-toast); --z-index-skip: var(--z-skip);

  --breakpoint-sm: 40rem; --breakpoint-md: 48rem; --breakpoint-lg: 64rem;
  --breakpoint-xl: 80rem; --breakpoint-2xl: 96rem;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans text-body antialiased; font-feature-settings: "cv05", "cv08"; }
  h1, h2, h3 { @apply font-heading; letter-spacing: -0.015em; }
  :lang(vi) .text-display { line-height: 1.2; }
  code, kbd, pre { font-variant-ligatures: none; }
  :focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
}
```

Tailwind's default sizes stay available because shadcn components use `text-sm` (14px, equal to `text-ui` / `text-meta`) and `text-xs` (12px, badges and kbd). App code and product components may only use the 11 named sizes (8 public + 3 admin); a lint rule flags `text-(xs|sm|base|lg|xl|[2-9]xl)` outside `components/ui/`, so a 9th public size cannot sneak in. Components never use raw palette classes (`teal-700`); `eslint-plugin-tailwindcss` with an allowlist enforces this.

---

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

<h2 id="s-5">5. Page-by-page UI spec</h2>

> **In this chapter:** Routes: public under `app/[locale]/(site)/…` with `locale ∈ {en, vi}` (default `en`, `vi` auto-suggested from `Accept-Language`, never forced); admin under `app/admin/(cms)/…` (not localized, UI in en; content fields edited per locale).

| § | Section |
| --- | --- |
| 5.0 | Data, states and components per screen |
| 5.1 | Home `/[locale]` (v2) |
| 5.2 | About + experience timeline `/[locale]/about` (v2) |
| 5.3 | Projects list `/[locale]/projects` (v2) |
| 5.4 | Project case study `/[locale]/projects/[slug]` (v2) |
| 5.5 | Blog list `/[locale]/notes` and post `/[locale]/notes/[slug]` (v2) |
| 5.6 | Contact `/[locale]/contact` (v2) |
| 5.7 | Admin dashboard `/admin` |
| 5.8 | Admin list/table `/admin/posts` (same pattern for projects, skills, experience, media, inbox, audit) |
| 5.9 | Admin editor `/admin/posts/[id]` (projects use the same shell with case-study section fields) |
| 5.10 | Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics) |
| 5.11 | Admin changes for v2 (small; the admin layout stays as is) |

Routes: public under `app/[locale]/(site)/…` with `locale ∈ {en, vi}` (default `en`, `vi` auto-suggested from `Accept-Language`, never forced); admin under `app/admin/(cms)/…` (not localized, UI in en; content fields edited per locale).

Every public page: `<title>` pattern `{page seoTitle} · {SiteSettings.siteName}`, description from CMS, canonical, `hreflang` alternates, OG image from the template, JSON-LD (`Person` on home/about, `CreativeWork` on case studies, `BlogPosting` on posts, `BreadcrumbList` on detail pages). Sitemap and RSS per locale.

<h3 id="s-5-0">5.0 Data, states and components per screen</h3>

All text in the wireframes below is **seed data** from the CV or chrome strings; none of it is typed into components. "Hide" means the section and its anchor are removed when empty (section 4.5).

| Screen · section | Data (endpoint → props) | Render | Skeleton | Empty | Error | shadcn components |
| --- | --- | --- | --- | --- | --- | --- |
| Layout: header, footer | `GET /public/site?locale` → `nav`, `socialLinks`, `settings` | RSC, tag `site` | n/a (part of shell) | Nav with 0 items shows logo only | `error.tsx` chrome page | `navigation-menu`, `sheet`, `toggle-group`, `dropdown-menu`, `button`, `command` + `dialog` |
| Home · hero | `site.profile`, `site.settings.availability*` | RSC | Title + 2 lines + 2 buttons | n/a (seeded singleton) | `error.tsx` (critical) | `badge`, `button` |
| Home · featured | `GET /public/projects?featured=1&limit=1` | RSC, tag `projects` | Cover + 3 lines + 2 stats | Hide | Inline `alert` + Retry | `card`, `badge` |
| Home · selected work | `GET /public/projects?limit=3` | RSC | 3 card skeletons | Hide | Inline `alert` | `card`, `badge` |
| Home · hero diagram (v2, replaces the v1 career-log panel) | featured project `versionFrom/To` + up to 6 linked `Skill` | RSC | Diagram-shaped block | Hide the diagram, hero text spans full width | Hide | `card` |
| Home · skills | `GET /public/skills` (grouped by depth) | RSC, tag `skills` | 3 rows of chips | Hide | Inline `alert` | `badge` |
| Home · latest notes | `GET /public/posts?limit=3` | RSC, tag `posts` | 3 rows | Hide | Inline `alert` | `separator` |
| Home · contact CTA | `PageSection(HOME, cta).title/ctaLabel` | RSC | n/a | Hide if no title | n/a | `button` |
| Home · stats band (v2) | `GET /public/site` → `profileStats` (computed values resolved on the server) | RSC, tag `site` | 4 tiles (icon + number + label blocks) | Hide if < 2 visible | Inline `alert` | none (custom `StatBand`) |
| Home · tech marquee (v2) | `GET /public/skills?marquee=1` | RSC, tag `skills` | 1 row of 8 chip blocks | Hide if 0; static row if < 6 | Hide (decorative duplicate of skills) | `badge`, `button` (pause) |
| Home · domains (v2) | `GET /public/domains` (with published project counts) | RSC, tag `domains` | 4 cards | Hide; cards with 0 projects hidden | Inline `alert` | `card` |
| Home · process (v2) | `GET /public/process-steps` | RSC, tag `site` | 2×2 cards + 5-step chain | Hide if < 3 steps | Inline `alert` | `card` |
| Home · CTA band (v2) | `PageSection(HOME, cta)` + `socialLinks.filter(showInCta)` | RSC | n/a | Hide if no title | n/a | `button` |
| Case study · key facts + chips (v2) | `project.keyFacts`, `project.factChips`, `project.domain` | RSC (same request) | 2×2 blocks | Hide each if empty | Part of page `error.tsx` | `badge`, `card` |
| About · intro | `site.profile.bio`, `resumeEnId/ViId` | RSC | Avatar + 3 lines | n/a | `error.tsx` | `avatar`, `button` |
| About · timeline | `GET /public/experience` | RSC | 3 items | Empty main list: `empty` | Inline `alert` | `accordion`, `badge` |
| About · skills, education, principles | `GET /public/skills`, `/education`, `/principles` | RSC | Chips / 1 row / 3 cards | Hide | Inline `alert` | `badge`, `card` |
| Projects list | `GET /public/projects?tag&skill` | RSC; filters are links (`?skill=nuxt`) re-rendered on the server | 4 cards | `empty` + "Clear filters" | Inline `alert` | `toggle-group`, `popover` + `command`, `card`, `badge` |
| Case study | `GET /public/projects/:slug` | RSC, `generateStaticParams`, tag `project:{slug}` | Header + cover + 2 stats + paragraphs | 404 via `notFound()` | `error.tsx` segment | `breadcrumb`, `badge`, `alert` (NDA), `collapsible` (mobile TOC) |
| Notes list | First page RSC; search/tag via TanStack Query | RSC + client island | 5 rows | `empty` ("No notes yet" / "No results for …" + Clear) | Inline `alert` + Retry (`refetch`) | `input-group`, `toggle-group`, `pagination`, `spinner` |
| Post | `GET /public/posts/:slug` | RSC, tag `post:{slug}` | Title + meta + paragraphs | 404 | `error.tsx` segment | `breadcrumb`, `badge`, `button` (copy), `separator` |
| Contact | `site.settings.contact*`, `GET /public/contact-topics` | RSC page, client form | n/a | Topic select hidden if 0 topics | Submit error: `alert` above the form, inputs kept | `field`, `input`, `textarea`, `select`, `button`, `alert` |
| Admin shell | `GET /auth/me`, unread count | RSC guard + client | Sidebar skeleton | n/a | Redirect to login on 401 | `sidebar`, `breadcrumb`, `dropdown-menu`, `avatar`, `sonner`, `command` |
| Admin dashboard | `GET /admin/stats?range`, `/admin/messages?limit=5`, `/admin/audit?limit=8`, `/admin/health` | Prefetch + `useSuspenseQuery` per card | Per-card skeletons | Per card: "No views yet", "Inbox zero", … | Per-card `alert` + Retry | `card`, `chart`, `toggle-group`, `badge`, `skeleton`, `empty` |
| Admin lists | `GET /admin/{entity}?…` | Prefetch + TanStack Table | 10 skeleton rows | `empty` + create action | `alert` + Retry | `table`, `checkbox`, `dropdown-menu`, `popover` + `command` (filters), `pagination`, `alert-dialog`, `badge` |
| Admin editors | `GET /admin/{entity}/:id` + Media, Tags, Skills | Prefetch + TanStack Form | Form skeleton | n/a (404 → "Not found" + back) | `alert` + Retry; save errors in `SaveStatus` | `tabs`, `field`, `input`, `textarea`, `select`, `switch`, `calendar`, `popover` + `command`, `resizable`, `sheet`/`drawer` (mobile properties), `progress` |
| Admin site & sections | `GET /admin/site`, `/admin/nav`, `/admin/sections`, `/admin/social`, `/admin/contact-topics` | Prefetch + TanStack Form/Table | Form + rows | `empty` per list | `alert` + Retry | `tabs`, `table`, `switch`, `field`, `button` (move up/down) |

<h3 id="s-5-1">5.1 Home `/[locale]` (v2)</h3>

Purpose: in 10 seconds, who he is, what he ships, proof in numbers, and one way to act. Default section order (from `PageSection`, admin can reorder/hide): **hero → stats → marquee → featured case study → domains → selected work → how I migrate (process) → skills by depth → latest notes → CTA band**. Bands (`--band`) alternate: stats+marquee, domains, process. Legend: `░` = masked grid, `◌` = orb/glow, `[ ]` = button, `‹›` = pill.

Desktop (1440, container 1120):
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ◆ parker.dev      Work  About  Notes  Contact          [Search ⌘K] ‹EN|VI› ◐   │ sticky, blur
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Atmosphere hero
│░  ‹>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS›        ┌──────────────────────────┐ ░│
│░                                                     │  ┌────┐        ┌────┐    │ ░│
│░  I move products forward                            │  │ v1 │──┐ ┌──▶│ v2 │    │ ░│ MigrationDiagram
│░  without breaking them.   ← accent in --primary     │  │Vue2│  ├─┤   │Nuxt│    │ ░│  (nodes pulse on v2)
│░  (text-display 64px)                                │  └────┘  │ │   └────┘    │ ░│
│░                                                     │  ○Pinia ○Query ○PrimeVue │ ░│
│░  Parker Vu · Senior Frontend Engineer. 5 years      │  ○Tailwind ○Playwright   │ ░│
│░  shipping data-dense product UIs… (text-prose)      └──────────────────────────┘ ░│
│░  ● Open to senior roles · Hanoi, GMT+7                                            ░│
│░  [ View case studies → ]glow   [ Download CV ]                                    ░│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│   ┌──┐            ┌──┐              ┌──┐               ┌──┐                       │
│   │▣ │ 5+         │▣ │ 4            │▣ │ 3             │▣ │ 20+                   │ StatBand
│   └──┘ YEARS      └──┘ PRODUCTS     └──┘ CLIENT        └──┘ ASSET CLASSES         │  numbers --primary
│        SHIPPING        SHIPPED           COUNTRIES          RATED (PARTICULA)     │  labels eyebrow
│ ─────────────────────────────────────────────────────────────────────────────────  │
│ ‹Vue 3›‹Nuxt 3›‹TypeScript›‹Pinia›‹TanStack Query›‹PrimeVue›‹Playwright›‹Vitest› ⏸ │ TechMarquee (fades)
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Featured case study                                               All work →    │ SectionHeader
│ ┌───────────────────────────────────────────┐  ‹▣ Fintech / Web3›   v1 → v2     │
│ │ cover 16:10 (project image or diagram)    │  Particula v2                     │
│ │                                           │  Rewriting an RWA ratings app     │
│ │                                           │  without stopping delivery.       │
│ └───────────────────────────────────────────┘  − bundle     412kB → 255kB       │
│                                                + e2e specs      0 → 120          │
│                                                ‹Nuxt 3›‹TanStack›‹Playwright›    │
│                                                Read case study ↗                 │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ▣ Domains   Products I've shipped, grouped by the problem they solve               │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐  │
│ │ ▣amber      1 project  │ │ ▣blue      2 projects  │ │ ▣violet     1 project  │  │ DomainCard ×4
│ │ Fintech / Web3 (ReFi)  │ │ Enterprise platforms   │ │ E-commerce tooling     │  │  (3+1 or 4-col)
│ │ RWA ratings, carbon…   │ │ Samsung SDS ops tools… │ │ Cart migrations across │  │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘  │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Selected work                                                    All projects → │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────┐│
│ │‹▣ Fintech›            ↗  │ │‹▣ E-commerce›         ↗  │ │‹▣ Enterprise› ‹NDA› ↗││ CaseCard ×3
│ │ Particula v2             │ │ Cart migration tool      │ │ MSP Advanced         ││  hover: lift, title
│ │ Nuxt 3 rewrite of…       │ │ Flask APIs + Vue 2 UI…   │ │ Re-platformed MSP…   ││  → primary
│ │ − bundle 412→255kB       │ │ + carts 4 platforms      │ │ + team 15 · KR       ││
│ │ ‹Nuxt 3›‹TanStack›‹+2›   │ │ ‹Flask›‹Vue 2›‹Pinia›    │ │ ‹Vue 2›‹Vuex›        ││
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────┘│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PROCESS›                                                                 │
│ How I migrate a frontend                      ┌────────────────────────────┐      │
│ Short intro (text-prose, muted, 2 lines)       │ 01 Audit  · tokens, states │      │ ProcessFlow
│ ┌───────────────────┐ ┌───────────────────┐    └─────────────┬──────────────┘      │
│ │▣ Migrate in slices│ │▣ Test the contract│    ┌─────────────▼──────────────┐      │
│ │ 2-line body       │ │ 2-line body       │    │ 03 Strangler routes  ◉glow │      │  active step
│ └───────────────────┘ └───────────────────┘    └─────────────┬──────────────┘      │
│ ┌───────────────────┐ ┌───────────────────┐    ┌─────────────▼──────────────┐      │
│ │▣ Server state ≠ UI│ │▣ Write it down    │    │ 05 Cut over · delete v1    │      │
│ └───────────────────┘ └───────────────────┘    └────────────────────────────┘      │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ What I work with      Daily ‹…›   ·   Shipped before ‹…›   ·   Growing ‹…›      │ 3 columns
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Latest notes                                                       All notes →  │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12 · 6 MIN   Vue → React: what transfers, what doesn't  ↗   #react #vue    │ │ PostCard rows ×3
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ CtaBand (glow)
│                                  ✦                                                 │
│             Have a product that needs to move forward?                             │
│             Senior frontend roles or a migration done right.                       │
│             [ ✉ Copy email ]glow  [ in LinkedIn ]  [ ⌥ GitHub ]                    │
├────────────────────────────────────────────────────────────────────────────────────┤
│ © 2026 Parker Vu · Hung Vu Van — Senior Frontend      Work  Notes  CV  ⌥ in ✉ · a1b2c3 │ mono footer
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (390):
```
┌──────────────────────────────┐
│ ◆ parker.dev    ⌘K ◐  ☰      │
├──────────────────────────────┤
│░‹>_ Senior Frontend · 5 yrs›░│ atmosphere (1 orb)
│░ I move products            ░│
│░ forward without            ░│ text-display 40px
│░ breaking them.             ░│ accent line in primary
│░ Parker Vu · Senior FE…     ░│
│░ [ View case studies → ]    ░│ full width
│░ [ Download CV ]            ░│
│░ ┌─────────────────────────┐░│ MigrationDiagram
│░ │ v1 Vue2 ──▶ v2 Nuxt3    │░│ (compact, horizontal)
│░ └─────────────────────────┘░│
├══════════════════════════════┤ band
│ 5+ YEARS    │ 4 PRODUCTS     │ StatBand 2×2
│ 3 COUNTRIES │ 20+ CLASSES    │
│ ‹Vue 3›‹Nuxt 3›‹TS›‹Pinia› ⏸ │ marquee
├══════════════════════════════┤
│ ▣ Featured case study        │
│ [cover]                      │
│ ‹Fintech› Particula v2 v1→v2 │
│ − bundle 412kB → 255kB       │
│ Read case study ↗            │
├══════════════════════════════┤ band
│ ▣ Domains                    │
│ [DomainCard] (stacked ×4)    │
├──────────────────────────────┤
│ ▣ Selected work              │
│ [CaseCard] (stacked ×3)      │
├══════════════════════════════┤ band
│ PROCESS · How I migrate      │
│ 01 → 02 → 03◉ → 04 → 05      │ vertical flow
│ [Feature] [Feature] (1 col)  │
├──────────────────────────────┤
│ Skills · Notes (cards)       │
├──────────────────────────────┤
│░  ✦ Have a product…?        ░│ CTA band
│░  [ Copy email ] [in] [⌥]   ░│
│ footer (2 lines, mono)       │
└──────────────────────────────┘
```
Metric values are placeholders until Parker supplies real ones (1.4 item 1). Stats with no real number stay hidden (`isVisible=false`), never invented.

<h3 id="s-5-2">5.2 About + experience timeline `/[locale]/about` (v2)</h3>

Sections: intro split (avatar card + bio) → stats strip (reuses `StatBand`, compact) → **timeline** with year rail → principles (`01 —` list) → skills by depth → education → CV download card.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header                                                                             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: ABOUT›                                                                   │
│ ┌─────────────────────┐  Hi, I'm Parker (Hung Vu Van).            (text-title H1)  │
│ │   avatar 1:1        │  Bio, 2–3 paragraphs, text-prose, 66ch.                    │
│ │   rounded-xl        │                                                            │
│ │ Hanoi · GMT+7       │  ‹Vietnamese› ‹English› ‹Works with KR · US · UK teams›    │
│ │ [Download CV ↓]     │                                                            │
│ └─────────────────────┘                                                            │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ 5+ YEARS · 4 PRODUCTS · 3 COUNTRIES · 20+ ASSET CLASSES        (compact StatBand)  │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Experience                                                                       │
│  2024 ─ NOW  ●━━ Kobizo · Frontend Developer        ‹▣ Fintech›  Case study ↗      │
│  (sticky)    ┃   Particula: main frontend, led v1 → v2.                            │
│              ┃   ▹ highlight  ▹ highlight  ▹ highlight                             │
│              ┃   ‹Vue 3›‹Nuxt 3›‹PrimeVue›‹TanStack›‹Playwright›                   │
│  2022 ─ 2024 ●━━ CMC Global · Frontend Developer    ‹▣ Enterprise› ‹NDA›           │
│              ┃   Samsung SDS: MSP Advanced, MSP App Expansion                      │
│  2021 ─ 2022 ●━━ LitGroup · Fullstack Developer     ‹▣ E-commerce›                 │
│              ┣ Frontend · 2022 · Vue 2, TS, Pinia                                  │
│              ┗ Backend  · 2021 · Flask, Laravel, store APIs                        │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PRINCIPLES›  How I work                                                  │
│ 01 — Migrate in slices        02 — Test the contract, not the pixels               │
│ 03 — Server state is not UI state   04 — Write the decision down                   │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Skills   DAILY ‹…›   SHIPPED BEFORE ‹…›   GROWING ‹…›                            │
│ ▣ Education  Hanoi University of Industry · Computer Science · 2017–2021           │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile:
```
┌──────────────────────────────┐
│ ABOUT                        │
│ [avatar 96]  Hi, I'm Parker  │
│ Bio (prose)                  │
│ ‹VI›‹EN›‹KR·US·UK teams›     │
│ [ Download CV ↓ ]            │
├══════════════════════════════┤
│ StatBand 2×2                 │
├══════════════════════════════┤
│ ● 2024 — now                 │ year on top of each item
│ ┃ Kobizo · Frontend Dev      │
│ ┃ ▹ … ▹ … ‹chips›            │ highlights in accordion
│ ● 2022 — 2024 CMC Global     │
│ ● 2021 — 2022 LitGroup       │
├══════════════════════════════┤
│ 01 — … 02 — … (1 col)        │
│ Skills · Education           │
└──────────────────────────────┘
```

<h3 id="s-5-3">5.3 Projects list `/[locale]/projects` (v2)</h3>

Header with eyebrow + H1 + intro, a **domain filter row** (domain pills with counts, URL `?domain=`) and a tech combobox; then a featured wide `CaseCard`, then a 2-col (desktop) grid. Each card shows a domain pill, `↗`, top `DiffStat`, chips.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header                                                                             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: WORK›                                                                    │
│ Case studies                                                       (text-title)    │
│ Four products I moved forward, 2021 — now.                         (text-prose)    │
│ ‹All 4› ‹▣ Fintech 1› ‹▣ Enterprise 2› ‹▣ E-commerce 1›          [Tech: any ▾]    │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐  ‹▣ Fintech / Web3›  v1 → v2            ↗   │ │ featured, wide
│ │ │ cover 16:10                   │  Particula v2                              │ │
│ │ └───────────────────────────────┘  Tagline (2 lines) · Kobizo · 2024 — now   │ │
│ │                                    − bundle 412→255kB   + specs 0→120         │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ │
│ │‹▣ E-commerce›                      ↗  │ │‹▣ Enterprise› ‹NDA›                ↗  │ │
│ │ Cart migration tool                   │ │ MSP Advanced (Samsung SDS)            │ │
│ │ Flask APIs + Vue 2 UI for…            │ │ Re-platformed MSP App logic…          │ │
│ │ + platforms 4 · LitGroup · 2021–22    │ │ team 15 · CMC Global · 2022–24        │ │
│ │ ‹Flask›‹Laravel›‹Vue 2›‹Pinia›        │ │ ‹Vue 2›‹Vuex›                         │ │
│ └───────────────────────────────────────┘ └───────────────────────────────────────┘ │
│ Empty filter: empty state "No case studies for Svelte" + [Clear filters]          │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: filter pills scroll horizontally (with edge fade), tech combobox below, cards stacked, featured card = normal card with the cover on top.

<h3 id="s-5-4">5.4 Project case study `/[locale]/projects/[slug]` (v2)</h3>

Order: back link → pills (domain, NDA) → H1 + tagline → meta grid (mono eyebrow labels) → cover → **key facts 2×2** → Outcome stats → sections each with an eyebrow (`SUMMARY` Problem, `LIMITS` Constraints, `SCOPE` Requirements as two cards, `HOW` Approach + diagram, `TRADE-OFFS` Key decisions as cards, `RESULT` Outcome, `RETRO` What I'd do differently) → fact chips → "More in <domain>" cards → prev/next. Sticky TOC + reading progress bar. The hero area may use a faint grid (no orbs); the prose area is plain `--background`.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (2px reading progress)                     │
├────────────────────────────────────────────────────────────────────────────────────┤
│░ ← All case studies                                                               ░│ faint grid
│░ ‹▣ Fintech / Web3›  ‹v1 → v2›                                                    ░│
│░ Particula v2: Vue 2 → Nuxt 3                                     (text-title)    ░│
│░ Rewriting an RWA ratings app without stopping delivery.          (text-prose)    ░│
│░ CLIENT        ROLE              TEAM     PERIOD          STACK                   ░│ eyebrow labels
│░ Particula     Main frontend     6        Feb 2024 — now  Nuxt 3 · TanStack · …   ░│
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────── cover 21:9 (rounded-xl) ─────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┬────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │ ON THIS PAGE           │
│ │● Strangler migration:   │ │● TanStack Query replaced│   │ ▌Key facts             │ KeyFacts 2×2
│ │  Nuxt 3 beside Vue 2    │ │  Axios as server state  │   │  Outcome               │
│ └─────────────────────────┘ └─────────────────────────┘   │  Problem               │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │  Requirements          │
│ │● Core component library │ │● 120 Playwright specs   │   │  Approach              │
│ └─────────────────────────┘ └─────────────────────────┘   │  Decisions             │
│ RESULT                                                    │  Retro                 │
│ ## Outcome   ┌ − bundle 412→255kB ┐ ┌ + specs 0→120 ┐     │                        │
│ SUMMARY                                                   │ STACK                  │
│ ## Problem   prose 18px/1.75, 66ch, ▹ bullets             │ ‹Nuxt 3›‹Vue 3›…       │
│ SCOPE                                                     │                        │
│ ## Requirements                                           │ Live site ↗            │
│ ┌ Functional ─────────────┐ ┌ Non-functional ─────────┐   │                        │
│ │ ▹ ratings dashboards    │ │ ▹ no stale ratings      │   │                        │
│ └─────────────────────────┘ └─────────────────────────┘   │                        │
│ HOW · ## Approach   prose + diagram (figure + caption)    │                        │
│ TRADE-OFFS · ## Key decisions                             │                        │
│ ┌ Axios → TanStack Query ─────────────────────────────┐   │                        │
│ │ OPTIONS · CHOICE · WHY · COST  (eyebrow labels)     │   │                        │
│ └─────────────────────────────────────────────────────┘   │                        │
│ RETRO · ## What I'd do differently                        │                        │
│ ‹fact chip›‹fact chip›‹fact chip›                         │                        │
├───────────────────────────────────────────────────────────┴────────────────────────┤
│ More in Fintech / Web3   [CaseCard] [CaseCard]                                     │
│ ← MSP Advanced                                          Cart migration tool →      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: meta grid becomes 2 columns; key facts 1 column; TOC becomes a sticky "On this page ▾" `collapsible` under the header; requirement cards stack.

<h3 id="s-5-5">5.5 Blog list `/[locale]/notes` and post `/[locale]/notes/[slug]` (v2)</h3>

List: eyebrow `WRITING` + H1 + intro → search + tag chips → year groups of `PostCard` rows (card with mono `OCT 12, 2026 · 6 MIN`, title + `↗`, excerpt, `#tag` chips). Featured post (`isFeatured`) gets a wider card with cover on top of the list.

List desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ WRITING                                                                            │
│ Notes                                     [⌕ Search notes…                 ⌘K ]   │
│ Things I learned shipping frontends.                                               │
│ ‹all 12› ‹#vue› ‹#react› ‹#nuxt› ‹#testing› ‹#architecture›                         │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 2026 ──────────────────────────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12, 2026 · 6 MIN                                                           │ │
│ │ Vue → React: what transfers, what doesn't ↗                    (subheading)    │ │
│ │ Excerpt, 2 lines, text-body muted…                                             │ │
│ │ #react #vue                                                                    │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ SEP 30, 2026 · 8 MIN · TanStack Query in Nuxt 3 ↗ … ───────────────────────────┐ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Post: unchanged reading column (66ch, plain background) — v2 adds the eyebrow `NOTE · #react`, reading progress bar, `▹` bullets, callouts with an icon tile, code block header with language badge + copy, a "Key takeaways" card at the end (from `Post.takeaways`, optional), and related `PostCard`s.

Post desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━ (progress)                                                   │
├────────────────────────────────────────────────────────────┬───────────────────────┤
│ ← Notes                                                    │                       │
│ NOTE · #REACT #VUE                                         │ ON THIS PAGE          │
│ Vue → React: what transfers, what doesn't   (text-title)   │ ▌Reactivity           │
│ Oct 12, 2026 · Updated Oct 14 · 6 min · Đọc bằng tiếng Việt│  Effects              │
│ ─────────────────────────────────────────────────────────  │  Data fetching        │
│ prose 18/1.75, 66ch                                        │                       │
│ ┌ ▣ Callout ────────────────────────────────────────────┐  │ Copy link             │
│ │ Treat React state as a value you replace…             │  │                       │
│ └───────────────────────────────────────────────────────┘  │                       │
│ ┌ components/Counter.tsx ─────────── ‹tsx› [copy] ┐        │                       │
│ │ code 15px JetBrains Mono, diff lines tinted     │        │                       │
│ └─────────────────────────────────────────────────┘        │                       │
│ ┌ KEY TAKEAWAYS ────────────────────────────────────────┐  │                       │
│ │ ▹ … ▹ … ▹ …                                           │  │                       │
│ └───────────────────────────────────────────────────────┘  │                       │
├────────────────────────────────────────────────────────────┴───────────────────────┤
│ Related notes  [PostCard] [PostCard] [PostCard]          ← Prev        Next →      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (list and post): cards full width; search above tags; tags scroll horizontally; TOC collapsible; code blocks scroll horizontally inside a focusable region.

<h3 id="s-5-6">5.6 Contact `/[locale]/contact` (v2)</h3>

Split layout on a faint grid: left = eyebrow, H1, intro (`SiteSettings.contactIntro`), reply-time note, channel cards (Copy email, LinkedIn, GitHub, each with icon tile), availability badge; right = form card on `--card-glass`. Success replaces the form with a status card (check icon tile, message, "Back to case studies").

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│░ CONTACT                                    ┌────────────────────────────────────┐░│
│░ Let's talk about your product.             │ Name *            Email *          │░│
│░ Senior frontend roles or a migration       │ [              ]  [              ] │░│
│░ done right. (text-prose)                   │ Topic                              │░│
│░ ● Open to senior roles · replies in 2 days │ [ Job opportunity          ▾ ]     │░│
│░ ┌───────────────────────────────────────┐  │ Message *                          │░│
│░ │ ▣ Email        [ Copy email ]         │  │ [                                ] │░│
│░ ├───────────────────────────────────────┤  │ [                                ] │░│
│░ │ ▣ LinkedIn     linkedin.com/in/…  ↗   │  │ 0 / 2000                           │░│
│░ ├───────────────────────────────────────┤  │ [ Send message → ]glow             │░│
│░ │ ▣ GitHub       github.com/parker2808 ↗│  └────────────────────────────────────┘░│
│░ └───────────────────────────────────────┘                                        ░│
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: channel cards first (stacked), form below, full-width submit. Validation: inline errors under fields + summary `alert` on submit; inputs keep their values on error.

<h3 id="s-5-7">5.7 Admin dashboard `/admin`</h3>

KPIs (7/30/90 days): views, unique visitors, contact messages, published posts; views chart; top pages; inbox preview (realtime); recent activity (audit); content health (drafts, missing vi translations, images without alt).

Mobile:
```
┌───────────────────────────────┐
│ ☰  Dashboard          🔔3  (P)│
├───────────────────────────────┤
│ [7d][30d][90d]                │
│ ┌─────────────┐┌─────────────┐│
│ │Views 2,140  ││Visitors 980 ││
│ │▲ 12% ╱╲╱    ││▲ 4%  ╱╲_    ││
│ └─────────────┘└─────────────┘│
│ ┌─────────────┐┌─────────────┐│
│ │Messages 6   ││Published 2  ││
│ └─────────────┘└─────────────┘│
├───────────────────────────────┤
│ Inbox (3 new)        View all │
│ ● Ana · Job opportunity · 2m  │
├───────────────────────────────┤
│ Content health                │
│ 2 drafts · 3 missing VI · 1 alt│
├───────────────────────────────┤
│ Activity                      │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ ◆ Parker ▾ │ Dashboard                       [7d][30d][90d]  🔔3 (P)│
│ 🔍 Search ⌘K├─────────────────────────────────────────────────────────┤
│            │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐        │
│ Dashboard  │ │Views     ││Visitors  ││Messages  ││Published │        │
│ Inbox    3 │ │2,140 ▲12%││980  ▲4%  ││6    ▼1   ││2         │        │
│ ─ Content  │ └──────────┘└──────────┘└──────────┘└──────────┘        │
│ Projects   │ ┌───────────────────────────────────┐┌────────────────┐ │
│ Posts      │ │ Views (area chart, 30d)           ││ Top pages      │ │
│ Experience │ │                                   ││ /projects/pa…  │ │
│ Skills     │ │                                   ││ /notes/vue-…   │ │
│ Media      │ └───────────────────────────────────┘└────────────────┘ │
│ ─ Insights │ ┌───────────────────────┐┌──────────────────────────────┐│
│ Analytics  │ │ Inbox          View → ││ Recent activity              ││
│ Audit log  │ │ ● Ana  Job opp.   2m  ││ Parker published "Vue → R…"  ││
│ ─          │ │   Minh Freelance  1d  ││ Parker updated Particula v2  ││
│ Settings   │ └───────────────────────┘└──────────────────────────────┘│
│            │ Content health: 2 drafts · 3 missing VI · 1 image no alt │
└────────────┴─────────────────────────────────────────────────────────┘
Realtime: new message → toast bottom-right "New message from Ana [Open]", Inbox badge 3→4.
```

<h3 id="s-5-8">5.8 Admin list/table `/admin/posts` (same pattern for projects, skills, experience, media, inbox, audit)</h3>

Mobile (table becomes a list of rows, filters in a sheet):
```
┌───────────────────────────────┐
│ ☰  Posts              [+ New] │
├───────────────────────────────┤
│ [🔍 Search ] [Filter (2)] [⋯] │
│ Status: Draft ✕  Tag: react ✕ │
├───────────────────────────────┤
│ ○ Vue → React: what transfers │
│   Draft · EN ● VI ○ · 2h ago  │
│ ───────────────────────────── │
│ ● TanStack Query in Nuxt 3    │
│   Published · EN ● VI ● · 3d  │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar    │ Posts                        [Views ▾]  [+ New post  C] │
│            ├─────────────────────────────────────────────────────────┤
│            │ [🔍 Filter posts…   /]  Status is Draft ✕  + Filter      │
│            ├──┬──────────────────────────┬──────────┬───────┬───────┬─┤
│            │☐ │ Title ↓                  │ Status   │ Lang  │Updated│⋯│
│            ├──┼──────────────────────────┼──────────┼───────┼───────┼─┤
│            │☐ │ Vue → React: what trans… │ ○ Draft  │ EN VI○│ 2h    │⋯│
│            │☑ │ TanStack Query in Nuxt 3 │ ● Publ.  │ EN VI │ 3d    │⋯│
│            │☑ │ Playwright at Particula  │ ◷ Sched. │ EN    │ 5d    │⋯│
│            ├──┴──────────────────────────┴──────────┴───────┴───────┴─┤
│            │ 1–25 of 42                                 ‹  1 2  ›     │
│            │ ┌──────── 2 selected · Publish · Archive · Delete · ✕ ─┐│
└────────────┴─────────────────────────────────────────────────────────┘
Keys: j/k move · x select · Enter open · C new · / search · ⌫ delete (confirm)
```

<h3 id="s-5-9">5.9 Admin editor `/admin/posts/[id]` (projects use the same shell with case-study section fields)</h3>

Mobile (editor full screen; properties in a bottom sheet):
```
┌───────────────────────────────┐
│ ←  Saved 4s ago   [⚙] [Publish]│
├───────────────────────────────┤
│ [EN ●] [VI ○]                 │
│ Title                         │
│ Vue → React: what transfers   │
│ [Write][Preview]              │
│ B I H 🔗 </> 🖼               │
│ ┌───────────────────────────┐ │
│ │ markdown…                 │ │
│ │                           │ │
│ └───────────────────────────┘ │
│ 1,240 words · 6 min           │
└───────────────────────────────┘
```

Desktop (`lg`: editor + properties; `2xl`: adds live preview):
```
┌────────────┬────────────────────────────────────────┬────────────────┐
│ sidebar    │ Posts / Vue → React     Saved 4s ago   │ [Preview] [Pub]│
│            ├────────────────────────────────────────┼────────────────┤
│            │ [EN ●] [VI ○ missing title, body]      │ Status  ○ Draft│
│            │ Title                                  │ Slug  vue-react│
│            │ Vue → React: what transfers            │ Tags  [react]+ │
│            │ Excerpt                                │ Publish  date ▾│
│            │ One-sentence summary…                  │ Featured  ☐    │
│            │ ┌ B I H1 H2 🔗 </> 🖼 callout  [Split]┐│ Cover   [img]  │
│            │ │ ## Reactivity                       ││ SEO title      │
│            │ │ In Vue, `ref()`…                    ││ SEO desc  0/160│
│            │ │ /  ← slash menu: image, code, callout││ ────────────── │
│            │ │ [drop image to upload ▓▓▓░ 60% ✕]   ││ History        │
│            │ └─────────────────────────────────────┘│ Parker · 2h    │
│            │ 1,240 words · 6 min read               │ Created · 1d   │
└────────────┴────────────────────────────────────────┴────────────────┘
Publish is blocked with an inline list when required fields are missing (per locale) or images lack alt.
⌘S save now · ⌘↵ publish · ⌘⇧P preview · Esc leaves (confirm if unsaved).
```

---

<h3 id="s-5-10">5.10 Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics)</h3>

Where everything that is not a project/post/experience/skill gets edited, so no visible text needs a code change. Tabs: General · Navigation · Sections · Social · Contact. Reordering is drag-and-drop **and** "Move up / Move down" buttons (keyboard and screen-reader friendly); each move is an optimistic `sortOrder` update.

Mobile:
```
┌───────────────────────────────┐
│ ☰  Site                [Save] │
├───────────────────────────────┤
│ [General][Nav][Sections] ▸    │
├───────────────────────────────┤
│ Home sections     [EN][VI]    │
│ ≡ Hero            ● shown  ⋯  │
│ ≡ Featured        ● shown  ⋯  │
│ ≡ Selected work   ● shown  ⋯  │
│ ≡ Skills          ○ hidden ⋯  │
│ ≡ Latest notes    ● shown  ⋯  │
│ ⋯ → Move up · Move down · Edit│
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar    │ Site                                      Saved 3s ago   │
│            │ [General] [Navigation] [Sections] [Social] [Contact]     │
│            ├─────────────────────────────────────────────────────────┤
│            │ Page [Home ▾]                                            │
│            │ ┌──┬───────────────┬──────────────────────┬────────┬───┐ │
│            │ │≡ │ Section       │ Title (EN · VI)       │ Shown  │   │ │
│            │ ├──┼───────────────┼──────────────────────┼────────┼───┤ │
│            │ │≡ │ hero          │ (uses profile)        │ [●]    │ ⋯ │ │
│            │ │≡ │ featured      │ Featured case study · │ [●]    │ ⋯ │ │
│            │ │≡ │ work          │ Selected work · Dự án │ [●]    │ ⋯ │ │
│            │ │≡ │ skills        │ What I work with · ○  │ [ ]    │ ⋯ │ │
│            │ └──┴───────────────┴──────────────────────┴────────┴───┘ │
│            │ Edit row → sheet: title EN/VI, intro EN/VI, CTA label    │
└────────────┴─────────────────────────────────────────────────────────┘
```
Sidebar gains a **Site** group: Site settings, Profile, Media. The admin UI itself is English-only chrome; every content field shows EN and VI side by side via locale tabs.

<h3 id="s-5-11">5.11 Admin changes for v2 (small; the admin layout stays as is)</h3>

The admin keeps its Linear-style calm: **no atmosphere, bands, orbs, reveals or marquee in `/admin`**. It only gains the editors and checks the richer public site needs.

| Where | Change | Components |
| --- | --- | --- |
| Sidebar → Content | New lists: **Stats**, **Domains**, **Process steps**. Same `DataTable` + sheet editor pattern as Skills (drag + Move up/down, `isVisible` switch, optimistic reorder) | `table`, `sheet`, `switch` |
| Stats editor | Label EN/VI, `source` select; `value` + `suffix` shown only for `MANUAL`; read-only preview of the computed value for the others | `select`, `field`, `input` |
| Domains editor | Name/description EN/VI, **hue picker** (5 swatches with names, `radio-group`, shows the light and dark pill preview), **icon picker**, read-only project count | `radio-group`, `popover` + `command` |
| Icon picker (shared) | Searchable grid of the allowlisted lucide icons; stores `iconKey`; keyboard-navigable (arrow keys in the grid, Enter selects) | `popover`, `command`, `toggle-group` |
| Profile editor | New fields: hero kicker, headline accent (inline error if it is not a substring of the headline, per locale) | `field`, `input` |
| Project editor | New "Card & facts" tab: domain select, key facts (2–4 lines, counter), fact chips (tag input, ≤ 6) | `select`, `textarea`, `badge` |
| Post editor | "Key takeaways" field (≤ 5 lines) under the body | `textarea` |
| Skills table | New "Marquee" switch column; header shows "n of 6+ needed" | `switch` |
| Social links | New "Show in CTA" switch (max 2, others disabled when 2 are on) | `switch`, `tooltip` |
| Site → General | New switches: "Ambient effects (grid, glow)" and "Animate tech marquee" | `switch` |
| Site → Sections | New keys `stats`, `marquee`, `domains`, `process`, `principles` appear as rows with the existing reorder/hide controls | existing |
| Publish validation | Blocks publish when any EN field contains `{{`, `TODO`, `TBD` or `lorem` (the reference site shows a raw `{{TODO}}` in production; ours must not), and when a project has no domain | `alert` list in the editor |
| Dashboard → Content health | Adds lines: "Projects without a domain", "Case studies with < 2 key facts", "Stats hidden (fewer than 2 visible)", "Marquee needs 6+ skills" | existing card |
| Live preview (`2xl`) | Renders the real public components (`CaseCard`, `KeyFacts`, `StatBand`) with the draft props, in light and dark (toggle in the preview header) | `toggle-group` |

---

<h2 id="s-6">6. Lab-day mapping (high level)</h2>

> **In this chapter:** Each day's Lab "Drill" builds one slice, aligned with that day's topic in `plans/study-plan-30d-redesign.md` section 3.

Each day's Lab "Drill" builds one slice, aligned with that day's topic in `plans/study-plan-30d-redesign.md` section 3. Repo: `portfolio/` monorepo (`apps/web` Next.js, `apps/api` NestJS + Prisma, `packages/ui` shadcn + product components, `packages/contracts` zod schemas, types, query keys, fixtures; `docker-compose.yml`).

How the two tracks fit together:
- **Backend climbs the ladder in section 1.6, one rung at a time, from Docker up.** No backend day assumes a concept that a later day teaches. Each backend step names the one concept it teaches.
- **Frontend Days 1–6 build components against fixtures** (stories/tests only). From Day 7 every page reads from the API; no page ever ships hard-coded content.
- Admin endpoints are open on `localhost` only until Day 16 adds guards (the API binds to `127.0.0.1` in dev until then).
- The "Done when" column becomes the lab `intro` callout's Output.

| Day | Plan topic | Frontend slice | Backend / DB step (concept) | Done when |
| --- | --- | --- | --- | --- |
| 1 | Inventory the UI system | Monorepo; shadcn init in `packages/ui`; theme CSS (3.6–3.7); fonts; type specimen page | **Docker:** `docker compose up` MySQL 8 + Adminer; `.env`, volume, port (rung 1) | Specimen renders light/dark with the vi QA string; Adminer logs in |
| 2 | UI states | `skeleton`, `empty`, `alert`, `SectionBoundary`, `StatusPill` stories | **SQL by hand** in Adminer: `CREATE TABLE`, `INSERT`, `SELECT`, `JOIN`, primary/foreign key; then drop it (rung 2) | State stories + `day-02.sql` |
| 3 | Accessible forms + keyboard | Contact form: TanStack Form + shadcn `field`, inline + summary errors, skip link (fixture topics) | **Nest basics:** `nest new`, module/controller/service, `GET /health` (rung 3) | Form a11y checks pass; `curl /health` → `ok` |
| 4 | Responsive data-heavy UI | `DataTable` (TanStack Table + `table`), mobile row list, sticky header (fixtures) | **Prisma:** `SiteSettings`, `Profile`, `NavItem`, `SocialLink`, `PageSection`; first migration; read the SQL; seed (rung 4) | Table at 360/1280px; seeded rows visible in Prisma Studio |
| 5 | Overlays, focus, tests | `dialog`, `alert-dialog`, `command` palette, `sonner`; Vitest + Testing Library | **Read API:** `PrismaService`, `GET /public/site?locale` (server picks the language), global exception filter with `requestId` (rung 5) | Palette tests green; `/public/site` returns localized JSON |
| 6 | Component APIs with TS | `ProjectCard`, `VersionTag`, `DiffStat`, badge variants, typed from `packages/contracts` | **Validation:** zod schemas in contracts + `ZodValidationPipe`; `PATCH /admin/profile` (rung 5) | Invalid PATCH → `400` with `fieldErrors` |
| 7 | Week 1 review | Home from `/public/site` in RSC: section registry, ordering, hidden empty sections, `error.tsx` | **Review:** draw the ERD from 1.5; explain migration vs seed aloud | Home renders only DB content; toggling `isVisible` in Adminer hides a section |
| 8 | JS execution model | Post TOC scroll-spy (`IntersectionObserver`), debounced search input (fixtures) | **Relations 1-to-many:** `Experience`, `Education`, `Principle`, `SkillCategory` → `Skill`; seed from CV (rung 6) | Timeline seed data matches the CV |
| 9 | Promises, cancellation | `apiClient` + `ApiError`, TanStack Query provider, `qk` factory, `signal` passed to fetch | **Many-to-many:** `Project`, `ProjectMetric`, `ProjectImage`, `Project↔Skill`; `include` vs `select` (rung 6) | Aborted request visible in DevTools; 4 projects seeded |
| 10 | TS for frontend models | Public vs admin response types; `next-intl` chrome messages en/vi | **Posts + tags**; public list endpoints return `PUBLISHED` only, localized (rung 5–6) | `GET /public/posts?locale=vi` falls back to EN with `lang` |
| 11 | Vue reactivity → hooks | `useDebouncedValue`, `useMediaQuery` vs composables; admin projects list on the real API (`useSuspenseQuery`) | **Write API pattern** on projects: create, update, archive; `404`; unique slug → `409` (rung 7) | Create/edit/archive a project from the admin |
| 12 | Nuxt rendering + fetching | Rendering matrix (4.6) vs Nuxt; projects list + case study in RSC with tags | **Query params:** pagination, sort, filter parsed with zod (rung 5) | `rendering.md`; `/projects?skill=nuxt` works |
| 13 | State ownership, cache | URL-driven list state; optimistic status toggle and reorder | **Remaining CRUD** (posts, experience, skills, nav, sections, social, topics); reorder in a **transaction** (rung 7) | Toggle rolls back on forced `500` |
| 14 | Week 2 review: performance | Lighthouse budget, `next/image`, font loading, bundle check | **Indexes + `EXPLAIN`**, Prisma query log, fix one N+1 (rung 8) | Budget report; one query plan before/after |
| 15 | React mental model | About + `Timeline` as RSC, `accordion` island | **Users + passwords:** `User` model, `argon2`, seed owner from env, `POST /auth/login` creates a `Session` row + cookie (rung 9) | Login sets an httpOnly cookie |
| 16 | State, refs, controlled inputs | `MarkdownEditor` (CodeMirror) + TanStack Form autosave + `SaveStatus`; login page | **Guards:** `AuthGuard`, `@Roles` + `RolesGuard`, `GET /auth/me`, logout; admin routes now protected; `409` on stale `updatedAt` (rung 9) | Viewer cannot publish (`403`); autosave survives a refresh |
| 17 | Effects, cleanup, boundaries | `EventSource` in admin layout → toast + inbox invalidation; cleanup on unmount; `error.tsx` per segment | **Contact + SSE:** `POST /public/contact`, `@nestjs/throttler`, `@Sse()` event stream (rung 10) | Message sent from public page appears live in admin |
| 18 | App Router layouts | `[locale]` segment, `(site)` and `admin` layouts, server-side session check, `loading.tsx`; media library UI with progress + cancel | **Uploads:** `FileInterceptor`, size/MIME limits, `Media` rows, files on a volume (rung 10) | Upload + cancel works; locale switch on all pages |
| 19 | Next data fetching + cache | Case study + post with `generateStaticParams`; `POST /api/revalidate` route; admin `HydrationBoundary` prefetch | **Publish workflow:** publish sets `publishedAt`, API calls the revalidate webhook (rung 10) | Publishing updates the public page in seconds |
| 20 | Server Actions, middleware, SEO | Contact via Server Action mutation (works without JS); `generateMetadata` from SEO fields; OG images; sitemap; RSS | **SEO data:** sitemap/slug endpoint, `SiteSettings` defaults (rung 10) | OG preview shows DB title; form works with JS off |
| 21 | Week 3 review: Next slice | Playwright e2e: draft → publish → public page | **Ops:** all 3 services in Compose, health checks, `prisma migrate deploy` (rung 11) | `docker compose up` runs the whole site; e2e green |
| 22 | Design an admin dashboard | Dashboard cards, `chart`, period `toggle-group`, content health | **Analytics:** `PageView` beacon endpoint, `GROUP BY` day aggregates (rung 10) | Dashboard shows real views |
| 23 | Data-heavy surfaces | Audit log with `useInfiniteQuery` + TanStack Virtual; bulk actions bar | **Audit log** written by services; cursor pagination; bulk update in a transaction (rung 10) | 5,000 seeded audit rows scroll smoothly |
| 24 | Security, release, resilience | CSP + security headers, secure cookie flags in prod; CI (lint, test, e2e) | **Hardening:** `Origin` check, session expiry, `mysqldump` backup + restore test (rung 11) | Restore from backup works; CI green |
| 25 | Behavioral: intro, impact | No code: write hero, about, profile in the admin using 1.1–1.2; enter real metrics | n/a | Content saved in CMS (EN) |
| 26 | Behavioral: project, React gap | Write Particula + "This portfolio" case studies in the editor | n/a | 2 case studies published |
| 27 | Leadership + collaboration | Write Samsung SDS (NDA-safe) + cart-migration case studies; first note "Vue → React" | n/a | 2 case studies + 1 post published |
| 28 | Mock round 1 | A11y audit (axe, keyboard, screen reader on 3 pages); fix list | n/a | Audit report, fixes merged |
| 29 | Weak spots + company fit | vi translations entered in the CMS; 404/500 pages; launch checklist | n/a | Lighthouse ≥ 95 on 4 key pages; no "EN" badges left on key pages |
| 30 | Full mock + retro | Production deploy; retro post published via the CMS; interview demo walkthrough | Deploy runbook | Live site + retro note |

Notes for the executing agent:
- Review and mock days (7, 14, 21, 28, 30) keep their timed-agenda Drill; the build step is one timed item in it.
- The Lab tab budget (210 words) means each Drill names the slice and its done-check only. Specs live here; link sections, e.g. "Spec: portfolio-design-system §5.4".
- Backend steps should link the glossary (1.6) the first time a term appears.
- Days 25–27 reuse the behavioral content: the stories Parker rehearses are the case studies he publishes.

**v2 rich-layer work, folded into the existing days** (no new days; each item is one extra step in that day's Drill):

| Day | Added frontend step | Added backend / DB step | Done when |
| --- | --- | --- | --- |
| 1 | v2 tokens: tinted dark, `--band`, `--border-strong`, atmosphere tokens, domain hues, `text-display`, `text-eyebrow` on the specimen page | n/a | Specimen shows bands, hue pills and eyebrows in light and dark, all AA |
| 2 | `Atmosphere`, `Band`, `Eyebrow`, `SectionHeader` stories; `useInView` hook + reveal utility with the reduced-motion fallback | n/a | Story toggles reduced motion and reduced transparency; nothing moves |
| 6 | `CaseCard` (hover lift, domain pill, `DiffStat`), `DomainCard`, `StatBand`, `KeyFacts`, `FactChips`, `PostCard` | n/a | Cards pass keyboard hover parity (focus-within looks like hover) |
| 7 | Home v2 section order from the registry: stats, marquee, domains, process, CTA band | Seed new `PageSection` keys | Hiding `marquee` in Adminer removes it |
| 8 | `ProcessFlow`, `PrincipleList`, `TechMarquee` (pause button) | `ProfileStat`, `ProcessStep` tables; `Principle.iconKey`, `Skill.showInMarquee` (1-to-many recap) | Stats band shows computed years from `careerStartDate` |
| 9 | `MigrationDiagram` SVG from featured project data | `Domain` table + `Project.domainId` FK; `keyFacts`, `factChips` columns; seed 4 domains | `GET /public/domains` returns project counts via `_count` |
| 10 | n/a | `Post.takeaways`; publish validation for `{{`, `TODO`, `lorem` | Publishing a post with `TODO` → `400` with `fieldErrors` |
| 13 | Admin Stats/Domains/Process lists; icon + hue pickers | CRUD for the 3 new tables | Reorder domains; home order updates after revalidate |
| 14 | Motion and paint budget: hero LCP ≤ 2.0s, orbs on a composited layer, CLS 0 from count-up and reveal | n/a | Lighthouse perf ≥ 95 with ambient effects on |
| 28 | Reduced-motion and reduced-transparency audit on home, case study, post | n/a | Audit notes show every effect's fallback working |

---

<h2 id="s-7">7. Mockup rebuild brief (v2)</h2>

> **In this chapter:** For the model rebuilding `mockups/portfolio/`.

| § | Section |
| --- | --- |
| 7.1 | Global rules (apply to every public screen) |
| 7.2 | Screens |

For the model rebuilding `mockups/portfolio/`. Parker's verdict on v1 was "too bare/plain". The v1 screens (`01`–`09`) were one neutral surface, small headings, flat cards and no imagery. **The new screens must look richer on a quick glance** while keeping every type rule in 3.2 and every contrast pair in 3.1. Follow sections 2, 3, 4.7 and 5.1–5.6 of this spec. Do not copy the reference site's layout, copy or green palette.

<h3 id="s-7-1">7.1 Global rules (apply to every public screen)</h3>

| # | Must be visibly different from v1 | Spec |
| --- | --- | --- |
| G1 | Sections alternate between `--background` and full-width `--band` stripes with `border-y`; no long run of same-color sections | 3.1, 4.4 |
| G2 | Dark mode uses the **jade-tinted** neutrals (`#0A0F0E` bg, `#111817` card), not v1's gray `#0B0C0E` | 3.1, 3.6 |
| G3 | Home hero and CTA band sit on the masked 44px grid with 1–2 soft orbs (`--glow`); no atmosphere anywhere else | 3.1b, 4.7 `Atmosphere` |
| G4 | Every section title has a mono uppercase **eyebrow** above it and, on home, a 28px **icon tile** beside it | 3.2 `text-eyebrow`, 4.7 `SectionHeader` |
| G5 | Cards have a visible hover/focus state: lift −2px, `--border-strong`, `--shadow-2`, title turns `--primary`, `↗` corner arrow. One card per screen is captured in the hover state (add `.is-hover` to it) | 3.4 motion table |
| G6 | Projects carry a **domain pill** (icon + name) in its hue; hues come from the 5-hue table only | 3.1b |
| G7 | Icons are inline SVGs copied from lucide (stroke 1.75, 16/20px). No emoji, no icon fonts | 4.7 |
| G8 | Body and prose sizes stay exactly as in 3.2 (16/18px, 1.6/1.75). "Richer" comes from surfaces, cards and icons, **never** from smaller, lighter or lower-contrast text | 3.2 |
| G9 | Content: CV-based placeholders as in v1 (Parker Vu / Hung Vu Van, Hanoi, `parker2808`, Particula v2, LitGroup cart migration, Samsung SDS MSP, This portfolio). **No phone or email**: show `<email>` where an address would appear, and the "Copy email" button copies the placeholder | 1.5 |
| G10 | Each screen exists in light; home, case study and post also in dark (`?dark=1`) | 3.6 |

**Screenshot spec:** Playwright + system Chrome, DPR 2, full page, widths 1440 (desktop) and 390 (mobile). Capture with `reducedMotion: 'no-preference'` but freeze animations in their final state (add a `.capture` class on `<html>` that sets `animation: none !important; transition: none !important` and shows revealed content and final count-up values), so orbs, glows and hover states are visible but the image is deterministic. File names below; save to artifacts and keep `screenshot.mjs` as the single entry point.

<h3 id="s-7-2">7.2 Screens</h3>

| File | Screen | Must be visibly different from v1 | Content to use |
| --- | --- | --- | --- |
| `01-home-light.png` (1440) | Home, light | (1) Hero: kicker pill `>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS`, H1 at `text-display` (64px) with the accent phrase in `--primary`, hero sub-line at `text-prose`, primary + outline buttons, and the **`MigrationDiagram`** (v1 → v2 nodes on a card) on the right instead of the v1 `git log` box; grid + orbs behind. (2) New **stats band** (4 tiles, icon + big number + mono label) on a band. (3) New **tech marquee** row with the pause button visible. (4) Featured case study becomes a large `CaseCard` with a real-looking cover (tinted gradient + UI screenshot frame with fake UI blocks), domain pill, `DiffStat` lines and fact chips, not the flat grid placeholder. (5) New **domains** 4-card row with hue icon tiles and project counts. (6) Selected work cards: domain pill, `↗`, `DiffStat`, chips; one card in hover state. (7) New **process** band: 2×2 feature cards + 5-step vertical flow with the middle step highlighted. (8) Skills in 3 columns with depth headings. (9) Notes as `PostCard` rows with `#tags`. (10) **CTA band** with grid, glow, icon tile, H2, "Copy email" + GitHub + LinkedIn buttons, replacing v1's plain one-line CTA. (11) Footer: one mono line (name, footer nav, social icons, deploy hash), as in the 5.1 wireframe | Section 5.1 wireframe; stats: "5+ years", "4 products shipped", "2 framework migrations", "1 enterprise platform"; domains as in 1.5 v2 seed |
| `02-home-dark.png` (1440) | Home, dark | Same structure as 01 in the jade-tinted dark theme; orbs and grid more visible (dark values), primary button with `--glow-button`; band contrast visible between `#0A0F0E` and `#0D1412` | Same as 01 |
| `03-case-study-light.png` (1440) | Particula v2 case study | (1) Header: back link, domain pill + status pills, H1, tagline, **meta grid** with eyebrow labels (ROLE, TEAM, TIMELINE, STACK). (2) 21:9 cover with a framed UI screenshot instead of the flat grid. (3) **Key facts** 2×2 cards. (4) Each section starts with an eyebrow (SUMMARY, LIMITS, HOW, TRADE-OFFS, RESULT, RETRO). (5) **Requirement columns** (functional / non-functional) with ▹ bullets. (6) Decisions as small cards with "Chose / Over / Because". (7) Before → after metrics as a `DiffStat` card. (8) **Fact chips** row. (9) "More in Fintech / Web3" with 2 `CaseCard`s. (10) Sticky TOC on the right with the active item marked, and the 2px reading-progress bar under the header (show it at ~40%) | Section 5.4; Particula: Vue 2 → Nuxt 3, RWA ratings, ReFi, team of 6, 2024–now |
| `03b-case-study-dark.png` (1440, new) | Case study, dark | Same as 03 in dark | Same |
| `04-blog-post-light.png` (1440) | Post "Vue → React: what transfers, what doesn't" | (1) NOTE eyebrow + mono date · minutes + tag chips above the H1. (2) Callout with an icon tile, not only a left border. (3) Code block with a header bar (filename + language badge + copy button). (4) **Key takeaways** card at the end (3–5 ▹ bullets, `--primary-subtle` background). (5) Prev/next as two `PostCard`s. (6) Sticky TOC + progress bar. Prose stays 18px / 1.75 / 66ch | Section 5.5 |
| `04b-blog-list-light.png` (1440, new) | Notes list | Search input with icon + `⌘K` hint, tag pills with counts, `PostCard` list (date · minutes, title, `↗`, excerpt, `#tags`), one card in hover state | Section 5.5; 3–5 posts with CV-based titles |
| `05-home-mobile-light.png` (390) | Home, mobile | Hero with kicker, `text-display` at 40px, diagram **below** the buttons (scaled), stats 2×2, marquee single row, domain cards 1 column, process as a vertical chain only (feature cards under it), CTA band full width with stacked buttons; header with hamburger. Nothing truncated; no horizontal page scroll | Section 5.1 mobile wireframe |
| `06-admin-dashboard.png` (1440, dark) | Admin dashboard | Keep layout. Only change: Content health card lists the new v2 checks ("Projects without a domain", "Case studies with < 2 key facts", "Marquee needs 6+ skills"); sidebar shows new Stats, Domains and Process items. Use the tinted dark tokens. **No** grid, orbs or bands | Section 5.11 |
| `07-admin-projects-table.png` (1440) | Admin projects table | Keep layout. Add a **Domain** column (hue pill) and a "Key facts" count column | Section 5.11 |
| `08-admin-project-editor.png` (1440) | Admin project editor | Keep layout. Show the new "Card & facts" tab active: domain select, key facts textarea with counter, fact chips input, and the live preview showing the real `CaseCard` | Section 5.11 |
| `09-home-skeletons.png` (1440) | Home loading state | Skeletons now match the v2 sections: hero with diagram block, 4 stat tiles, marquee chip row, featured card, 4 domain cards, process chain. Atmosphere stays visible (it is not content); no shimmer under reduced motion | Section 5.0 rows |
| `10-about-light.png` (1440, new) | About + timeline | Intro split (avatar card with city + availability pill, bio), compact stats strip, timeline with a year rail and company groups (LitGroup shows 2 roles), numbered principles (`01 —`), skills by depth, education row, CV download card | Section 5.2; 4 experience rows from the CV |
| `11-projects-light.png` (1440, new) | Projects list | Domain filter pills with counts (hue dots), tech combobox, wide featured card then a 2-column `CaseCard` grid, one card in hover state | Section 5.3; 4 projects |
| `12-contact-light.png` (1440, new) | Contact | Split layout on the faint grid: left H1 + intro + reply-time note + channel cards (Email `<email>` with "Copy email", GitHub `parker2808`, LinkedIn); right form on `--card-glass` with topic select; one field shown in its error state | Section 5.6 |

**Acceptance check before handing back:** (a) every screen has at least one band, one eyebrow and one icon tile (admin excepted); (b) body text is 16px and prose 18px everywhere; (c) a contrast spot-check of muted text on `--band` and of every hue pill passes 4.5:1 in both themes; (d) a search of `mockups/portfolio/*.html` for email-shaped strings, `+84` and `gmail` finds nothing; (e) the 390px screenshot has no horizontal overflow.
