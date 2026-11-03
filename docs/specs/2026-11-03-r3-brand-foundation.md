# Round 3 brand foundation

- Keep the `lp` vector in `packages/ui/src/components/BrandMark/brand-icon.svg` as the sole glyph source. Generate the app SVG and PNG icons from it.
- Render the shared `BrandMark` on the real public header/footer and admin sidebar/login. Use the fixed `lil.parker` wordmark; keep CMS names in page content.
- Scope orange/green tokens and quiet cosmic decoration to existing public/admin surfaces, preserving legibility, focus, motion preferences, IBM Plex and radii.
- Verify the icon provenance and real production routes in EN/VI at 1440/390 in light/dark. Capture only after assertions and keep a tuple manifest.
- Run focused checks and `pnpm check:all`; commit on the task branch without pushing.
