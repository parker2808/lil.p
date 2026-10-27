# UI redesign plan — public site + admin CMS (frontend only)

Status: proposal for review · Owner: Parker · Mockups: [`docs/design/redesign/`](../design/redesign/index.html) · Screenshots: [`docs/design/redesign/screenshots/`](../design/redesign/screenshots/)

---

## Tóm tắt (Tiếng Việt)

**Phạm vi.** Chỉ làm frontend: thiết kế lại giao diện trang public và admin CMS trên API và dữ liệu hiện có. Không đổi NestJS, Prisma, schema, API hay migration. Ý tưởng nào cần backend được gom vào mục [§11 Tương lai, ngoài phạm vi](#11-future-out-of-scope-needs-backend). Mọi nội dung đều lấy từ API/admin; nhãn giao diện đi qua next-intl (EN/VI). Giữ nguyên Tiptap. Chỉ dùng hạ tầng miễn phí (Vercel, Render free, TiDB, Cloudinary).

**Hướng thiết kế public, “Ink & Signal”.** Trang public là nơi nhà tuyển dụng xem, nên nó phải tự chứng minh tay nghề frontend senior. Phong cách mang tính biên tập: nền giấy ấm, mực đậm, một màu nhấn đỏ cam (“signal”), chữ IBM Plex Sans biến thiên (wght/wdth) cỡ rất lớn, và nhãn meta bằng Plex Mono. Chuyển động dày nhưng có kỷ luật:

- animation theo cuộn bằng CSS thuần (`animation-timeline`), count-up chỉ bằng CSS (`@property`)
- tiêu đề đổi độ đậm/độ rộng khi cuộn, thẻ dự án xếp chồng sticky, quy trình được ghim
- View Transitions giữa các trang (ảnh bìa bay sang trang chi tiết), đổi theme bằng hiệu ứng lan tròn
- shader WebGL2 ở hero (lazy, dừng khi khuất, có poster tĩnh), con trỏ theo chuột, nút “nam châm”, thẻ nghiêng nhẹ

Tất cả là tăng cường lũy tiến: tôn trọng `prefers-reduced-motion` và Save-Data, nội dung đầy đủ khi không có JS, và không được làm tụt Lighthouse so với hiện tại.

**Admin theo trang KB của interview-fe.**

- màu teal của KB, ánh xạ sang tên biến shadcn
- bố cục 3 cột `h-dvh`: trang không cuộn, mỗi cột tự cuộn
- top bar cố định, nhóm menu đánh số La Mã, mục đang chọn nền `accent-soft` + viền trái
- bảng lệnh kiểu DocSearch (⌘K, tìm không dấu), drawer cho mobile
- bảng chỉ cuộn ngang trong chính nó, và thành thẻ ở ≤ 639px

**Quyết định đã chốt.**

- IBM Plex Sans + IBM Plex Mono cho cả public và admin, có subset `vietnamese`. Dưới `:lang(vi)` tiêu đề nới line-height để dấu chồng (Ở, Ẫ, Ữ) không bị cắt.
- Bo góc: `--radius` = 10px là gốc, kèm một thang theo kích thước kiểu Apple (4 · 6 · 8 · **10** · 14 · 20 · 28 · full).
- Góc liền mạch dùng `corner-shape: squircle` khi trình duyệt hỗ trợ (thang nhân `--k: 1.5` để khớp thị giác). Trình duyệt chưa hỗ trợ dùng `border-radius` thường.
- Quy tắc đồng tâm: bán kính trong = bán kính ngoài − padding.

**Trạng thái tải (loading) ở mọi nơi.** Bản hiện tại gần như không có hiệu ứng tải: chưa có `loading.tsx`, skeleton chỉ là khối xám chung chung, không có thanh tiến trình khi chuyển trang. Kế hoạch bổ sung một hệ thống tải hoàn chỉnh cho cả public và admin (xem [§7.9](#79-loading-states-public--admin--loadinghtml-admin-loadinghtml), mockup `loading.html` và `admin-loading.html`):

- skeleton bám đúng bố cục từng trang/khối (cùng grid, tỉ lệ ảnh, chiều cao dòng `1lh`), nên khi dữ liệu về không bị nhảy layout (CLS ≤ 0.02)
- hiệu ứng shimmer chỉ dùng `transform`, tắt hẳn khi `prefers-reduced-motion`; skeleton chỉ hiện sau 100ms để phản hồi nhanh không bị nháy
- `loading.tsx` cho từng route và Suspense cho từng block/panel; TanStack Query: `isPending` → skeleton, `isFetching` → thanh mảnh giữ dữ liệu cũ (`keepPreviousData`), cập nhật lạc quan có hoàn tác
- nút/form đang gửi: giữ nguyên độ rộng, spinner, `aria-busy`, chặn gửi hai lần, thông báo qua live region
- thanh tiến trình chuyển trang 2px (dùng `useLinkStatus`, chỉ hiện nếu chờ quá 120ms)
- ảnh: giữ chỗ theo width/height, ảnh mờ LQIP lấy từ Cloudinary (`w_32,e_blur,q_1`, chỉ đổi URL ở frontend), rồi hiện dần ảnh thật
- màn mở đầu “ink curtain” cho lần vào đầu tiên của phiên: ≤ 700ms, không chặn thao tác, bỏ qua khi giảm chuyển động

**8 quy tắc bố cục của Parker** được áp dụng cho cả hai phía (xem [§3](#3-parkers-layout-rules--how-each-surface-complies)). Riêng trang public là trang cuộn tài liệu, nên quy tắc 1–2 chỉ áp dụng cho màn hình chia cột. Trình đọc bài Notes dùng 3 cột kiểu KB ở ≥ 1024px. Đây là câu hỏi mở cho Parker.

**Kế hoạch triển khai** gồm 17 PR nối tiếp (stacked), R1 → R16 cộng R4b, mỗi PR có tiêu chí nghiệm thu và test (Vitest, Storybook, Playwright + axe, Lighthouse). Từ R5 trở đi, mỗi PR trang đều có mục “Loading” riêng với skeleton của trang đó và test không nhảy layout:

| PR | Nội dung |
| --- | --- |
| R1 | Token + font |
| R2 | Sửa lỗi dữ liệu hiển thị (block rỗng, TODO, tiêu đề lặp, Reveal ẩn nội dung) |
| R3 | Header/footer public |
| R4 | Bộ component public |
| R4b | Nền tảng trạng thái tải: Skeleton/shimmer, nút loading, FetchBar, ảnh LQIP, công cụ test CLS |
| R5 | Các block trang chủ (+ skeleton trang chủ) |
| R6 | Shader hero |
| R7 | Lớp vi tương tác |
| R8 | Chuyển trang, thanh tiến trình route, màn mở đầu |
| R9 | Projects + case study (+ skeleton, giữ dữ liệu cũ khi lọc) |
| R10 | About + contact (+ trạng thái gửi form) |
| R11 | Notes + trình đọc (+ skeleton 3 cột) |
| R12 | Admin shell (KB) (+ thanh tiến trình teal, skeleton trong bảng lệnh) |
| R13 | Bảng + dashboard admin (+ skeleton KPI/bảng, thanh refetch, cập nhật lạc quan) |
| R14 | Editor, page builder, media, inbox (+ skeleton editor, trạng thái lưu/xuất bản, tiến trình upload) |
| R15 | Kiểm thử hiệu năng/a11y và tài liệu (+ quét CLS/loading toàn site) |
| R16 | Thư viện Figma (tuỳ chọn) |

**Cách xem.** Mở `docs/design/redesign/index.html` trong trình duyệt (thêm `?dark=1` để xem giao diện tối; `home.html?intro=1` để xem màn mở đầu; `admin-loading.html?state=dashboard|table|editor|states` cho các trạng thái tải của admin). Ảnh chụp nằm trong `docs/design/redesign/screenshots/`, ảnh “trước” trong `screenshots/before/`.

---

## Contents

0. [Scope, constraints, how to review](#0-scope-constraints-how-to-review)
1. [Audit](#1-audit)
2. [Design direction](#2-design-direction)
3. [Parker's layout rules → how each surface complies](#3-parkers-layout-rules--how-each-surface-complies)
4. [Tokens](#4-tokens)
5. [Grid and breakpoints](#5-grid-and-breakpoints)
6. [Component inventory](#6-component-inventory)
7. [Per-page designs](#7-per-page-designs)
8. [Showcase techniques → FE skills, budgets](#8-showcase-techniques--fe-skills-budgets)
9. [Implementation plan (stacked PRs)](#9-implementation-plan-stacked-prs)
10. [i18n](#10-i18n)
11. [Future, out of scope (needs backend)](#11-future-out-of-scope-needs-backend)
12. [Open questions and risks](#12-open-questions-and-risks)

---

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

## 1. Audit

### 1.1 Public site (live, 27 Oct 2026; desktop 1440, mobile 390, light and dark, EN and VI)

Live data today: 0 published projects, 0 published posts, profile avatar and resume empty, several settings still hold `TODO`. The redesign has to look excellent with **this** data, not only with a full portfolio.

| # | Area | Problem (what a visitor sees) | Root cause in code |
| --- | --- | --- | --- |
| P1 | Hierarchy | Home is a column of similar 30px section titles. Nothing signals “senior” in the first viewport besides the h1. | Every block uses the same `BlockHeading`. Band wrapper is `mx-auto max-w-5xl px-6 py-16` for every group (`apps/web/src/modules/blocks/components/BlockRenderer/BlockRenderer.tsx:49`, `:102`). |
| P2 | Spacing | Large empty bands where a block has no data (case grid, post list). | `CaseGridBlock` returns `null` (`CaseGridBlock.tsx:38`) but `BlockRenderer` still wraps it in `SectionBoundary` + `BlockLayout` padding. |
| P3 | Content quality | `TODO` is rendered publicly (hero status note, reply-time note, domain). | Settings strings shown verbatim; there is no placeholder guard. |
| P4 | Content quality | Stat “0 Products shipped”. | `PROJECT_COUNT` resolves to 0 with no published projects; `StatBand` also starts every value at `'0'` (`packages/ui/src/components/StatBand/StatBand.tsx:16`). |
| P5 | Consistency | Kicker renders “>_ > Frontend · Vue/Nuxt/TS” (double prompt). | `KickerPill` adds a terminal icon before `profile.heroKicker`, and the data already starts with `>` (`HeroBlock.tsx:55`). |
| P6 | SEO / polish | Title “Parker Vu · Senior Frontend Engineer · Parker Vu”. | `formatTitle` appends the site name when the SEO title already contains it but is not equal to it (`apps/web/src/modules/seo/utils/title.util.ts:10`). |
| P7 | Hierarchy | Two tools sections: “Tools I use” marquee plus “What I work with” skill groups. | `tech-marquee` and `skill-groups` both on home, both with headings. |
| P8 | Typography | Three families (Be Vietnam Pro display, Inter body, JetBrains Mono); h3 at 12px inside skill groups; little contrast between levels. | `apps/web/src/modules/core/utils/fonts.util.ts:1–20`; type tokens in `globals.css`. |
| P9 | Color | Near-white stone background with a teal accent used sparingly; reads as a template. Dark mode is an inverted copy with the same flatness. | `globals.css` tokens. |
| P10 | Imagery | 0 images on every page. Avatar null, covers null, and the cards fall back to flat placeholders. | `CoverPlaceholder` is a plain box; no generative fallback. |
| P11 | Motion | Content below the fold is `opacity-0` until an IntersectionObserver fires. Full-page captures, no-JS and slow devices see blank sections. | `packages/ui/src/components/Reveal/Reveal.tsx:16,25` (`useInView`). |
| P12 | Motion | Motion is generic (fade-up, floating orbs). Nothing demonstrates modern platform skill. | `Atmosphere` orbs, `Reveal`. |
| P13 | Layout | Narrow `max-w-5xl` column on a 1440 screen; no grid or rail; the footer is a single line. | `BlockRenderer` band wrapper; site footer. |
| P14 | Components | Projects filter uses a native `<select>` next to custom chips; mismatched heights and radii. | `ProjectsBrowserBlock`. |
| P15 | Responsiveness | Mobile hero is fine; bands keep 64px vertical padding even when empty; marquee duplicates content for screen readers. | Same as P2, plus the `TechMarquee` duplicate track (already hidden under reduced motion). |
| P16 | a11y | Baseline is good (axe 0 serious/critical; Lighthouse a11y ≥ 95 in CI, see `docs/audits/2026-10-26-a11y-perf.md`). Risks to keep: count-up `aria-label` and the Reveal-hidden content. | — |
| P17 | Performance | Lighthouse mobile performance 79 local / 59–64 on CI for home. The remaining cost is JS. | `docs/audits/2026-10-26-a11y-perf.md` |
| P18 | Loading | Visitors never see a loading state. Clicking a nav link leaves the old page frozen, with no feedback, until the RSC payload arrives (worst on a cold Render free-tier API). The block skeletons that exist are one generic box (`h-80 w-full`, `animate-pulse`) unrelated to the block's shape. The contact button swaps “Send” for “Sending…”, so its width jumps, and it becomes `disabled`, which drops focus. Images are not covered: there is no placeholder. | No `loading.tsx` under `app/[locale]/(site)`. `SectionBoundary` wraps each block in `Suspense`, but the registry's skeletons are boxes (`HeroBlock.tsx:98`, `ProjectsBrowserBlock.tsx:99`, `block-renderers.constant.ts:52`). `packages/ui/src/components/ui/skeleton.tsx` uses `animate-pulse`. `ContactForm.tsx:257–268`. |

### 1.2 Admin CMS (code review + the live sign-in screen)

| # | Area | Problem | Where |
| --- | --- | --- | --- |
| A1 | Layout | The whole document scrolls; sidebar and top bar scroll away on long forms (violates rules 1–4). | `AdminShell.tsx`: `flex min-h-dvh`, `main` is `flex-1 p-6`. |
| A2 | Targets | Sidebar items are `h-8` (32px), below the KB `min-h-10` and below comfortable touch size. | `AdminSidebar.tsx:84` |
| A3 | Hierarchy | Group labels and items share the muted style; the active state is only a background tint. | `AdminSidebar.tsx:76–84` |
| A4 | Width | Forms and tables stretch to the full main width; long text fields have no reading measure. | `main.p-6` with no max width; `EditorShell`. |
| A5 | Tables | `DataTable` has no mobile strategy; it either overflows the page or squeezes columns (violates rule 5). | `packages/ui/src/components/DataTable/DataTable.tsx` |
| A6 | Palette | ⌘K exists (`apps/web/src/modules/admin-core/components/CommandPalette/CommandPalette.tsx`) but is a plain cmdk dialog with no grouping, skeleton or diacritics-insensitive search. | — |
| A7 | Feedback | Health issues are a list; nothing ties an issue to the exact field, and there is no client-side TODO warning. | Dashboard / health widgets. |
| A8 | Consistency | Sign-in is a centered card that shares nothing with the public brand. | `/admin/login` |
| A9 | Visual | Same flat stone + teal as public, so admin and site feel identical but neither feels designed. | `globals.css` |
| A10 | Loading | No route-level loading state or progress indicator, so a sidebar click looks ignored. Table skeleton rows are full-width `h-6` bars in auto-layout columns, so column widths jump when rows land. Five list hooks already use `keepPreviousData`, but nothing shows the refetch, so a filter change looks like a no-op. Sign-in has no pending state. Uploads report XHR progress that only the uploader shows. | No `loading.tsx` under `app/admin/(cms)`. `DataTable.tsx:391–395`. `use-admin-projects.hook.ts:26` (and posts, users, experience, notes search). `LoginForm.tsx:85`. `media-upload.service.ts`. Dashboard Suspense fallbacks are plain boxes (`AdminDashboardIndex.tsx`). |

---

## 2. Design direction

**Public, “Ink & Signal”.** An editorial, print-inspired system: warm paper, dense ink and a single vermilion signal. Typography does the heavy lifting: variable IBM Plex Sans set very large and condensed (`wdth 85`), an italic light accent word in signal color, and Plex Mono for meta, numbers and indices. Each section carries a `§` rail with a computed index, and content sits on a 12-column grid with a three-column rail.

Motion is the second voice, and almost all of it is CSS that runs off the main thread:

- the headline reveals line by line, then thins and widens as you scroll
- stats count up on a view timeline
- selected work stacks as sticky sheets
- the migration process pins and fills
- covers morph into the case study through View Transitions
- the hero carries a slow, pointer-reactive WebGL2 field in the signal color

With no project images today, every cover is a **generative cover**: domain hue, a glyph from the title, and a pattern from the slug hash. The site still looks authored at zero media.

**Admin, “KB workspace”.** Calm, dense and fast, taken directly from the interview-fe knowledge-base page:

- teal palette, radial glow background
- fixed top bar and a three-pane `h-dvh` split where each pane scrolls independently
- roman-numeral nav groups, an `accent-soft` active item with a left border
- a DocSearch-style palette and a `48rem` reading canvas for editors

The admin shares type, spacing, radius and motion tokens with the public site, and every shadcn variable name, so `packages/ui` components render correctly in either scope.

**Shape.** One radius ladder based on 10px. Size decides the step. Continuous (squircle) corners are used where supported, and nested surfaces stay concentric. See [§4.4](#44-radius--10px-base-apple-style-scale-continuous-corners).

---

## 3. Parker's layout rules → how each surface complies

| Rule | Admin | Public |
| --- | --- | --- |
| 1. Full-viewport split panes, page never scrolls | `html` + `body` locked (`height: 100dvh; overflow: hidden`, the KB `docs-lock-scroll`); `.app` grid fixed below the top bar. | Public pages are long-form documents and keep document scroll. **Split-pane screens** (the notes reader at ≥ 1024px) lock the document like the KB. *Open question Q1.* |
| 2. Sticky/fixed top nav always visible | Fixed `h-12` top bar, `bg-card/95 backdrop-blur`. | Sticky header is always visible (no hide-on-scroll); it only compacts 64 → 56px on a scroll timeline. |
| 3. Left menu: one vertical scroll, never horizontal | `.pane-side`: `overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain`; labels `text-overflow: ellipsis`. | Notes reader left pane, same rules. |
| 4. Content scrolls on its own, no nested scrollbars | `.pane-main` is the only scroller in the content column. Palette and TOC box lists are bounded overlays (`max-h-[min(24rem,50vh)]`), not nested page scrollers. | Filter pills **wrap**, never a horizontal scroller. Code blocks and tables scroll only on x inside themselves (rule 5). |
| 5. Tables on mobile: scroll inside or cards ≤ 639px | `.table-wrap` x-only; rows with `td[data-label]` become cards ≤ 639px (`admin-projects` mobile screenshot). | Prose tables in posts and case studies: same `.table-wrap` + `data-label` (the Tiptap table output gets `data-label` from the header row at render). |
| 6. Prefer shadcn/ui + TanStack | Sidebar, Sheet (drawer), Command (palette), Table + TanStack Table, Resizable (inspector), Tabs, Form + TanStack Form. | Sheet (mobile menu), Command (search), Tooltip, ToggleGroup (locale, view switch). |
| 7. No hardcoded content | See [§0](#0-scope-constraints-how-to-review): API data + next-intl labels; computed numbering. | Same. |
| 8. Figma deliverables editable | R16 (optional): variables for both palettes, text styles, the radius ladder and components built with auto-layout, not flattened screenshots. | Same file. |

---

## 4. Tokens

All tokens are CSS custom properties under shadcn names, so components do not care which scope they render in. The public scope is `:root` (`.dark` for night ink), and the admin scope is `.admin` (`.dark .admin`). R1 sets them in `packages/ui/src/styles/globals.css` and maps them into Tailwind v4 with `@theme inline`.

### 4.1 Color

**Public “Ink & Signal”**

| Role | shadcn var | Light | Dark (“night ink”) | Notes |
| --- | --- | --- | --- | --- |
| Page | `--background` | `#f6f3ec` paper | `#111318` | Optional grain overlay (SVG noise, 5%). |
| Raised | `--card` | `#fcfaf6` | `#181b22` | |
| Sunken / band | `--muted` | `#eeeae0` | `#0b0d11` | BAND surface. |
| Inverse | `--inverse` (new name) | `#16181f` | `#eee9df` | CTA band, code blocks. |
| Text | `--foreground` | `#16181f` (16.2:1) | `#eee9df` (15.1:1) | |
| Text 2 | `--muted-foreground` | `#474a54` (8.3:1) | `#b7b2a8` (8.9:1) | |
| Text 3 | `--faint-foreground` (new) | `#686b75` (5.0:1) | `#8f8b83` (5.4:1) | Smallest allowed for body-size text. |
| Rule | `--border` / `--input` | `#dcd6c9` / `#bfb8a8` | `#2a2e37` / `#3d424d` | |
| Signal | `--primary` | `#e5482d` | `#ff6b4a` | Fills, marks, large type only. |
| Signal ink | `--primary-ink` (new) | `#b3321a` (5.9:1) | `#ff8f74` (7.6:1) | Links, small text. |
| Signal wash | `--primary-subtle` | `#fbe4da` | `#331a14` | Selection, decision callouts. |
| Diff | `--add` / `--del` (+ `-wash`) | `#1e7a4c` / `#b42318` | `#5cc98f` / `#ff7d6e` | Metric before → after. |
| Domain hues | `--hue-{jade,amber,blue,violet,rose}` (+ `-wash`) | see `redesign.css` | see `redesign.css` | The existing `Hue` enum drives covers and chips. |

**Admin “KB teal”** (values from the interview-fe KB; only `--faint-foreground` changed)

| shadcn var | KB name | Light | Dark |
| --- | --- | --- | --- |
| `--background` | `--bg` | `#f4f7f6` | `#0f1614` |
| `--card` | `--bg-elevated` | `#ffffff` | `#1a2421` |
| `--foreground` | `--ink` | `#14201c` | `#e7f0ec` |
| `--muted-foreground` | `--ink-muted` | `#5a6b64` | `#9db0a8` |
| `--faint-foreground` | `--ink-faint` | `#66776f` (KB `#8a9a93` is 2.9:1; darkened to 4.6:1 because it labels 11px groups) | `#879a92` |
| `--border` | `--line` | `#d5e0db` | `#2a3833` |
| `--primary` | `--accent` | `#0f766e` | `#2dd4bf` |
| `--primary-subtle` | `--accent-soft` | `#ccfbf1` | `#134e4a` |
| `--primary-ink` | `--accent-ink` | `#115e59` | `#5eead4` |
| `--success` / `--success-subtle` | `--done` / `--done-soft` | `#15803d` / `#dcfce7` | `#4ade80` / `#14532d` |
| `--glow-a` / `--glow-b` | `--bg-glow-a/-b` | `#d9efe9` / `#e8f0ec` | `#12201c` / `#15241f` |
| `--code-bg` / `--code-fg` | same | `#0f1c18` / `#e7f5f1` | `#0a1210` / `#d5efe8` |

R1 adds a Vitest contrast test that reads the token table and asserts the AA pairs listed above, so a later color tweak cannot silently break contrast.

### 4.2 Type: IBM Plex Sans + IBM Plex Mono

- **Loading:** `next/font/google` with `IBM_Plex_Sans` (variable `wght 100–700`, `wdth 85–100`, roman + italic) and `IBM_Plex_Mono` (400, 500, italic 400). Subsets `latin`, `latin-ext`, `vietnamese`; `display: 'swap'`; the next/font metric fallback avoids CLS. These replace `fonts.util.ts`, so one display family is dropped.
- **Scale** (fluid, `clamp`):

  | Token | px | Role |
  | --- | --- | --- |
  | `--step--2` | 12 | Mono meta |
  | `--step--1` | 14 | Small |
  | `--step-0` | 16→17 | Body, line-height 1.62 |
  | `--step-1` | 18→21 | Lead |
  | `--step-2` | 22→28 | h3 |
  | `--step-3` | 28→44 | h2, `wdth 90` |
  | `--step-4` | 36→68 | Page h1 |
  | `--step-5` | 48→144 | Hero, `wght 650 · wdth 85 · tracking −0.045em` |

  The accent word is italic `wght 300 · wdth 100` in signal color. The admin uses the same families at a denser scale: 14px UI, 26px page title, 11px uppercase group labels.
- **Vietnamese:**
  - `:lang(vi)` raises display leading 0.94 → 1.06 and tight leading 1.05 → 1.14, so stacked marks (Ở, Ẫ, Ữ, Ặ) never collide with the line above.
  - Line-mask reveals pad `0.06em` block-start/end so marks are not clipped by `overflow: clip`.
  - The `lang` attribute is set per field on fallback content (EN shown on `/vi`), so the browser picks correct shaping and hyphenation.
  - See `foundations.html` and `post.html` (VI fallback callout).
- **Numbers:** `font-variant-numeric: tabular-nums` for stats, tables and dates.

### 4.3 Spacing

4px base: `--s-1…--s-10` = 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section rhythm is fluid with `--section-y: clamp(72px, 10vw, 160px)`. The admin uses the same steps, mostly 8–24.

### 4.4 Radius: 10px base, Apple-style scale, continuous corners

**Ladder** (size decides the step; capsules stay round, like iOS):

| Token | Value | Use (element height) |
| --- | --- | --- |
| `--radius-2xs` | 4 | ≤ 20px: kbd, inline code, checkbox |
| `--radius-xs` | 6 | 20–28px: tags, badges, thumbnails |
| `--radius-sm` | 8 | 28–36px: small buttons, segments |
| **`--radius`** | **10** | **36–48px: buttons, inputs, nav items (base)** |
| `--radius-lg` | 14 | cards ≤ 360px, menus, popovers, toasts |
| `--radius-xl` | 20 | large cards, panels, media, palette |
| `--radius-2xl` | 28 | dialogs, sheets, hero media, stacked cards |
| `--radius-full` | 9999 | chips, avatars, switches |

Every step is `calc(<px> * var(--k))`, with `--k: 1` by default. R1 replaces today's `--radius: 0.5rem` ladder (`globals.css:8, 270–273`) and maps Tailwind `rounded-*` onto it, so existing shadcn components inherit it.

**Continuous corners (techniques, in order of preference):**

1. **`corner-shape: squircle`** (CSS Borders 4). This is a one-line progressive enhancement with no layout or JS cost.

   ```css
   @supports (corner-shape: squircle) {
     :root { --k: 1.5; }            /* a squircle reads tighter; scale the ladder */
     .sq, .btn, .card, … { corner-shape: squircle; }
     .chip, .avatar, .switch { corner-shape: round; }
   }
   ```

   Chromium ships it today (verified in Chrome 156 in this environment); other engines fall back to the circular `border-radius`, and the design is valid either way. `--k: 1.5` is the optical match; tune it in R1 against `foundations.html` (round 28 vs squircle 28 vs squircle 42).
2. **SVG `clip-path: path()` / `mask`.** For a few large media surfaces only (hero media, case-study cover), if Parker wants squircles in Safari and Firefox too. Generate the path with `figma-squircle` (MIT, ~2 KB) from a `ResizeObserver`. Costs: a JS dependency, a repaint on resize, and borders and shadows must be drawn inside the mask. **Not** for controls.
3. **Houdini paint worklet** (`paint(squircle)`). Chromium-only and therefore redundant with option 1. Rejected.

**Concentric nesting.** The inner radius equals the outer radius minus the padding, and never drops below `--radius-2xs`:

```css
.nest { --r-outer: var(--radius-2xl); --pad: 12px; border-radius: var(--r-outer); padding: var(--pad); }
.nest > .nest-inner { border-radius: max(var(--radius-2xs), calc(var(--r-outer) - var(--pad))); }
```

It is used for stacked case cards (sheet 2xl, cover 2xl − 12), media tiles, the editor card preview, swatches, and the cover badge (`calc(--radius-xl − 16px)`). R4 ships it as a `Nest` primitive (Tailwind plugin utility `rounded-nest`) with a Storybook story.

### 4.5 Elevation

Hairlines come first (`--shadow-hair`). Shadows are reserved for floating things:

- `--shadow-1`: subtle
- `--shadow-2`: cards that stack or float
- `--shadow-pop`: menus, palette, dialogs

The public signature hover is a hard print offset, `--shadow-press: 4px 4px 0 0 ink` (signal in dark). The admin sets `--shadow-press: none`.

### 4.6 Motion

- **Durations:** `--dur-1…5` = 120, 200, 320, 560, 900 ms.
- **Easings:**
  - `--ease-out: cubic-bezier(.22,1,.36,1)`, the KB `--ease`, shared with the admin
  - `--ease-expo: cubic-bezier(.16,1,.3,1)`
  - `--ease-in-out: cubic-bezier(.65,0,.35,1)`
  - `--ease-spring`: a `linear()` spring
- **Admin:** only the KB motions, `animate-fade-up` (0.35s, 8px, staggered by `--i`) and the themed checkbox 0.12s scale-in.
- **Loading** (both apps, [§7.9](#79-loading-states-public--admin--loadinghtml-admin-loadinghtml)):
  - shimmer: a 1.6s `--ease-in-out` translate sweep, 80ms stagger
  - skeleton fade-in: `--dur-2` after 100ms
  - route bar: shown after 120ms, an 8s trickle to 92%, then `--dur-2` to complete
  - spinner: 0.7s linear
  - intro curtain: ≤ 700ms on `--ease-expo`

  All of these are static under reduced motion.
- **Reduced motion:** a global rule collapses durations to 0.01ms, and the specific scroll-driven effects are disabled. The ticker becomes a static wrapped row; pins and stacks become static; the shader shows its poster. Content is never hidden behind motion: SSR HTML has the final state.

---

## 5. Grid and breakpoints

- **Public:**
  - Container `1320px` plus fluid margins `clamp(20px, 5vw, 72px)`.
  - 12 columns with a `clamp(16px, 2vw, 24px)` gutter.
  - A **rail** of three columns for the `§` index and sticky TOC; content takes columns 4–12.
  - Breakpoints: 560 (single column), 760, 860 (nav → menu), 960 (rail collapses), 1024 (split-pane reader), 1280.
- **Admin:**
  - The app grid is `16rem | 1fr`; with an aside it is `16rem | 1fr | 18rem`. At ≥ 1280 it widens to 18/20rem, like the KB `w-64 xl:w-72`.
  - Data pages cap at `80rem`; the editor canvas caps at **`48rem`** (the KB `max-w-prose`).
  - Below 1100 the aside folds into the main column; below 860 the sidebar becomes the drawer `w-[min(100%,20rem)]`.
  - Tables become cards below 640.
- **Block layout presets** (`packages/contracts/src/blocks/block-layout.constant.ts`, unchanged) map onto the grid: `ONE` → 12, `TWO` → 6 + 6, `THREE` → 4 × 3, `FOUR` → 3 × 4, `SPLIT_8_4` → 8 + 4, `SPLIT_4_8` → 4 + 8, `SPLIT_7_5` → 7 + 5.
- **Surfaces:** `PLAIN` → paper, `BAND` → sunken. The `cta-band` block always renders the inverse surface: a block-type style, not a new surface value.

---

## 6. Component inventory

Legend: **new** (new component), **restyle** (same API, new look), **extend** (new optional props). Public components live in `packages/ui/src/components`, app glue in `apps/web/src/modules/*`.

### 6.1 Shared foundations (`packages/ui`)

| Component | Status | Notes |
| --- | --- | --- |
| Tokens + `@theme inline` mapping | restyle | R1; both scopes. |
| `Button` (`ui/button.tsx`) | extend | Variants `default`, `ghost`, `signal`, `link`; sizes `sm`/`md`/`lg`; public hover = print offset; admin = tint. |
| `Kbd`, `Badge`, `StatusPill` | restyle | Status colors for DRAFT / PUBLISHED / ARCHIVED. |
| `Nest` | new | Concentric radius wrapper ([§4.4](#44-radius--10px-base-apple-style-scale-continuous-corners)). |
| `Chip`, `FilterChip` | new | Capsule, `aria-pressed`, wraps (rule 4). |
| `Tag` | new | Mono, `--radius-xs`. |
| `Monogram` | new | Initial(s) from `profile.displayName`; avatar fallback. |
| `GenerativeCover` | new | Props `{ hue, title, slug, version? }`. Glyph = first letters of the title words; pattern (dots / stripes / rings) = FNV-1a hash of the slug mod 3; deterministic for SSR. Replaces `CoverPlaceholder` when `cover` is null. |
| `MetricDiff` | new | `before` (strike, `--del`) → `after` (`--add`) from `publicProjectMetricSchema`. Replaces `DiffStat` styling. |
| `EmptyState` | restyle | Hatched panel and glyph; label from i18n. |
| `Prose` | restyle | Plex scale, numbered h2, `table-wrap` + `data-label`, inverse code blocks. |
| `CodeBlock` | restyle | Inverse surface, x-only scroll. |
| `Callout`, `DecisionCard`, `KeyFacts`, `TakeawaysCard` | restyle | Callout note/decision; key facts as a hairline grid. |
| `Reveal` | **replace** | CSS view-timeline reveal; JS fallback only adds a class after hydration and never sets `opacity-0` in SSR (fixes P11). |
| `StatBand` / `StatCard` | restyle | SSR renders the final value; the CSS `@property --n` count-up overlays it on a view timeline (fixes P4 flash). |
| `TechMarquee` | restyle | `Ticker`: thin strip, WAAPI velocity, static row under reduced motion. |
| `Timeline` | restyle | Commit-graph style with a scroll-filled line. |
| `ProcessFlow` | restyle | Pinned on ≥ 961px with a named view timeline; vertical list below. |
| `PrincipleList`, `SkillGroup` | restyle | Two-column principles; skill matrix with depth bars. |
| `Atmosphere` | replace | `HeroStage`: poster gradient plus the lazy shader island (R6). |
| `Skeleton` (`ui/skeleton.tsx`) | **rewrite** | Translate-based shimmer (`::after`), surface-mixed colours, `--si` stagger, static under reduced motion; zero-specificity radius so wrappers keep their own (R4b). Replaces `animate-pulse`. |
| `SkeletonText` | new | `lines`, `widths`, inherits the type token: each line `1lh`, bar clipped to cap / x-height (R4b). |
| `SkeletonScope` | new | Wrapper for fallbacks: `aria-hidden` shapes, delayed fade-in (100ms), one `role="status"` label (R4b). |
| `Button` | extend | `loading` already exists (`button.tsx:42–75`); switch to `aria-disabled` + activation guard so focus stays, add a `done` state with `doneLabel` (R4b). |
| `ProgressBar`, `FetchBar`, `Spinner` | new / restyle | Determinate (`--v`), indeterminate refetch strip, and the existing spinner restyled (R4b). |
| `useAnnounce` / `LiveRegion` | new | One polite region per layout for Sending… / Sent / errors (R4b). |

### 6.2 Public app (`apps/web/src/modules/core`, `blocks`, `projects`, `notes`)

| Component | Status | Notes |
| --- | --- | --- |
| `SiteHeader` | restyle | Monogram wordmark, numbered nav, anchor-positioned indicator, ⌘K, EN/VI `ToggleGroup`, theme toggle (VT circular reveal), mobile `Sheet`. |
| `SiteFooter` | restyle | Columns from `nav.footer` + `socialLinks`; giant wordmark from `profile.displayName` (aria-hidden). |
| `SectionHeader` (`BlockHeading`) | restyle | `§` index computed from the rendered order, label, title, aside link. |
| `HeroBlock` | restyle | Line-masked h1 split from `headline` / `headlineAccent`; status card from `settings.availability` + `profile.city/country/timezone/careerStartDate`. Kicker icon removed, or the leading `>` stripped once (P5). |
| `CaseCard`, `FeaturedCaseBlock`, `CaseGridBlock` | restyle | `GenerativeCover`, metric diff, sticky stack variant. Container queries switch card layout (row ↔ stacked) by card width, not viewport. |
| `ProjectsBrowserBlock` | restyle | Filter chips (domain, skill) replace the native `select` (P14); Grid / Index `ToggleGroup`; Index rows with a hover preview. |
| `CaseStudyView` | restyle | Crumbs, facts bar, cover (shared element), metrics board, sticky TOC with progress, `notMine` callout, release status, next case. |
| `NotesBrowserBlock` | restyle | Pinned post, tag chips, search, year groups, EN badge for fallback. |
| `PostReader` | new layout | KB three-pane at ≥ 1024: notes nav \| article (48rem) \| “On this page” tree. Below that, a collapsible TOC box. |
| `CursorFollower`, `Magnetic`, `Tilt`, `RowPreview` | new | R7, behind `MotionProvider` (fine pointer + motion allowed). |
| `PageTransition` | new | R8, View Transitions. |
| `VitalsHud` | new, optional | `web-vitals` (MIT, ~2 KB) shows live LCP/INP/CLS behind a footer toggle; demonstrates measurement. |
| `X.Skeleton` per block and view | rewrite | One layout-matched skeleton per block in the registry and per public view (`HeroBlock.Skeleton`, `CaseStudyView.Skeleton`, `PostReader.Skeleton`, …), used by `loading.tsx` and `SectionBoundary` (R5, R9–R11). |
| `RouteProgress` + `PendingLink` | new | `useLinkStatus()` reporter inside next-intl `Link`, a `useSyncExternalStore` counter, and a 2px header bar; shared with admin (R8, R12). |
| `IntroCurtain` | new | First-visit ink curtain + nonce'd gate script (R8). |
| `CmsImage` | new | `next/image` wrapper: width/height from `publicImageSchema`, `lqipUrl()` + server `getBlurDataURL()`, fade-in on load (R4b). |

### 6.3 Admin (`apps/web/src/modules/admin-*`)

| Component | Status | Notes |
| --- | --- | --- |
| `AdminShell` | rewrite layout | KB `h-dvh`: fixed `Topbar` + `.app` grid of panes, document locked (fixes A1). |
| `AdminSidebar` | restyle | Roman-numeral group labels (computed), `min-h-10` items, `border-l-2` + `primary-subtle` active, counts from `/api/admin/stats` (A2, A3). |
| `Topbar` | restyle | Brand, crumbs, DocSearch button, View site, `NotificationBell`, theme. |
| `AdminDrawer` | new | `Sheet` with the same nav, `w-[min(100%,20rem)]`. |
| `AdminCommandPalette` | restyle | DocSearch: `pt-[14vh]`, `max-w-xl`, groups, skeleton rows, highlighted matches, diacritics-insensitive filter (`normalize('NFD')` + strip combining marks + `đ→d`), keyboard footer (A6). |
| `DataTable` | extend | `cardLabels` → `td[data-label]` for ≤ 639px cards; `ThemedCheckbox`; facets; bulk bar; density toggle; x-only wrap (A5). |
| `ThemedCheckbox` | new | KB 0.12s scale-in check; `indeterminate`. |
| Dashboard widgets | restyle | KPI cards with sparkline; health ring + issue rows that deep-link to the field (A7); views bars; inbox preview. |
| `EditorShell` | restyle | Focus mode: outline pane \| 48rem canvas \| publish pane; admin nav in the drawer. |
| `LocaleTabs` | extend | Completeness meter per locale (computed client-side from filled localized fields). |
| `MarkdownEditor` | restyle | Toolbar and slash menu restyled; extensions unchanged. |
| `PublishChecks` | new (client) | Mirrors `/api/admin/health` kinds for the open record and adds client-only checks (TODO placeholder, empty VI). |
| Page builder | restyle | Block rows with visibility state (hidden publicly when data is empty), `Resizable` inspector, preset picker limited to the block's `layouts`, PLAIN/BAND surface. |
| `MediaLibrary` | restyle | Grid + details pane, alt EN/VI, “missing alt” filter. |
| Inbox | restyle | List + reading pane. |
| Sign in | restyle | Split art/form (teal grid art), error callout, `Button loading` while signing in. |
| Admin `loading.tsx` + view skeletons | new | Shell-level fallback in `app/admin/(cms)/loading.tsx`; `Dashboard.Skeleton`, `DataTable` skeleton rows (fixed columns), `EditorShell.Skeleton`, `MediaGrid.Skeleton`, `Inbox.Skeleton` (R12–R14). |
| `DataTable` pending props | extend | `isLoading` keeps its meaning (skeleton rows); new `isFetching` shows the header `FetchBar` and dims rows; `skeletonRows` count (R13). |
| `SaveStatus` | restyle | Four states (saved, dirty, saving, error + Retry) in a fixed-width slot (R14). |
| `UploadQueue` | new | Per-file progress rows from `media-upload.service.ts` events, retry on error (R14). |

---

## 7. Per-page designs

Every page lists its data sources (unchanged endpoints) and how it behaves with today's data.

### 7.1 Home — `home.html`

Blocks render in the stored order: `hero` → `stat-band` → `tech-marquee` → `featured-case` → `domain-grid` → `case-grid` → `process` → `skill-groups` → `post-list` → `cta-band`. Data comes from `GET /api/public/pages/home` and `GET /api/public/site`.

- **Hero (`SPLIT_7_5`).**
  - Kicker with a blinking caret, then a 4-line masked h1. Lines are split at render from `headline`; the `headlineAccent` substring becomes the italic signal word.
  - Lead, two CTAs (`primaryCta`, `secondaryCta`) and the `status.json` card (`showAvailability`).
  - `HeroStage` (shader + poster) appears when `showDiagram` is on. It animates only when `settings.ambientEffects` is true.
- **Ticker.** `tech-marquee` items from skills; the heading is visually hidden. When `marqueeEnabled` is false it renders a static row.
- **§01 Stats.** Computed and manual stats. A stat that resolves to 0 is not rendered (today: `PROJECT_COUNT`).
- **§02 Featured.** The featured project: `GenerativeCover` (shared element), metric diffs, CTA.
- **§03 Selected work.** Sticky stacking sheets, with concentric radius inside each sheet. **Hidden entirely** when there are no published projects (today).
- **§04 Domains.** Sunken band with four hue-topped columns and case counts.
- **§05 Process.** Pinned on desktop; the line fills and steps light up in order.
- **§06 Writing.** Index rows. Hidden when there are no published posts (today).
- **§07 CTA.** Inverse band: big line, a copy-email button showing `<email>` from settings, social links.
- **Footer.** Columns plus a giant wordmark.
- **`skill-groups`.** Collapses into the ticker when both blocks are on home (P7). Admin shows a hint suggesting one or the other; the public side renders the skill matrix on About only if Parker removes the block from home. This is an open question, Q3.

### 7.2 Projects list — `projects.html`

- **Data:** `GET /api/public/projects` (+ `domain`, `skill`, `featured` params) and `/api/public/domains`.
- **Header:** count, sticky toolbar with **wrapping** filter chips (domain hue dots, counts), Grid / Index toggle, and URL-synced filters.
- **Grid view:** the featured card spans two columns. **Index view:** numbered rows; a pointer-following cover preview appears on fine pointers.
- **Empty (today):** `EmptyState` with the label `projects.empty` and a link to About.

### 7.3 Case study — `case-study.html`

- **Data:** `GET /api/public/projects/:slug`.
- **Top:** crumbs, h1 = `title`, tagline, and a facts bar with client, role, timeline, team size and version `from → to`. Then the 21:9 cover (shared element from the card).
- **Metrics board** (`metrics[]` before/after), then a two-column body: a sticky TOC with progress on the rail, and prose from `problem`, `constraints`, `approach`, `decisions`, `outcome`, `lessons` (markdown from Tiptap).
- **Extra blocks:** key facts (`keyFacts[]`), a **“Not mine” callout** when `notMine` is set (honest attribution, shown prominently), and release status lists.
- **Bottom:** “Next case” with a kinetic hover.
- **`isConfidential`:** the client name is shown as written by the API, and in-content images are hidden.

### 7.4 About / CV — `about.html`

- **Data:** `GET /api/public/pages/about` and `/site`.
- **About intro:** portrait frame showing a `Monogram` while `avatar` is null; definition list from the profile; bio with a drop cap.
- **Then:** compact stats; experience timeline as a commit graph (company → roles → highlights, current node in signal); principles; skill matrix; education.
- **CV download:** EN and VI cards. A card is disabled with a “not uploaded” label when `resumeEn` or `resumeVi` is null (today).

### 7.5 Contact — `contact.html`

- **Data:** the `contact-form` block, the contact topics, and settings (availability, reply-time note).
- **Layout:** big headline and channels on the left (copy-email `<email>`, social links); the form on the right with line inputs, topic pills (radio group) and an inline success state.
- **TODO guard:** notes that still contain `TODO` are not rendered.

### 7.6 Notes list — `notes.html`

- **Data:** `GET /api/public/posts` and tags.
- **Layout:** pinned latest post, tag chips, search (client filter on the loaded page), year groups, and an EN badge on fallback posts when viewing `/vi`.
- **Empty (today):** `EmptyState` (`notes.empty`).

### 7.7 Post reader — `post.html`

- **Data:** `GET /api/public/posts/:slug` plus the posts list for the left pane.
- **≥ 1024px:** KB three-pane, with the document locked. The left pane lists notes grouped by tag with roman numerals (computed), single y-scroll and ellipsis. The center is a 48rem article with a reading-progress bar driven by `scroll(nearest)`. The right pane is the “On this page” tree, whose active heading comes from an IntersectionObserver with root = the article pane, rootMargin `-20% 0 -60% 0` (KB).
- **< 1024px:** normal document with a collapsible TOC box.
- **Locale fallback:** a VI callout with `lang="vi"`.
- **Bottom:** takeaways card and next note.

### 7.8 Admin — `admin-*.html`

- **Sign in.** Teal grid art on the left, form on the right, error callout. The UI stays English-only.
- **Dashboard.** Data from `GET /api/admin/stats?range=7d|30d|90d` and `GET /api/admin/health`.
  - KPIs: views, projects, posts and unread messages.
  - Content health: a ring plus one issue row per kind, each with a deep link (`MISSING_VI` → editor field, `MISSING_ALT` → media filter, `PAGE_STALE_DRAFT` → page builder, and so on).
  - Quick actions with shortcuts, views bars with a range toggle, and an inbox preview.
- **Command palette.** `?palette=1`.
- **Drawer.** `?drawer=1` at mobile width.
- **Projects table.** TanStack Table with search, facets (status, domain, missing VI), density, bulk bar, drag order (dnd-kit), status pills and locale chips. At ≤ 639px rows become cards.
- **Project editor (focus mode).**
  - The outline pane lists sections with completeness marks.
  - The 48rem canvas has locale tabs with meters, a big title, tagline counter, facts fieldset and the Tiptap toolbar and slash menu.
  - The publish pane holds status, save state and version, preview and publish, publish checks (server health for this record plus client TODO / empty-VI checks) and a concentric card preview.
- **Page builder.** Block rows with icon, key, summary and visibility. Rows whose data is empty are marked “Hidden publicly · no data”.
  - The resizable inspector shows only the block's allowed `layouts` (hero: `SPLIT_7_5`, `ONE`) and the PLAIN / BAND surface.
  - Fields come from the block's zod `meta` (`primaryCta` EN/VI + href, `showAvailability`, `showDiagram`), next to a live mini preview.
- **Media.** Drop zone, grid with “No alt” badges, details pane with alt EN/VI and usage count.
- **Inbox.** List with unread dots, reading pane, reply-by-email action.

### 7.9 Loading states (public + admin) — `loading.html`, `admin-loading.html`

The current build shows almost no loading feedback (P18, A10). This section defines one loading system shared by both apps. The mockups show every state at real size (screenshots `loading-*.jpg`, `admin-loading*.jpg`).

**Rule 1: skeleton parity, so nothing shifts.**

- Every data component exports a colocated skeleton built from the **same layout wrapper** as the component. The plan writes it as `X.Skeleton`; in code it follows the existing naming, a named export like `HeroSkeleton`. It shares the same grid classes, `aspect-ratio`, gaps and type tokens. Only the data is swapped for skeleton shapes. The block registry already has a `skeleton` slot per block (`block-renderers.constant.ts:52`); its generic `h-80` boxes are replaced one by one.
- Static UI strings render for real inside skeletons: `§` rails, panel titles, KPI labels, table headers, toolbars, editor section titles. The page reads as itself while the data is pending, and the toolbar stays usable.
- Text lines use `SkeletonText`: each line is exactly `1lh` tall in the same type token as the real text, and the visible bar is clipped to cap height (x-height at display sizes). A 4-line hero skeleton is therefore the height of a 4-line hero.
- Variable text in the real component is **bounded**, so the skeleton can match it. Card titles and excerpts use a two-line clamp plus `min-height: 2lh`; facts and KPIs are single-line. The parity demo in `loading.html` measures Δ 0px between a skeleton card and a real one.
- Media boxes come from `aspect-ratio` (generative covers) or the API's `width`/`height` (`publicImageSchema`).
- Tables use fixed column sizes: TanStack `column.size` renders a `<colgroup>` with `table-layout: fixed`. Skeleton rows reuse the real cell structure (thumb + two text lines), so their height matches.

**Rule 2: one mechanism per situation.**

| Situation | Mechanism | What the user sees |
| --- | --- | --- |
| Navigating to a route segment whose data is not ready | `loading.tsx` per segment, shown at once by the router | That page's skeleton under the real header/shell |
| A block or panel whose data streams | `SectionBoundary` / `<Suspense fallback={<X.Skeleton/>}>` | That block's skeleton; blocks above it are already interactive |
| Client query, first load | `useSuspenseQuery` inside a boundary (admin), or `isPending` → `X.Skeleton` | Skeleton |
| Client query, refetch with data on screen | `isFetching && !isPending`, with `placeholderData: keepPreviousData` (already in 5 hooks) | Previous data dimmed to 60% plus a 2px `FetchBar`; no skeleton, focus and scroll kept |
| Any client navigation still pending after 120ms | `useLinkStatus()` in each `Link`, reported to a tiny store read by `RouteProgress` | 2px bar on the header edge (signal on public, teal in admin) |
| Mutation / form submit | `mutation.isPending`, TanStack Form `isSubmitting` | `Button loading`: width locked, spinner, `aria-busy`; double submits ignored |
| Autosave | Existing `SaveStatus` on `mutation.status` | Saved · v14 → Unsaved changes → Saving… → Couldn't save · Retry |
| Toggles and reordering (featured, drag order, read/unread) | Optimistic `onMutate` snapshot, `onError` rollback, `onSettled` invalidate | Instant change; a toast with Retry on failure |
| Upload | XHR progress from `media-upload.service.ts` | Per-file `ProgressBar` with %, error row with Retry |
| Image | `width`/`height` + Cloudinary LQIP | Reserved box → blurred preview → full image fades in |
| First hard load of a session (public) | `IntroCurtain` | Ink curtain, ≤ 700ms |

**Rule 3: timing.**

- Skeletons fade in from 100ms (CSS `animation-delay`, no JS timers, SSR-safe), so a fast response never flashes one.
- The route bar appears only if the navigation is still pending after 120ms. It trickles to 92%, completes on commit, then fades.
- “Done” states (Sent ✓, Published ✓) last 1.4s, then return to idle.
- No artificial minimum durations: content always wins.

**Rule 4: motion.**

- The shimmer is a `::after` gradient moved with `translate` (compositor-only), lasting 1.6s with an 80ms stagger per item (`--si`). `background-position` and `animate-pulse` are not used.
- Its colours are mixed from `--foreground` over whatever surface it sits on, so one class works on paper, card, band and dark.
- `prefers-reduced-motion`: no sweep, a static tone only. The route bar becomes a static bar, the spinner stops (the ring with a gap still reads as busy), and there is no image fade and no intro curtain. `?capture=1` freezes the same way for screenshots.

**Rule 5: accessibility.**

- Skeleton subtrees are `aria-hidden`. The region being loaded gets `aria-busy="true"` plus one visually hidden `role="status"` line, such as “Loading case studies…” (`states.*` keys).
- `Button loading` keeps the label in the DOM, so its width is locked. It uses `aria-disabled` instead of `disabled`, so focus stays on the button, and it ignores activation while busy. Today the Button sets `disabled` (`packages/ui/src/components/ui/button.tsx:66`).
- One polite live region per page announces Sending… / Sent / the error. Spinners are `aria-hidden`.
- Arriving content never moves focus; route-change focus is handled in R8.

**Image placeholders (LQIP) without backend changes.**

- `lqipUrl(url)` inserts `w_32,e_blur:1000,q_1,f_auto` after `/upload/` for `res.cloudinary.com` URLs, using the same parsing as `image-loader.util.ts:18`.
- On the server, `getBlurDataURL(url)` fetches that ~300-byte preview through the Next data cache, base64-encodes it and passes it to `next/image` as `placeholder="blur" blurDataURL`. The preview paints on first render with no extra request. CSP already allows `data:` in `img-src`.
- Client-only grids (admin media) use the LQIP URL directly as a CSS background, because it comes from the same CDN.
- Non-Cloudinary URLs or a failed fetch fall back to the sunken box. Generative covers need no placeholder.

**Initial page loader: the “ink curtain” (public only).**

- **Look.** An ink sheet with the monogram and a signal stroke that draws (0–340ms), then the sheet wipes upward with `clip-path` (380–700ms). The hero lines start rising as it leaves.
- **When.** Only on the first hard load of a session. A tiny inline script in `<head>`, using the request nonce from `proxy.ts` like next-themes already does, adds `html.intro` before first paint, and only when all of these hold:
  - `sessionStorage` has no flag
  - motion is allowed
  - `settings.ambientEffects` is true

  Client navigations never show it.
- **Safety.**
  - The real page is server-rendered underneath, and the curtain is `aria-hidden` with `pointer-events: none`, so input is never blocked.
  - It holds no large text or image, so it cannot become the LCP element.
  - Without JS it never appears.
- **Budget.** Lighthouse runs as a first visit, so the curtain is included in the measured LCP. It must stay within the R5 budget, and R8 has the test.

**Per-surface skeleton map** (each line is an acceptance item in the PR named in brackets):

- **Home (R5).** Hero: kicker line, 4 display lines, 3 lead lines, 2 CTA-sized boxes, and the status card with its real header and 5 dt/dd rows. Static ticker strip. Stats: 4 cells with the real rule lines. Featured and stack card: cover box at the real ratio plus meta / 2-line title / 2-line excerpt. Domains: 4 columns with hue rules. Process: 5 nodes with the real line. Post list: index rows. The CSS shader poster paints at once; the canvas never blocks.
- **Projects (R9).** Page head, filter pills (5 capsules), tools, a results line, the featured card spanning both columns, then cards. A filter change keeps the previous cards (FetchBar), and the skeleton appears only on a cold load.
- **Case study (R9).** Crumbs, 2 title lines, 2 tagline lines, the 5-column facts bar, and the 21:9 cover box, which keeps `view-transition-name` so the card → detail morph still lands. Then the metrics board, TOC and paragraph-shaped prose.
- **About (R10).** Portrait frame (monogram box), definition list, timeline nodes with role lines, principles grid, skill matrix columns. **Contact (R10).** The form is static (no skeleton); submitting is shown in `loading.html` board 06.
- **Notes + reader (R11).** List rows with year groups. Reader at ≥ 1024: nav pane lines, a 48rem article (meta, 2 title lines, paragraphs, a figure box) and TOC lines. Below 1024, only the article.
- **Admin shell (R12).** `app/admin/(cms)/loading.tsx` renders the generic page-head + panel skeleton inside the real shell. The sidebar and top bar never unmount. Teal route bar under the top bar. Palette: local commands at once, two skeleton rows while the debounced server search (150ms) is pending.
- **Dashboard and tables (R13).** KPI cards keep their labels with skeleton values; the health panel has a ring and 4 issue rows; then the views chart box and inbox rows. DataTable: a real toolbar and header, 6 skeleton rows with fixed columns, and a `role="status"` footer; at ≤ 639px the skeleton rows become cards like real rows. Refetch shows the FetchBar inside the panel header (absolutely positioned, so there is zero shift).
- **Editors, media, inbox (R14).** The editor in focus mode: outline lines, locale tabs with meter placeholders, 2 big-title lines, a tagline box, the fieldset (real labels and 36px input boxes), the Tiptap toolbar rendered disabled with paragraph lines, and the publish pane (status pill, two button boxes, check rows). Page builder: block rows at 56px. Media: 4:3 tiles, then LQIP. Inbox: message rows; `fetchNextPage` adds two skeleton rows at the end. Sign-in: `Button loading` while signing in (fixes the missing pending state at `LoginForm.tsx:85`).

---

## 8. Showcase techniques → FE skills, budgets

### 8.1 What each technique demonstrates

| Technique | Where | FE skill it shows | Cost / fallback |
| --- | --- | --- | --- |
| CSS scroll-driven animations (`animation-timeline: scroll()` / `view()`, named `view-timeline`, `animation-range`) | Section reveals, header compaction, process fill, commit-graph fill, footer wordmark, reading progress, sticky-stack recede | Modern CSS platform depth; moving motion off the main thread; replacing JS observers | 0 KB JS, compositor-friendly. `@supports` gate; IntersectionObserver class fallback; static under reduced motion. |
| Typed custom properties (`@property --n`) + `counter()` count-up | Stats | Houdini Properties & Values; SSR-first motion (final number in HTML, no hydration flash or CLS) | 0 KB JS; falls back to the static number. |
| Variable-font kinetic type (`wght` / `wdth` on scroll) | Hero h1, next-case hover, footer wordmark | Typography engineering with one variable file instead of several static weights | No extra bytes; `font-stretch` is animatable. |
| Line-mask headline reveal, VI-safe | Hero | Detail-oriented i18n typography (diacritic padding, `:lang(vi)` leading) | CSS only. |
| Sticky stacking cards + pinned section | Selected work, process | Layout mastery: sticky + timelines + containment; graceful static mode | CSS only; off < 961px. |
| CSS anchor positioning | Header nav indicator | Newest layout primitive, with an `@supports not` underline fallback | CSS only. |
| View Transitions: route crossfade, shared-element cover morph, theme circular reveal | Card → case study; theme toggle | Router integration, progressive enhancement, `view-transition-name` hygiene (unique per page) | Feature-detected; plain navigation otherwise. |
| WebGL2 fragment shader (fbm domain warp, theme-aware uniforms, pointer-reactive) | Hero stage | Graphics programming plus performance discipline: dynamic import after LCP, DPR cap 1.5, pause offscreen (IntersectionObserver) and on `visibilitychange`, context-loss handling, poster fallback | ≤ 4 KB gz; skipped for reduced motion, Save-Data, `ambientEffects=false`, no WebGL2. |
| rAF-lerped cursor follower, magnetic buttons, card tilt | Hero, CTA, cards | Interaction design at 60 fps (transforms only, passive listeners, one rAF loop), input-modality detection (`pointer: fine`) | ≤ 5 KB gz total; never hides the system cursor; off on touch. |
| Cursor-following row preview | Projects index | Pointer-driven UI with deterministic generative content | Fine pointer only. |
| WAAPI `playbackRate` ticker velocity | Ticker | Web Animations API | Static row fallback. |
| Generative covers (hash-seeded pattern, domain hue, glyph) | Every card while `cover` is null | Design-system thinking under real data constraints; deterministic SSR output | CSS gradients, no images. |
| Continuous corners (`corner-shape`) + concentric radius maths | Everywhere | Design-system rigor and progressive enhancement | CSS only. |
| Container queries | Case cards | Component-level responsiveness | CSS only. |
| KB-style split panes with independent scrollers | Admin, notes reader | App-shell architecture, scroll containment, focus management | CSS + small hooks. |
| Diacritics-insensitive search | Admin palette, notes search | Unicode normalization (`NFD`, combining marks, `đ`) | Pure function, unit-tested. |
| Optional vitals HUD | Footer toggle | Measuring what you ship (`web-vitals`) | ~2 KB gz, loaded on demand. |
| Streaming SSR with layout-matched skeletons (`loading.tsx` + per-block Suspense, `1lh` text lines, bounded text, fixed table columns) | Every route, both apps | React Server Components streaming, Suspense boundary design, CLS engineering proven by a parity test | CSS only; fallbacks are server components. |
| Pending-UI choreography: `useLinkStatus` route bar, `keepPreviousData` + FetchBar, optimistic updates with rollback, `aria-busy` buttons | Navigation, filters, tables, toggles, forms | Server-state UX with TanStack Query, perceived performance, accessible async feedback | < 1 KB JS (route store); everything else is existing libraries. |
| Cloudinary LQIP blur-up with no backend change | Every real image | Image pipeline thinking: URL transforms, server-side base64 inlining, data cache | ~300 B per image inlined; falls back to the reserved box. |
| First-visit curtain gated before first paint | Public, once per session | Critical-render-path control (nonce'd inline script, no CLS, no LCP element, no input block) | ~0.3 KB inline; skipped for reduced motion and `ambientEffects=false`. |

### 8.2 Budgets (CI-enforced where possible)

- **Lighthouse mobile** (existing `apps/web/e2e/lighthouse.spec.ts`):
  - Accessibility ≥ 95: CI already asserts this.
  - Performance must not fall below the current baselines in `docs/audits/2026-10-26-a11y-perf.md` (home 79 local; projects, case study and post ≥ 70).
  - The target is home ≥ 85 local, gained by replacing the `Reveal`, `StatBand` and `Atmosphere` JS with CSS.
- **Core Web Vitals (lab):** LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms on mobile emulation. The LCP element is the hero h1 text, never the canvas.
- **JS:** the motion layer is ≤ 5 KB gz and the shader island ≤ 4 KB gz. Both load after LCP (`requestIdleCallback`), and neither is in the initial route chunk. No new dependency above 10 KB gz.
- **Fonts:** two families. Preload only the Plex Sans roman latin + vietnamese subsets; italic and mono load on demand.
- **Motion:** every effect has a reduced-motion state and a Save-Data state. A Playwright test runs each public page with `reducedMotion: 'reduce'` and asserts that no element has a running animation and that all content is visible.
- **Rendering:** animations touch only `transform`, `opacity`, `clip-path`, `filter`, font variations on text, and registered custom properties. No layout-thrashing reads in rAF loops.
- **Loading:** see [§7.9](#79-loading-states-public--admin--loadinghtml-admin-loadinghtml).
  - With the API delayed by 1.5s (Playwright route interception), every public route and the main admin routes must show their skeleton.
  - Layout shift from skeleton to content must sum to CLS ≤ 0.02. A `PerformanceObserver('layout-shift')` collector in the e2e helpers checks this, ignoring shifts within 500ms of input.
  - The skeleton and content boxes of each card type match within 1px.
  - The route bar is absent for navigations under 120ms and present after 200ms.
  - The intro curtain adds ≤ 100ms to lab LCP versus `?intro=0`.

---

## 9. Implementation plan (stacked PRs)

Each PR stacks on the previous one (R1 on `main` after this docs PR merges). Every PR is small, keeps `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` and `check:content` green, adds Storybook stories for new or changed components, and adds i18n keys to both `en.json` and `vi.json` for any public chrome label. Admin labels go to `en.json` only, which is the current convention.

### R1 — Tokens, fonts, radius ladder

- **Files:**
  - `packages/ui/src/styles/globals.css`: both scopes, shadcn names, `@theme inline`, radius ladder + `@supports (corner-shape)`, motion tokens, base reduced-motion rule.
  - `apps/web/src/modules/core/utils/fonts.util.ts` → Plex Sans/Mono.
  - Admin layout gets the `admin` scope class.
- **Acceptance:**
  - All existing screens render with the new tokens and no layout breakage.
  - `rounded-*` utilities map onto the ladder.
  - Squircle shows in Chromium; round corners elsewhere.
  - Vietnamese diacritics render in Plex on `/vi` with no clipping.
- **Tests:**
  - Vitest contrast test over the token pairs in [§4.1](#41-color).
  - Storybook “Foundations” story (palette, type, radius, motion), ported from `foundations.html`.
  - Playwright `/vi` smoke asserts that the computed `font-family` starts with IBM Plex Sans.
  - axe stays at 0 serious/critical.

### R2 — Public data-quality guards (client-only)

- **Files:**
  - `BlockRenderer.tsx`: no wrapper or padding when a renderer returns `null`; band groups drop empty members.
  - `isPlaceholderText()` util (TODO / TBD / lorem, case-insensitive, trimmed).
  - `formatTitle` de-dup (contains, not only equals).
  - Hero kicker: strip one leading `>`, or drop the icon.
  - Stats: skip zero-valued entries.
  - `Reveal`: SSR-visible.
- **Acceptance:**
  - No `TODO` text on any public page with the live data.
  - No empty bands.
  - `<title>` has no repeated name.
  - Kicker shows a single prompt.
  - No “0” stat.
  - Content is visible with JS disabled.
- **Tests:**
  - Vitest for `isPlaceholderText`, `formatTitle`, and the BlockRenderer empty-block cases.
  - Playwright `public.spec.ts`: no `TODO` in `main`, no section shorter than 40px, JS-disabled context shows the hero and first sections.

### R3 — Public shell: header + footer

- **Files:** `SiteHeader`, `SiteFooter`, mobile `Sheet` menu, theme toggle with a View Transition circular reveal, anchor-positioned nav indicator, ⌘K trigger (the existing `CommandPalette`, restyled).
- **Acceptance:**
  - The header stays visible on scroll and compacts.
  - Keyboard order: skip link → wordmark → nav → tools.
  - The menu sheet traps focus.
  - The theme reveal respects reduced motion.
  - The footer renders `nav.footer` and `socialLinks` from the API.
- **Tests:**
  - Storybook stories for light, dark, mobile and VI.
  - Playwright: header in viewport after scrolling 2000px; menu opens and closes with Esc; axe.
  - Vitest for the nav-number formatter.

### R4 — Public primitives

- **Files:** `Chip`/`FilterChip`, `Tag`, `Monogram`, `Nest`, `GenerativeCover`, `MetricDiff`, `EmptyState`, `SectionHeader` (computed `§` index), `Ticker`, `Stat` (CSS count-up), container-query `CaseCard`.
- **Acceptance:**
  - `GenerativeCover` is deterministic for the same slug and title, on server and client.
  - Every component works in both themes and both locales, and has a reduced-motion story.
- **Tests:**
  - Vitest: slug-hash pattern selection, glyph extraction (including Vietnamese titles), metric before/after rendering, `Stat` SSR output contains the final value.
  - Storybook interaction tests for `FilterChip` (`aria-pressed`).

### R4b — Loading-state foundations (shared by public and admin)

- **Files:**
  - `packages/ui`:
    - `ui/skeleton.tsx`: rewrite the shimmer; the CSS is the `.skel` block of `redesign.css` §16b.
    - New `SkeletonText` and `SkeletonScope`.
    - `ui/button.tsx` `loading`: switch to `aria-disabled`, guard `onClick`/submit while busy, add `done` / `doneLabel`.
    - New `ProgressBar`, `FetchBar`; restyled `Spinner`.
    - `useAnnounce` + `LiveRegion` in the root layouts.
  - `apps/web/src/modules/core`:
    - `lqip.util.ts` (`lqipUrl`, Cloudinary parsing shared with `image-loader.util.ts`).
    - `get-blur-data-url.ts` (server: fetch through the data cache → base64, 1.5s timeout, null on failure).
    - `CmsImage`.
  - `apps/web/e2e/helpers/loading.ts`:
    - `delayApi(page, ms)`: route interception for the public and admin API origins.
    - `collectLayoutShifts(page)`: `PerformanceObserver` with `buffered: true`.
    - `expectBoxParity(skeleton, content)`.
- **Acceptance:**
  - The shimmer animates only `translate`: no paint per frame in a DevTools performance trace, and no `background-position` animation anywhere.
  - Under `reducedMotion: 'reduce'` no skeleton has a running animation.
  - `SkeletonText` lines are exactly one line box of the inherited token.
  - `Button loading`:
    - keeps its width (±0px)
    - keeps focus
    - sets `aria-busy` and `aria-disabled`
    - ignores a second click or Enter
    - announces through the live region
  - `CmsImage` reserves its box before load (no CLS) and shows the blurred preview on first paint. Non-Cloudinary URLs render without a placeholder and without errors.
  - No backend change; CSP unchanged (`data:` is already allowed).
- **Tests:**
  - Vitest:
    - `lqipUrl` (with and without existing transforms, non-Cloudinary passthrough)
    - `getBlurDataURL` (fetch mocked: success, timeout, 404)
    - `Button` loading (width snapshot via computed style, `aria-*`, double-click guard)
    - `SkeletonText` line count and line height
  - Storybook: skeleton and pending stories in light, dark, admin scope and reduced motion.
  - Playwright: a fixture page proves `collectLayoutShifts` catches a deliberate shift and `expectBoxParity` fails on a 2px mismatch, so the helpers themselves are tested.

### R5 — Home blocks

- **Files:** hero (line split, kinetic type), stat band, ticker, featured case, case grid as a sticky stack, domain grid, pinned process, skill groups, post list, CTA inverse band.
- **Acceptance:**
  - Matches `home-*.jpg` within normal implementation tolerance.
  - With today's data: no empty sections, no zero stats, no TODO.
  - With seeded demo data: all sections render.
  - Reduced motion shows every section static and complete.
- **Loading:**
  - `app/[locale]/(site)/loading.tsx` renders `PageSkeleton` from the stored block order when it is cached, or else the home default.
  - Every home block's registry `skeleton` is replaced by its layout-matched version ([§7.9](#79-loading-states-public--admin--loadinghtml-admin-loadinghtml), home map).
  - Blocks that resolve to hidden (no data) render no skeleton after resolution and leave no gap.
- **Tests:**
  - Storybook stories per block for empty, typical and long-VI data, plus a `Skeleton` story placed next to each.
  - Playwright home (EN/VI, light/dark, 390/1440) with no horizontal overflow (`scrollWidth === innerWidth`).
  - Reduced-motion test ([§8.2](#82-budgets-ci-enforced-where-possible)).
  - `loading.spec.ts` (home), with the API delayed 1.5s:
    - skeletons visible
    - `aria-busy` on main
    - CLS ≤ 0.02 after data
    - hero and stat-cell skeleton boxes match within 1px at 1440 and 390
  - Lighthouse budget.

### R6 — Hero shader island

- **Files:** `HeroStage` (poster in CSS) and a `hero-shader` dynamic import with WebGL2 init, uniforms from CSS tokens, theme observer, IntersectionObserver / `visibilitychange` pausing, DPR cap, `webglcontextlost` handling. Gated on `showDiagram`, `settings.ambientEffects`, reduced motion, Save-Data and WebGL2 support.
- **Acceptance:**
  - The shader never delays LCP.
  - It pauses offscreen and in hidden tabs.
  - The poster alone looks complete.
  - It costs ≤ 4 KB gz.
- **Tests:**
  - Vitest for the gating function (each flag).
  - Playwright: canvas is absent under reduced motion; canvas is present and the rAF loop stops after scrolling it out of view (instrumented counter).
  - Lighthouse: no LCP regression.

### R7 — Micro-interactions layer

- **Files:** `MotionProvider` (one rAF loop, `pointer: fine` + motion gates), `CursorFollower` (labels from `data-cursor` → i18n key), `Magnetic`, `Tilt`, `RowPreview`, ticker velocity.
- **Acceptance:**
  - Nothing renders on touch devices or under reduced motion.
  - No long tasks above 50 ms from the motion layer during scroll.
  - The system cursor is never hidden.
- **Tests:**
  - Vitest for the lerp and clamp utils and the gate hook.
  - Playwright with `hasTouch` asserts no `.cursor` element.
  - Performance trace in CI logs long tasks (warning only).

### R8 — Page transitions, route progress, first-visit loader

- **Files:** a View Transitions integration for App Router navigation, plus `RouteProgress` and `IntroCurtain`.
  - Spike first: React `<ViewTransition>` or Next `experimental.viewTransition` (Next 16).
  - Fallback: a small `startViewTransition` wrapper around `router.push`, i.e. a `TransitionLink`.
  - Unique `view-transition-name` per project cover (`cover-${slug}`).
- **Acceptance:**
  - Card → case-study cover morph in Chromium.
  - Crossfade elsewhere when supported; instant otherwise.
  - Back/forward works.
  - Focus moves to the new `main`.
- **Route progress:**
  - `PendingLink` is a child of next-intl `Link` that calls `useLinkStatus()` and reports into a `useSyncExternalStore` counter. Programmatic `router.push` goes through the same store via `startTransition`.
  - `RouteProgress` is rendered in `SiteHeader` (and in the admin `Topbar` in R12). It appears only when a navigation is still pending at 120ms, completes on commit, and is `aria-hidden`, because the page's own `role="status"` speaks.
- **Intro curtain:**
  - `IntroCurtain` is server markup in `app/[locale]/(site)/layout.tsx` plus an inline gate script that uses `requestNonce()`. The script sets `html.intro` only when sessionStorage has no flag, motion is allowed and `settings.ambientEffects` is true.
  - `?intro=0` disables it, for tests and for sharing links. It lasts ≤ 700ms, never blocks input, never runs on client navigations, and is absent without JS.
- **Tests:**
  - Playwright navigation in a browser without VT (feature disabled), and with VT, asserting no duplicate `view-transition-name` on a page; a11y focus check.
  - Route bar: with the API delayed 1.5s, the bar is visible within 200ms of the click and gone after commit. With no delay (cached route), it never appears. Back/forward also reports.
  - Curtain:
    - The first visit in a fresh context has `html.intro` and the curtain is removed by 800ms.
    - A second navigation in the same context shows no curtain.
    - `reducedMotion: 'reduce'` shows none.
    - With JS disabled there is no curtain.
    - `elementFromPoint` on a CTA is clickable at 100ms.
    - Lighthouse LCP with the curtain is ≤ `?intro=0` + 100ms.

### R9 — Projects list + case study

- **Files:** `ProjectsBrowserBlock` (wrapping chips, URL state, Grid/Index toggle, row preview), `CaseStudyView` (facts bar, cover, metrics board, sticky TOC with progress, prose tables with `data-label`, “Not mine” callout, release status, next case).
- **Acceptance:**
  - Filters round-trip through the URL.
  - The filter bar never scrolls horizontally.
  - Case-study tables follow rule 5.
  - `isConfidential` hides in-content images.
- **Loading:**
  - `projects/loading.tsx` and `projects/[slug]/loading.tsx` with layout-matched skeletons ([§7.9](#79-loading-states-public--admin--loadinghtml-admin-loadinghtml)).
  - A filter change keeps the previous cards dimmed under a `FetchBar`, with no skeleton, while focus stays on the chip.
  - The case-study cover skeleton keeps `view-transition-name`, so the morph lands on the box.
  - Prose images go through `CmsImage`.
- **Tests:**
  - Vitest for the filter-state ↔ search-params mapping and the TOC extraction from markdown.
  - Playwright for filter interactions, mobile table cards at 390px, axe.
  - `loading.spec.ts` (projects, case study), with the API delayed 1.5s:
    - skeletons visible and CLS ≤ 0.02
    - card skeleton ↔ card box parity within 1px
    - filter click → `FetchBar` visible, previous cards still in the DOM, focused element unchanged

### R10 — About / CV + contact

- **Files:** about intro (`Monogram` fallback), commit-graph timeline, principles, skill matrix, education, CV cards (disabled state); contact layout, topic pills, success state, copy-email.
- **Acceptance:** CV cards show an EN/VI state from `resumeEn` / `resumeVi`; contact form validation and success are unchanged functionally.
- **Loading:**
  - `about/loading.tsx` uses the about skeletons (portrait frame, definition list, timeline, principles, skills).
  - Contact submit: `Button loading` replaces the label swap at `ContactForm.tsx:257–268`, so the width no longer changes and focus stays. The form gets `aria-busy` and its inputs dim but keep their values.
  - On error the draft is kept and the message is `role="alert"`. On success the “sent” card replaces the form at the same height.
  - The live region announces Sending… / Sent.
- **Tests:**
  - Existing `contact.spec.ts` stays green, extended with the API delayed 1.5s:
    - the button has `aria-busy`
    - its bounding width is unchanged
    - a second click sends nothing (request count 1)
    - after a mocked 500, the typed message is still there
  - Storybook for the timeline (current node, multiple roles).
  - Vitest for the copy-email hook (clipboard mocked).

### R11 — Notes list + post reader

- **Files:** `NotesBrowserBlock` (pinned post, chips, diacritics-insensitive search, year groups, EN badge), `PostReader` (three-pane ≥ 1024, document lock scoped to the route, pane-scoped heading observer, lang-switch scroll preservation like the KB `captureLangScroll` / `restoreLangScroll`).
- **Acceptance:**
  - At ≥ 1024 `document.scrollingElement.scrollHeight === innerHeight` and each pane scrolls independently.
  - Below 1024 the page scrolls normally.
  - Switching EN ↔ VI keeps the reading position.
- **Loading:**
  - `notes/loading.tsx` (list rows) and `notes/[slug]/loading.tsx` (`PostReader.Skeleton`: nav, article, TOC at ≥ 1024; article only below).
  - Notes search keeps previous results with a `FetchBar` (`use-notes-search.hook.ts` already uses `keepPreviousData`).
- **Tests:**
  - Vitest for `normalizeForSearch` (“viet” matches “Việt”, “đ” matches “d”).
  - Playwright reader-layout assertions at 1280 and 390, and axe.
  - `loading.spec.ts` (notes, reader): skeleton visible with the API delayed; CLS ≤ 0.02; at ≥ 1024 the document stays locked while the skeleton is shown.

### R12 — Admin shell (KB)

- **Files:** `AdminShell` (`h-dvh`, fixed `Topbar`, `.app` grid, panes), `AdminSidebar` (roman numerals computed, counts from stats), `AdminDrawer`, `AdminCommandPalette` (DocSearch layout, groups, skeleton, highlight, diacritics-insensitive), `animate-fade-up`.
- **Acceptance:**
  - The document never scrolls on any admin route.
  - The sidebar has no horizontal overflow at 256px with long labels.
  - The main pane is the only scroller.
  - Focus is trapped in the drawer and palette.
  - ⌘K / Ctrl K toggles the palette, and Esc closes it.
- **Loading:**
  - `app/admin/(cms)/loading.tsx` shows a generic page-head + panel skeleton inside the real shell; the sidebar and top bar never unmount.
  - `RouteProgress` (teal, from R8) sits under the top bar.
  - The palette shows local commands at once, plus two skeleton rows while the debounced server search is pending.
  - Sign-in uses `Button loading`.
- **Tests:**
  - Playwright `admin-layout.spec.ts` at 1440 and 390: `scrollHeight === innerHeight` on html; sidebar `scrollWidth === clientWidth`; main pane `scrollHeight > clientHeight` on a long form.
  - With the admin API delayed 1.5s, a sidebar click shows the route bar within 200ms and the target route's skeleton, and the sidebar element stays the same DOM node (no remount).
  - `admin-login.spec.ts`: the button has `aria-busy` while the delayed login is pending.
  - Vitest for `toRoman` and the palette filter.
  - axe on dashboard, projects and editor.

### R13 — Admin tables + dashboard

- **Files:** `DataTable` (`cardLabels` → `data-label`, `ThemedCheckbox`, facets, bulk bar, density), dashboard KPIs, health ring and rows with deep links, views chart restyle, inbox preview.
- **Acceptance:** at ≤ 639px every DataTable renders as cards, and no table causes page-level horizontal overflow; each health issue kind maps to a deep link.
- **Loading:**
  - `Dashboard.Skeleton` is used per Suspense boundary: KPI labels real, values skeleton; health ring + 4 rows; chart box; inbox rows. It replaces `StatsSkeleton` / `HealthSkeleton`.
  - DataTable:
    - `isLoading` → `skeletonRows` with real cell structure.
    - Columns get fixed sizes (`column.size` → `<colgroup>`, `table-layout: fixed`).
    - `isFetching` → `FetchBar` in the panel header, and rows `.is-stale`.
    - The skeleton rows become cards at ≤ 639px.
  - Optimistic featured toggle and drag reorder, with rollback and a toast.
- **Tests:**
  - DataTable unit: cards mode attributes, selection, indeterminate, skeleton row count, `isFetching` renders the bar without unmounting rows.
  - Playwright mobile projects table.
  - Vitest for the health-kind → route mapping (exhaustive over the 10 kinds).
  - Playwright with the API delayed:
    - first column x-positions are identical (±1px) before and after rows load
    - a filter change keeps the row count on screen until data arrives
    - a forced 500 on the featured toggle reverts the star and shows the toast

### R14 — Admin editors: project/post editor, page builder, media, inbox, sign in

- **Files:**
  - `EditorShell` focus mode (outline \| 48rem canvas \| publish pane), `LocaleTabs` meters, `MarkdownEditor` toolbar and slash-menu restyle (extensions untouched), `PublishChecks` (server health + client TODO / empty-VI).
  - Page-builder inspector (`Resizable`; presets from the block's `layouts`, surfaces from `BLOCK_SURFACES`; “Hidden publicly · no data” state), media details pane, inbox reading pane, sign-in split layout.
- **Acceptance:**
  - Tiptap behavior is unchanged: existing `MarkdownEditor.test.tsx` passes.
  - The preset picker never offers a layout the block does not allow.
  - The TODO warning appears on the field that contains it.
- **Loading:**
  - `projects/[id]/loading.tsx` and `posts/[id]/loading.tsx` use `EditorShell.Skeleton` (outline, canvas, publish pane; the Tiptap toolbar is rendered disabled). The same skeleton works for `pages/[key]` (56px block rows) and inbox detail.
  - `SaveStatus` has four states in a fixed slot.
  - Publish and Save buttons use `Button loading` + `done`.
  - `UploadQueue` shows per-file progress and Retry.
  - Media tiles keep their 4:3 box and show the LQIP background.
  - Inbox `fetchNextPage` appends two skeleton rows.
- **Tests:**
  - Vitest for locale completeness, `PublishChecks` client rules, and preset filtering from the registry.
  - Vitest for `SaveStatus` (status → label and icon, fixed width) and `UploadQueue` (progress events → `--v`, error → Retry).
  - Playwright with the API delayed:
    - editor skeleton → form with CLS ≤ 0.02 in the canvas pane
    - Publish shows `aria-busy` and then “Published”
    - a second Publish click during pending sends one request
  - Existing `admin-pages.spec.ts` and `admin-publish.spec.ts` stay green.
  - Storybook stories for the editor shell and inspector.

### R15 — Hardening and docs

- **Files:**
  - Lighthouse budgets tightened to the new numbers.
  - A Playwright visual-regression baseline (`toHaveScreenshot`) for the key public pages and admin shell with `?capture`-style motion freezing.
  - A11y sweep, a VI copy review of all new chrome labels.
  - Loading sweep: `loading.spec.ts` loops over every public route and the main admin routes with the API delayed 1.5s and asserts skeleton → content with CLS ≤ 0.02, `aria-busy` cleared, and no skeleton left in the DOM.
  - `docs/design/portfolio-design-system.md` updated to v3.
  - `docs/audits/` gets a before/after.
- **Acceptance:** all budgets in [§8.2](#82-budgets-ci-enforced-where-possible) are green in CI; a manual screen-reader pass is recorded (VoiceOver or NVDA) for home, case study, reader and admin editor.

### R16 — Figma library (optional)

An editable Figma file (rule 8):

- variables for both palettes, light and dark
- the type scale as text styles (with a VI specimen)
- radius ladder and spacing variables
- components (Button, Chip, Tag, CaseCard with GenerativeCover variants, StatusPill, nav item, DataTable row, palette)
- the home, case-study, admin-dashboard and editor frames built with auto-layout from those components

No flattened screenshots.

---

## 10. i18n

- **Public chrome labels are new keys in both `en.json` and `vi.json`:**

  | Group | Keys |
  | --- | --- |
  | `core.header.*` | search, menu, theme, language |
  | `core.footer.*` | column titles, last-published |
  | `blocks.hero.status.*` | availability, basedIn, localTime, experience, dailyStack |
  | `projects.view.*` | grid, index |
  | `projects.empty` | |
  | `notes.reader.*` | onThisPage, collapseAll, expandAll, readingTime, fallbackBanner |
  | `notes.empty` | |
  | `core.copy.*` | copy, copied |
  | `core.cursor.*` | view, open |
  | `states.notUploaded` | |
  | `states.*` (loading) | `loading` exists; new: `loadingPage`, `loadingProjects`, `loadingCaseStudy`, `loadingNotes`, `loadingNote`, `updatingResults`, `sending`, `sent`, `sendFailed` (one key per region, not an interpolated noun, so the Vietnamese reads naturally) |

  Admin pending labels (`admin.states.saving`, `saved`, `unsaved`, `saveFailed`, `publishing`, `published`, `uploading`, `loadingTable`) go to `en.json` only.

  Vietnamese strings are reviewed in R15.
- **Admin stays English-only** (`admin.*` keys in `en.json` only, as today). Content still edits EN/VI through `LocaleTabs`.
- **Computed, never translated:** section indices, roman numerals, `01 / 03` counters and dates. Dates use `Intl.DateTimeFormat(locale)` (`27 thg 10, 2026` on `/vi`).
- **Fallback content:** when VI is missing, the EN field renders with `lang="en"` inside the `/vi` page, plus the existing fallback banner (restyled as a callout).
- **Typography:** `:lang(vi)` leading adjustments ([§4.2](#42-type-ibm-plex-sans--ibm-plex-mono)); line-mask padding; no `text-transform: uppercase` on Vietnamese running text (mono meta labels only, and they are short).

---

## 11. Future, out of scope (needs backend)

None of these are part of R1–R16 (including R4b). Each needs a NestJS / Prisma / API change.

| Idea | Why it needs BE | Frontend stop-gap in this plan |
| --- | --- | --- |
| `TODO_PLACEHOLDER` health issue kind | `/api/admin/health` has no such kind | Client-side check in `PublishChecks` and the field warning (R14); public guard (R2). |
| Scheduled publishing (“Scheduled” status) | Status enum is DRAFT / PUBLISHED / ARCHIVED; no future `publishedAt` workflow for projects | Not shown. |
| Stored image placeholders (blurhash / dominant color computed at upload) and focal point | No such fields on media | Cloudinary LQIP derived from the URL at render time (R4b `CmsImage`), plus `GenerativeCover` and aspect-ratio boxes. |
| Remembering the real block order per page for `loading.tsx` on a cold cache | The public API has no lightweight “layout only” endpoint | `loading.tsx` uses the cached page layout when present, or else a per-route default skeleton. |
| Public project gallery | Public detail schema has no `images[]` | Images inside markdown only. |
| Per-block “hide on public when empty” setting | Visibility is computed, not stored | Computed in the renderer (R2) and shown in the page builder (R14). |
| `INVERSE` block surface | `BLOCK_SURFACES` is PLAIN / BAND | `cta-band` renders inverse by block type. |
| Server-side diacritics-insensitive search for posts/projects | Search runs client-side over the loaded page | Client filter (R11, R12). |
| Pinned / featured post flag | No such field | “Pinned” = the newest published post. |
| Per-locale OG images generated from the new design | Needs an image route with fonts + data; could run on Vercel OG but touches SEO config | Existing OG. |

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

| Risk | Mitigation |
| --- | --- |
| Scroll-driven animations and anchor positioning are not in every engine | Everything is behind `@supports`; static designs are complete; Playwright runs the static path too. |
| View Transitions + App Router APIs are still settling | R8 starts with a spike and a feature flag; fallback to instant navigation. |
| Motion and the shader cost Lighthouse points | Budgets in CI (R5, R6, R15); LCP is text; the shader loads after LCP and is tiny. |
| Big type and condensed widths with long Vietnamese words | `text-wrap: balance`, `hyphens: auto` with `lang`, clamp-based sizes, long-VI Storybook fixtures in R4–R5. |
| Locking the document in admin breaks existing flows (dialogs, toasts, dnd) | R12 runs the existing admin e2e suite; Radix portals stay at body level; dnd-kit autoscroll targets the main pane. |
| Design drift between mockups and app | R15 visual baselines; foundations story as the single reference. |
| Skeletons drift from their components as layouts change | Each skeleton is colocated and built from the same wrapper; parity tests (±1px) run per card type, and the CLS sweep in R15 covers every route. |
| `loading.tsx` hides a fast page behind a flash of skeleton | Skeletons fade in from 100ms; the route bar waits 120ms; cached routes render without either (asserted in R8). |
| The intro curtain hurts LCP or annoys repeat visitors | Session-gated, ≤ 700ms, no input block, no LCP candidate, `?intro=0`; LCP delta asserted in R8; Q6 lets Parker turn it off. |
