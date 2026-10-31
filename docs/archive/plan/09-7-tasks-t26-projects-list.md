<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T26 · Projects list); links re-pointed. Index: ../../PLAN.md -->

#### T26 · Projects list

**Roadmap** p14 · **Spec** [§5.3](../../design/portfolio-design-system.md#s-5-3), §5.0 (Projects list row) · **Depends** T14, T19, T20 · **Size** M

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

**Roadmap** p14 · **Spec** [§5.4](../../design/portfolio-design-system.md#s-5-4), §5.0 (Case study rows) · **Depends** T23, T26 · **Size** L

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

**Roadmap** p14 · **Spec** [§5.5](../../design/portfolio-design-system.md#s-5-5), §4.6 (notes search island) · **Depends** T19, T20, T23 · **Size** L

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

