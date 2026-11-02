# Public design demo, round 2

1. Stay on `design/demo-redesign-2026-11-02`; enable all visual changes only with `DESIGN_DEMO=1`.
2. Make a single SVG identity asset for the shared logo component and generate app icons from it.
3. Add reusable orange and green brand tokens in shared CSS, with accessible light and dark values.
4. Give the demo a restrained CSS starfield and glow; remove animation for reduced motion and reduce decoration on narrow screens.
5. Extend the bilingual demo shell to home, projects, case study, notes, about, contact, craft, not-found, and error screens.
6. Give each public segment a matching demo loading skeleton.
7. Keep existing API-backed pages when the demo flag is off; use sample copy only where the local API is unavailable.
8. Build and run Next in production mode, then capture full-page PNGs for every reachable route and state at 1440 and 390 pixels.
9. Check alignment, overflow, route errors, and console output; run repository checks and update Graphify.
10. Commit the demo on this branch. Do not create a merge PR or touch production, database, or deployment services.
