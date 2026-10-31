<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (7. Brief để rebuild mockup (v2)); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-7">7. Brief để rebuild mockup (v2)</h2>

> **Trong chương này:** Cho model đang rebuild `mockups/portfolio/`.

| § | Mục |
| --- | --- |
| 7.1 | Rule global (áp cho mọi public screen) |
| 7.2 | Screen |


Cho model đang rebuild `mockups/portfolio/`. Verdict của Parker với v1 là "too bare/plain". Screen v1 (`01`–`09`) là một surface trung tính, heading nhỏ, card flat và không imagery. **Screen mới phải nhìn giàu hơn trong một ánh mắt** nhưng vẫn giữ mọi type rule ở 3.2 và mọi contrast pair ở 3.1. Làm theo section 2, 3, 4.7 và 5.1–5.6 của spec này. Đừng copy layout, copy hay palette xanh của site reference.

 

<h3 id="s-7-1">7.1 Rule global (áp cho mọi public screen)</h3>

| # | Phải khác v1 nhìn thấy được | Spec |
| --- | --- | --- |
| G1 | Section xen kẽ giữa `--background` và sọc `--band` full-width với `border-y`; không chạy dài các section cùng màu | 3.1, 4.4 |
| G2 | Dark mode dùng neutral **nhuộm jade** (bg `#0A0F0E`, card `#111817`), không phải gray `#0B0C0E` của v1 | 3.1, 3.6 |
| G3 | Home hero và CTA band nằm trên grid 44px đã mask với 1–2 orb mềm (`--glow`); không atmosphere chỗ nào khác | 3.1b, 4.7 `Atmosphere` |
| G4 | Mọi section title có **eyebrow** uppercase mono phía trên, và trên home có **icon tile** 28px bên cạnh | 3.2 `text-eyebrow`, 4.7 `SectionHeader` |
| G5 | Card có hover/focus state nhìn thấy: lift −2px, `--border-strong`, `--shadow-2`, title chuyển `--primary`, mũi tên góc `↗`. Mỗi screen capture một card ở hover state (thêm `.is-hover` vào card đó) | Bảng motion 3.4 |
| G6 | Project mang **domain pill** (icon + name) theo hue của nó; hue chỉ lấy từ bảng 5-hue | 3.1b |
| G7 | Icon là SVG inline copy từ lucide (stroke 1.75, 16/20px). Không emoji, không icon font | 4.7 |
| G8 | Size body và prose giữ đúng như 3.2 (16/18px, 1.6/1.75). "Giàu hơn" đến từ surface, card và icon, **không bao giờ** từ text nhỏ hơn, nhạt hơn hay contrast thấp hơn | 3.2 |
| G9 | Content: placeholder dựa trên CV như v1 (Parker Vu / Hung Vu Van, Hanoi, `parker2808`, Particula v2, LitGroup cart migration, Samsung SDS MSP, This portfolio). **Không phone hay email**: hiện `<email>` chỗ nào lẽ ra có address, và nút "Copy email" copy placeholder | 1.5 |
| G10 | Mỗi screen có bản light; home, case study và post thêm bản dark (`?dark=1`) | 3.6 |

**Spec screenshot:** Playwright + system Chrome, DPR 2, full page, width 1440 (desktop) và 390 (mobile). Capture với `reducedMotion: 'no-preference'` nhưng đóng băng animation ở trạng thái cuối (thêm class `.capture` trên `<html>` để set `animation: none !important; transition: none !important` và hiện content đã reveal cùng giá trị count-up cuối), nên orb, glow và hover state nhìn thấy được nhưng ảnh là deterministic. Tên file bên dưới; lưu vào artifacts và giữ `screenshot.mjs` là entry point duy nhất.

 

<h3 id="s-7-2">7.2 Screen</h3>

| File | Screen | Phải khác v1 nhìn thấy được | Content dùng |
| --- | --- | --- | --- |
| `01-home-light.png` (1440) | Home, light | (1) Hero: kicker pill `>_ Senior Frontend · 5 yrs · Vue/Nuxt/TS`, H1 ở `text-display` (64px) với cụm accent bằng `--primary`, hero sub-line ở `text-prose`, primary + outline button, và **`MigrationDiagram`** (node v1 → v2 trên một card) bên phải thay vì box `git log` của v1; grid + orb phía sau. (2) **Stats band** mới (4 tile, icon + số lớn + label mono) trên một band. (3) Hàng **tech marquee** mới với nút pause nhìn thấy. (4) Featured case study thành `CaseCard` lớn với cover trông thật (gradient nhuộm + khung screenshot UI với block UI giả), domain pill, dòng `DiffStat` và fact chips, không phải placeholder grid flat. (5) Hàng **domains** 4-card mới với icon tile theo hue và project count. (6) Selected work card: domain pill, `↗`, `DiffStat`, chip; một card ở hover state. (7) Band **process** mới: feature card 2×2 + flow dọc 5-step với step giữa được highlight. (8) Skills 3 column với heading theo depth. (9) Notes dạng hàng `PostCard` với `#tags`. (10) **CTA band** với grid, glow, icon tile, H2, nút "Copy email" + GitHub + LinkedIn, thay CTA một dòng plain của v1. (11) Footer: một dòng mono (tên, footer nav, social icon, deploy hash), như wireframe 5.1 | Wireframe section 5.1; stats: "5+ years", "4 products shipped", "2 framework migrations", "1 enterprise platform"; domains như seed v2 ở 1.5 |
| `02-home-dark.png` (1440) | Home, dark | Cùng structure như 01 trong dark theme nhuộm jade; orb và grid hiện hơn (giá trị dark), primary button với `--glow-button`; contrast band nhìn thấy giữa `#0A0F0E` và `#0D1412` | Giống 01 |
| `03-case-study-light.png` (1440) | Case study Particula v2 | (1) Header: back link, domain pill + status pill, H1, tagline, **meta grid** với label eyebrow (ROLE, TEAM, TIMELINE, STACK). (2) Cover 21:9 với screenshot UI có khung, không phải grid flat. (3) Card **Key facts** 2×2. (4) Mỗi section bắt đầu bằng eyebrow (SUMMARY, LIMITS, HOW, TRADE-OFFS, RESULT, RETRO). (5) **Requirement columns** (functional / non-functional) với bullet ▹. (6) Decisions dạng card nhỏ với "Chose / Over / Because". (7) Metric before → after dạng card `DiffStat`. (8) Hàng **Fact chips**. (9) "More in Fintech / Web3" với 2 `CaseCard`. (10) TOC sticky bên phải với item active được đánh dấu, và reading-progress bar 2px dưới header (hiện ở ~40%) | Section 5.4; Particula: Vue 2 → Nuxt 3, RWA ratings, ReFi, team 6 người, 2024–now |
| `03b-case-study-dark.png` (1440, mới) | Case study, dark | Giống 03 bản dark | Giống |
| `04-blog-post-light.png` (1440) | Post "Vue → React: what transfers, what doesn't" | (1) Eyebrow NOTE + date · minutes mono + tag chip trên H1. (2) Callout với icon tile, không chỉ border trái. (3) Code block với thanh header (filename + language badge + nút copy). (4) Card **Key takeaways** ở cuối (3–5 bullet ▹, background `--primary-subtle`). (5) Prev/next là hai `PostCard`. (6) TOC sticky + progress bar. Prose giữ 18px / 1.75 / 66ch | Section 5.5 |
| `04b-blog-list-light.png` (1440, mới) | List notes | Search input với icon + hint `⌘K`, tag pill kèm count, list `PostCard` (date · minutes, title, `↗`, excerpt, `#tags`), một card ở hover state | Section 5.5; 3–5 post với title dựa trên CV |
| `05-home-mobile-light.png` (390) | Home, mobile | Hero với kicker, `text-display` 40px, diagram **dưới** button (đã scale), stats 2×2, marquee một hàng, domain card 1 column, process chỉ chuỗi dọc (feature card bên dưới), CTA band full width với button xếp chồng; header có hamburger. Không truncated; không scroll ngang page | Wireframe mobile section 5.1 |
| `06-admin-dashboard.png` (1440, dark) | Admin dashboard | Giữ layout. Chỉ đổi: card Content health list các check v2 mới ("Projects without a domain", "Case studies with < 2 key facts", "Marquee needs 6+ skills"); sidebar hiện item Stats, Domains và Process mới. Dùng token dark đã nhuộm. **Không** grid, orb hay band | Section 5.11 |
| `07-admin-projects-table.png` (1440) | Admin projects table | Giữ layout. Thêm cột **Domain** (hue pill) và cột count "Key facts" | Section 5.11 |
| `08-admin-project-editor.png` (1440) | Admin project editor | Giữ layout. Hiện tab mới "Card & facts" đang active: domain select, textarea key facts kèm counter, input fact chips, và live preview hiện đúng `CaseCard` | Section 5.11 |
| `09-home-skeletons.png` (1440) | Home loading state | Skeleton shape khớp section v2: hero với block diagram, 4 stat tile, hàng chip marquee, featured card, 4 domain card, chuỗi process. Atmosphere vẫn hiện (nó không phải content); không shimmer khi reduced motion | Các row section 5.0 |
| `10-about-light.png` (1440, mới) | About + timeline | Intro tách (avatar card với city + availability pill, bio), stats strip compact, timeline với year rail và group theo company (LitGroup hiện 2 role), principles đánh số (`01 -`), skills theo depth, hàng education, card download CV | Section 5.2; 4 experience row từ CV |
| `11-projects-light.png` (1440, mới) | List projects | Filter pill domain kèm count (hue dot), tech combobox, featured card rộng rồi grid `CaseCard` 2-column, một card ở hover state | Section 5.3; 4 project |
| `12-contact-light.png` (1440, mới) | Contact | Layout tách trên grid mờ: trái H1 + intro + note thời gian reply + channel card (Email `<email>` với "Copy email", GitHub `parker2808`, LinkedIn); phải form trên `--card-glass` với topic select; một field hiện ở error state | Section 5.6 |

**Acceptance check trước khi trả:** (a) mọi screen có ít nhất một band, một eyebrow và một icon tile (trừ admin); (b) body text 16px và prose 18px mọi nơi; (c) check nhanh contrast của muted text trên `--band` và mọi hue pill đạt 4.5:1 ở cả hai theme; (d) search `mockups/portfolio/*.html` tìm string dạng email, `+84` và `gmail` không ra gì; (e) screenshot 390px không overflow ngang.
