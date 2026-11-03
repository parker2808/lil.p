# R3-08 — Admin shell and insights

## Scope

Apply the approved admin design to the live login and CMS shell, dashboard, analytics, profile stats, audit, and admin not-found/loading routes. Edit only item 8's admin app routes, `admin-core`, `admin-auth`, `admin-dashboard`, `admin-insights`, admin styles/messages, focused browser coverage, and required project records. Keep the live API, JWT session, role checks, query keys, and localization.

## Acceptance

- EN and VI login, shell, dashboard, analytics, stats, audit, and not-found work at 1440 and 390 in light and dark themes.
- A `user` cannot see admin-only links/actions or load the audit route; an `admin` can use all insight routes. Sidebar, mobile bar, topbar, theme and language controls remain usable by keyboard with visible focus.
- Real API data renders in success and empty states. Loading and API failure states have useful localized feedback and retry where applicable.
- Real-route browser and server diagnostics are free of uncaught errors, hydration warnings, and development overlay. Every capture follows a passing state assertion and has a unique route/locale/state/theme/width tuple.

## Verification

Use named production-build Playwright flows for login, role gating and insight navigation in both locales; axe and state assertions; development diagnostic reproduction and regression check. Capture each applicable state in `~/Desktop/lilp-admin-demo-20261102/`, then run `pnpm check:all`. No fixture mount or persistent database migration.
