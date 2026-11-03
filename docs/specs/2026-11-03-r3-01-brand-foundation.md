# Round 3 PR 01 — brand foundation

## Scope

- Keep `packages/ui/src/components/BrandMark/brand-icon.svg` as the sole `lp` vector source. Generate `apps/web/app/icon.svg` and `apple-icon.png` from it.
- Render the shared `BrandMark` and fixed `lil.parker` wordmark in the real public header/footer and admin shell/login. CMS names remain page content.
- Scope orange/green light/dark tokens and restrained cosmic decoration to existing public/admin surfaces. Add no runtime dependency.

## Acceptance

- The same logo source appears at every named caller and both icon links resolve; the old `lb.` mark disappears.
- EN/VI, light/dark, 1440/390 real routes retain readable AA token pairs, visible focus, reduced motion, IBM Plex typography, and concentric radii.
- Each passing route assertion creates a theme-named PNG and a unique route/state/locale/width/theme manifest entry in the assigned Desktop folder.

## Tests

- Run deterministic SVG/PNG provenance comparison against the package source.
- Run `pnpm check:all` and the focused production-build Playwright `brand-foundation.spec.ts` against guarded disposable no-volume local MySQL; verify public header/footer and admin login/shell, icon links, themes, contrast, focus, and reduced motion.
- Inspect both themes, verify capture counts and manifest uniqueness, then destroy the temporary database.
