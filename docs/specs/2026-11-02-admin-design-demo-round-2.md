# Admin design demo, round 2

## Goal and boundaries

- Extend the isolated `/design-demo-admin` fixture to visually cover every `apps/web/app/admin` page family and loading/not-found state using fictional local data. No production auth, API, database, or migration changes.
- Map each real admin route to a deterministic `screen` query value and capture it at 1440px and 390px from `next build` + `next start`.
- Preserve production `MarkdownField`, `BlockList`, `BlockInspector`, and `PagePreview`; the fixture depicts their layout without invoking persistence.

## Design system

- Use one canonical `app/icon.svg` LP monogram as the source for admin brand marks and generated Apple icon; expose it through a shared `BrandMark` component for future public use.
- Apply accessible orange and green light/dark tokens, IBM Plex, 10px concentric radii, and a restrained cosmic accent. Disable decorative motion for reduced-motion and simplify the effect on mobile.
- Align the inbox back control and message count on one flex row and audit shared icon, spacing, and baseline rules.

## Coverage and verification

- Add explicit EN/VI UI strings and a visible language switch to the fixture, including route headings, controls, states, and validation copy.
- Cover dashboard, analytics, stats, all content lists/editors, about entities, site/system sections, inbox list/detail, audit, login, not-found, and skeletons.
- Run `pnpm check:all`, inspect a representative desktop/mobile matrix and the complete PNG count, refresh Graphify, and commit on this branch. No PR or merge.

## UX quality add-on (Parker 22:45)

- Review every capture at both widths for hierarchy, legibility, alignment, overflow, accessible contrast, focus and touch targets, keyboard access, reduced motion, and restrained decoration.
- Make the mock login validate fields inline and show a success state. Give inbox archive a confirmation and success or empty state. Keep all actions local to the fixture.
- Capture the new states alongside the route and loading matrix. Record automated and manual review findings before the final production build screenshots.

### Review evidence

- `apps/web/scripts/audit-admin-demo.mjs` checks every route and loading/state view in EN and VI at 1440px and 390px. Final run: 284 views, zero WCAG A/AA axe violations, horizontal overflow, missing keyboard focus, or mobile controls below 44px. Results are saved as `ux-review.json` next to the PNGs.
- Keyboard interaction review covered login validation, Enter submission and success, palette arrow navigation, archive confirmation/Escape, table search empty state, and error recovery. These actions stay inside the local fixture.
- Full-size desktop/mobile contact sheets exposed a cramped horizontal layout on the 404 and error screens; their content now stacks with a clear heading, helpful copy, and recovery action. Inbox detail header controls align on one row.
- Final screenshots come from `next build` and `next start`: 221 PNGs, zero page errors. The output folder includes `png-list.txt` and `capture-manifest.json`.
