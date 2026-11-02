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
