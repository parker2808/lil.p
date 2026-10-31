<!-- Archived verbatim from docs/design/portfolio-design-system.md (2. Design direction); links re-pointed. Index: ../../portfolio-design-system.md -->

<h2 id="s-2">2. Design direction</h2>

> **In this chapter:** Concept (v2): "Readable release notes, with atmosphere." A typography-first, Linear-calm interface where each project reads like a well-edited changelog entry: version tags, before → after diffs and mono metadata.

| § | Section |
| --- | --- |
| 2.1 | Reference analysis: longpham.tech (captured 1440 and 390, Oct 2026) |
| 2.2 | What we adopt, adapt or skip for Parker |

**Concept (v2): "Readable release notes, with atmosphere."** A typography-first, Linear-calm interface where each project reads like a well-edited changelog entry: version tags, before → after diffs and mono metadata. v2 adds a quiet *atmosphere layer* (jade-tinted surfaces, a masked grid, soft glow, scroll reveals) and richer section types (stats, tech marquee, domain cards, a migration-flow diagram) so the page feels alive without hurting reading.

- **Typography is still the design.** The atmosphere sits *behind* content and never under body text; long-form pages (case study, post) keep a plain background behind the 66ch measure. A recruiter skims headings and numbers in 10 seconds; an engineer reads 2,000 words of case study without strain (section 3.2).
- **Why release notes:** the CV's through-line is migrations (v1 → v2). Version and diff motifs turn that into a visual language, and the same restraint scales to a dense admin.
- **Accent:** jade/teal. A nod to Vue green (his roots) and to Particula's ReFi/carbon domain. v2 uses it more boldly in three places only: the hero accent phrase, stat numbers and the primary CTA (with glow in dark mode). Everywhere else it stays sparing: links, focus, one highlight per card.
- **References:** [longpham.tech](https://www.longpham.tech/) (atmosphere, section rhythm, stats + marquee, domain cards, case-study card and page structure; see 2.1), Linear (admin density, command palette, status pills), Vercel Geist and Stripe docs (type hierarchy, prose, code blocks), Practical Typography (measure, line-height), Raycast and Linear changelogs (versioned entries), GitHub diff view.
- **Tone:** confident, specific, quiet. Short sentences, real numbers, no "passionate developer". Motion is functional or ambient-and-slow, never attention-grabbing, and always off under `prefers-reduced-motion`. Light and dark are both first-class; the atmosphere layer has a light variant (2.2).

<h3 id="s-2-1">2.1 Reference analysis: longpham.tech (captured 1440 and 390, Oct 2026)</h3>

**What it is.** A Next.js + Tailwind v4 site (Geist + Geist Mono), dark-only, green-tinted (`#06110C` background, `#4ADE80` primary), about 5,000px tall on desktop. Sticky header, then: hero → stats band → tech marquee → domain cards → numbered principles → feature split with flow diagram → certification cards → featured case-study cards → CTA band → minimal footer. Case-study pages and a blog list follow the same card language.

**Why it feels rich while ours feels bare (same restraint, different density):**

| Ingredient | Reference | Our v1 mockups |
| --- | --- | --- |
| Surface depth | Three tinted surfaces (`background`, `surface`, `surface-2`) + alternating full-width **bands** with `border-y` | One flat background, cards only |
| Atmosphere | Grid pattern masked by a radial gradient under the hero; 2 large blurred **orbs** floating (14s / 18s); radial glow behind the CTA | None |
| Hero | Terminal-style **kicker pill** (`>_ Solution Architect · 13+ years`), 60px H1 with a **colored accent phrase**, glowing primary button, animated **SVG diagram** (nodes pulse) on the right | Name + paragraph + small git-log card |
| Proof at a glance | **Stats band**: 4 big numbers in primary, icon tiles, mono uppercase labels | Two diff lines inside the featured block |
| Breadth | Infinite **tech marquee** of mono pills; **domain cards** with icon tile, count ("2 systems"), per-domain hue | One row of skill badges |
| Section headers | Icon + H2 + one-line muted subtitle; mono **eyebrows** ("SUMMARY", "SCOPE") on inner pages | Bare H2 |
| Cards | Category pill in domain hue, `↗` corner arrow, title turns primary, lift −2px + brighter border + shadow on hover, mono tech chips | Static cards, gray badges |
| Process | Numbered principles (`01 —` in mono); a vertical **flow diagram** (Ingest → Core → Guardrails → Action) beside 2×2 feature cards | Not present |
| Case study page | Back link, category + "Confidential" pills, meta grid with mono labels, **key-facts 2×2 cards**, eyebrow per section, ▹ bullets in primary, requirement cards side by side, mono **fact chips**, "More in <domain>" | Plainer version of the same |
| Motion | `reveal-in` (fade + 16px rise, 0.5s) per section, orb float, node/ring pulse, icon bob, marquee; all disabled under reduced motion | Hover only |
| CTA + footer | Centered CTA band with sparkle icon, glow, primary + outline buttons; one-line mono footer | Plain band |

**Weak spots to avoid:** dark-only (no light mode); a lot of muted green-gray text at 12–14px; visible `{{TODO: …}}` placeholders on a live case study (needs a publish check); decorative animations (icon bob, ring pulse) that run forever; email shown as plain text; very long pages without in-page navigation; certification images are screenshots of PDFs.

<h3 id="s-2-2">2.2 What we adopt, adapt or skip for Parker</h3>

| Idea | Decision | How it maps to Parker and our constraints |
| --- | --- | --- |
| Tinted surfaces + bands | **Adopt** | Dark neutrals tinted toward jade (3.1); a `--band` surface for alternating full-width sections on Home and About. Light mode gets a faint warm-jade band. |
| Masked grid + orbs + glow | **Adapt** | Only on the home hero and the CTA band, never behind prose. Light: grid at 6% jade, one orb at 10%. Dark: grid at 8%, two orbs at 18%. Orbs float slowly (20s / 26s), stop when off-screen and under reduced motion. Owner can turn effects off (`SiteSettings.ambientEffects`). |
| Kicker pill + accent phrase | **Adopt** | Kicker from `Profile.heroKicker` (e.g. `> Senior Frontend · 5 yrs · Vue/Nuxt/TS`); accent phrase from `Profile.headlineAccent`, solid `--primary` (no gradient text, so contrast stays measurable). |
| Hero diagram | **Adapt** | Instead of a generic architecture graph: a **migration diagram** (`v1 Vue 2` node → `v2 Nuxt 3` node with a component tree that "rewires"), built from the featured project's `versionFrom`/`versionTo` + up to 6 skills. SVG, CSS-animated, static under reduced motion. |
| Stats band | **Adopt** | `ProfileStat` rows: years (computed from `careerStartDate`), products shipped (computed from published projects), framework migrations, enterprise platforms (seed values in 1.5). Numbers count up once on first view. |
| Tech marquee | **Adapt** | From `Skill.showInMarquee`. Pauses on hover/focus, has a visible pause button, is `aria-hidden` for the duplicated half, and becomes a static wrapped list under reduced motion. |
| Domain cards | **Adopt** | `Domain` entity: Fintech / Web3 (ReFi), Enterprise platforms (Samsung SDS), E-commerce tooling, Developer experience & testing. Icon tile, hue, project count, one-line description. |
| Numbered principles | **Adopt** | Existing `Principle` rows rendered as `01 — Migrate in slices` with mono numbers. |
| Flow diagram + 2×2 features | **Adapt** | "How I migrate a frontend": `ProcessStep` rows (Audit → Tokens & primitives → Strangler routes → Contract tests → Cut over) as a vertical flow beside 4 feature cards (from `Principle`). |
| Certifications | **Skip** | Parker has none to show; the slot becomes "Worked with" (teams/companies as text chips) only if content exists. |
| Case-study cards | **Adopt** | Domain-hued pill, `↗` arrow, hover lift, mono tech chips, plus our `DiffStat` line (the thing the reference lacks: numbers). |
| Case-study page structure | **Adopt** | Back link, pills, meta grid, key-facts 2×2, eyebrows, ▹ bullets, decision cards, fact chips, "More in <domain>". Keep our sticky TOC (the reference has none). |
| Blog list as cards | **Adapt** | Card rows with mono date · minutes and `#tag` chips; keep the year grouping and search. |
| CTA band + footer | **Adopt** | CTA band with glow, a primary "Copy email" button (the address is never shown as visible text) and up to 2 outline buttons from `SocialLink.showInCta`. Footer stays one line + mono build hash. |
| Dark-only, forever animations, TODO leaks | **Reject** | Light + dark; ambient motion only in 2 places; publish validation blocks `{{TODO` and empty required fields. |

---

