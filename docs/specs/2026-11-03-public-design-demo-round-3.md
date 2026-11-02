# Public design demo, round 3

1. Keep the demo isolated behind `DESIGN_DEMO=1` on `design/demo-redesign-2026-11-02`.
2. Review Parker's media-card screenshot and the public card patterns at desktop and mobile widths.
3. Give image cards consistent outer padding, concentric inner radii, reserved brand-glyph space, and even caption gaps.
4. Sweep all English and Vietnamese public routes for missing inline gaps, overflow, wrapped badges, misaligned columns, inconsistent card padding or radii, and controls below 44 pixels on mobile.
5. Extend the Playwright audit with geometry checks that catch these regressions, then review rendered pages and fix findings.
6. Build and start the web app in production mode, overwrite the public PNG set at 1440 and 390 pixels, run repository checks, update Graphify, and commit.
7. Keep backend, admin, database, deployment, merge, and PR work outside this branch.

Result: all public demo screen types and sample detail URLs passed the light-theme audit at 320, 390, 768, 900, and 1440 pixels. The representative screen set also passed the dark-theme audit at those widths. No axe violations, horizontal overflow, wrapped badges, inset or radius mismatches, or mobile targets below 44 pixels remained. The production capture contains 84 English/Vietnamese PNGs at 1440 and 390 pixels.
