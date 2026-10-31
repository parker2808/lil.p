<!-- Archived verbatim from docs/design/portfolio-design-system.md (7. Mockup rebuild brief (v2)); links re-pointed. Index: ../../portfolio-design-system.md -->

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
