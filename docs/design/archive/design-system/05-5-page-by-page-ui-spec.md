<!-- Archived verbatim from docs/design/portfolio-design-system.md (5. Page-by-page UI spec); links re-pointed. Index: ../../portfolio-design-system.md -->

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

