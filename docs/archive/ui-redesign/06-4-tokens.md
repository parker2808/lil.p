<!-- Archived verbatim from docs/plans/ui-redesign.md (4. Tokens); links re-pointed. Index: ../../plans/ui-redesign.md -->

## 4. Tokens

All tokens are CSS custom properties under shadcn names, so components do not care which scope they render in. The public scope is `:root` (`.dark` for night ink), and the admin scope is `.admin` (`.dark .admin`). R1 sets them in `packages/ui/src/styles/globals.css` and maps them into Tailwind v4 with `@theme inline`.

### 4.1 Color

**Public “Ink & Signal”**

| Role          | shadcn var                                        | Light                 | Dark (“night ink”)    | Notes                                            |
| ------------- | ------------------------------------------------- | --------------------- | --------------------- | ------------------------------------------------ |
| Page          | `--background`                                    | `#f6f3ec` paper       | `#111318`             | Optional grain overlay (SVG noise, 5%).          |
| Raised        | `--card`                                          | `#fcfaf6`             | `#181b22`             |                                                  |
| Sunken / band | `--muted`                                         | `#eeeae0`             | `#0b0d11`             | BAND surface.                                    |
| Inverse       | `--inverse` (new name)                            | `#16181f`             | `#eee9df`             | CTA band, code blocks.                           |
| Text          | `--foreground`                                    | `#16181f` (16.2:1)    | `#eee9df` (15.1:1)    |                                                  |
| Text 2        | `--muted-foreground`                              | `#474a54` (8.3:1)     | `#b7b2a8` (8.9:1)     |                                                  |
| Text 3        | `--faint-foreground` (new)                        | `#686b75` (5.0:1)     | `#8f8b83` (5.4:1)     | Smallest allowed for body-size text.             |
| Rule          | `--border` / `--input`                            | `#dcd6c9` / `#bfb8a8` | `#2a2e37` / `#3d424d` |                                                  |
| Signal        | `--primary`                                       | `#e5482d`             | `#ff6b4a`             | Fills, marks, large type only.                   |
| Signal ink    | `--primary-ink` (new)                             | `#b3321a` (5.9:1)     | `#ff8f74` (7.6:1)     | Links, small text.                               |
| Signal wash   | `--primary-subtle`                                | `#fbe4da`             | `#331a14`             | Selection, decision callouts.                    |
| Diff          | `--add` / `--del` (+ `-wash`)                     | `#1e7a4c` / `#b42318` | `#5cc98f` / `#ff7d6e` | Metric before → after.                           |
| Domain hues   | `--hue-{jade,amber,blue,violet,rose}` (+ `-wash`) | see `redesign.css`    | see `redesign.css`    | The existing `Hue` enum drives covers and chips. |

**Admin “KB teal”** (values from the interview-fe KB; only `--faint-foreground` changed)

| shadcn var                       | KB name                  | Light                                                                              | Dark                  |
| -------------------------------- | ------------------------ | ---------------------------------------------------------------------------------- | --------------------- |
| `--background`                   | `--bg`                   | `#f4f7f6`                                                                          | `#0f1614`             |
| `--card`                         | `--bg-elevated`          | `#ffffff`                                                                          | `#1a2421`             |
| `--foreground`                   | `--ink`                  | `#14201c`                                                                          | `#e7f0ec`             |
| `--muted-foreground`             | `--ink-muted`            | `#5a6b64`                                                                          | `#9db0a8`             |
| `--faint-foreground`             | `--ink-faint`            | `#66776f` (KB `#8a9a93` is 2.9:1; darkened to 4.6:1 because it labels 11px groups) | `#879a92`             |
| `--border`                       | `--line`                 | `#d5e0db`                                                                          | `#2a3833`             |
| `--primary`                      | `--accent`               | `#0f766e`                                                                          | `#2dd4bf`             |
| `--primary-subtle`               | `--accent-soft`          | `#ccfbf1`                                                                          | `#134e4a`             |
| `--primary-ink`                  | `--accent-ink`           | `#115e59`                                                                          | `#5eead4`             |
| `--success` / `--success-subtle` | `--done` / `--done-soft` | `#15803d` / `#dcfce7`                                                              | `#4ade80` / `#14532d` |
| `--glow-a` / `--glow-b`          | `--bg-glow-a/-b`         | `#d9efe9` / `#e8f0ec`                                                              | `#12201c` / `#15241f` |
| `--code-bg` / `--code-fg`        | same                     | `#0f1c18` / `#e7f5f1`                                                              | `#0a1210` / `#d5efe8` |

R1 adds a Vitest contrast test that reads the token table and asserts the AA pairs listed above, so a later color tweak cannot silently break contrast.

### 4.2 Type: IBM Plex Sans + IBM Plex Mono

- **Loading:** `next/font/google` with `IBM_Plex_Sans` (variable `wght 100–700`, `wdth 85–100`, roman + italic) and `IBM_Plex_Mono` (400, 500, italic 400). Subsets `latin`, `latin-ext`, `vietnamese`; `display: 'swap'`; the next/font metric fallback avoids CLS. These replace `fonts.util.ts`, so one display family is dropped.
- **Scale** (fluid, `clamp`):

  | Token       | px     | Role                                           |
  | ----------- | ------ | ---------------------------------------------- |
  | `--step--2` | 12     | Mono meta                                      |
  | `--step--1` | 14     | Small                                          |
  | `--step-0`  | 16→17  | Body, line-height 1.62                         |
  | `--step-1`  | 18→21  | Lead                                           |
  | `--step-2`  | 22→28  | h3                                             |
  | `--step-3`  | 28→44  | h2, `wdth 90`                                  |
  | `--step-4`  | 36→68  | Page h1                                        |
  | `--step-5`  | 48→144 | Hero, `wght 650 · wdth 85 · tracking −0.045em` |

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

| Token           | Value  | Use (element height)                           |
| --------------- | ------ | ---------------------------------------------- |
| `--radius-2xs`  | 4      | ≤ 20px: kbd, inline code, checkbox             |
| `--radius-xs`   | 6      | 20–28px: tags, badges, thumbnails              |
| `--radius-sm`   | 8      | 28–36px: small buttons, segments               |
| **`--radius`**  | **10** | **36–48px: buttons, inputs, nav items (base)** |
| `--radius-lg`   | 14     | cards ≤ 360px, menus, popovers, toasts         |
| `--radius-xl`   | 20     | large cards, panels, media, palette            |
| `--radius-2xl`  | 28     | dialogs, sheets, hero media, stacked cards     |
| `--radius-full` | 9999   | chips, avatars, switches                       |

Every step is `calc(<px> * var(--k))`, with `--k: 1` by default. R1 replaces today's `--radius: 0.5rem` ladder (`globals.css:8, 270–273`) and maps Tailwind `rounded-*` onto it, so existing shadcn components inherit it.

**Continuous corners (techniques, in order of preference):**

1. **`corner-shape: squircle`** (CSS Borders 4). This is a one-line progressive enhancement with no layout or JS cost.

   ```css
   @supports (corner-shape: squircle) {
     :root {
       --k: 1.5;
     } /* a squircle reads tighter; scale the ladder */
     .sq,
     .btn,
     .card,
     … {
       corner-shape: squircle;
     }
     .chip,
     .avatar,
     .switch {
       corner-shape: round;
     }
   }
   ```

   Chromium ships it today (verified in Chrome 156 in this environment); other engines fall back to the circular `border-radius`, and the design is valid either way. `--k: 1.5` is the optical match; tune it in R1 against `foundations.html` (round 28 vs squircle 28 vs squircle 42).

2. **SVG `clip-path: path()` / `mask`.** For a few large media surfaces only (hero media, case-study cover), if Parker wants squircles in Safari and Firefox too. Generate the path with `figma-squircle` (MIT, ~2 KB) from a `ResizeObserver`. Costs: a JS dependency, a repaint on resize, and borders and shadows must be drawn inside the mask. **Not** for controls.
3. **Houdini paint worklet** (`paint(squircle)`). Chromium-only and therefore redundant with option 1. Rejected.

**Concentric nesting.** The inner radius equals the outer radius minus the padding, and never drops below `--radius-2xs`:

```css
.nest {
  --r-outer: var(--radius-2xl);
  --pad: 12px;
  border-radius: var(--r-outer);
  padding: var(--pad);
}
.nest > .nest-inner {
  border-radius: max(var(--radius-2xs), calc(var(--r-outer) - var(--pad)));
}
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
- **Loading** (both apps, [§7.9](09-7-per-page-designs.md#79-loading-states-public--admin--loadinghtml-admin-loadinghtml)):
  - shimmer: a 1.6s `--ease-in-out` translate sweep, 80ms stagger
  - skeleton fade-in: `--dur-2` after 100ms
  - route bar: shown after 120ms, an 8s trickle to 92%, then `--dur-2` to complete
  - spinner: 0.7s linear
  - intro curtain: ≤ 700ms on `--ease-expo`

  All of these are static under reduced motion.

- **Reduced motion:** a global rule collapses durations to 0.01ms, and the specific scroll-driven effects are disabled. The ticker becomes a static wrapped row; pins and stacks become static; the shader shows its poster. Content is never hidden behind motion: SSR HTML has the final state.

---

