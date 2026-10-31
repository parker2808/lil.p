<!-- Archived verbatim from docs/design/portfolio-design-system.md (6. Lab-day mapping (high level)); links re-pointed. Index: ../../portfolio-design-system.md -->

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

