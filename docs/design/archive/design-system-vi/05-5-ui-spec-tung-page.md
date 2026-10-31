<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (5. UI spec từng page); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-5">5. UI spec từng page</h2>

> **Trong chương này:** Route: public dưới `app/[locale]/(site)/…` với `locale ∈ {en, vi}` (default `en`, `vi` gợi ý tự động từ `Accept-Language`, không bao giờ ép); admin dưới `app/admin/(cms)/…` (không localize, UI bằng en; field content edit theo locale).

| § | Mục |
| --- | --- |
| 5.0 | Data, state và component theo từng screen |
| 5.1 | Home `/[locale]` (v2) |
| 5.2 | About + experience timeline `/[locale]/about` (v2) |
| 5.3 | List projects `/[locale]/projects` (v2) |
| 5.4 | Project case study `/[locale]/projects/[slug]` (v2) |
| 5.5 | List blog `/[locale]/notes` và post `/[locale]/notes/[slug]` (v2) |
| 5.6 | Contact `/[locale]/contact` (v2) |
| 5.7 | Admin dashboard `/admin` |
| 5.8 | Admin list/table `/admin/posts` (cùng pattern cho projects, skills, experience, media, inbox, audit) |
| 5.9 | Admin editor `/admin/posts/[id]` (projects dùng cùng shell với field section case-study) |
| 5.10 | Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics) |
| 5.11 | Thay đổi admin cho v2 (nhỏ; admin layout giữ nguyên) |


Route: public dưới `app/[locale]/(site)/…` với `locale ∈ {en, vi}` (default `en`, `vi` gợi ý tự động từ `Accept-Language`, không bao giờ ép); admin dưới `app/admin/(cms)/…` (không localize, UI bằng en; field content edit theo locale).

Mọi public page: pattern `<title>` `{page seoTitle} · {SiteSettings.siteName}`, description từ CMS, canonical, `hreflang` alternate, OG image từ template, JSON-LD (`Person` trên home/about, `CreativeWork` trên case study, `BlogPosting` trên post, `BreadcrumbList` trên page detail). Sitemap và RSS theo locale.

 

<h3 id="s-5-0">5.0 Data, state và component theo từng screen</h3>

Mọi text trong wireframe bên dưới là **seed data** từ CV hoặc chrome string; không cái nào được gõ cứng vào component. "Ẩn" nghĩa là section và anchor của nó bị gỡ khi empty (section 4.5).

| Screen · section | Data (endpoint → props) | Render | Skeleton | Empty | Error | shadcn component |
| --- | --- | --- | --- | --- | --- | --- |
| Layout: header, footer | `GET /public/site?locale` → `nav`, `socialLinks`, `settings` | RSC, tag `site` | n/a (thuộc shell) | Nav 0 item thì chỉ hiện logo | Page chrome `error.tsx` | `navigation-menu`, `sheet`, `toggle-group`, `dropdown-menu`, `button`, `command` + `dialog` |
| Home · hero | `site.profile`, `site.settings.availability*` | RSC | Title + 2 dòng + 2 button | n/a (singleton đã seed) | `error.tsx` (critical) | `badge`, `button` |
| Home · featured | `GET /public/projects?featured=1&limit=1` | RSC, tag `projects` | Cover + 3 dòng + 2 stat | Ẩn | Inline `alert` + Retry | `card`, `badge` |
| Home · selected work | `GET /public/projects?limit=3` | RSC | 3 card skeleton | Ẩn | Inline `alert` | `card`, `badge` |
| Home · hero diagram (v2, thay panel career-log của v1) | project featured `versionFrom/To` + tối đa 6 `Skill` linked | RSC | Block hình diagram | Ẩn diagram, hero text span full width | Ẩn | `card` |
| Home · skills | `GET /public/skills` (group theo depth) | RSC, tag `skills` | 3 hàng chip | Ẩn | Inline `alert` | `badge` |
| Home · latest notes | `GET /public/posts?limit=3` | RSC, tag `posts` | 3 hàng | Ẩn | Inline `alert` | `separator` |
| Home · contact CTA | `PageSection(HOME, cta).title/ctaLabel` | RSC | n/a | Ẩn nếu không có title | n/a | `button` |
| Home · stats band (v2) | `GET /public/site` → `profileStats` (value computed resolve phía server) | RSC, tag `site` | 4 tile (block icon + số + label) | Ẩn nếu < 2 visible | Inline `alert` | không (custom `StatBand`) |
| Home · tech marquee (v2) | `GET /public/skills?marquee=1` | RSC, tag `skills` | 1 hàng 8 block chip | Ẩn nếu 0; hàng tĩnh nếu < 6 | Ẩn (bản decorative trùng skills) | `badge`, `button` (pause) |
| Home · domains (v2) | `GET /public/domains` (kèm count project published) | RSC, tag `domains` | 4 card | Ẩn; card 0 project bị ẩn | Inline `alert` | `card` |
| Home · process (v2) | `GET /public/process-steps` | RSC, tag `site` | 2×2 card + chuỗi 5-step | Ẩn nếu < 3 step | Inline `alert` | `card` |
| Home · CTA band (v2) | `PageSection(HOME, cta)` + `socialLinks.filter(showInCta)` | RSC | n/a | Ẩn nếu không có title | n/a | `button` |
| Case study · key facts + chips (v2) | `project.keyFacts`, `project.factChips`, `project.domain` | RSC (cùng request) | 2×2 block | Ẩn từng cái nếu empty | Thuộc `error.tsx` của page | `badge`, `card` |
| About · intro | `site.profile.bio`, `resumeEnId/ViId` | RSC | Avatar + 3 dòng | n/a | `error.tsx` | `avatar`, `button` |
| About · timeline | `GET /public/experience` | RSC | 3 item | Empty list chính: `empty` | Inline `alert` | `accordion`, `badge` |
| About · skills, education, principles | `GET /public/skills`, `/education`, `/principles` | RSC | Chip / 1 hàng / 3 card | Ẩn | Inline `alert` | `badge`, `card` |
| List projects | `GET /public/projects?tag&skill` | RSC; filter là link (`?skill=nuxt`) re-render phía server | 4 card | `empty` + "Clear filters" | Inline `alert` | `toggle-group`, `popover` + `command`, `card`, `badge` |
| Case study | `GET /public/projects/:slug` | RSC, `generateStaticParams`, tag `project:{slug}` | Header + cover + 2 stat + paragraph | 404 qua `notFound()` | Segment `error.tsx` | `breadcrumb`, `badge`, `alert` (NDA), `collapsible` (TOC mobile) |
| List notes | Trang đầu RSC; search/tag qua TanStack Query | RSC + client island | 5 hàng | `empty` ("No notes yet" / "No results for …" + Clear) | Inline `alert` + Retry (`refetch`) | `input-group`, `toggle-group`, `pagination`, `spinner` |
| Post | `GET /public/posts/:slug` | RSC, tag `post:{slug}` | Title + meta + paragraph | 404 | Segment `error.tsx` | `breadcrumb`, `badge`, `button` (copy), `separator` |
| Contact | `site.settings.contact*`, `GET /public/contact-topics` | Page RSC, form client | n/a | Topic select ẩn nếu 0 topic | Error lúc submit: `alert` phía trên form, giữ input | `field`, `input`, `textarea`, `select`, `button`, `alert` |
| Admin shell | `GET /auth/me`, số unread | RSC guard + client | Sidebar skeleton | n/a | Redirect login khi 401 | `sidebar`, `breadcrumb`, `dropdown-menu`, `avatar`, `sonner`, `command` |
| Admin dashboard | `GET /admin/stats?range`, `/admin/messages?limit=5`, `/admin/audit?limit=8`, `/admin/health` | Prefetch + `useSuspenseQuery` từng card | Skeleton từng card | Từng card: "No views yet", "Inbox zero", … | `alert` + Retry từng card | `card`, `chart`, `toggle-group`, `badge`, `skeleton`, `empty` |
| Admin list | `GET /admin/{entity}?…` | Prefetch + TanStack Table | 10 skeleton row | `empty` + create action | `alert` + Retry | `table`, `checkbox`, `dropdown-menu`, `popover` + `command` (filter), `pagination`, `alert-dialog`, `badge` |
| Admin editor | `GET /admin/{entity}/:id` + Media, Tags, Skills | Prefetch + TanStack Form | Form skeleton | n/a (404 → "Not found" + back) | `alert` + Retry; error lúc save nằm trong `SaveStatus` | `tabs`, `field`, `input`, `textarea`, `select`, `switch`, `calendar`, `popover` + `command`, `resizable`, `sheet`/`drawer` (properties mobile), `progress` |
| Admin site & sections | `GET /admin/site`, `/admin/nav`, `/admin/sections`, `/admin/social`, `/admin/contact-topics` | Prefetch + TanStack Form/Table | Form + row | `empty` từng list | `alert` + Retry | `tabs`, `table`, `switch`, `field`, `button` (move up/down) |

 

<h3 id="s-5-1">5.1 Home `/[locale]` (v2)</h3>

Mục đích: trong 10 giây, anh ấy là ai, ship cái gì, proof bằng số, và một cách để act. Thứ tự section mặc định (từ `PageSection`, admin có thể reorder/ẩn): **hero → stats → marquee → featured case study → domains → selected work → how I migrate (process) → skills by depth → latest notes → CTA band**. Band (`--band`) xen kẽ: stats+marquee, domains, process. Chú giải: `░` = grid đã mask, `◌` = orb/glow, `[ ]` = button, `‹›` = pill.

Desktop (1440, container 1120):
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ◆ parker.dev Work About Notes Contact [Search ⌘K] ‹EN|VI› ◐ │ sticky, blur
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ Atmosphere hero
│░ ‹>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS› ┌──────────────────────────┐ ░│
│░ │ ┌────┐ ┌────┐ │ ░│
│░ I move products forward │ │ v1 │──┐ ┌──▶│ v2 │ │ ░│ MigrationDiagram
│░ without breaking them. ← accent in --primary │ │Vue2│ ├─┤ │Nuxt│ │ ░│ (nodes pulse on v2)
│░ (text-display 64px) │ └────┘ │ │ └────┘ │ ░│
│░ │ ○Pinia ○Query ○PrimeVue │ ░│
│░ Parker Vu · Senior Frontend Engineer. 5 years │ ○Tailwind ○Playwright │ ░│
│░ shipping data-dense product UIs… (text-prose) └──────────────────────────┘ ░│
│░ ● Open to senior roles · Hanoi, GMT+7 ░│
│░ [ View case studies → ]glow [ Download CV ] ░│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │
│ │▣ │ 5+ │▣ │ 4 │▣ │ 3 │▣ │ 20+ │ StatBand
│ └──┘ YEARS └──┘ PRODUCTS └──┘ CLIENT └──┘ ASSET CLASSES │ numbers --primary
│ SHIPPING SHIPPED COUNTRIES RATED (PARTICULA) │ labels eyebrow
│ ───────────────────────────────────────────────────────────────────────────────── │
│ ‹Vue 3›‹Nuxt 3›‹TypeScript›‹Pinia›‹TanStack Query›‹PrimeVue›‹Playwright›‹Vitest› ⏸ │ TechMarquee (fades)
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Featured case study All work → │ SectionHeader
│ ┌───────────────────────────────────────────┐ ‹▣ Fintech / Web3› v1 → v2 │
│ │ cover 16:10 (project image or diagram) │ Particula v2 │
│ │ │ Rewriting an RWA ratings app │
│ │ │ without stopping delivery. │
│ └───────────────────────────────────────────┘ − bundle 412kB → 255kB │
│ + e2e specs 0 → 120 │
│ ‹Nuxt 3›‹TanStack›‹Playwright› │
│ Read case study ↗ │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ▣ Domains Products I've shipped, grouped by the problem they solve │
│ ┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐ │
│ │ ▣amber 1 project │ │ ▣blue 2 projects │ │ ▣violet 1 project │ │ DomainCard ×4
│ │ Fintech / Web3 (ReFi) │ │ Enterprise platforms │ │ E-commerce tooling │ │ (3+1 or 4-col)
│ │ RWA ratings, carbon… │ │ Samsung SDS ops tools… │ │ Cart migrations across │ │
│ └────────────────────────┘ └────────────────────────┘ └────────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Selected work All projects → │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────┐│
│ │‹▣ Fintech› ↗ │ │‹▣ E-commerce› ↗ │ │‹▣ Enterprise› ‹NDA› ↗││ CaseCard ×3
│ │ Particula v2 │ │ Cart migration tool │ │ MSP Advanced ││ hover: lift, title
│ │ Nuxt 3 rewrite of… │ │ Flask APIs + Vue 2 UI… │ │ Re-platformed MSP… ││ → primary
│ │ − bundle 412→255kB │ │ + carts 4 platforms │ │ + team 15 · KR ││
│ │ ‹Nuxt 3›‹TanStack›‹+2› │ │ ‹Flask›‹Vue 2›‹Pinia› │ │ ‹Vue 2›‹Vuex› ││
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────┘│
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PROCESS› │
│ How I migrate a frontend ┌────────────────────────────┐ │
│ Short intro (text-prose, muted, 2 lines) │ 01 Audit · tokens, states │ │ ProcessFlow
│ ┌───────────────────┐ ┌───────────────────┐ └─────────────┬──────────────┘ │
│ │▣ Migrate in slices│ │▣ Test the contract│ ┌─────────────▼──────────────┐ │
│ │ 2-line body │ │ 2-line body │ │ 03 Strangler routes ◉glow │ │ active step
│ └───────────────────┘ └───────────────────┘ └─────────────┬──────────────┘ │
│ ┌───────────────────┐ ┌───────────────────┐ ┌─────────────▼──────────────┐ │
│ │▣ Server state ≠ UI│ │▣ Write it down │ │ 05 Cut over · delete v1 │ │
│ └───────────────────┘ └───────────────────┘ └────────────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ What I work with Daily ‹…› · Shipped before ‹…› · Growing ‹…› │ 3 columns
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Latest notes All notes → │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12 · 6 MIN Vue → React: what transfers, what doesn't ↗ #react #vue │ │ PostCard rows ×3
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────┤
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░◌◌◌◌◌░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ CtaBand (glow)
│ ✦ │
│ Have a product that needs to move forward? │
│ Senior frontend roles or a migration done right. │
│ [ ✉ Copy email ]glow [ in LinkedIn ] [ ⌥ GitHub ] │
├────────────────────────────────────────────────────────────────────────────────────┤
│ © 2026 Parker Vu · Hung Vu Van - Senior Frontend Work Notes CV ⌥ in ✉ · a1b2c3 │ mono footer
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (390):
```
┌──────────────────────────────┐
│ ◆ parker.dev ⌘K ◐ ☰ │
├──────────────────────────────┤
│░‹>_ Senior Frontend · 5 yrs›░│ atmosphere (1 orb)
│░ I move products ░│
│░ forward without ░│ text-display 40px
│░ breaking them. ░│ accent line in primary
│░ Parker Vu · Senior FE… ░│
│░ [ View case studies → ] ░│ full width
│░ [ Download CV ] ░│
│░ ┌─────────────────────────┐░│ MigrationDiagram
│░ │ v1 Vue2 ──▶ v2 Nuxt3 │░│ (compact, horizontal)
│░ └─────────────────────────┘░│
├══════════════════════════════┤ band
│ 5+ YEARS │ 4 PRODUCTS │ StatBand 2×2
│ 3 COUNTRIES │ 20+ CLASSES │
│ ‹Vue 3›‹Nuxt 3›‹TS›‹Pinia› ⏸ │ marquee
├══════════════════════════════┤
│ ▣ Featured case study │
│ [cover] │
│ ‹Fintech› Particula v2 v1→v2 │
│ − bundle 412kB → 255kB │
│ Read case study ↗ │
├══════════════════════════════┤ band
│ ▣ Domains │
│ [DomainCard] (stacked ×4) │
├──────────────────────────────┤
│ ▣ Selected work │
│ [CaseCard] (stacked ×3) │
├══════════════════════════════┤ band
│ PROCESS · How I migrate │
│ 01 → 02 → 03◉ → 04 → 05 │ vertical flow
│ [Feature] [Feature] (1 col) │
├──────────────────────────────┤
│ Skills · Notes (cards) │
├──────────────────────────────┤
│░ ✦ Have a product…? ░│ CTA band
│░ [ Copy email ] [in] [⌥] ░│
│ footer (2 lines, mono) │
└──────────────────────────────┘
```
Giá trị metric là placeholder đến khi Parker cung cấp số thật (1.4 item 1). Stat không có số thật thì giữ ẩn (`isVisible=false`), không bịa.

 

<h3 id="s-5-2">5.2 About + experience timeline `/[locale]/about` (v2)</h3>

Section: intro tách (avatar card + bio) → stats strip (tái dùng `StatBand`, compact) → **timeline** với year rail → principles (list `01 -`) → skills theo depth → education → card download CV.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: ABOUT› │
│ ┌─────────────────────┐ Hi, I'm Parker (Hung Vu Van). (text-title H1) │
│ │ avatar 1:1 │ Bio, 2–3 paragraphs, text-prose, 66ch. │
│ │ rounded-xl │ │
│ │ Hanoi · GMT+7 │ ‹Vietnamese› ‹English› ‹Works with KR · US · UK teams› │
│ │ [Download CV ↓] │ │
│ └─────────────────────┘ │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ 5+ YEARS · 4 PRODUCTS · 3 COUNTRIES · 20+ ASSET CLASSES (compact StatBand) │
├════════════════════════════════════════════════════════════════════════════════════┤
│ ▣ Experience │
│ 2024 ─ NOW ●━━ Kobizo · Frontend Developer ‹▣ Fintech› Case study ↗ │
│ (sticky) ┃ Particula: main frontend, led v1 → v2. │
│ ┃ ▹ highlight ▹ highlight ▹ highlight │
│ ┃ ‹Vue 3›‹Nuxt 3›‹PrimeVue›‹TanStack›‹Playwright› │
│ 2022 ─ 2024 ●━━ CMC Global · Frontend Developer ‹▣ Enterprise› ‹NDA› │
│ ┃ Samsung SDS: MSP Advanced, MSP App Expansion │
│ 2021 ─ 2022 ●━━ LitGroup · Fullstack Developer ‹▣ E-commerce› │
│ ┣ Frontend · 2022 · Vue 2, TS, Pinia │
│ ┗ Backend · 2021 · Flask, Laravel, store APIs │
├════════════════════════════════════════════════════════════════════════════════════┤ band
│ ‹EYEBROW: PRINCIPLES› How I work │
│ 01 - Migrate in slices 02 - Test the contract, not the pixels │
│ 03 - Server state is not UI state 04 - Write the decision down │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ▣ Skills DAILY ‹…› SHIPPED BEFORE ‹…› GROWING ‹…› │
│ ▣ Education Hanoi University of Industry · Computer Science · 2017–2021 │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile:
```
┌──────────────────────────────┐
│ ABOUT │
│ [avatar 96] Hi, I'm Parker │
│ Bio (prose) │
│ ‹VI›‹EN›‹KR·US·UK teams› │
│ [ Download CV ↓ ] │
├══════════════════════════════┤
│ StatBand 2×2 │
├══════════════════════════════┤
│ ● 2024 - now │ year on top of each item
│ ┃ Kobizo · Frontend Dev │
│ ┃ ▹ … ▹ … ‹chips› │ highlights in accordion
│ ● 2022 - 2024 CMC Global │
│ ● 2021 - 2022 LitGroup │
├══════════════════════════════┤
│ 01 - … 02 - … (1 col) │
│ Skills · Education │
└──────────────────────────────┘
```

 

<h3 id="s-5-3">5.3 List projects `/[locale]/projects` (v2)</h3>

Header với eyebrow + H1 + intro, một **hàng filter domain** (domain pill kèm count, URL `?domain=`) và một tech combobox; rồi một `CaseCard` featured rộng, rồi grid 2-col (desktop). Mỗi card hiện domain pill, `↗`, `DiffStat` top, chip.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: WORK› │
│ Case studies (text-title) │
│ Four products I moved forward, 2021 - now. (text-prose) │
│ ‹All 4› ‹▣ Fintech 1› ‹▣ Enterprise 2› ‹▣ E-commerce 1› [Tech: any ▾] │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐ ‹▣ Fintech / Web3› v1 → v2 ↗ │ │ featured, wide
│ │ │ cover 16:10 │ Particula v2 │ │
│ │ └───────────────────────────────┘ Tagline (2 lines) · Kobizo · 2024 - now │ │
│ │ − bundle 412→255kB + specs 0→120 │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ │
│ │‹▣ E-commerce› ↗ │ │‹▣ Enterprise› ‹NDA› ↗ │ │
│ │ Cart migration tool │ │ MSP Advanced (Samsung SDS) │ │
│ │ Flask APIs + Vue 2 UI for… │ │ Re-platformed MSP App logic… │ │
│ │ + platforms 4 · LitGroup · 2021–22 │ │ team 15 · CMC Global · 2022–24 │ │
│ │ ‹Flask›‹Laravel›‹Vue 2›‹Pinia› │ │ ‹Vue 2›‹Vuex› │ │
│ └───────────────────────────────────────┘ └───────────────────────────────────────┘ │
│ Empty filter: empty state "No case studies for Svelte" + [Clear filters] │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: filter pill scroll ngang (có fade mép), tech combobox bên dưới, card xếp chồng, featured card = card thường với cover ở trên.

 

