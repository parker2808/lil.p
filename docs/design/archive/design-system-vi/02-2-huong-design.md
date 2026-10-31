<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (2. Hướng design); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h2 id="s-2">2. Hướng design</h2>

> **Trong chương này:** Concept (v2): "Readable release notes, with atmosphere." Interface lấy typography làm trục, Linear-calm, mỗi project đọc như một changelog entry đã edit kỹ: version tag, diff before → after và metadata mono.

| § | Mục |
| --- | --- |
| 2.1 | Phân tích reference: longpham.tech (chụp 1440 và 390, Oct 2026) |
| 2.2 | Cái nào lấy, chỉnh lại, hoặc bỏ cho Parker |


**Concept (v2): "Readable release notes, with atmosphere."** Interface lấy typography làm trục, Linear-calm, mỗi project đọc như một changelog entry đã edit kỹ: version tag, diff before → after và metadata mono. v2 thêm một *lớp atmosphere* nhẹ (surface nhuốm jade, grid có mask, glow mềm, scroll reveal) và loại section giàu hơn (stats, tech marquee, domain card, diagram migration-flow) để page sống mà không hại việc đọc.

- **Typography vẫn là design.** Atmosphere nằm *phía sau* content và không bao giờ nằm dưới body text; page long-form (case study, post) giữ nền trơn phía sau measure 66ch. Recruiter lướt heading và số trong 10 giây; engineer đọc 2.000 từ case study mà không mỏi (mục 3.2).
- **Vì sao release notes:** sợi xuyên suốt của CV là migration (v1 → v2). Motif version và diff biến điều đó thành ngôn ngữ visual, và cùng mức kiềm chế đó scale được sang admin dày đặc.
- **Accent:** jade/teal. Gật đầu với Vue green (gốc của anh) và domain ReFi/carbon của Particula. v2 dùng đậm hơn, nhưng chỉ ở ba chỗ: cụm accent trên hero, số stat, và CTA primary (kèm glow ở dark mode). Mọi chỗ khác giữ tiết chế: link, focus, một highlight mỗi card.
- **Reference:** [longpham.tech](https://www.longpham.tech/) (atmosphere, nhịp section, stats + marquee, domain card, cấu trúc card và page case study; xem 2.1), Linear (mật độ admin, command palette, status pill), Vercel Geist và Stripe docs (type hierarchy, prose, code block), Practical Typography (measure, line-height), changelog Raycast và Linear (entry có version), GitHub diff view.
- **Tone:** tự tin, cụ thể, trầm. Câu ngắn, số thật, không "passionate developer". Motion mang tính functional hoặc ambient-và-chậm, không bao giờ giật mắt, và luôn tắt dưới `prefers-reduced-motion`. Light và dark đều first-class; lớp atmosphere có biến thể light (2.2).

 

<h3 id="s-2-1">2.1 Phân tích reference: longpham.tech (chụp 1440 và 390, Oct 2026)</h3>

**Nó là gì.** Một site Next.js + Tailwind v4 (Geist + Geist Mono), dark-only, nhuốm xanh (`#06110C` background, `#4ADE80` primary), khoảng 5.000px cao trên desktop. Header sticky, rồi: hero → stats band → tech marquee → domain card → principle đánh số → feature split kèm flow diagram → certification card → card case study featured → CTA band → footer tối giản. Page case study và list blog dùng cùng ngôn ngữ card.

**Vì sao nó giàu trong khi bản mình trần (cùng mức kiềm chế, khác mật độ):**

| Thành phần | Reference | Mockup v1 của mình |
| --- | --- | --- |
| Độ sâu surface | Ba surface nhuốm (`background`, `surface`, `surface-2`) + **band** full-width xen kẽ với `border-y` | Một background phẳng, chỉ có card |
| Atmosphere | Pattern grid masked bởi radial gradient dưới hero; 2 **orb** blur lớn nổi (14s / 18s); radial glow sau CTA | Không có |
| Hero | **Kicker pill** kiểu terminal (`>_ Solution Architect · 13+ years`), H1 60px với **cụm accent màu**, button primary có glow, **SVG diagram** animate (node pulse) bên phải | Tên + đoạn văn + card git-log nhỏ |
| Proof nhìn một cái | **Stats band**: 4 số lớn màu primary, ô icon, label mono uppercase | Hai dòng diff trong featured block |
| Độ rộng phủ | **Tech marquee** vô hạn gồm pill mono; **domain card** có ô icon, count ("2 systems"), hue theo domain | Một hàng skill badge |
| Section header | Icon + H2 + subtitle muted một dòng; **eyebrow** mono ("SUMMARY", "SCOPE") trên inner page | H2 trần |
| Card | Category pill theo hue domain, mũi tên góc `↗`, title chuyển primary, lift −2px + border sáng hơn + shadow lúc hover, tech chip mono | Card tĩnh, badge xám |
| Process | Principle đánh số (`01 -` dạng mono); **flow diagram** dọc (Ingest → Core → Guardrails → Action) cạnh feature card 2×2 | Không có |
| Page case study | Back link, pill category + "Confidential", meta grid với label mono, **card key-facts 2×2**, eyebrow mỗi section, bullet ▹ màu primary, requirement card cạnh nhau, **fact chip** mono, "More in <domain>" | Bản cùng cấu trúc nhưng nhạt hơn |
| Motion | `reveal-in` (fade + trượt 16px, 0.5s) mỗi section, orb float, node/ring pulse, icon bob, marquee; tất cả tắt dưới reduced motion | Chỉ hover |
| CTA + footer | CTA band căn giữa, icon sparkle, glow, button primary + outline; footer một dòng mono | Band trần |

**Điểm yếu cần tránh:** dark-only (không có light mode); nhiều text xanh-xám muted 12–14px; placeholder `{{TODO: …}}` hiện trên case study live (cần check lúc publish); animation trang trí (icon bob, ring pulse) chạy mãi; email hiện dạng plain text; page rất dài mà không có in-page navigation; ảnh certification là screenshot PDF.

 

<h3 id="s-2-2">2.2 Cái nào lấy, chỉnh lại, hoặc bỏ cho Parker</h3>

| Ý tưởng | Quyết định | Map sang Parker và constraint của mình thế nào |
| --- | --- | --- |
| Surface nhuốm + band | **Lấy** | Neutral dark nhuốm về jade (3.1); surface `--band` cho section full-width xen kẽ trên Home và About. Light mode có band jade ấm rất nhạt. |
| Grid có mask + orb + glow | **Chỉnh** | Chỉ trên hero home và CTA band, không bao giờ sau prose. Light: grid 6% jade, một orb 10%. Dark: grid 8%, hai orb 18%. Orb nổi chậm (20s / 26s), dừng khi ra khỏi màn và dưới reduced motion. Owner có thể tắt effect (`SiteSettings.ambientEffects`). |
| Kicker pill + cụm accent | **Lấy** | Kicker từ `Profile.heroKicker` (ví dụ `> Senior Frontend · 5 yrs · Vue/Nuxt/TS`); cụm accent từ `Profile.headlineAccent`, `--primary` đặc (không gradient text, để contrast vẫn đo được). |
| Diagram hero | **Chỉnh** | Thay vì architecture graph generic: một **migration diagram** (node `v1 Vue 2` → node `v2 Nuxt 3` với component tree "rewire"), dựng từ `versionFrom`/`versionTo` của project featured + tối đa 6 skill. SVG, CSS-animated, tĩnh dưới reduced motion. |
| Stats band | **Lấy** | Row `ProfileStat`: số năm (compute từ `careerStartDate`), product đã ship (compute từ project đã publish), framework migration, enterprise platform (giá trị seed ở 1.5). Số đếm lên một lần lúc xem lần đầu. |
| Tech marquee | **Chỉnh** | Từ `Skill.showInMarquee`. Pause lúc hover/focus, có button pause nhìn thấy, nửa nhân đôi `aria-hidden`, và trở thành list wrap tĩnh dưới reduced motion. |
| Domain card | **Lấy** | Entity `Domain`: Fintech / Web3 (ReFi), Enterprise platforms (Samsung SDS), E-commerce tooling, Developer experience & testing. Ô icon, hue, số project, mô tả một dòng. |
| Principle đánh số | **Lấy** | Row `Principle` có sẵn, render `01 - Migrate in slices` với số mono. |
| Flow diagram + feature 2×2 | **Chỉnh** | "How I migrate a frontend": row `ProcessStep` (Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over) dạng flow dọc cạnh 4 feature card (từ `Principle`). |
| Certification | **Bỏ** | Parker không có gì để show; slot này thành "Worked with" (team/công ty dạng text chip) chỉ khi có content. |
| Card case study | **Lấy** | Pill theo hue domain, mũi tên `↗`, hover lift, tech chip mono, kèm dòng `DiffStat` của mình (thứ reference thiếu: số). |
| Cấu trúc page case study | **Lấy** | Back link, pill, meta grid, key-facts 2×2, eyebrow, bullet ▹, decision card, fact chip, "More in <domain>". Giữ sticky TOC của mình (reference không có). |
| List blog dạng card | **Chỉnh** | Hàng card với date · minutes mono và chip `#tag`; giữ group theo năm và search. |
| CTA band + footer | **Lấy** | CTA band có glow, button primary "Copy email" (địa chỉ không bao giờ hiện dạng text nhìn thấy) và tối đa 2 button outline từ `SocialLink.showInCta`. Footer giữ một dòng + build hash mono. |
| Dark-only, animation chạy mãi, TODO lọt | **Không lấy** | Light + dark; motion ambient chỉ ở 2 chỗ; validation lúc publish chặn `{{TODO` và field bắt buộc đang trống. |

---

 

