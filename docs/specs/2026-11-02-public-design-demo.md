# Public design demo (throwaway branch)

## Scope

- Render local-only `/en` and `/vi` home, projects, case study, and craft screens through the existing locale layout. A `DESIGN_DEMO=1` switch selects the demo while preserving the normal API-backed paths.
- The local API is unavailable, so use clearly identified sample project copy and existing abstract cover assets. Use existing public card and UI components where possible.
- Add a drawn SVG hero mark, restrained gradient, pointer spotlight, native same-origin View Transitions on project links, sticky case study contents and TL;DR, and a small craft gallery. Respect reduced motion.
- Keep IBM Plex fonts, radius hierarchy, and skeleton geometry. Avoid admin, API, database, deployment, and production changes.

## Review steps

1. Implement the local demo shell and screens.
2. Run formatting, content, type and build checks; update Graphify.
3. Run the web server with `DESIGN_DEMO=1`, capture full-page desktop/mobile PNGs for five screens, and inspect the images.
4. Commit only on `design/demo-redesign-2026-11-02`; no PR or merge.
