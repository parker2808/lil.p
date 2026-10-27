# Portfolio notes — Central Food Wholesale CRM Portal (cfw-sales-crm-portal)

Source: analysis of `c:\Users\vvhung6\Desktop\cfw\cfw-sales-crm-portal` on 2026-10-26, branch `sit` at `beef898`.
Company: Central Food Wholesale. Product: CRM used by the sales team, served under `/crm` behind the Sales Portal (shared auth cookies, Cloud Run). Git identities counted here, from 1 Jun 2026: lilparker28 `<<email>>` (Parker) and, included on request, cmc-bond-tran `<<email>>`. Older commits by `Bond` on the same email are outside this window.

## Facts (verified via git)

- Combined window: 2 Jun 2026 – 23 Sep 2026. 16 merged commits on `sit`. Diff of those commits: +6,264 / −912. 16 / 887 commits. A focused slice, not ownership of the whole portal.
- Parker, 7 Aug 2026 – 23 Sep 2026: 11 commits (PRs #565, #572, #575, #577, #580, #584, #585, #586, #594, #596, #605), +6,130 / −883, 15 test files.
- cmc-bond-tran, 2 Jun 2026 – 23 Jun 2026: 5 commits (PRs #513, #526, #527, #528, #538), +134 / −29. No other commit on `<email>` falls in June 2026 or later. PR #538 is the only one with `Co-authored-by: Hung. Vu Van - CMC Global DU3.1 <<email>>`.
- Repo: Nuxt 4 SPA (`ssr: false`), Vue 3 `<script setup>`, TypeScript, Vuetify 3, Tailwind, Pinia, TanStack Vue Query, Firebase Auth, vue-i18n (default `th`, fallback `en`), Vitest, Playwright. About 214 Vue files, 163 TS files under `app/`, 141 test files, 16 pages.
- Screens these commits did not build: activity and task CRUD, calendar, customer territory, the monitoring and performance dashboards themselves, auth/proxy, Google route calculation. The June commits only patch the dashboards.

## Highlights authored by Parker

1. Visit-route customer review UI — the work that runs through 10 of the 11 commits (YIMCMC-3465, 3564, 3567/3577/3578, 3645).
   - Initial customer table, available-customer pool, and stops table for a generated day route (PR #565), then edit mode (PR #572).
   - Edit session is draft-based. The table mutates `draftStops`; the map and route metrics stay on the committed list until save. `draftTouched` stays true after any add, remove, or reorder in the session, including remove-then-add of the same customer, so Save does not flip off when the task-id list happens to match the committed list again.
   - Completed visits are frozen (`lockedTaskIds` via `isVisitRouteTaskDone`). They cannot be dragged or removed. `reorderVisitRouteStopsKeepingLocked` lets other stops move around a frozen row while that row keeps its slot. Drag-and-drop is `VueDraggable` with `force-fallback` (touch / iPad), and locked rows are filtered out of the drag.
   - Available-customer pool (PR #575, follow-up #577): search across customer id, member id, business name, and customer name; Vuetify clear emits `null`, coerced back to `''` so the field cannot get stuck; leaving edit mode clears the query. Infinite scroll, page size 15, observer rooted on the list scroller. Capacity is `MAX_CUSTOMERS_PER_DAY` (9): remaining slots, add disabled at the cap, add only when `assigned_day_number === 0`. Badge shows Unassigned or the day number. Buying potential and sub-district / district / province are on the card.
   - Stops table shows business name, falling back to customer name (PR #584, #586). Responsive column layout for iPad and desktop (PR #580), then header overlap and right padding (YIMCMC-3645, PR #596, #605).
   - Route-map warnings: `force-info-panel-warnings` on the saved-detail card so the info-panel warnings stay visible whenever a review model exists (PR #585). The warning copy and the Google/Haversine calculation itself belong to other commits.

2. AI recommendation UI on the activity-log form — sole author of the first version (YIMCMC-3712, PR #594, 19 files, +2,240 / −10). Shipped as a mockup, explicitly outside the Next/Save workflow.
   - New tab on `FormCreateUpdateLog`. It is not one of the workflow tabs (log / customer / sales). Next from that tab returns to Customer, and the tab does not block form validity or the scroll-every-tab gate.
   - Layout: customer panel (General / Insight) with buying potential, actual purchase, and gap (`potential − actual`, null when either side is missing); category filters Top Picks / Win Back / New Items with counts; product grid; current-order drawer.
   - Sort is client-side: promotion priority BMSM, then COUPON, then PWP, unknown types last, then `similarBuyPercentage` descending.
   - Cards show rank, promotion and action badges, image with fallback, stock, similar-buy percent, revenue impact. Empty category state.
   - Cart is in-memory. Add is a no-op at stock 0 or when the product is already in the cart. Quantity increases only up to stock and decreases only down to 1; remove is separate. Totals: unique lines, quantity sum, amount = unit price × quantity. Changing category does not drop cart lines, because each line keeps its product snapshot.
   - Lists page in chunks of 10 via `IntersectionObserver`, with a loaded-count remembered per category. Query is TanStack Vue Query with `keepPreviousData` so a category switch does not blank the previous grid.
   - Service is a mock (`getAIRecommendation`). The file says to swap the return for `$customFetch` when the API exists. No order is placed from this screen. The drawer footer navigates to X-Ordering in a new tab.
   - Drawer is teleported, full width on mobile and 560px otherwise, and locks scroll on `body` plus `.default-layout-container`, released on close and unmount.
   - Copy in both `en` and `th`. Tests cover the screen, empty category, customer panel, cart helper, service, and the log-form tab.

3. Performance and monitoring dashboard fixes — cmc-bond-tran, June 2026. These sit on tables and filter stores other people had already built.
   - Pagination re-apply (PR #528). Apply and Reset wrote `pagingActionType` directly. A second Apply with the same enum value did not notify the tables, so the page did not return to 1. `triggerPaging` sets the type and increments `pagingActionTrigger`. The activity overview, task overview, and visit/call drill-down tables watch both, with `flush: 'sync'`. The same trigger is on the monitoring filter store and its filter bar. Task overview also sent `statuses`; the query key is `status`.
   - Table height (PR #538, co-authored by Hung Vu Van). Activity and task overview used a fixed `height` of 400. `getDataTableHeight` returns `undefined` when the page size is 10 or fewer (the table grows with its rows, 10 is the default visible count) and otherwise `header (48) + 10 × row height`. Activity rows use 76px, task rows 52px. Covered by `vuetify-table` tests.
   - Missing `dayjs` import (PR #526, #527). `ActivityOverviewTable` and `TaskOverviewTable` imported `TimeFormatEnum` and `formatDate` from `~/utils/helpers/dayjs.js`. PR #526 also dropped `break-all` on the calendar task card's activity id and location.
   - Copy (PR #513): English label `objective` on the performance dashboard changed from "Objective" to "Objectives". Thai locale was not changed.

## NOT Parker's (don't claim)

- Google Routes (YIMCMC-3571, PR #576) and the Haversine × 1.3 / 20 km/h fallback, geocoding, hidden-stop geometry, and route snapshot cache — leanguyenCMC. Parker only forced the existing warning panel to stay visible.
- Suggested-route view (YIMCMC-3533) and loading a saved plan — leanguyenCMC. A later fix to `VisitRouteCustomers` (PR #592) is also Lea's.
- YIMCMC-3551, the follow-up that adjusted remove-by-status inside `VisitRouteStopsTable` — jacknguyen19. The lock set and the reorder helper above are Parker's; that table tweak is Jack's.
- Reset-to-suggested-route, summary table, generation-form cancel, sidebar scroll, and iPad spacing passes — teammates (leanguyenCMC, jacknguyen19, pmquan2cfw).
- Turning the AI tab on with `CRM_AI_RECOMMENDATION_ENABLED` across environments, and gating add-to-cart / the drawer on `useHasAccessV2(X_ORDERING)` — leanguyenCMC, YIMCMC-3695, PR #601, two days after the UI. Parker shipped the tab present on the form; the flag and the permission checks came after.
- The recommendation model, ranking, and any real order API. The UI sorts and displays; it does not generate recommendations or submit a cart.
- cmc-bond-tran / Bond history before 1 Jun 2026 (210 earlier commits on `<email>`, including the original dashboard work). Only the five commits from June 2026 are counted. The performance and monitoring dashboards, their filter stores, and `getIndexTable` already existed; June only adds the paging trigger, the height helper, the import fix, and the Objectives label.
