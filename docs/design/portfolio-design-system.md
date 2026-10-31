# Portfolio design system and UI spec (Parker)

Design and planning only. This doc feeds the LAB tab of the 30-day plan (`plans/study-plan-30d-redesign.md`): the lab becomes one continuous project, Parker's full-stack portfolio.

- Stack: Next.js App Router + TypeScript (`apps/web`) with **shadcn/ui** (Radix + Tailwind v4) and **TanStack** Query, Table, Form and Virtual; NestJS (`apps/api`); MySQL 8 in Docker Compose; **Prisma** as the one ORM; server-side sessions for auth; shared zod schemas, types and query keys in `packages/contracts`; components in `packages/ui`.
- Principles: typography first (3.2); no hard-coded content, everything visible comes from the API/CMS (1.5, 4.5); backend decisions are explained for a backend beginner and built bottom-up (1.6, 6).
- v2 revision: after reviewing the v1 mockups ("too bare"), the visual layer was enriched using [longpham.tech](https://www.longpham.tech/) as a reference: analysis in 2.1–2.2, new tokens in 3.1–3.1b, motion in 3.4, components in 4.7, wireframes in 5.1–5.6, admin additions in 5.11, rebuild brief in 7.
- Source: Parker's CV (dated, says "4+ years"; he now has ~5 years with Vue/Nuxt/TypeScript).
- Privacy: contact details are `<email>` / `<phone>` everywhere, including seeds and fixtures. The CV file itself is not committed.
- **§ refs:** Headings are `<h2 id="s-N">N. Title</h2>` (chapter) and `<h3 id="s-N-M">N.M Title</h3>` (section; a letter suffix is allowed, e.g. `3.1b`). `§1.5` maps to the heading whose text starts with `1.5 `, and to the explicit HTML id `s-1-5` (`s-` + digits/letters with `.` → `-`). Prefer `#s-1-5` over GitHub auto-slugs, which drop the dots (`15-content-model-dbcms`).

---


> **Agents:** this is the short index. Read only the piece you need.

Full content is split, verbatim, into `docs/design/archive/design-system/`. Search it with `rg` and open only the piece you need.

- [1. CV analysis](archive/design-system/01-1-cv-analysis.md)
- [2. Design direction](archive/design-system/02-2-design-direction.md)
- [3. Design tokens](archive/design-system/03-3-design-tokens.md)
- [4. Components and layout](archive/design-system/04-4-components-and-layout.md)
- [5. Page-by-page UI spec](archive/design-system/05-5-page-by-page-ui-spec.md)
- [5. Page-by-page UI spec / 5.3 Projects list `/[locale]/projects` (v2)](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md)
- [5. Page-by-page UI spec / 5.9 Admin editor `/admin/posts/[id]` (projects use the same shell with case-study section fields)](archive/design-system/07-5-page-by-page-ui-spec-5-9-admin-editor-admin-post.md)
- [6. Lab-day mapping (high level)](archive/design-system/08-6-lab-day-mapping-high-level.md)
- [7. Mockup rebuild brief (v2)](archive/design-system/09-7-mockup-rebuild-brief-v2.md)

<details><summary>Old section links</summary>

<a id="s-3"></a>[s-3](archive/design-system/03-3-design-tokens.md#s-3) ·
<a id="s-6"></a>[s-6](archive/design-system/08-6-lab-day-mapping-high-level.md#s-6) ·
<a id="s-1-5"></a>[s-1-5](archive/design-system/01-1-cv-analysis.md#s-1-5) ·
<a id="s-1-6"></a>[s-1-6](archive/design-system/01-1-cv-analysis.md#s-1-6) ·
<a id="s-3-2"></a>[s-3-2](archive/design-system/03-3-design-tokens.md#s-3-2) ·
<a id="s-3-6"></a>[s-3-6](archive/design-system/03-3-design-tokens.md#s-3-6) ·
<a id="s-3-7"></a>[s-3-7](archive/design-system/03-3-design-tokens.md#s-3-7) ·
<a id="s-4-0"></a>[s-4-0](archive/design-system/04-4-components-and-layout.md#s-4-0) ·
<a id="s-4-1"></a>[s-4-1](archive/design-system/04-4-components-and-layout.md#s-4-1) ·
<a id="s-4-2"></a>[s-4-2](archive/design-system/04-4-components-and-layout.md#s-4-2) ·
<a id="s-4-3"></a>[s-4-3](archive/design-system/04-4-components-and-layout.md#s-4-3) ·
<a id="s-4-5"></a>[s-4-5](archive/design-system/04-4-components-and-layout.md#s-4-5) ·
<a id="s-4-6"></a>[s-4-6](archive/design-system/04-4-components-and-layout.md#s-4-6) ·
<a id="s-4-7"></a>[s-4-7](archive/design-system/04-4-components-and-layout.md#s-4-7) ·
<a id="s-5-1"></a>[s-5-1](archive/design-system/05-5-page-by-page-ui-spec.md#s-5-1) ·
<a id="s-5-2"></a>[s-5-2](archive/design-system/05-5-page-by-page-ui-spec.md#s-5-2) ·
<a id="s-5-3"></a>[s-5-3](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-3) ·
<a id="s-5-4"></a>[s-5-4](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-4) ·
<a id="s-5-5"></a>[s-5-5](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-5) ·
<a id="s-5-6"></a>[s-5-6](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-6) ·
<a id="s-5-7"></a>[s-5-7](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-7) ·
<a id="s-5-8"></a>[s-5-8](archive/design-system/06-5-page-by-page-ui-spec-5-3-projects-list-locale-pr.md#s-5-8) ·
<a id="s-5-9"></a>[s-5-9](archive/design-system/07-5-page-by-page-ui-spec-5-9-admin-editor-admin-post.md#s-5-9) ·
<a id="s-5-10"></a>[s-5-10](archive/design-system/07-5-page-by-page-ui-spec-5-9-admin-editor-admin-post.md#s-5-10) ·

</details>
