# Lessons

- 2026-10-31: An agent edited the main checkout on `main` instead of its worktree; always use a T3 worktree branch, and the pre-commit hook now blocks `main`.
- 2026-10-31: A free model failed silently or hit quota; run work via `~/ai-tools/t3-run.sh` watchdog, which switches models and reports failures.
- 2026-10-31: A big task skipped planning; write a plan and a spec in `docs/specs/` before coding.
- 2026-11-01: Playwright device descriptors include a browser; `devices['iPhone SE']` forces WebKit. For the pinned Chromium project use explicit `viewport`/`hasTouch`/`isMobile` instead.
- 2026-11-01: A Radix modal overlay blocks pointer events, so an e2e that re-opens an already-open dialog on its covered trigger hangs forever; close via Escape before reopening.
- 2026-11-01: Admin sheets render `<AdminMobileNav>` (18 links): without `min-h-0 flex-1 overflow-y-auto` on the nav the sheet content overflows below the fold and taps below 667px hang on scrollIntoView; the admin document never scrolls (`.admin-main` is the scroller), so admin scroll checks must assert pane scrollTop.
