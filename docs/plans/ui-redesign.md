# UI redesign plan — public site + admin CMS (frontend only)

Status: proposal for review · Owner: Parker · Mockups: [`docs/design/redesign/`](../design/redesign/index.html) · Screenshots: [`docs/design/redesign/screenshots/`](../design/redesign/screenshots/)

Implementation review (29 Oct 2026): [shipped surfaces, checks, screenshots and remaining proposal work](../audits/2026-10-29-redesign/README.md).

---

> **Agents:** this is the short index. Read only the piece you need.

Full content is split, verbatim, into `docs/archive/ui-redesign/`. Search it with `rg` and open only the piece you need.

- [Tóm tắt (Tiếng Việt)](../archive/ui-redesign/01-tom-tat-tieng-viet.md)
- [Contents](../archive/ui-redesign/02-contents.md)
- [1. Audit](../archive/ui-redesign/03-1-audit.md)
- [2. Design direction](../archive/ui-redesign/04-2-design-direction.md)
- [3. Parker's layout rules → how each surface complies](../archive/ui-redesign/05-3-parker-s-layout-rules-how-each-surface-complies.md)
- [4. Tokens](../archive/ui-redesign/06-4-tokens.md)
- [5. Grid and breakpoints](../archive/ui-redesign/07-5-grid-and-breakpoints.md)
- [6. Component inventory](../archive/ui-redesign/08-6-component-inventory.md)
- [7. Per-page designs](../archive/ui-redesign/09-7-per-page-designs.md)
- [8. Showcase techniques → FE skills, budgets](../archive/ui-redesign/10-8-showcase-techniques-fe-skills-budgets.md)
- [9. Implementation plan (stacked PRs)](../archive/ui-redesign/11-9-implementation-plan-stacked-prs.md)
- [10. i18n](../archive/ui-redesign/12-10-i18n.md)
- [11. Future, out of scope (needs backend)](../archive/ui-redesign/13-11-future-out-of-scope-needs-backend.md)

## 0. Scope, constraints, how to review

**In scope**

- `apps/web`: Next 16 App Router, next-intl `/en` `/vi`, next-themes, TanStack Query/Table/Form/Virtual.
- `packages/ui`: shadcn/Radix, Tiptap 3, dnd-kit, Storybook.
- Read-only use of `packages/contracts`, the zod block registry and its schemas. Block props and layouts are used as they are.

**Out of scope:** `apps/api`, Prisma schema, migrations and any new endpoint or field. Ideas that need them are listed in [§11](#11-future-out-of-scope-needs-backend).

**Constraints carried into every task**

- **No hardcoded content.** Every visible string is either API data or a next-intl chrome label. Numbering is computed, not stored: section indices `§01…`, roman-numeral nav groups, `01 / 03` counters. The mockups contain sample data that mirrors today's API responses; it is not copy to paste.
- **Tiptap stays** (`packages/ui/src/components/MarkdownEditor`, slash command, callout, safe-content, paste extensions). Only its chrome is restyled.
- **Placeholders** are `<email>` / `<phone>` in docs and mockups.
- **Free hosting only.** No new paid services, no paid fonts. IBM Plex is OFL and served by `next/font/google` at build time.
- **No new heavy runtime dependencies.** No three.js and no GSAP; the shader is raw WebGL2. Lenis smooth scroll is optional and off by default (see [§12](#12-open-questions-and-risks)).

**How to review**

1. Open `docs/design/redesign/index.html` from disk or any static server. Every page accepts `?dark=1`, and `?capture=1` freezes motion.
2. Screenshots are in `docs/design/redesign/screenshots/`: `*-desktop.jpg` (1440 px), `*-desktop-dark.jpg`, `*-mobile.jpg` (390 px).
3. Current-site captures are in `screenshots/before/`.
4. Loading states have their own boards: `loading.html` (public; its “Simulate a slow navigation” button drives the route bar) and `admin-loading.html?state=dashboard|table|editor|states`. `home.html?intro=1` plays the first-visit curtain, and `?progress=1` freezes the route bar on any page.
5. Regenerate the screenshots with `node docs/design/redesign/screenshot.mjs` (needs `playwright-core` and a Chrome binary). It warns on any horizontal overflow; none are reported today.

Mockups are static HTML/CSS/JS written for review, not product code. `redesign.css` is the token proposal that R1 ports to `packages/ui/src/styles/globals.css`.

---

## 12. Open questions and risks

**Questions for Parker**

- **Q1. Rules 1–2 on public pages.** This plan keeps document scroll on public pages (long-form reading, View Transitions and scroll timelines need it) and uses the locked three-pane only for the notes reader at ≥ 1024px. Should the case study also become a KB-style split?
- **Q2. Shader intensity.** Should it be on by default when `ambientEffects` is true, or only after the first interaction? The current proposal is on, at low intensity, paused offscreen.
- **Q3. Tools shown twice on home** (ticker + skill groups). Should one block move to About? The plan only flags it in the page builder; content stays as configured.
- **Q4. Lenis smooth scroll.** It is off by default: native scroll is better for accessibility, scroll timelines and battery. Should it be offered as an opt-in?
- **Q5. Squircle reach.** Is `corner-shape` (Chromium) plus round fallback acceptable, or should the SVG mask also apply to the two hero media surfaces in Safari and Firefox (+2 KB JS)?
- **Q6. Intro curtain.** It is on by default for the first hard load of a session (when `ambientEffects` is true). Should it be off by default, or limited to the home route only?

**Risks**

| Risk                                                                       | Mitigation                                                                                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Scroll-driven animations and anchor positioning are not in every engine    | Everything is behind `@supports`; static designs are complete; Playwright runs the static path too.                                             |
| View Transitions + App Router APIs are still settling                      | R8 starts with a spike and a feature flag; fallback to instant navigation.                                                                      |
| Motion and the shader cost Lighthouse points                               | Budgets in CI (R5, R6, R15); LCP is text; the shader loads after LCP and is tiny.                                                               |
| Big type and condensed widths with long Vietnamese words                   | `text-wrap: balance`, `hyphens: auto` with `lang`, clamp-based sizes, long-VI Storybook fixtures in R4–R5.                                      |
| Locking the document in admin breaks existing flows (dialogs, toasts, dnd) | R12 runs the existing admin e2e suite; Radix portals stay at body level; dnd-kit autoscroll targets the main pane.                              |
| Design drift between mockups and app                                       | R15 visual baselines; foundations story as the single reference.                                                                                |
| Skeletons drift from their components as layouts change                    | Each skeleton is colocated and built from the same wrapper; parity tests (±1px) run per card type, and the CLS sweep in R15 covers every route. |
| `loading.tsx` hides a fast page behind a flash of skeleton                 | Skeletons fade in from 100ms; the route bar waits 120ms; cached routes render without either (asserted in R8).                                  |
| The intro curtain hurts LCP or annoys repeat visitors                      | Session-gated, ≤ 700ms, no input block, no LCP candidate, `?intro=0`; LCP delta asserted in R8; Q6 lets Parker turn it off.                     |

<details><summary>Old section links</summary>

<a id="1-audit"></a>[1-audit](../archive/ui-redesign/03-1-audit.md#1-audit) ·
<a id="10-i18n"></a>[10-i18n](../archive/ui-redesign/12-10-i18n.md#10-i18n) ·
<a id="4-tokens"></a>[4-tokens](../archive/ui-redesign/06-4-tokens.md#4-tokens) ·
<a id="41-color"></a>[41-color](../archive/ui-redesign/06-4-tokens.md#41-color) ·
<a id="2-design-direction"></a>[2-design-direction](../archive/ui-redesign/04-2-design-direction.md#2-design-direction) ·
<a id="7-per-page-designs"></a>[7-per-page-designs](../archive/ui-redesign/09-7-per-page-designs.md#7-per-page-designs) ·
<a id="6-component-inventory"></a>[6-component-inventory](../archive/ui-redesign/08-6-component-inventory.md#6-component-inventory) ·
<a id="5-grid-and-breakpoints"></a>[5-grid-and-breakpoints](../archive/ui-redesign/07-5-grid-and-breakpoints.md#5-grid-and-breakpoints) ·
<a id="9-implementation-plan-stacked-prs"></a>[9-implementation-plan-stacked-prs](../archive/ui-redesign/11-9-implementation-plan-stacked-prs.md#9-implementation-plan-stacked-prs) ·
<a id="11-future-out-of-scope-needs-backend"></a>[11-future-out-of-scope-needs-backend](../archive/ui-redesign/13-11-future-out-of-scope-needs-backend.md#11-future-out-of-scope-needs-backend) ·
<a id="42-type-ibm-plex-sans--ibm-plex-mono"></a>[42-type-ibm-plex-sans--ibm-plex-mono](../archive/ui-redesign/06-4-tokens.md#42-type-ibm-plex-sans--ibm-plex-mono) ·
<a id="82-budgets-ci-enforced-where-possible"></a>[82-budgets-ci-enforced-where-possible](../archive/ui-redesign/10-8-showcase-techniques-fe-skills-budgets.md#82-budgets-ci-enforced-where-possible) ·
<a id="8-showcase-techniques--fe-skills-budgets"></a>[8-showcase-techniques--fe-skills-budgets](../archive/ui-redesign/10-8-showcase-techniques-fe-skills-budgets.md#8-showcase-techniques--fe-skills-budgets) ·
<a id="3-parkers-layout-rules--how-each-surface-complies"></a>[3-parkers-layout-rules--how-each-surface-complies](../archive/ui-redesign/05-3-parker-s-layout-rules-how-each-surface-complies.md#3-parkers-layout-rules--how-each-surface-complies) ·
<a id="44-radius-10px-base-apple-style-scale-continuous-corners"></a>[44-radius-10px-base-apple-style-scale-continuous-corners](../archive/ui-redesign/06-4-tokens.md#44-radius-10px-base-apple-style-scale-continuous-corners) ·
<a id="79-loading-states-public--admin--loadinghtml-admin-loadinghtml"></a>[79-loading-states-public--admin--loadinghtml-admin-loadinghtml](../archive/ui-redesign/09-7-per-page-designs.md#79-loading-states-public--admin--loadinghtml-admin-loadinghtml) ·

</details>
