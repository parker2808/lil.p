# Lessons

- 2026-10-31: An agent edited the main checkout on `main` instead of its worktree; always use a T3 worktree branch, and the pre-commit hook now blocks `main`.
- 2026-10-31: A free model failed silently or hit quota; run work via `~/ai-tools/t3-run.sh` watchdog, which switches models and reports failures.
- 2026-10-31: A big task skipped planning; write a plan and a spec in `docs/specs/` before coding.
- 2026-11-01: Playwright device descriptors include a browser; `devices['iPhone SE']` forces WebKit. For the pinned Chromium project use explicit `viewport`/`hasTouch`/`isMobile` instead.
- 2026-11-01: A Radix modal overlay blocks pointer events, so an e2e that re-opens an already-open dialog on its covered trigger hangs forever; close via Escape before reopening.
- 2026-11-01: Admin sheets render `<AdminMobileNav>` (18 links): without `min-h-0 flex-1 overflow-y-auto` on the nav the sheet content overflows below the fold and taps below 667px hang on scrollIntoView; the admin document never scrolls (`.admin-main` is the scroller), so admin scroll checks must assert pane scrollTop.
- 2026-11-01: Next can stream an admin `notFound()` page inside an async authenticated layout with HTTP 200; mark unknown admin sections as 404 in the proxy while the catch-all renders the shell page.
- 2026-11-01: Published seed records can still contain unfinished fields across case studies, so guard public API text after schema parsing to keep those fields out of every route.
- 2026-11-01: A canvas rendered before media checks still appears in mobile DOM even if the shader import is skipped; gate the canvas element along with the import.
- 2026-11-01: A mobile-only shader guard does not prevent global client providers and desktop-only controls from hydrating on mobile; keep route-specific providers and controls out of the mobile bundle.
- 2026-11-01: In a fresh T3 worktree, `/usr/local/bin/node` may be Node 18 ahead of the installed Node 22; put the Node 22 bin directory first on `PATH` before installing or checking this repo.
- 2026-11-01: In a fresh worktree, build `@portfolio/contracts` before running the UI package typecheck alone; its generated type declarations are not present after install.
