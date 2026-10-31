<!-- Archived verbatim from docs/design/portfolio-design-system.md (5. Page-by-page UI spec / 5.3 Projects list `/[locale]/projects` (v2)); links re-pointed. Index: ../../portfolio-design-system.md -->

<h3 id="s-5-3">5.3 Projects list `/[locale]/projects` (v2)</h3>

Header with eyebrow + H1 + intro, a **domain filter row** (domain pills with counts, URL `?domain=`) and a tech combobox; then a featured wide `CaseCard`, then a 2-col (desktop) grid. Each card shows a domain pill, `↗`, top `DiffStat`, chips.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header                                                                             │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ‹EYEBROW: WORK›                                                                    │
│ Case studies                                                       (text-title)    │
│ Four products I moved forward, 2021 — now.                         (text-prose)    │
│ ‹All 4› ‹▣ Fintech 1› ‹▣ Enterprise 2› ‹▣ E-commerce 1›          [Tech: any ▾]    │
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ┌───────────────────────────────┐  ‹▣ Fintech / Web3›  v1 → v2            ↗   │ │ featured, wide
│ │ │ cover 16:10                   │  Particula v2                              │ │
│ │ └───────────────────────────────┘  Tagline (2 lines) · Kobizo · 2024 — now   │ │
│ │                                    − bundle 412→255kB   + specs 0→120         │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐ │
│ │‹▣ E-commerce›                      ↗  │ │‹▣ Enterprise› ‹NDA›                ↗  │ │
│ │ Cart migration tool                   │ │ MSP Advanced (Samsung SDS)            │ │
│ │ Flask APIs + Vue 2 UI for…            │ │ Re-platformed MSP App logic…          │ │
│ │ + platforms 4 · LitGroup · 2021–22    │ │ team 15 · CMC Global · 2022–24        │ │
│ │ ‹Flask›‹Laravel›‹Vue 2›‹Pinia›        │ │ ‹Vue 2›‹Vuex›                         │ │
│ └───────────────────────────────────────┘ └───────────────────────────────────────┘ │
│ Empty filter: empty state "No case studies for Svelte" + [Clear filters]          │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: filter pills scroll horizontally (with edge fade), tech combobox below, cards stacked, featured card = normal card with the cover on top.

<h3 id="s-5-4">5.4 Project case study `/[locale]/projects/[slug]` (v2)</h3>

Order: back link → pills (domain, NDA) → H1 + tagline → meta grid (mono eyebrow labels) → cover → **key facts 2×2** → Outcome stats → sections each with an eyebrow (`SUMMARY` Problem, `LIMITS` Constraints, `SCOPE` Requirements as two cards, `HOW` Approach + diagram, `TRADE-OFFS` Key decisions as cards, `RESULT` Outcome, `RETRO` What I'd do differently) → fact chips → "More in <domain>" cards → prev/next. Sticky TOC + reading progress bar. The hero area may use a faint grid (no orbs); the prose area is plain `--background`.

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (2px reading progress)                     │
├────────────────────────────────────────────────────────────────────────────────────┤
│░ ← All case studies                                                               ░│ faint grid
│░ ‹▣ Fintech / Web3›  ‹v1 → v2›                                                    ░│
│░ Particula v2: Vue 2 → Nuxt 3                                     (text-title)    ░│
│░ Rewriting an RWA ratings app without stopping delivery.          (text-prose)    ░│
│░ CLIENT        ROLE              TEAM     PERIOD          STACK                   ░│ eyebrow labels
│░ Particula     Main frontend     6        Feb 2024 — now  Nuxt 3 · TanStack · …   ░│
├────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────── cover 21:9 (rounded-xl) ─────────────────────────┐ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┬────────────────────────┤
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │ ON THIS PAGE           │
│ │● Strangler migration:   │ │● TanStack Query replaced│   │ ▌Key facts             │ KeyFacts 2×2
│ │  Nuxt 3 beside Vue 2    │ │  Axios as server state  │   │  Outcome               │
│ └─────────────────────────┘ └─────────────────────────┘   │  Problem               │
│ ┌─────────────────────────┐ ┌─────────────────────────┐   │  Requirements          │
│ │● Core component library │ │● 120 Playwright specs   │   │  Approach              │
│ └─────────────────────────┘ └─────────────────────────┘   │  Decisions             │
│ RESULT                                                    │  Retro                 │
│ ## Outcome   ┌ − bundle 412→255kB ┐ ┌ + specs 0→120 ┐     │                        │
│ SUMMARY                                                   │ STACK                  │
│ ## Problem   prose 18px/1.75, 66ch, ▹ bullets             │ ‹Nuxt 3›‹Vue 3›…       │
│ SCOPE                                                     │                        │
│ ## Requirements                                           │ Live site ↗            │
│ ┌ Functional ─────────────┐ ┌ Non-functional ─────────┐   │                        │
│ │ ▹ ratings dashboards    │ │ ▹ no stale ratings      │   │                        │
│ └─────────────────────────┘ └─────────────────────────┘   │                        │
│ HOW · ## Approach   prose + diagram (figure + caption)    │                        │
│ TRADE-OFFS · ## Key decisions                             │                        │
│ ┌ Axios → TanStack Query ─────────────────────────────┐   │                        │
│ │ OPTIONS · CHOICE · WHY · COST  (eyebrow labels)     │   │                        │
│ └─────────────────────────────────────────────────────┘   │                        │
│ RETRO · ## What I'd do differently                        │                        │
│ ‹fact chip›‹fact chip›‹fact chip›                         │                        │
├───────────────────────────────────────────────────────────┴────────────────────────┤
│ More in Fintech / Web3   [CaseCard] [CaseCard]                                     │
│ ← MSP Advanced                                          Cart migration tool →      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: meta grid becomes 2 columns; key facts 1 column; TOC becomes a sticky "On this page ▾" `collapsible` under the header; requirement cards stack.

<h3 id="s-5-5">5.5 Blog list `/[locale]/notes` and post `/[locale]/notes/[slug]` (v2)</h3>

List: eyebrow `WRITING` + H1 + intro → search + tag chips → year groups of `PostCard` rows (card with mono `OCT 12, 2026 · 6 MIN`, title + `↗`, excerpt, `#tag` chips). Featured post (`isFeatured`) gets a wider card with cover on top of the list.

List desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ WRITING                                                                            │
│ Notes                                     [⌕ Search notes…                 ⌘K ]   │
│ Things I learned shipping frontends.                                               │
│ ‹all 12› ‹#vue› ‹#react› ‹#nuxt› ‹#testing› ‹#architecture›                         │
├────────────────────────────────────────────────────────────────────────────────────┤
│ 2026 ──────────────────────────────────────────────────────────────────────────── │
│ ┌────────────────────────────────────────────────────────────────────────────────┐ │
│ │ OCT 12, 2026 · 6 MIN                                                           │ │
│ │ Vue → React: what transfers, what doesn't ↗                    (subheading)    │ │
│ │ Excerpt, 2 lines, text-body muted…                                             │ │
│ │ #react #vue                                                                    │ │
│ └────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌ SEP 30, 2026 · 8 MIN · TanStack Query in Nuxt 3 ↗ … ───────────────────────────┐ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Post: unchanged reading column (66ch, plain background) — v2 adds the eyebrow `NOTE · #react`, reading progress bar, `▹` bullets, callouts with an icon tile, code block header with language badge + copy, a "Key takeaways" card at the end (from `Post.takeaways`, optional), and related `PostCard`s.

Post desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ header ━━━━━━━━━━━━━━ (progress)                                                   │
├────────────────────────────────────────────────────────────┬───────────────────────┤
│ ← Notes                                                    │                       │
│ NOTE · #REACT #VUE                                         │ ON THIS PAGE          │
│ Vue → React: what transfers, what doesn't   (text-title)   │ ▌Reactivity           │
│ Oct 12, 2026 · Updated Oct 14 · 6 min · Đọc bằng tiếng Việt│  Effects              │
│ ─────────────────────────────────────────────────────────  │  Data fetching        │
│ prose 18/1.75, 66ch                                        │                       │
│ ┌ ▣ Callout ────────────────────────────────────────────┐  │ Copy link             │
│ │ Treat React state as a value you replace…             │  │                       │
│ └───────────────────────────────────────────────────────┘  │                       │
│ ┌ components/Counter.tsx ─────────── ‹tsx› [copy] ┐        │                       │
│ │ code 15px JetBrains Mono, diff lines tinted     │        │                       │
│ └─────────────────────────────────────────────────┘        │                       │
│ ┌ KEY TAKEAWAYS ────────────────────────────────────────┐  │                       │
│ │ ▹ … ▹ … ▹ …                                           │  │                       │
│ └───────────────────────────────────────────────────────┘  │                       │
├────────────────────────────────────────────────────────────┴───────────────────────┤
│ Related notes  [PostCard] [PostCard] [PostCard]          ← Prev        Next →      │
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile (list and post): cards full width; search above tags; tags scroll horizontally; TOC collapsible; code blocks scroll horizontally inside a focusable region.

<h3 id="s-5-6">5.6 Contact `/[locale]/contact` (v2)</h3>

Split layout on a faint grid: left = eyebrow, H1, intro (`SiteSettings.contactIntro`), reply-time note, channel cards (Copy email, LinkedIn, GitHub, each with icon tile), availability badge; right = form card on `--card-glass`. Success replaces the form with a status card (check icon tile, message, "Back to case studies").

Desktop:
```
┌────────────────────────────────────────────────────────────────────────────────────┐
│░ CONTACT                                    ┌────────────────────────────────────┐░│
│░ Let's talk about your product.             │ Name *            Email *          │░│
│░ Senior frontend roles or a migration       │ [              ]  [              ] │░│
│░ done right. (text-prose)                   │ Topic                              │░│
│░ ● Open to senior roles · replies in 2 days │ [ Job opportunity          ▾ ]     │░│
│░ ┌───────────────────────────────────────┐  │ Message *                          │░│
│░ │ ▣ Email        [ Copy email ]         │  │ [                                ] │░│
│░ ├───────────────────────────────────────┤  │ [                                ] │░│
│░ │ ▣ LinkedIn     linkedin.com/in/…  ↗   │  │ 0 / 2000                           │░│
│░ ├───────────────────────────────────────┤  │ [ Send message → ]glow             │░│
│░ │ ▣ GitHub       github.com/parker2808 ↗│  └────────────────────────────────────┘░│
│░ └───────────────────────────────────────┘                                        ░│
└────────────────────────────────────────────────────────────────────────────────────┘
```

Mobile: channel cards first (stacked), form below, full-width submit. Validation: inline errors under fields + summary `alert` on submit; inputs keep their values on error.

<h3 id="s-5-7">5.7 Admin dashboard `/admin`</h3>

KPIs (7/30/90 days): views, unique visitors, contact messages, published posts; views chart; top pages; inbox preview (realtime); recent activity (audit); content health (drafts, missing vi translations, images without alt).

Mobile:
```
┌───────────────────────────────┐
│ ☰  Dashboard          🔔3  (P)│
├───────────────────────────────┤
│ [7d][30d][90d]                │
│ ┌─────────────┐┌─────────────┐│
│ │Views 2,140  ││Visitors 980 ││
│ │▲ 12% ╱╲╱    ││▲ 4%  ╱╲_    ││
│ └─────────────┘└─────────────┘│
│ ┌─────────────┐┌─────────────┐│
│ │Messages 6   ││Published 2  ││
│ └─────────────┘└─────────────┘│
├───────────────────────────────┤
│ Inbox (3 new)        View all │
│ ● Ana · Job opportunity · 2m  │
├───────────────────────────────┤
│ Content health                │
│ 2 drafts · 3 missing VI · 1 alt│
├───────────────────────────────┤
│ Activity                      │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ ◆ Parker ▾ │ Dashboard                       [7d][30d][90d]  🔔3 (P)│
│ 🔍 Search ⌘K├─────────────────────────────────────────────────────────┤
│            │ ┌──────────┐┌──────────┐┌──────────┐┌──────────┐        │
│ Dashboard  │ │Views     ││Visitors  ││Messages  ││Published │        │
│ Inbox    3 │ │2,140 ▲12%││980  ▲4%  ││6    ▼1   ││2         │        │
│ ─ Content  │ └──────────┘└──────────┘└──────────┘└──────────┘        │
│ Projects   │ ┌───────────────────────────────────┐┌────────────────┐ │
│ Posts      │ │ Views (area chart, 30d)           ││ Top pages      │ │
│ Experience │ │                                   ││ /projects/pa…  │ │
│ Skills     │ │                                   ││ /notes/vue-…   │ │
│ Media      │ └───────────────────────────────────┘└────────────────┘ │
│ ─ Insights │ ┌───────────────────────┐┌──────────────────────────────┐│
│ Analytics  │ │ Inbox          View → ││ Recent activity              ││
│ Audit log  │ │ ● Ana  Job opp.   2m  ││ Parker published "Vue → R…"  ││
│ ─          │ │   Minh Freelance  1d  ││ Parker updated Particula v2  ││
│ Settings   │ └───────────────────────┘└──────────────────────────────┘│
│            │ Content health: 2 drafts · 3 missing VI · 1 image no alt │
└────────────┴─────────────────────────────────────────────────────────┘
Realtime: new message → toast bottom-right "New message from Ana [Open]", Inbox badge 3→4.
```

<h3 id="s-5-8">5.8 Admin list/table `/admin/posts` (same pattern for projects, skills, experience, media, inbox, audit)</h3>

Mobile (table becomes a list of rows, filters in a sheet):
```
┌───────────────────────────────┐
│ ☰  Posts              [+ New] │
├───────────────────────────────┤
│ [🔍 Search ] [Filter (2)] [⋯] │
│ Status: Draft ✕  Tag: react ✕ │
├───────────────────────────────┤
│ ○ Vue → React: what transfers │
│   Draft · EN ● VI ○ · 2h ago  │
│ ───────────────────────────── │
│ ● TanStack Query in Nuxt 3    │
│   Published · EN ● VI ● · 3d  │
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar    │ Posts                        [Views ▾]  [+ New post  C] │
│            ├─────────────────────────────────────────────────────────┤
│            │ [🔍 Filter posts…   /]  Status is Draft ✕  + Filter      │
│            ├──┬──────────────────────────┬──────────┬───────┬───────┬─┤
│            │☐ │ Title ↓                  │ Status   │ Lang  │Updated│⋯│
│            ├──┼──────────────────────────┼──────────┼───────┼───────┼─┤
│            │☐ │ Vue → React: what trans… │ ○ Draft  │ EN VI○│ 2h    │⋯│
│            │☑ │ TanStack Query in Nuxt 3 │ ● Publ.  │ EN VI │ 3d    │⋯│
│            │☑ │ Playwright at Particula  │ ◷ Sched. │ EN    │ 5d    │⋯│
│            ├──┴──────────────────────────┴──────────┴───────┴───────┴─┤
│            │ 1–25 of 42                                 ‹  1 2  ›     │
│            │ ┌──────── 2 selected · Publish · Archive · Delete · ✕ ─┐│
└────────────┴─────────────────────────────────────────────────────────┘
Keys: j/k move · x select · Enter open · C new · / search · ⌫ delete (confirm)
```

