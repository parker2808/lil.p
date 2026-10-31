<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (3. Design tokens); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-3">3. Design tokens</h2>

> **Trong chương này:** Token dùng tên biến của shadcn/ui (`--background`, `--primary`, `--muted-foreground`, …) làm lớp semantic, kèm vài extension (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`).

| § | Mục |
| --- | --- |
| 3.1 | Color (semantic, tên shadcn) |
| 3.1b | Atmosphere và hue theo domain (v2) |
| 3.2 | Typography (cốt lõi của design) |
| 3.3 | Spacing, radius, elevation |
| 3.4 | Motion |
| 3.5 | Breakpoints và z-index |
| 3.6 | Theme shadcn: CSS variables (`packages/ui/src/styles/globals.css`) |
| 3.7 | Mapping Tailwind v4 (cùng file, `@theme inline`) |


Token dùng **tên biến của shadcn/ui** (`--background`, `--primary`, `--muted-foreground`, …) làm lớp semantic, kèm vài extension (`--subtle-foreground`, `--success`, `--warning`, `--info`, `--primary-subtle`). Một naming scheme nghĩa là component shadcn chạy không sửa, và custom component của mình dùng cùng utility (`bg-primary`, `text-muted-foreground`).

Mọi cặp color bên dưới đã đo bằng công thức relative luminance WCAG 2.x. Text cần ≥ 4.5:1 (normal) và ≥ 3:1 (≥ 24px, hoặc ≥ 18.66px bold). Border input và focus ring cần ≥ 3:1 (SC 1.4.11). Divider trang trí (`--border`) được miễn và không bao giờ là ranh giới duy nhất của một control.

 

<h3 id="s-3-1">3.1 Color (semantic, tên shadcn)</h3>

Thay đổi v2: neutral dark được **nhuốm về jade** (hue ≈ 165°) thay vì gray thuần, cho độ sâu mà không thêm màu. Light giữ warm neutral. Mọi cặp dark đã đo lại.

| Token | Light | Dark (v2) | Dùng cho | Contrast (đã đo, light / dark) |
| --- | --- | --- | --- | --- |
| `--background` / `--foreground` | `#FAFAF9` / `#18181B` | `#0A0F0E` / `#E8EFED` | Page và body text | 16.96 / 16.55 ✅ |
| `--card` / `--card-foreground` | `#FFFFFF` / `#18181B` | `#111817` / `#E8EFED` | Card, input, table | ≥ 16 / ≥ 15 ✅ |
| `--popover` / `--popover-foreground` | `#FFFFFF` / `#18181B` | `#172120` / `#E8EFED` | Menu, dialog, command palette | ≥ 16 / 14.12 ✅ |
| `--band` (ext, v2) | `#F3F5F3` | `#0D1412` | Band section full-width xen kẽ | muted-fg trên band 7.05 / 8.20, subtle 4.82, primary 5.00 ✅ |
| `--muted` | `#F2F2EF` | `#172120` | Code bg, table hover, skeleton base, ô icon | n/a |
| `--muted-foreground` | `#52525B` | `#9DB0AB` | Text phụ | 7.40 bg, 6.89 muted / 8.49 bg, 7.91 card, 7.24 muted ✅ |
| `--subtle-foreground` (ext) | `#6B6B74` | `#809590` | Meta, placeholder, timestamp | 5.05 bg, 4.70 muted / 6.09 bg, 5.67 card, 5.19 muted ✅ |
| `--primary` / `--primary-foreground` | `#0F766E` / `#FFFFFF` | `#2DD4BF` / `#042F2B` | Link, button primary, cụm accent, số stat | primary trên bg 5.24 / 10.37, trên card 5.47 / 9.67; fg trên primary 5.47 / 7.80 ✅ |
| `--primary-hover` (ext) | `#115E59` | `#5EEAD4` | Hover/pressed | white trên nó 7.58 ✅ |
| `--primary-subtle` / `--primary-subtle-foreground` (ext) | `#E3F2EF` / `#115E59` | `#0F2E2B` / `#5EEAD4` | Row selected, tag active, kicker pill | 6.58 / 9.82 ✅ |
| `--secondary`, `--accent` (+ foreground) | `#F2F2EF` / `#18181B` | `#172120` / `#E8EFED` | Button secondary; hover bg của shadcn (không phải brand color) | 15.80 / 14.12 ✅ |
| `--destructive` / `--destructive-foreground` | `#B42318` / `#FFFFFF` | `#F97066` / `#0A0F0E` | Error, action destructive | 6.29 / 6.93; fg trên nó 6.57 / 6.93 ✅ |
| `--success` trên `--success-subtle` (ext) | `#067647` trên `#E6F1EC` | `#47CD89` trên `#1A2F25` | Published, sent | 5.45 bg, 4.92 subtle / 9.53, 7.01 ✅ |
| `--warning` trên `--warning-subtle` (ext) | `#93370D` trên `#F4EBE7` | `#FDB022` trên `#3A2F18` | Warning, thiếu bản dịch | 7.20, 6.40 / 10.49, 7.13 ✅ |
| `--info` trên `--info-subtle` (ext) | `#1D4ED8` trên `#E8EDFB` | `#7AA2F7` trên `#1B2540` | Callout info | 6.42, 5.72 / 7.67, 6.02 ✅ |
| `--destructive-subtle` (ext) | `#F7E9E8` | `#3A1F1F` | Panel error | destructive trên nó 5.56 / 5.40 ✅ |
| `--border` | `#E4E4E0` | `#233230` | Divider, outline card (trang trí) | chỉ trang trí |
| `--border-strong` (ext, v2) | `#CFCFC9` | `#2F4542` | Border card lúc hover, cạnh band | chỉ trang trí (hover còn lift + shadow) |
| `--input` | `#8A8A93` | `#62807A` | Border input, checkbox, switch | 3.42 trên card / 4.19 trên card ✅ |
| `--ring` | `#0F766E` | `#2DD4BF` | Focus ring, 2px + offset 2px | 5.24 / 10.37 ✅ |
| `--chart-1…5` | `#0F766E`, `#1D4ED8`, `#93370D`, `#6B6B74`, `#067647` | `#2DD4BF`, `#7AA2F7`, `#FDB022`, `#809590`, `#47CD89` | Chart, luôn có label | ≥ 3:1 vs bg ✅ |
| Family `--sidebar` | `--sidebar: #F4F4F2`, `--sidebar-accent: #EAEAE6`, `--sidebar-primary: #0F766E`, `--sidebar-border: #E4E4E0` | `--sidebar: #0C1211`, `--sidebar-accent: #172120`, `--sidebar-primary: #2DD4BF`, `--sidebar-border: #233230` | shadcn `Sidebar` (admin) | muted-fg trên sidebar 7.02 / 8.32 ✅ |

Chuyển theme: `next-themes` với `attribute="class"` (mặc định shadcn, `.dark` trên `<html>`), default `system`, `disableTransitionOnChange`. Chọn theme là UI preference, không phải content.

 

<h3 id="s-3-1b">3.1b Atmosphere và hue theo domain (v2)</h3>

**Token atmosphere** (trang trí; không bao giờ mang text, không bao giờ nằm sau body copy):

| Token | Light | Dark | Dùng cho |
| --- | --- | --- | --- |
| `--grid-line` | `rgb(15 118 110 / .06)` | `rgb(45 212 191 / .08)` | Grid 44px trên hero home và CTA band, mask bằng `radial-gradient(80% 60% at 50% 0, #000 40%, transparent)` |
| `--glow` | `rgb(15 118 110 / .10)` | `rgb(45 212 191 / .18)` | Orb (blur 80px) và radial glow sau CTA |
| `--glow-button` | `none` (dùng `--shadow-1`) | `0 0 24px -6px rgb(45 212 191 / .55)` | Button primary trên hero và CTA thôi |
| `--card-glass` | `rgb(255 255 255 / .72)` | `rgb(17 24 23 / .72)` | Card nằm trên grid (+ `backdrop-filter: blur(8px)`); fallback `--card` đặc khi `prefers-reduced-transparency: reduce` hoặc không hỗ trợ `backdrop-filter` |

**Hue theo domain** (cho `Domain.hue`, dùng trên domain card, pill case study và accent cạnh trên của card). Pill luôn hiện icon + text label; hue không bao giờ là cue duy nhất. Tint = hue 10% trên `#FFFFFF` (light) / 14% trên `--card` (dark).

| Hue key | Text / tint light | Text / tint dark | Contrast (text trên tint, light / dark) | Domain gợi ý |
| --- | --- | --- | --- | --- |
| `jade` | `#0F766E` / `#E7F1F1` | `#2DD4BF` / `#15322F` | 4.76 / 7.38 ✅ | Developer experience & testing |
| `amber` | `#8A4B08` / `#F3EDE6` | `#FBBF24` / `#322F19` | 5.85 / 8.08 ✅ | Fintech / Web3 (ReFi) |
| `blue` | `#1D4ED8` / `#E8EDFB` | `#7AA2F7` / `#202B36` | 5.72 / 5.71 ✅ | Enterprise platforms |
| `violet` | `#6D28D9` / `#F0EAFB` | `#C4B5FD` / `#2A2E37` | 6.04 / 7.37 ✅ | E-commerce tooling |
| `rose` | `#B4235A` / `#F8E9EF` | `#FDA4C4` / `#322C2F` | 5.38 / 7.34 ✅ | Dự phòng (ví dụ "This portfolio") |

 

<h3 id="s-3-2">3.2 Typography (cốt lõi của design)</h3>

**Mục tiêu, theo thứ tự:** (1) mọi dấu tiếng Việt render sạch ở mọi size, (2) case study và note long-form đọc thoải mái 10+ phút, (3) hierarchy rõ với ít size, (4) code không mơ hồ.

**Family (3, mỗi cái một việc).**

| Vai trò | Family | Weight được load | Vì sao |
| --- | --- | --- | --- |
| Heading (H1–H3 public) | **Be Vietnam Pro** | 600, 700 | Thiết kế tại Việt Nam cho tiếng Việt: dấu như `ế ộ ữ ẳ` được vẽ như một phần của chữ, không chồng, nên heading vẫn sắc. Hơi rộng hơn Inter, giúp contrast heading/body |
| Body và toàn bộ UI (kể cả admin) | **Inter** | 400, 500, 600 (variable) | Đủ subset `vietnamese`, x-height cao, rất dễ đọc ở 14–18px, tabular figure (`tnum`) cho metric và table, character variant `cv05` (`l` có đuôi) và `cv08` (`I` có serif) để `Il1` không bao giờ giống nhau |
| Code, version tag, kbd | **JetBrains Mono** | 400, 600 | Có subset `vietnamese` (comment code vi render được), x-height cao, `0/O`, `1/l/I` rõ. Ligature **tắt** (`font-variant-ligatures: none`) để `!==` và `=>` trông đúng như lúc gõ |

Load bằng `next/font/google`, `subsets: ['latin', 'latin-ext', 'vietnamese']`, `display: 'swap'`, `adjustFontFallback` bật (fallback khớp metric, không layout shift). Expose thành `--font-heading`, `--font-sans`, `--font-mono`. Không load gì khác; tổng ≤ 5 file font.

**Scale: 8 size public (mỗi cái một việc), 3 size admin.** v2 thêm `text-display` (chỉ hero home) và `text-eyebrow` (chỉ label mono). Hierarchy dùng size *và* weight *và* space; đừng thêm size, hãy đổi weight hoặc spacing.

| Token | Size (mobile → desktop) | Line-height | Weight · family | Dùng cho |
| --- | --- | --- | --- | --- |
| `text-display` (v2) | 40px → 64px (`clamp(2.5rem, 1.5rem + 4vw, 4rem)`) | 1.1 en / 1.2 vi | 700 · heading, `-0.02em` | Chỉ H1 hero home (kèm cụm accent) |
| `text-title` | 34px → 48px (`clamp(2.125rem, 1.6rem + 2.2vw, 3rem)`) | 1.2 (1.25 cho vi) | 700 · heading | H1 page, số stat, H2 CTA band |
| `text-heading` | 26px → 30px | 1.3 | 600 · heading | H2 (section, markdown `##`) |
| `text-subheading` | 20px | 1.4 | 600 · heading | H3, title card, markdown `###` |
| `text-prose` | 18px | 1.75 | 400 · sans | Long-form: case study, note, bio, sub-line hero |
| `text-body` | 16px | 1.6 | 400/500 · sans | UI và copy ngắn, mô tả card |
| `text-meta` | 14px | 1.5 | 500 · sans (mono cho date, version, chip) | Meta, caption, tag, chip |
| `text-eyebrow` (v2) | 12px | 1.4 | 500 · mono, uppercase, tracking `0.08em`, `--primary` hoặc `--subtle-foreground` | Eyebrow ("CASE STUDY", "OUTCOME"), label stat. Tối đa 4 từ; không bao giờ thành câu |
| admin `text-ui-title` | 20px | 1.4 | 600 · sans | Title page admin |
| admin `text-ui` | 14px | 1.5 | 400/500 · sans | Toàn bộ UI admin, table, input |
| admin `text-ui-meta` | 12.5px | 1.4 | 500 · sans | Timestamp, count, kbd |

Markdown `####` trở xuống render thành `text-prose` 600 (không size mới). Post và case study bắt đầu từ `##`; title page là H1 duy nhất.

**Rule long-form (component `Prose`).**
- **Measure:** max `66ch` (≈ 680px ở Inter 18px); không bao giờ rộng hơn 75ch, không bao giờ hẹp hơn 45ch trên mobile (padding page 20px).
- **Spacing:** paragraph cách `1.1em`; `##` nhận `2.2em` trên và `0.6em` dưới; `###` `1.6em` / `0.5em`. Space trên heading luôn lớn hơn dưới, để nó dính với content của chính nó.
- **List:** `0.4em` giữa item, bullet treo (`padding-inline-start: 1.25em`).
- **Link:** `--primary`, underline luôn bật trong prose (`text-underline-offset: 0.2em`, `text-decoration-thickness: 1px`, 2px lúc hover). Color không bao giờ là cue duy nhất.
- **Emphasis:** bold 600, italic là italic thật; không paragraph ALL CAPS.
- **Number:** `font-variant-numeric: tabular-nums` trong metric, table và date.
- **Quote và callout:** border trái 3px, cùng size với body, text `--muted-foreground`; không pull quote oversized.
- **Image:** rộng bằng measure, caption `text-meta` phía dưới.

**Code.**
- Block: JetBrains Mono 15px (`0.875em` của prose 17–18px), line-height 1.65, background `--muted`, `rounded-lg` (8px), padding 16px, thanh filename optional, scroll ngang (vùng focusable với `aria-label`), toggle wrap. Max width thiết kế ~80 character. Shiki với theme light và dark chỉnh theo palette (comment dùng `--subtle-foreground`, ≥ 4.5:1).
- Inline: `0.9em`, background `--muted`, padding 0.15em × 0.35em, `rounded-sm` (4px), không đổi màu.

**An toàn tiếng Việt.**
- Line-height không bao giờ dưới 1.2 (heading) hoặc 1.5 (text UI); dấu chồng (`Ỗ`, `ặ`) bị cắt nếu thấp hơn.
- Letter-spacing ≥ `-0.015em` trên heading, `0` trên body; không bao giờ track body text tiếng Việt.
- Mọi container `overflow: hidden` hoặc `line-clamp` nhận `padding-block: 0.15em` để dấu trên và dưới không bị cắt.
- `lang` được set trên `<html>` theo locale, và trên mọi element hiện English fallback trong page vi.
- Chuỗi vi dài hơn ~10–15%: button, nav và table header phải chứa được vi ở 360px mà không truncate.
- Chuỗi QA dùng trong mọi type story: `Hưởng ứng - Ở Đồng Tháp, những người thợ xây đã hoàn thành ngôi nhà mới. 0O 1lI {}`.

 

<h3 id="s-3-3">3.3 Spacing, radius, elevation</h3>

| Spacing | `0` 0 · `0.5` 2px · `1` 4px · `1.5` 6px · `2` 8px · `3` 12px · `4` 16px · `5` 20px · `6` 24px · `8` 32px · `10` 40px · `12` 48px · `16` 64px · `24` 96px · `32` 128px (base 4px) |
| --- | --- |
| Radius (shadcn, từ `--radius: 0.5rem`) | `rounded-sm` 4px (badge, kbd, inline code) · `rounded-md` 6px (input, button) · `rounded-lg` 8px (card, menu, code block) · `rounded-xl` 12px (dialog, media) · `rounded-full` (avatar, pill) |
| Chiều cao control | public 40px (touch target 44px trên mobile) · admin 32px mặc định, 28px compact; icon button 32/28 với hit area 44px trên touch |

| Elevation | Light | Dark | Dùng cho |
| --- | --- | --- | --- |
| `--shadow-0` | none | none | Phẳng (hầu hết surface; dùng border) |
| `--shadow-1` | `0 1px 2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .06)` | Header sticky, card resting trên band |
| `--shadow-2` | `0 4px 12px -2px rgb(16 24 40 / .10), 0 2px 4px -2px rgb(16 24 40 / .06)` | `0 0 0 1px rgb(255 255 255 / .08), 0 8px 24px rgb(0 0 0 / .5)` | Popover, dropdown, toast, card hover (v2) |
| `--shadow-3` | `0 16px 40px -8px rgb(16 24 40 / .18)` | `0 0 0 1px rgb(255 255 255 / .10), 0 24px 48px rgb(0 0 0 / .6)` | Dialog, command palette |

Dark mode thể hiện elevation bằng surface sáng hơn kèm hairline trong 1px, không phải chỉ bằng shadow.

 

<h3 id="s-3-4">3.4 Motion</h3>

| Token | Value | Dùng cho |
| --- | --- | --- |
| `--dur-instant` | 80ms | Press, tick checkbox |
| `--dur-fast` | 140ms | Hover, color, focus |
| `--dur-base` | 200ms | Menu, tooltip, toast in |
| `--dur-slow` | 320ms | Dialog, sheet, reveal section page |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Entering |
| `--ease-in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Leaving (dùng duration 0.75×) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Moving/reordering |

Rule (v2):

- Chỉ animate `opacity` và `transform` (kèm `box-shadow`/`border-color` lúc hover). Không scroll-jacking, không parallax gắn vị trí scroll, không effect cursor-follow.
- Mọi effect dưới đây là CSS-only trừ reveal và count-up, dùng một hook `IntersectionObserver` dùng chung (`useInView`, `once: true`). Không animation library.
- Animation ambient chạy **chỉ** trên hero home và CTA band, pause khi ra khỏi màn (`animation-play-state: paused` qua cùng observer) và khi tab bị ẩn.

| Effect | Ở đâu | Spec | Fallback reduced-motion |
| --- | --- | --- | --- |
| Section reveal | Section Home và About, key-facts case study, grid card | `opacity 0 → 1`, `translateY(12px) → 0`, `--dur-slow` (320ms) `--ease-out`, một lần, khi 15% visible. Grid stagger 60ms mỗi item, tối đa 6 item (item sau hiện cùng item thứ 6) | Content hiện ngay, không transform |
| Card hover / focus-within | Card project, domain, post | Border → `--border-strong`, `translateY(-2px)`, `--shadow-2`, title → `--primary`, mũi tên `↗` dịch 2px lên-phải; `--dur-fast` | Chỉ đổi color và border, không lift |
| Button hover | Button primary | Background → `--primary-hover`; ở dark hero/CTA thì `--glow-button` cũng đậm hơn | Giống vậy, không đổi glow |
| Orb | Hero (2), CTA (1) | Hình tròn 320–420px của `--glow`, `filter: blur(80px)`, nổi ±24px trong 20s / 26s `ease-in-out infinite` | Tĩnh, cùng vị trí |
| Migration diagram hero | Hero home | Node fade in theo thứ tự (stagger 60ms), stroke connector vẽ một lần (`stroke-dashoffset`, 900ms), rồi node "pulse" opacity .6 ↔ 1 mỗi 3s chỉ trên node active (`v2`) | Vẽ đủ, không pulse |
| Stat count-up | Stats band | Số đếm từ 0 tới value một lần, 700ms `--ease-out`, `tabular-nums` để width không nhảy; giá trị thật nằm trong DOM từ đầu (`aria-label` = giá trị cuối) | Hiện giá trị cuối |
| Tech marquee | Dưới stats | Hai track giống nhau translate −50% trong 40s linear infinite; pause lúc hover và keyboard focus; button pause/play nhìn thấy (`aria-pressed`); track thứ hai `aria-hidden` | Một list chip tĩnh, wrap |
| Theme switch | Global | Không transition (`disableTransitionOnChange`) | n/a |
| Route transition | List project ↔ case study | View Transitions API: morph ảnh cover, 320ms | Instant |

- Không bao giờ animate: body text, prose, code, table row, UI admin (admin chỉ giữ transition menu/dialog/toast từ shadcn).
- `@media (prefers-reduced-motion: reduce)`: mọi effect trên fallback như đã liệt kê; duration → `0.01ms` trừ fade opacity ở `--dur-fast`; timeline render bung hết.
- `@media (prefers-reduced-transparency: reduce)`: `--card-glass` → `--card` đặc, ẩn orb.

 

<h3 id="s-3-5">3.5 Breakpoints và z-index</h3>

| Breakpoint | Min width | Layout |
| --- | --- | --- |
| `base` | 0 | Grid 4-col, gutter 16px, padding page 20px |
| `sm` | 640px | 4-col, type lớn hơn |
| `md` | 768px | 8-col, gutter 24px; sidebar admin thành rail |
| `lg` | 1024px | 12-col, gutter 32px; sidebar admin full |
| `xl` | 1280px | Container cap 1120px (public) |
| `2xl` | 1536px | Editor admin hiện 3 pane |

| Token z-index | Value | Dùng cho |
| --- | --- | --- |
| `--z-base` | 0 | Content |
| `--z-raised` | 10 | Header table sticky, TOC sticky |
| `--z-header` | 100 | Header site, topbar admin |
| `--z-sidebar` | 200 | Sidebar admin mobile |
| `--z-dropdown` | 300 | Menu, combobox, tooltip |
| `--z-overlay` | 400 | Backdrop dialog/sheet |
| `--z-modal` | 500 | Dialog, sheet, command palette |
| `--z-toast` | 600 | Toast, notification realtime |
| `--z-skip` | 700 | Skip link (khi focus) |

 

<h3 id="s-3-6">3.6 Theme shadcn: CSS variables (`packages/ui/src/styles/globals.css`)</h3>

shadcn/ui (Tailwind v4, style `new-york`, `baseColor: neutral`, `cssVariables: true`) được init trong `packages/ui` với setup monorepo (`components.json` ở cả `packages/ui` và `apps/web`). `globals.css` được generate sẽ bị thay bằng block dưới; component shadcn lúc đó nhận palette của mình mà không sửa màu từng component. Dùng hex thay OKLCH mặc định của shadcn để giá trị khớp đúng bảng contrast.

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
 --radius: 0.5rem;

 --background: #FAFAF9; --foreground: #18181B;
 --card: #FFFFFF; --card-foreground: #18181B;
 --popover: #FFFFFF; --popover-foreground: #18181B;
 --primary: #0F766E; --primary-foreground: #FFFFFF;
 --secondary: #F2F2EF; --secondary-foreground: #18181B;
 --muted: #F2F2EF; --muted-foreground: #52525B;
 --accent: #F2F2EF; --accent-foreground: #18181B;
 --destructive: #B42318; --destructive-foreground: #FFFFFF;
 --border: #E4E4E0; --input: #8A8A93; --ring: #0F766E;
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
 --info: #1D4ED8; --info-subtle: #E8EDFB;
 --destructive-subtle: #F7E9E8;

 /* v2: bands, atmosphere, domain hues */
 --band: #F3F5F3; --border-strong: #CFCFC9;
 --grid-line: rgb(15 118 110 / .06); --glow: rgb(15 118 110 / .10);
 --glow-button: var(--shadow-1); --card-glass: rgb(255 255 255 / .72);
 --hue-jade: #0F766E; --hue-jade-subtle: #E7F1F1;
 --hue-amber: #8A4B08; --hue-amber-subtle: #F3EDE6;
 --hue-blue: #1D4ED8; --hue-blue-subtle: #E8EDFB;
 --hue-violet: #6D28D9; --hue-violet-subtle: #F0EAFB;
 --hue-rose: #B4235A; --hue-rose-subtle: #F8E9EF;

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
 --background: #0A0F0E; --foreground: #E8EFED;
 --card: #111817; --card-foreground: #E8EFED;
 --popover: #172120; --popover-foreground: #E8EFED;
 --primary: #2DD4BF; --primary-foreground: #042F2B;
 --secondary: #172120; --secondary-foreground: #E8EFED;
 --muted: #172120; --muted-foreground: #9DB0AB;
 --accent: #172120; --accent-foreground: #E8EFED;
 --destructive: #F97066; --destructive-foreground: #0A0F0E;
 --border: #233230; --input: #62807A; --ring: #2DD4BF;
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
 --info: #7AA2F7; --info-subtle: #1B2540;
 --destructive-subtle: #3A1F1F;

 --band: #0D1412; --border-strong: #2F4542;
 --grid-line: rgb(45 212 191 / .08); --glow: rgb(45 212 191 / .18);
 --glow-button: 0 0 24px -6px rgb(45 212 191 / .55); --card-glass: rgb(17 24 23 / .72);
 --hue-jade: #2DD4BF; --hue-jade-subtle: #15322F;
 --hue-amber: #FBBF24; --hue-amber-subtle: #322F19;
 --hue-blue: #7AA2F7; --hue-blue-subtle: #202B36;
 --hue-violet: #C4B5FD; --hue-violet-subtle: #2A2E37;
 --hue-rose: #FDA4C4; --hue-rose-subtle: #322C2F;

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

 

<h3 id="s-3-7">3.7 Mapping Tailwind v4 (cùng file, `@theme inline`)</h3>

`@theme inline` biến mọi variable thành utility theo theme đang active: `bg-background`, `text-muted-foreground`, `text-subtle-foreground`, `bg-primary-subtle`, `border-input`, `ring-ring`, `rounded-lg`, `shadow-2`, `font-heading`, `text-prose`, `bg-band`, `border-border-strong`, `bg-hue-amber-subtle text-hue-amber`, `text-display`, `text-eyebrow`, `z-modal`, `duration-base`, `ease-out`.

```css
@theme inline {
 --color-background: var(--background); --color-foreground: var(--foreground);
 --color-card: var(--card); --color-card-foreground: var(--card-foreground);
 --color-popover: var(--popover); --color-popover-foreground: var(--popover-foreground);
 --color-primary: var(--primary); --color-primary-foreground: var(--primary-foreground);
 --color-primary-hover: var(--primary-hover);
 --color-primary-subtle: var(--primary-subtle);
 --color-primary-subtle-foreground: var(--primary-subtle-foreground);
 --color-secondary: var(--secondary); --color-secondary-foreground: var(--secondary-foreground);
 --color-muted: var(--muted); --color-muted-foreground: var(--muted-foreground);
 --color-subtle-foreground: var(--subtle-foreground);
 --color-accent: var(--accent); --color-accent-foreground: var(--accent-foreground);
 --color-destructive: var(--destructive); --color-destructive-foreground: var(--destructive-foreground);
 --color-destructive-subtle: var(--destructive-subtle);
 --color-success: var(--success); --color-success-subtle: var(--success-subtle);
 --color-warning: var(--warning); --color-warning-subtle: var(--warning-subtle);
 --color-info: var(--info); --color-info-subtle: var(--info-subtle);
 --color-border: var(--border); --color-input: var(--input); --color-ring: var(--ring);
 --color-band: var(--band); --color-border-strong: var(--border-strong);
 --color-card-glass: var(--card-glass);
 --color-hue-jade: var(--hue-jade); --color-hue-jade-subtle: var(--hue-jade-subtle);
 --color-hue-amber: var(--hue-amber); --color-hue-amber-subtle: var(--hue-amber-subtle);
 --color-hue-blue: var(--hue-blue); --color-hue-blue-subtle: var(--hue-blue-subtle);
 --color-hue-violet: var(--hue-violet); --color-hue-violet-subtle: var(--hue-violet-subtle);
 --color-hue-rose: var(--hue-rose); --color-hue-rose-subtle: var(--hue-rose-subtle);
 --color-chart-1: var(--chart-1); --color-chart-2: var(--chart-2); --color-chart-3: var(--chart-3);
 --color-chart-4: var(--chart-4); --color-chart-5: var(--chart-5);
 --color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground);
 --color-sidebar-primary: var(--sidebar-primary); --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
 --color-sidebar-accent: var(--sidebar-accent); --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
 --color-sidebar-border: var(--sidebar-border); --color-sidebar-ring: var(--sidebar-ring);

 --radius-sm: calc(var(--radius) - 4px); /* 4px badges, kbd, inline code */
 --radius-md: calc(var(--radius) - 2px); /* 6px buttons, inputs */
 --radius-lg: var(--radius); /* 8px cards, menus, code blocks */
 --radius-xl: calc(var(--radius) + 4px); /* 12px dialogs, media */

 --font-heading: var(--font-be-vietnam-pro), var(--font-inter), ui-sans-serif, system-ui, sans-serif;
 --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
 --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, monospace;

 --text-display: clamp(2.5rem, 1.5rem + 4vw, 4rem); --text-display--line-height: 1.1;
 --text-title: clamp(2.125rem, 1.6rem + 2.2vw, 3rem); --text-title--line-height: 1.2;
 --text-heading: clamp(1.625rem, 1.5rem + 0.5vw, 1.875rem); --text-heading--line-height: 1.3;
 --text-subheading: 1.25rem; --text-subheading--line-height: 1.4;
 --text-prose: 1.125rem; --text-prose--line-height: 1.75;
 --text-body: 1rem; --text-body--line-height: 1.6;
 --text-meta: 0.875rem; --text-meta--line-height: 1.5;
 --text-eyebrow: 0.75rem; --text-eyebrow--line-height: 1.4; --text-eyebrow--letter-spacing: 0.08em;
 --text-ui-title: 1.25rem; --text-ui-title--line-height: 1.4;
 --text-ui: 0.875rem; --text-ui--line-height: 1.5;
 --text-ui-meta: 0.78125rem; --text-ui-meta--line-height: 1.4;

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

Size mặc định của Tailwind vẫn dùng được vì component shadcn dùng `text-sm` (14px, bằng `text-ui` / `text-meta`) và `text-xs` (12px, badge và kbd). App code và product component chỉ được dùng 11 size có tên (8 public + 3 admin); một lint rule gắn cờ `text-(xs|sm|base|lg|xl|[2-9]xl)` bên ngoài `components/ui/`, nên size public thứ 9 không lọt được. Component không bao giờ dùng class palette thô (`teal-700`); `eslint-plugin-tailwindcss` với allowlist enforce điều này.

---

