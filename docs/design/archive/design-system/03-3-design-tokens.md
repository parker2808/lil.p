<!-- Archived verbatim from docs/design/portfolio-design-system.md (3. Design tokens); links re-pointed. Index: ../../portfolio-design-system.md -->

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

