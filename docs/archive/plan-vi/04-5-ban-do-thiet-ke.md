<!-- Archived verbatim from docs/PLAN.vi.md (5. Bản đồ thiết kế); links re-pointed. Index: ../../PLAN.vi.md -->

## 5. Bản đồ thiết kế

Link Figma dùng dạng `https://www.figma.com/design/ULYJR56vSbNQhZE3JxvkRu/?node-id=<id>` (viết `13:2` thành `13-2`). Mockup nằm trong `docs/design/mockups/`. Gallery id là tên các screenshot trên [/practice/design](https://parker-interview-senior-fe.vercel.app/practice/design).

| Screen | Figma node | Mockup | Gallery | Spec | Task |
| --- | --- | --- | --- | --- | --- |
| Cover & foundations (token, type, màu) | page `0:1` | `foundations.html`, `cover.html` | n/a | §3 | T04, T05, T06 |
| Component (Button, Badge/Pill, Eyebrow, Input, CaseCard, Kicker pill, Nav link) | page `1:2` | `foundations.html` | n/a | §4.1, §4.7 | T12, T13, T20 |
| Home, light / dark (một cặp, cần xác minh frame nào) | `2:2`, `3:2` | `home.html`, `home.html?dark=1` | `01-home-light`, `02-home-dark` | §5.1, §7.2 | T14, T24 |
| Home, mobile 390 | `8:2` | `home.html` ở 390px | `05-home-mobile-light` | §5.1 | T14, T24 |
| Home, loading | `21:2` | `home-skeleton.html` | `09-home-skeletons` | §5.0 | T13, T24 |
| About + timeline | `7:2` | `about.html` | `10-about-light` | §5.2 | T25 |
| List project (bind token đầy đủ) | `13:2` | `projects.html` | `11-projects-light` | §5.3 | T26 |
| Case study, light / dark (một cặp, cần xác minh frame nào) | `4:2`, `5:2` | `case-study.html`, `?dark=1` | `03-case-study-light`, `03b-case-study-dark` | §5.4 | T27 |
| List notes | `9:2` | `notes.html` | `04b-blog-list-light` | §5.5 | T28 |
| Post | `10:2` | `post.html` | `04-blog-post-light` | §5.5 | T23, T28 |
| Contact | `12:2` | `contact.html` | `12-contact-light` | §5.6 | T48 |
| Admin dashboard (dark) | `14:2` | `admin-dashboard.html` | `06-admin-dashboard` | §5.7, §5.11 | T37, T38, T54 |
| Admin table project | `15:2` | `admin-table.html` | `07-admin-projects-table` | §5.8, §5.11 | T39, T40, T41 |
| Admin editor project | `18:2` | `admin-editor.html` | `08-admin-project-editor` | §5.9, §5.11 | T42, T43, T44 |
| Admin page builder (chưa có frame: ghép từ `18:2` và `15:2`) | không có | không có | n/a | §5.10, D26 | T45b, T52a |

**Figma component set → code.**

| Figma set (variant) | Property | Code |
| --- | --- | --- |
| Button (40) | Variant `Primary/Secondary/Outline/Ghost/Destructive` × State `Default/Hover` × Size `Public 40/Admin 32` × Theme | `packages/ui/src/components/ui/button.tsx` với các variant `default`, `secondary`, `outline`, `ghost`, `destructive`, `link`; size `sm` 28, `default` 32, `lg` 40 (T12) |
| Badge/Pill (22) | Hue `neutral/primary/success/warning/destructive/outline/jade/amber/blue/violet/rose` × Theme | `components/ui/badge.tsx` với variant `hue` (T12) |
| Eyebrow (4) | Tone `Primary/Subtle` × Theme | `components/Eyebrow/` (T12) |
| Input (8) | State `Default/Focus/Error/Disabled` × Theme | `components/ui/input.tsx` + `field.tsx` (T12) |
| CaseCard (4) | State `Default/Hover` × Theme | `components/CaseCard/` (T20) |
| Kicker pill (2) | Theme | `components/KickerPill/` (T12) |
| Nav link (4) | State `Default/Active` × Theme | `components/NavLink/` (T12) |

<a id="6-task-overview"></a>

