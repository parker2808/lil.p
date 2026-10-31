<!-- Archived verbatim from docs/design/portfolio-design-system.md (5. Page-by-page UI spec / 5.9 Admin editor `/admin/posts/[id]` (projects use the same shell with case-study section fields)); links re-pointed. Index: ../../portfolio-design-system.md -->

<h3 id="s-5-9">5.9 Admin editor `/admin/posts/[id]` (projects use the same shell with case-study section fields)</h3>

Mobile (editor full screen; properties in a bottom sheet):
```
┌───────────────────────────────┐
│ ←  Saved 4s ago   [⚙] [Publish]│
├───────────────────────────────┤
│ [EN ●] [VI ○]                 │
│ Title                         │
│ Vue → React: what transfers   │
│ [Write][Preview]              │
│ B I H 🔗 </> 🖼               │
│ ┌───────────────────────────┐ │
│ │ markdown…                 │ │
│ │                           │ │
│ └───────────────────────────┘ │
│ 1,240 words · 6 min           │
└───────────────────────────────┘
```

Desktop (`lg`: editor + properties; `2xl`: adds live preview):
```
┌────────────┬────────────────────────────────────────┬────────────────┐
│ sidebar    │ Posts / Vue → React     Saved 4s ago   │ [Preview] [Pub]│
│            ├────────────────────────────────────────┼────────────────┤
│            │ [EN ●] [VI ○ missing title, body]      │ Status  ○ Draft│
│            │ Title                                  │ Slug  vue-react│
│            │ Vue → React: what transfers            │ Tags  [react]+ │
│            │ Excerpt                                │ Publish  date ▾│
│            │ One-sentence summary…                  │ Featured  ☐    │
│            │ ┌ B I H1 H2 🔗 </> 🖼 callout  [Split]┐│ Cover   [img]  │
│            │ │ ## Reactivity                       ││ SEO title      │
│            │ │ In Vue, `ref()`…                    ││ SEO desc  0/160│
│            │ │ /  ← slash menu: image, code, callout││ ────────────── │
│            │ │ [drop image to upload ▓▓▓░ 60% ✕]   ││ History        │
│            │ └─────────────────────────────────────┘│ Parker · 2h    │
│            │ 1,240 words · 6 min read               │ Created · 1d   │
└────────────┴────────────────────────────────────────┴────────────────┘
Publish is blocked with an inline list when required fields are missing (per locale) or images lack alt.
⌘S save now · ⌘↵ publish · ⌘⇧P preview · Esc leaves (confirm if unsaved).
```

---

<h3 id="s-5-10">5.10 Admin site & sections `/admin/site` (settings, navigation, sections, social links, contact topics)</h3>

Where everything that is not a project/post/experience/skill gets edited, so no visible text needs a code change. Tabs: General · Navigation · Sections · Social · Contact. Reordering is drag-and-drop **and** "Move up / Move down" buttons (keyboard and screen-reader friendly); each move is an optimistic `sortOrder` update.

Mobile:
```
┌───────────────────────────────┐
│ ☰  Site                [Save] │
├───────────────────────────────┤
│ [General][Nav][Sections] ▸    │
├───────────────────────────────┤
│ Home sections     [EN][VI]    │
│ ≡ Hero            ● shown  ⋯  │
│ ≡ Featured        ● shown  ⋯  │
│ ≡ Selected work   ● shown  ⋯  │
│ ≡ Skills          ○ hidden ⋯  │
│ ≡ Latest notes    ● shown  ⋯  │
│ ⋯ → Move up · Move down · Edit│
└───────────────────────────────┘
```

Desktop:
```
┌────────────┬─────────────────────────────────────────────────────────┐
│ sidebar    │ Site                                      Saved 3s ago   │
│            │ [General] [Navigation] [Sections] [Social] [Contact]     │
│            ├─────────────────────────────────────────────────────────┤
│            │ Page [Home ▾]                                            │
│            │ ┌──┬───────────────┬──────────────────────┬────────┬───┐ │
│            │ │≡ │ Section       │ Title (EN · VI)       │ Shown  │   │ │
│            │ ├──┼───────────────┼──────────────────────┼────────┼───┤ │
│            │ │≡ │ hero          │ (uses profile)        │ [●]    │ ⋯ │ │
│            │ │≡ │ featured      │ Featured case study · │ [●]    │ ⋯ │ │
│            │ │≡ │ work          │ Selected work · Dự án │ [●]    │ ⋯ │ │
│            │ │≡ │ skills        │ What I work with · ○  │ [ ]    │ ⋯ │ │
│            │ └──┴───────────────┴──────────────────────┴────────┴───┘ │
│            │ Edit row → sheet: title EN/VI, intro EN/VI, CTA label    │
└────────────┴─────────────────────────────────────────────────────────┘
```
Sidebar gains a **Site** group: Site settings, Profile, Media. The admin UI itself is English-only chrome; every content field shows EN and VI side by side via locale tabs.

<h3 id="s-5-11">5.11 Admin changes for v2 (small; the admin layout stays as is)</h3>

The admin keeps its Linear-style calm: **no atmosphere, bands, orbs, reveals or marquee in `/admin`**. It only gains the editors and checks the richer public site needs.

| Where | Change | Components |
| --- | --- | --- |
| Sidebar → Content | New lists: **Stats**, **Domains**, **Process steps**. Same `DataTable` + sheet editor pattern as Skills (drag + Move up/down, `isVisible` switch, optimistic reorder) | `table`, `sheet`, `switch` |
| Stats editor | Label EN/VI, `source` select; `value` + `suffix` shown only for `MANUAL`; read-only preview of the computed value for the others | `select`, `field`, `input` |
| Domains editor | Name/description EN/VI, **hue picker** (5 swatches with names, `radio-group`, shows the light and dark pill preview), **icon picker**, read-only project count | `radio-group`, `popover` + `command` |
| Icon picker (shared) | Searchable grid of the allowlisted lucide icons; stores `iconKey`; keyboard-navigable (arrow keys in the grid, Enter selects) | `popover`, `command`, `toggle-group` |
| Profile editor | New fields: hero kicker, headline accent (inline error if it is not a substring of the headline, per locale) | `field`, `input` |
| Project editor | New "Card & facts" tab: domain select, key facts (2–4 lines, counter), fact chips (tag input, ≤ 6) | `select`, `textarea`, `badge` |
| Post editor | "Key takeaways" field (≤ 5 lines) under the body | `textarea` |
| Skills table | New "Marquee" switch column; header shows "n of 6+ needed" | `switch` |
| Social links | New "Show in CTA" switch (max 2, others disabled when 2 are on) | `switch`, `tooltip` |
| Site → General | New switches: "Ambient effects (grid, glow)" and "Animate tech marquee" | `switch` |
| Site → Sections | New keys `stats`, `marquee`, `domains`, `process`, `principles` appear as rows with the existing reorder/hide controls | existing |
| Publish validation | Blocks publish when any EN field contains `{{`, `TODO`, `TBD` or `lorem` (the reference site shows a raw `{{TODO}}` in production; ours must not), and when a project has no domain | `alert` list in the editor |
| Dashboard → Content health | Adds lines: "Projects without a domain", "Case studies with < 2 key facts", "Stats hidden (fewer than 2 visible)", "Marquee needs 6+ skills" | existing card |
| Live preview (`2xl`) | Renders the real public components (`CaseCard`, `KeyFacts`, `StatBand`) with the draft props, in light and dark (toggle in the preview header) | `toggle-group` |

---

