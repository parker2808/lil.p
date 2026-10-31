# Portfolio implementation plan

[Tiếng Việt](./PLAN.vi.md) · Structure: [root](../STRUCTURE.md) · [web](../apps/web/STRUCTURE.md) · [api](../apps/api/STRUCTURE.md) · Design snapshot: [docs/design/](./design/)

This plan turns Parker's design (spec, Figma, mockups, practice roadmap) into 67 small tasks. Each task is one pull request that an implementation agent, or Parker, can finish and merge on its own. The tasks follow the practice roadmap order (p01–p33, milestones M0–M7), so the code grows the same way the lessons do.


> **Agents:** this is the short index. Read only the piece you need.

Full content is split, verbatim, into `docs/archive/plan/`. Search it with `rg` and open only the piece you need.

- [Contents](archive/plan/01-contents.md)
- [3. Decisions](archive/plan/02-3-decisions.md)
- [4. Architecture at a glance](archive/plan/03-4-architecture-at-a-glance.md)
- [5. Design map](archive/plan/04-5-design-map.md)
- [6. Task overview](archive/plan/05-6-task-overview.md)
- [7. Tasks](archive/plan/06-7-tasks.md)
- [7. Tasks / T10 · Validation pipe, error filter, request id, logging](archive/plan/07-7-tasks-t10-validation-pipe-error-filter-request-i.md)
- [7. Tasks / T16 · Domains + projects + metrics (one-to-many)](archive/plan/08-7-tasks-t16-domains-projects-metrics-one-to-many.md)
- [7. Tasks / T26 · Projects list](archive/plan/09-7-tasks-t26-projects-list.md)
- [7. Tasks / T35 · Users, argon2, JWT access + refresh cookies](archive/plan/10-7-tasks-t35-users-argon2-jwt-access-refresh-cookie.md)
- [7. Tasks / T42 · Editor shell + Tiptap MarkdownEditor + autosave](archive/plan/11-7-tasks-t42-editor-shell-tiptap-markdowneditor-aut.md)
- [7. Tasks / T46 · Users admin (admin only) + change own password](archive/plan/12-7-tasks-t46-users-admin-admin-only-change-own-pass.md)
- [7. Tasks / M6 — Quality](archive/plan/13-7-tasks-m6-quality.md)

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
| 4 | **Practice roadmap** p01–p33 | Task order, learning steps, done-checks, commit messages | [/practice](https://parker-interview-senior-fe.vercel.app/practice). Snapshot: [docs/design/roadmap.json](./design/archive/roadmap.json) |
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

<details><summary>Old section links</summary>

<a id="7-tasks"></a>[7-tasks](archive/plan/06-7-tasks.md#7-tasks) ·
<a id="3-decisions"></a>[3-decisions](archive/plan/02-3-decisions.md#3-decisions) ·
<a id="5-design-map"></a>[5-design-map](archive/plan/04-5-design-map.md#5-design-map) ·
<a id="6-task-overview"></a>[6-task-overview](archive/plan/05-6-task-overview.md#6-task-overview) ·
<a id="4-architecture-at-a-glance"></a>[4-architecture-at-a-glance](archive/plan/03-4-architecture-at-a-glance.md#4-architecture-at-a-glance) ·

</details>
