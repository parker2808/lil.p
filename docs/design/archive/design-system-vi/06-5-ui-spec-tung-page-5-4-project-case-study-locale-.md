<!-- Archived verbatim from docs/design/portfolio-design-system.vi.md (5. UI spec từng page / 5.4 Project case study `/[locale]/projects/[slug]` (v2)); links re-pointed. Index: ../../portfolio-design-system.vi.md -->

<h3 id="s-5-4">5.4 Project case study `/[locale]/projects/[slug]` (v2)</h3>

Thứ tự: back link → pill (domain, NDA) → H1 + tagline → meta grid (label eyebrow mono) → cover → **key facts 2×2** → Outcome stats → từng section có eyebrow (`SUMMARY` Problem, `LIMITS` Constraints, `SCOPE` Requirements thành hai card, `HOW` Approach + diagram, `TRADE-OFFS` Key decisions thành card, `RESULT` Outcome, `RETRO` What I'd do differently) → fact chips → card "More in <domain>" → prev/next. TOC sticky + reading progress bar. Vùng hero có thể dùng grid mờ (không orb); vùng prose là `--background` thường.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (2px reading progress) │
├────────────────────────────────────────────────────────────────────────────────────┤
│░ ← All case studies ░│ faint grid
│░ ‹▣ Fintech / Web3› ‹v1 → v2› ░│
│░ Particula v2: Vue 2 → Nuxt 3 (text-title) ░│
│░ Rewriting an RWA ratings app without stopping delivery. (text-prose) ░│
│░ CLIENT ROLE TEAM PERIOD STACK ░│ eyebrow labels
│░ Particula Main frontend 6 Feb 2024 - now Nuxt 3 · TanStack · … ░│
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────── cover 21:9 (rounded-xl) ─────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┬────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │ ON THIS PAGE │
│ │● Strangler migration: │ │● TanStack Query replaced│ │ ▌Key facts │ KeyFacts 2×2
│ │ Nuxt 3 beside Vue 2 │ │ Axios as server state │ │ Outcome │
│ └─────────────────────────┘ └─────────────────────────┘ │ Problem │
│ ┌─────────────────────────┐ ┌─────────────────────────┐ │ Requirements │
│ │● Core component library │ │● 120 Playwright specs │ │ Approach │
│ └─────────────────────────┘ └─────────────────────────┘ │ Decisions │
│ RESULT │ Retro │
│ ## Outcome ┌ − bundle 412→255kB ┐ ┌ + specs 0→120 ┐ │ │
│ SUMMARY │ STACK │
│ ## Problem prose 18px/1.75, 66ch, ▹ bullets │ ‹Nuxt 3›‹Vue 3›… │
│ SCOPE │ │
│ ## Requirements │ Live site ↗ │
│ ┌ Functional ─────────────┐ ┌ Non-functional ─────────┐ │ │
│ │ ▹ ratings dashboards │ │ ▹ no stale ratings │ │ │
│ └─────────────────────────┘ └─────────────────────────┘ │ │
│ HOW · ## Approach prose + diagram (figure + caption) │ │
│ TRADE-OFFS · ## Key decisions │ │
│ ┌ Axios → TanStack Query ─────────────────────────────┐ │ │
│ │ OPTIONS · CHOICE · WHY · COST (eyebrow labels) │ │ │
│ └─────────────────────────────────────────────────────┘ │ │
│ RETRO · ## What I'd do differently │ │
│ ‹fact chip›‹fact chip›‹fact chip› │ │
├───────────────────────────────────────────────────────────┴────────────────────────┤
│ More in Fintech / Web3 [CaseCard] [CaseCard] │
│ ← MSP Advanced Cart migration tool → │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: meta grid thành 2 column; key facts 1 column; TOC thành `collapsible` sticky "On this page ▾" dưới header; requirement card xếp chồng.

 

<h3 id="s-5-5">5.5 List blog `/[locale]/notes` và post `/[locale]/notes/[slug]` (v2)</h3>

List: eyebrow `WRITING` + H1 + intro → search + tag chip → group theo năm các hàng `PostCard` (card với `OCT 12, 2026 · 6 MIN` mono, title + `↗`, excerpt, chip `#tag`). Post featured (`isFeatured`) được card rộng hơn, cover nằm trên đầu list.

List desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ WRITING │
│ Notes [⌕ Search notes… ⌘K ] │
│ Things I learned shipping frontends. │
│ ‹all 12› ‹#vue› ‹#react› ‹#nuxt› ‹#testing› ‹#architecture› │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 2026 ──────────────────────────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12, 2026 · 6 MIN │ │
│ │ Vue → React: what transfers, what doesn't ↗ (subheading) │ │
│ │ Excerpt, 2 lines, text-body muted… │ │
│ │ #react #vue │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ SEP 30, 2026 · 8 MIN · TanStack Query in Nuxt 3 ↗ … ───────────────────────────┐ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Post: cột đọc giữ nguyên (66ch, background thường). v2 thêm eyebrow `NOTE · #react`, reading progress bar, bullet `▹`, callout với icon tile, header code block với language badge + copy, card "Key takeaways" ở cuối (từ `Post.takeaways`, optional), và các `PostCard` related.

Post desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━ (progress) │
├────────────────────────────────────────────────────────────┬───────────────────────┤
│ ← Notes │ │
│ NOTE · #REACT #VUE │ ON THIS PAGE │
│ Vue → React: what transfers, what doesn't (text-title) │ ▌Reactivity │
│ Oct 12, 2026 · Updated Oct 14 · 6 min · Đọc bằng tiếng Việt│ Effects │
│ ───────────────────────────────────────────────────────── │ Data fetching │
│ prose 18/1.75, 66ch │ │
│ ┌ ▣ Callout ────────────────────────────────────────────┐ │ Copy link │
│ │ Treat React state as a value you replace… │ │ │
│ └───────────────────────────────────────────────────────┘ │ │
│ ┌ components/Counter.tsx ─────────── ‹tsx› [copy] ┐ │ │
│ │ code 15px JetBrains Mono, diff lines tinted │ │ │
│ └─────────────────────────────────────────────────┘ │ │
│ ┌ KEY TAKEAWAYS ────────────────────────────────────────┐ │ │
│ │ ▹ … ▹ … ▹ … │ │ │
│ └───────────────────────────────────────────────────────┘ │ │
├────────────────────────────────────────────────────────────┴───────────────────────┤
│ Related notes [PostCard] [PostCard] [PostCard] ← Prev Next → │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (list và post): card full width; search trên tag; tag scroll ngang; TOC collapsible; code block scroll ngang trong region focus được.

 

<h3 id="s-5-6">5.6 Contact `/[locale]/contact` (v2)</h3>

Layout tách trên grid mờ: trái = eyebrow, H1, intro (`SiteSettings.contactIntro`), note thời gian reply, channel card (Copy email, LinkedIn, GitHub, mỗi cái có icon tile), availability badge; phải = form card trên `--card-glass`. Success thay form bằng status card (icon tile check, message, "Back to case studies").

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│░ CONTACT ┌────────────────────────────────────┐░│
│░ Let's talk about your product. │ Name * Email * │░│
│░ Senior frontend roles or a migration │ [ ] [ ] │░│
│░ done right. (text-prose) │ Topic │░│
│░ ● Open to senior roles · replies in 2 days │ [ Job opportunity ▾ ] │░│
│░ ┌───────────────────────────────────────┐ │ Message * │░│
│░ │ ▣ Email [ Copy email ] │ │ [ ] │░│
│░ ├───────────────────────────────────────┤ │ [ ] │░│
│░ │ ▣ LinkedIn linkedin.com/in/… ↗ │ │ 0 / 2000 │░│
│░ ├───────────────────────────────────────┤ │ [ Send message → ]glow │░│
│░ │ ▣ GitHub github.com/parker2808 ↗│ └────────────────────────────────────┘░│
│░ └───────────────────────────────────────┘ ░│
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: channel card trước (xếp chồng), form bên dưới, submit full-width. Validation: error inline dưới field + summary `alert` lúc submit; input giữ value khi error.

 

<h3 id="s-5-7">5.7 Admin dashboard `/admin`</h3>

KPI (7/30/90 ngày): views, unique visitors, contact messages, published posts; chart views; top pages; inbox preview (realtime); recent activity (audit); content health (draft, thiếu bản dịch vi, image không có alt).

Mobile:
```
┌───────────────────────────────┐
│ ☰ Dashboard 🔔3 (P)│
├───────────────────────────────┤
│ [7d][30d][90d] │
│ ┌─────────────┐┌─────────────┐│
│ │Views 2,140 ││Visitors 980 ││
│ │▲ 12% ╱╲╱ ││▲ 4% ╱╲_ ││
│ └─────────────┘└─────────────┘│
│ ┌─────────────┐┌─────────────┐│
│ │Messages 6 ││Published 2 ││
│ └─────────────┘└─────────────┘│
├───────────────────────────────┤
│ Inbox (3 new) View all │
│ ● Ana · Job opportunity · 2m │
├───────────────────────────────┤
│ Content health │
│ 2 drafts · 3 missing VI · 1 alt│
├───────────────────────────────┤
│ Activity │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ ◆ Parker ▾ │ Dashboard [7d][30d][90d] 🔔3 (P)│
│ 🔍 Search ⌘K├─────────────────────────────────────────────────────────┤
│ │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐ │
│ Dashboard │ │Views ││Visitors ││Messages ││Published │ │
│ Inbox 3 │ │2,140 ▲12%││980 ▲4% ││6 ▼1 ││2 │ │
│ ─ Content │ └──────────┘└──────────┘└──────────┘└──────────┘ │
│ Projects │ ┌───────────────────────────────────┐┌────────────────┐ │
│ Posts │ │ Views (area chart, 30d) ││ Top pages │ │
│ Experience │ │ ││ /projects/pa… │ │
│ Skills │ │ ││ /notes/vue-… │ │
│ Media │ └───────────────────────────────────┘└────────────────┘ │
│ ─ Insights │ ┌───────────────────────┐┌──────────────────────────────┐│
│ Analytics │ │ Inbox View → ││ Recent activity ││
│ Audit log │ │ ● Ana Job opp. 2m ││ Parker published "Vue → R…" ││
│ ─ │ │ Minh Freelance 1d ││ Parker updated Particula v2 ││
│ Settings │ └───────────────────────┘└──────────────────────────────┘│
│ │ Content health: 2 drafts · 3 missing VI · 1 image no alt │
└────────────┴─────────────────────────────────────────────────────────┘
Realtime: new message → toast bottom-right "New message from Ana [Open]", Inbox badge 3→4.
```
Realtime: message mới → toast góc dưới phải "New message from Ana [Open]", Inbox badge 3→4.

 

<h3 id="s-5-8">5.8 Admin list/table `/admin/posts` (cùng pattern cho projects, skills, experience, media, inbox, audit)</h3>

Mobile (table thành list các row, filter trong sheet):
```
┌───────────────────────────────┐
│ ☰ Posts [+ New] │
├───────────────────────────────┤
│ [🔍 Search ] [Filter (2)] [⋯] │
│ Status: Draft ✕ Tag: react ✕ │
├───────────────────────────────┤
│ ○ Vue → React: what transfers │
│ Draft · EN ● VI ○ · 2h ago │
│ ───────────────────────────── │
│ ● TanStack Query in Nuxt 3 │
│ Published · EN ● VI ● · 3d │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar │ Posts [Views ▾] [+ New post C] │
│ ├─────────────────────────────────────────────────────────┤
│ │ [🔍 Filter posts… /] Status is Draft ✕ + Filter │
│ ├──┬──────────────────────────┬──────────┬───────┬───────┬─┤
│ │☐ │ Title ↓ │ Status │ Lang │Updated│⋯│
│ ├──┼──────────────────────────┼──────────┼───────┼───────┼─┤
│ │☐ │ Vue → React: what trans… │ ○ Draft │ EN VI○│ 2h │⋯│
│ │☑ │ TanStack Query in Nuxt 3 │ ● Publ. │ EN VI │ 3d │⋯│
│ │☑ │ Playwright at Particula │ ◷ Sched. │ EN │ 5d │⋯│
│ ├──┴──────────────────────────┴──────────┴───────┴───────┴─┤
│ │ 1–25 of 42 ‹ 1 2 › │
│ │ ┌──────── 2 selected · Publish · Archive · Delete · ✕ ─┐│
└────────────┴─────────────────────────────────────────────────────────┘
Keys: j/k move · x select · Enter open · C new · / search · ⌫ delete (confirm)
```
Keys: j/k di chuyển · x chọn · Enter mở · C tạo mới · / search · ⌫ xóa (confirm)

 

<h3 id="s-5-9">5.9 Admin editor `/admin/posts/[id]` (projects dùng cùng shell với field section case-study)</h3>

Mobile (editor full screen; properties trong bottom sheet):
```
┌───────────────────────────────┐
│ ← Saved 4s ago [⚙] [Publish]│
├───────────────────────────────┤
│ [EN ●] [VI ○] │
│ Title │
│ Vue → React: what transfers │
│ [Write][Preview] │
│ B I H 🔗 </> 🖼 │
│ ┌───────────────────────────┐ │
│ │ markdown… │ │
│ │ │ │
│ └───────────────────────────┘ │
│ 1,240 words · 6 min │
└───────────────────────────────┘
```

Desktop (`lg`: editor + properties; `2xl`: thêm live preview):
```
┌────────────┬────────────────────────────────────────┬────────────────┐
│ sidebar │ Posts / Vue → React Saved 4s ago │ [Preview] [Pub]│
│ ├────────────────────────────────────────┼────────────────┤
│ │ [EN ●] [VI ○ missing title, body] │ Status ○ Draft│
│ │ Title │ Slug vue-react│
│ │ Vue → React: what transfers │ Tags [react]+ │
│ │ Excerpt │ Publish date ▾│
│ │ One-sentence summary… │ Featured ☐ │
│ │ ┌ B I H1 H2 🔗 </> 🖼 callout [Split]┐│ Cover [img] │
│ │ │ ## Reactivity ││ SEO title │
│ │ │ In Vue, `ref()`… ││ SEO desc 0/160│
│ │ │ / ← slash menu: image, code, callout││ ────────────── │
│ │ │ [drop image to upload ▓▓▓░ 60% ✕] ││ History │
│ │ └─────────────────────────────────────┘│ Parker · 2h │
│ │ 1,240 words · 6 min read │ Created · 1d │
└────────────┴────────────────────────────────────────┴────────────────┘
Publish is blocked with an inline list when required fields are missing (per locale) or images lack alt.
⌘S save now · ⌘↵ publish · ⌘⇧P preview · Esc leaves (confirm if unsaved).
```
Publish bị block kèm list inline khi thiếu field required (theo locale) hoặc image thiếu alt.
⌘S save ngay · ⌘↵ publish · ⌘⇧P preview · Esc thoát (confirm nếu chưa save).

---

 

<h3 id="s-5-10">5.10 Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics)</h3>

Chỗ edit mọi thứ không phải project/post/experience/skill, nên không text nào hiện ra lại cần sửa code. Tab: General · Navigation · Sections · Social · Contact. Reorder là drag-and-drop **và** nút "Move up / Move down" (thân thiện bàn phím và screen reader); mỗi lần move là một update `sortOrder` optimistic.

Mobile:
```
┌───────────────────────────────┐
│ ☰ Site [Save] │
├───────────────────────────────┤
│ [General][Nav][Sections] ▸ │
├───────────────────────────────┤
│ Home sections [EN][VI] │
│ ≡ Hero ● shown ⋯ │
│ ≡ Featured ● shown ⋯ │
│ ≡ Selected work ● shown ⋯ │
│ ≡ Skills ○ hidden ⋯ │
│ ≡ Latest notes ● shown ⋯ │
│ ⋯ → Move up · Move down · Edit│
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar │ Site Saved 3s ago │
│ │ [General] [Navigation] [Sections] [Social] [Contact] │
│ ├─────────────────────────────────────────────────────────┤
│ │ Page [Home ▾] │
│ │ ┌──┬───────────────┬──────────────────────┬────────┬───┐ │
│ │ │≡ │ Section │ Title (EN · VI) │ Shown │ │ │
│ │ ├──┼───────────────┼──────────────────────┼────────┼───┤ │
│ │ │≡ │ hero │ (uses profile) │ [●] │ ⋯ │ │
│ │ │≡ │ featured │ Featured case study · │ [●] │ ⋯ │ │
│ │ │≡ │ work │ Selected work · Dự án │ [●] │ ⋯ │ │
│ │ │≡ │ skills │ What I work with · ○ │ [ ] │ ⋯ │ │
│ │ └──┴───────────────┴──────────────────────┴────────┴───┘ │
│ │ Edit row → sheet: title EN/VI, intro EN/VI, CTA label │
└────────────┴─────────────────────────────────────────────────────────┘
```
Sidebar thêm group **Site**: Site settings, Profile, Media. Bản thân admin UI là chrome English-only; mọi field content hiện EN và VI cạnh nhau qua tab locale.


 

<h3 id="s-5-11">5.11 Thay đổi admin cho v2 (nhỏ; admin layout giữ nguyên)</h3>

Admin giữ vẻ Linear điềm tĩnh: **không atmosphere, band, orb, reveal hay marquee trong `/admin`**. Nó chỉ thêm editor và check mà public site giàu hơn cần.

| Chỗ | Thay đổi | Component |
| --- | --- | --- |
| Sidebar → Content | List mới: **Stats**, **Domains**, **Process steps**. Cùng pattern `DataTable` + sheet editor như Skills (drag + Move up/down, switch `isVisible`, reorder optimistic) | `table`, `sheet`, `switch` |
| Stats editor | Label EN/VI, select `source`; `value` + `suffix` chỉ hiện với `MANUAL`; preview read-only của value computed cho các nguồn còn lại | `select`, `field`, `input` |
| Domains editor | Name/description EN/VI, **hue picker** (5 swatch kèm tên, `radio-group`, hiện preview pill light và dark), **icon picker**, project count read-only | `radio-group`, `popover` + `command` |
| Icon picker (dùng chung) | Grid search được của lucide icon trong allowlist; lưu `iconKey`; navigate bằng bàn phím (phím mũi tên trong grid, Enter chọn) | `popover`, `command`, `toggle-group` |
| Profile editor | Field mới: hero kicker, headline accent (error inline nếu không phải substring của headline, theo locale) | `field`, `input` |
| Project editor | Tab mới "Card & facts": domain select, key facts (2–4 dòng, counter), fact chips (tag input, ≤ 6) | `select`, `textarea`, `badge` |
| Post editor | Field "Key takeaways" (≤ 5 dòng) dưới body | `textarea` |
| Skills table | Cột switch "Marquee" mới; header hiện "n of 6+ needed" | `switch` |
| Social links | Switch mới "Show in CTA" (tối đa 2, cái còn lại disable khi đã bật 2) | `switch`, `tooltip` |
| Site → General | Switch mới: "Ambient effects (grid, glow)" và "Animate tech marquee" | `switch` |
| Site → Sections | Key mới `stats`, `marquee`, `domains`, `process`, `principles` xuất hiện thành row với control reorder/ẩn sẵn có | existing |
| Publish validation | Block publish khi bất kỳ field EN nào chứa `{{`, `TODO`, `TBD` hoặc `lorem` (site reference hiện `{{TODO}}` thô trên production; mình thì không được), và khi project không có domain | List `alert` trong editor |
| Dashboard → Content health | Thêm dòng: "Projects without a domain", "Case studies with < 2 key facts", "Stats hidden (fewer than 2 visible)", "Marquee needs 6+ skills" | Card sẵn có |
| Live preview (`2xl`) | Render đúng public component (`CaseCard`, `KeyFacts`, `StatBand`) với draft props, light và dark (toggle trên preview header) | `toggle-group` |

---

 
