<!-- Archived verbatim from docs/plans/ui-redesign.md (2. Design direction); links re-pointed. Index: ../../plans/ui-redesign.md -->

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

**Shape.** One radius ladder based on 10px. Size decides the step. Continuous (squircle) corners are used where supported, and nested surfaces stay concentric. See [§4.4](06-4-tokens.md#44-radius-10px-base-apple-style-scale-continuous-corners).

---

