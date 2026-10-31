<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T16 · Domains + projects + metrics (one-to-many)); links re-pointed. Index: ../../PLAN.md -->

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

**Roadmap** p14 · **Spec** [§5.1](../../design/portfolio-design-system.md#s-5-1), §5.0 (home rows), §4.4, §4.5, §7.2 (`01`, `02`, `05`, `09`) · **Depends** T14, T19, T20, T21, T22 · **Size** L

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

**Roadmap** p14 · **Spec** [§5.2](../../design/portfolio-design-system.md#s-5-2), §4.2 (`Timeline`), §5.0 (About rows) · **Depends** T23, T24 · **Size** L

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

