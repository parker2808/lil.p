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
11. Apply Parker's UX quality bar to every route and state: hierarchy, navigation, readable type, AA contrast, keyboard focus, 44px mobile targets, useful state copy, inline validation where forms exist, spacing, motion, and speed.
12. Audit each screen before the final production screenshot pass, fix measurable issues, and record any demo-only limits.

UX review: all 21 screen types were checked in English and Vietnamese at 1440 and 390 pixels. The light and dark automated audits found no WCAG axe violations, small mobile targets, horizontal overflow, missing keyboard focus, or reduced-motion failures. Visual review found and corrected a stale home hero mark and a sticky-header capture offset after form interaction.
