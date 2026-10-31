<!-- Archived verbatim from docs/PLAN.md (7. Tasks / T35 · Users, argon2, JWT access + refresh cookies); links re-pointed. Index: ../../PLAN.md -->

#### T35 · Users, argon2, JWT access + refresh cookies

**Roadmap** p18 (adjusted by D24) · **Spec** §1.5 (`User`), §1.6 (Auth row, replaced by D24), §6 Day 15 · **Depends** T29 · **Size** L

**Goal.** Email + password login that returns two JWTs in httpOnly cookies: a short access token that proves who you are on every request, and a longer refresh token that gets a new pair when the access token expires. Logout clears both cookies.

**Scope.**
- Packages: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` (+ `@types/passport-jwt`), `argon2`, `cookie-parser`.
- Model `User`: `id`, `email @unique`, `name`, `passwordHash`, `role Role @default(user)` with `enum Role { admin user }` (D7), `isActive @default(true)`, `tokenVersion Int @default(0)`, `lastLoginAt?`, timestamps. No `Session` model (D24). Migration `add-auth`.
- Contracts `auth/`: `auth.enum.ts` (`roleSchema = z.enum(['admin', 'user'])`, type `Role`), `auth.schema.ts` (`loginSchema`, `meSchema` = `{ id, email, name, role }`, never `passwordHash` or `tokenVersion`).
- Config (`src/config/env.schema.ts`): `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (each at least 32 characters and not equal to each other, or boot fails), `JWT_ACCESS_TTL_SECONDS` (default 900 = 15 min), `JWT_REFRESH_TTL_SECONDS` (default 604800 = 7 days).
- `modules/users`: `users.service.ts` (find by email, find by id, create with an argon2id hash, `bumpTokenVersion`). The seed creates one `admin` from `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` only when all three are set; never a default password.
- `modules/auth`:
  - `token.service.ts`: `signAccess(user)` → `{ sub: String(user.id), role }` with `JWT_ACCESS_SECRET`, `expiresIn: JWT_ACCESS_TTL_SECONDS`; `signRefresh(user)` → `{ sub, ver: user.tokenVersion }` with `JWT_REFRESH_SECRET`, `expiresIn: JWT_REFRESH_TTL_SECONDS`. Both use `JwtService.signAsync(payload, { secret, expiresIn })`, algorithm HS256. No email, name or other personal data in a payload.
  - `auth-cookies.util.ts`: `setAuthCookies(res, tokens)` and `clearAuthCookies(res)` with the options in the table below (Express `maxAge` is in milliseconds: seconds × 1000).
  - `strategies/jwt.strategy.ts` (`PassportStrategy(Strategy, 'jwt')`): `jwtFromRequest` reads `req.cookies.access_token`, `ignoreExpiration: false`, `secretOrKey: JWT_ACCESS_SECRET`; `validate(payload)` returns `{ id: Number(payload.sub), role: payload.role }` without a DB query (this becomes `request.user`).
  - `strategies/jwt-refresh.strategy.ts` (`'jwt-refresh'`): reads `req.cookies.refresh_token` with `JWT_REFRESH_SECRET`; `validate` loads the user and rejects (401) when the user is missing, `isActive = false`, or `payload.ver !== user.tokenVersion`.
  - `auth.service.ts`: `login` (find by email, `argon2.verify`; the same `INVALID_CREDENTIALS` 401 for an unknown email, a wrong password and an inactive user; update `lastLoginAt`; issue both tokens), `refresh` (issue a new pair for the validated user: rotation), `me` (load the user by `request.user.id`; 401 if missing or inactive).
  - `auth.controller.ts`: `POST /auth/login` (body `loginSchema`; sets both cookies; returns `meSchema`, never the tokens), `POST /auth/refresh` (`@UseGuards(JwtRefreshGuard)`; sets a new pair; 204), `POST /auth/logout` (clears both cookies; 204, works even with an expired access token), `GET /auth/me` (`@UseGuards(JwtAuthGuard)`). T36 makes `JwtAuthGuard` global.
- `common/guards/jwt-auth.guard.ts` (`AuthGuard('jwt')`, `handleRequest` turns every failure into 401 `UNAUTHENTICATED`, D5) and `common/guards/jwt-refresh.guard.ts` (`AuthGuard('jwt-refresh')`).
- `cookie-parser` in `main.ts`. `.env.example`: the four `JWT_*` keys (empty secrets, with the comment "generate with `openssl rand -base64 48`"), `ADMIN_EMAIL="<email>"`, `ADMIN_NAME`, `ADMIN_PASSWORD`.
- `test/helpers/auth.helper.ts`: creates an `admin` and a `user` in the test DB and returns logged-in supertest agents (cookies kept between requests). `api.http`: login, me, refresh, logout (REST Client remembers cookies).
- e2e: login sets both cookies with the right flags; `me` returns the DTO with `role`; an expired access token (signed in the test with a past `exp`) → 401; refresh → 204 and new cookies; refresh after `tokenVersion` changes → 401; logout clears both cookies.

**Cookies (D24).**

| Cookie | Holds | `Path` | `Max-Age` | Flags |
| --- | --- | --- | --- | --- |
| `access_token` | access JWT `{ sub, role }` | `/` (Next server components read it on `/admin/*` and forward it, T37) | `JWT_ACCESS_TTL_SECONDS` (15 min) | `httpOnly`, `SameSite=Lax`, `Secure` in production |
| `refresh_token` | refresh JWT `{ sub, ver }` | `/api/auth` (sent only to refresh and logout) | `JWT_REFRESH_TTL_SECONDS` (7 days) | `httpOnly`, `SameSite=Lax`, `Secure` in production |

**Files.** `apps/api/package.json`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*_add_auth/`, `apps/api/prisma/seed/profiles/*.seed.ts`, `apps/api/src/config/{env.schema.ts,app-config.service.ts}`, `apps/api/src/modules/users/{users.module.ts,users.service.ts,users.service.spec.ts,entities/*}`, `apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,auth.service.spec.ts,token.service.ts,auth-cookies.util.ts,strategies/jwt.strategy.ts,strategies/jwt-refresh.strategy.ts,dto/*}`, `apps/api/src/common/guards/{jwt-auth.guard.ts,jwt-refresh.guard.ts}`, `apps/api/src/main.ts`, `packages/contracts/src/auth/{auth.enum.ts,auth.schema.ts,auth.type.ts}`, `apps/api/test/helpers/auth.helper.ts`, `apps/api/test/auth.e2e-spec.ts`, `.env.example`, `apps/api/api.http` ([api STRUCTURE: auth](../../../apps/api/STRUCTURE.md#auth-jwt)).

**Design.** None (API only).

**Backend steps, explained.**
1. **Hashing, not encryption.** A password hash cannot be turned back into the password. argon2id is slow on purpose, so guessing millions of passwords is expensive. `argon2.hash` on create, `argon2.verify` on login; the plain password is never stored or logged.
2. **What a JWT is.** Three base64url parts joined by dots: header (algorithm), payload (claims such as `sub` = user id, `role`, `exp` = expiry time) and a signature made with a secret only the API knows. Anyone can *read* the payload (it is not encrypted, so no email or secrets in it), but nobody can *change* it without breaking the signature. The API trusts a token because the signature checks out, not because a DB row exists.
3. **Why two tokens.** The access token is sent on every request and is checked without touching the DB, so it must die quickly (15 min) in case it leaks. The refresh token is sent only to `/api/auth/*` (its cookie `Path`), lives 7 days, and is checked against the DB (`isActive`, `tokenVersion`) each time it is used. Different secrets mean one can never be used as the other.
4. **Where they live: httpOnly cookies.** `httpOnly`: page JavaScript cannot read them, so an XSS bug cannot steal them (a token in `localStorage` can be stolen). `SameSite=Lax`: other sites cannot send them with form posts. `Secure`: HTTPS only (production). Because Next rewrites `/api/*` to Nest, the browser thinks it is talking to one site; the cookies set by Nest are first-party and the browser sends them back on every `/api/*` call with no extra code.
5. **`@nestjs/jwt` and `passport-jwt`.** `JwtService` (from `@nestjs/jwt`) *creates* tokens. A Passport *strategy* (from `passport-jwt`) *checks* them: it says where to find the token (the cookie), which secret verifies it, and `validate()` returns what goes on `request.user`. `AuthGuard('jwt')` runs that strategy before a route.
6. **Refresh and rotation.** When a request gets 401 because the access token expired, the web calls `POST /api/auth/refresh` once (T37). The API checks the refresh token, then sends a fresh access token *and* a fresh refresh token. While someone keeps using the admin, the 7 days keep sliding; after 7 idle days they log in again.
7. **Logout and the kill switch.** Logout clears both cookies in this browser. There is no session row to delete, so to cut off *every* device the API increments `User.tokenVersion`; every refresh token signed with the old `ver` now fails, and the user is out within 15 minutes (when their access token expires). T46 uses this for "sign out everywhere", deactivation and password changes.
8. **Same error for every failure.** "Invalid email or password" for an unknown email, a wrong password and an inactive account, so nobody can test which emails have accounts.

**Acceptance.**
- [ ] Login sets `access_token` and `refresh_token` as httpOnly cookies with the paths and lifetimes in the table, and `GET /auth/me` returns the user DTO with `role` (roadmap p18).
- [ ] An expired or tampered access token gives 401; `POST /auth/refresh` with a valid refresh cookie returns 204 and new cookies; after `tokenVersion` changes, refresh gives 401.
- [ ] Logout clears both cookies, and `GET /auth/me` then returns 401 (roadmap p18, adjusted by D24).
- [ ] The DB holds no plain passwords and no tokens; no response body or log line contains a token.

**PR title:** `feat(api): jwt auth` (roadmap p18 says `session auth`; changed by D24)

#### T36 · Global JWT guard, roles (admin/user), Origin check, throttle

**Roadmap** p19 · **Spec** §1.6 (Auth, CSRF, Rate limit), §6 Day 16 · **Depends** T35 · **Size** M

**Goal.** Every non-public route needs a valid access token and the right role; mutating requests must come from our site; login is rate-limited.

**Scope.**
- Register three global guards in `app.module.ts`, in this order (`APP_GUARD`): `JwtAuthGuard` → `RolesGuard` → `OriginGuard`.
- `JwtAuthGuard` (from T35) becomes global and reads `@Public()` with `Reflector`: public routes skip it; everything else needs a valid access token or gets 401. `@Public()` on health, `POST /auth/login`, `POST /auth/refresh` (it has its own `JwtRefreshGuard`), `POST /auth/logout` and every `public-*.controller.ts`.
- `common/decorators/roles.decorator.ts`: `@Roles(...roles: Role[])` with `Role = 'admin' | 'user'` from contracts.
- `common/guards/roles.guard.ts`: skips `@Public()` routes; reads `@Roles()` from the handler, then the class; **no `@Roles()` means `['admin']`**; `request.user.role` not in the list → 403 `FORBIDDEN`.
- Add `@Roles('admin', 'user')` to every read (`GET`) handler of the admin controllers that exist so far (T29–T32a) and to `GET /auth/me`. Writes keep no decorator, so they are admin only. Later tasks name their roles explicitly (see the table).
- `common/guards/origin.guard.ts`: for `POST/PUT/PATCH/DELETE`, `Origin` must equal `WEB_ORIGIN`; otherwise 403 `BAD_ORIGIN` (D8). Login, refresh and logout are included. Server-to-server calls from Next (contact Server Action, T48) send `Origin: WEB_ORIGIN` explicitly.
- `common/decorators/current-user.decorator.ts`: `@CurrentUser()` returns `request.user` (`{ id, role }`).
- `@nestjs/throttler`: login 5 per minute per IP + email → 429; refresh 30 per minute per IP. Trust the loopback proxy (`trust proxy`) so the client IP comes from `x-forwarded-for` set by Next.
- e2e: no token → 401; expired token → 401; `user` on any write → 403; `user` on an admin `GET` → 200; `admin` write → 2xx; foreign `Origin` → 403; 6th bad login → 429.

**What each role can do (D7).** The API enforces this; the web only hides what a role cannot use (T37 `RoleGate`).

| Area | `admin` | `user` | Routes (task) |
| --- | --- | --- | --- |
| Own account: me, logout, change own password | yes | yes | `/auth/*` (T35, T46) |
| Dashboard: counts, content health, analytics charts | read | read | `GET /admin/stats`, `GET /admin/health` (T38, T54) |
| Content: projects, posts, experience and other about tables, skills, tags, domains, site, profile, nav, social, contact topics, pages and blocks | read, create, edit, delete, reorder | read only (lists, editors and the page builder open read-only) | `/admin/*` (T29–T33, T39–T45b) |
| Publish, unpublish, bulk status changes; page publish, discard and version restore | yes | no | T52, T52a, T55 |
| Draft preview (including the page builder live preview) and page version history | yes | yes | `GET /admin/preview/*`, `/api/draft`, `GET /admin/pages/:key/versions` (T52, T52a) |
| Media: browse | yes | yes | `GET /admin/media` (T50) |
| Media: upload, edit alt text, delete | yes | no | T50 |
| Inbox (contact messages contain visitor emails) and live notifications | yes | no | `/admin/messages`, `/admin/events` (T47, T49) |
| Audit log | yes | no | `GET /admin/audit` (T55) |
| Users: create, change role, deactivate, sign out everywhere | yes | no | `/admin/users` (T46) |

**Files.** `apps/api/src/common/guards/{jwt-auth.guard.ts,roles.guard.ts,origin.guard.ts}` (+ specs), `apps/api/src/common/decorators/{public.decorator.ts,roles.decorator.ts,current-user.decorator.ts}`, `apps/api/src/app.module.ts`, `apps/api/src/main.ts`, `apps/api/src/modules/auth/auth.controller.ts`, every `public-*.controller.ts` (`@Public()`), every `admin-*.controller.ts` so far (`@Roles('admin', 'user')` on `GET` handlers), `apps/api/test/guards.e2e-spec.ts`.

**Design.** None (API only).

**Backend steps, explained.**
1. **Guard.** Runs before the controller and answers yes or no. A global guard protects every route by default; `@Public()` opts a route out. Forgetting a decorator then fails safe (401), not open.
2. **Guard order.** First "who are you?" (`JwtAuthGuard` verifies the token and sets `request.user`), then "are you allowed?" (`RolesGuard`), then "did this come from our site?" (`OriginGuard`). Nest runs global guards in the order they are registered.
3. **Roles.** `@Roles('admin', 'user')` puts a label on the route; `RolesGuard` compares it with `request.user.role`, which comes from the verified token, so a user cannot fake it. No label means admin only. The web hides buttons too, but the server is what enforces it.
4. **Role changes and the 15 minutes.** The role is inside the access token, so a role change or deactivation (T46) takes effect at the next refresh, at most 15 minutes later. That is the price of not reading the DB on every request (D24).
5. **Origin check (CSRF).** A malicious page can make your browser send a request with your cookies. Browsers always send the `Origin` header on such requests, so rejecting other origins blocks it. JWTs in cookies need this exactly as session cookies do.
6. **Rate limit.** Counts requests per key in a time window and answers 429 when over the limit.

**Acceptance.**
- [ ] Writes without a token return 401; writes with a foreign or missing `Origin` return 403 (roadmap p19, adjusted by D8).
- [ ] The 6th bad login in a minute returns 429 (roadmap p19).
- [ ] Only `admin` can write: a `user` gets 403 on every admin `POST/PATCH/DELETE`, and 200 on admin `GET` routes (roadmap p19 "only the admin can write"; spec §6 Day 16).
- [ ] A new admin route without `@Roles()` is admin only (covered by a guard spec).

**PR title:** `feat(api): guards + csrf + throttle`

#### T37 · Admin shell, login, ⌘K

**Roadmap** p20 · **Spec** [§4.3](../../design/portfolio-design-system.md#s-4-3), §4.6 (Admin layout row), §5.7, §5.11 · **Depends** T11, T12, T36 · **Size** L

**Goal.** A protected admin with a server-side token check, silent token refresh, role-aware UI, the Linear-style shell, the login page and the admin command palette.

**Scope.**
- `app/admin/layout.tsx`: root layout #2 (`<html lang="en">`, fonts, `Providers` with `QueryProvider`, `Toaster`, admin messages from `en.json` `admin.*`, D22).
- `middleware.ts` (extends the T11 file): for `/admin/*` except `/admin/login`, no `access_token` cookie → redirect to `/admin/login?next=<path>`. This is only a fast, no-network check (the cookie disappears when the token expires, T35); the real check is the layout below. Public routes keep the next-intl middleware.
- `app/admin/login/page.tsx` → `admin-auth/views/AdminAuthLogin.tsx`. On mount it tries `POST /api/auth/refresh` once (the browser sends `refresh_token` by itself); 204 → `router.replace(next)`; otherwise it shows `LoginForm` (TanStack Form + `field`, `loginSchema`, maps `fieldErrors`, shows the 429 message). `admin-auth/utils/safe-next.util.ts` accepts only paths starting with `/admin` (no open redirect).
- `app/admin/(cms)/layout.tsx`: server call `GET /auth/me` (`apiServer` option `withAuth`: forwards only the `access_token` cookie, `cache: 'no-store'`); 401 → `redirect('/admin/login')`; else `AdminShell` with the `me` DTO.
- `core/services/api-client.service.ts`: for `/api/admin/*` and `/api/auth/me`, a 401 triggers one `POST /api/auth/refresh` (single-flight: parallel 401s share one refresh promise) and retries the request once; if refresh fails → `window.location.assign('/admin/login?next=…')`. Exports `refreshOnce()` for the SSE hook (T49). Public calls never refresh.
- `admin-core`: `AdminShell` (shadcn `sidebar`, 240px, collapsible to a 56px rail, `[` toggles; groups and items from §4.3 plus Stats, Domains, Process (§5.11); mobile sheet), `Topbar` (breadcrumbs, page actions slot, user menu with name, role badge and logout), admin `CommandPalette` (jump to admin routes, "New project/post" for `admin` only), `RoleGate` (`<RoleGate allow={['admin']}>` renders children only for those roles), `stores/admin-ui.store.tsx` (`AdminUiProvider`, `useAdminUi`: sidebar collapsed, palette open), `services/auth.service.ts` (me, logout), `hooks/use-me.hook.ts` (`useMe()`, seeded from the layout's `me`; `useIsAdmin()`).
- Role-aware UI rule for every later admin task: write controls (New, Save, Delete, Publish, reorder, upload, bulk bar) are wrapped in `RoleGate allow={['admin']}`; the Inbox, Audit log and Users sidebar items are `admin` only; a `user` sees the rest read-only (T36 table).
- `app/admin/(cms)/page.tsx` → `AdminDashboardIndex` placeholder (filled by T38).

**Files.** `apps/web/middleware.ts`, `apps/web/app/admin/layout.tsx`, `apps/web/app/admin/login/page.tsx`, `apps/web/app/admin/(cms)/{layout.tsx,page.tsx}`, `apps/web/src/modules/admin-auth/{views/AdminAuthLogin.tsx,components/LoginForm/*,utils/safe-next.util.ts}`, `apps/web/src/modules/admin-core/components/{AdminShell,AdminSidebar,Topbar,CommandPalette,RoleGate}/*`, `apps/web/src/modules/admin-core/{stores/admin-ui.store.tsx,services/auth.service.ts,hooks/use-me.hook.ts}`, `apps/web/src/modules/core/services/{api-server.service.ts,api-client.service.ts}`, `apps/web/i18n/locales/en.json`, `packages/ui/src/components/ui/{sidebar,breadcrumb,avatar}.tsx`.

**Design.** Figma `14:2` (shell). Mockup `admin-dashboard.html`. Tokens: `--sidebar*`, `text-ui-title`, `text-ui`, `text-ui-meta`, admin control height 32 (28 compact). No atmosphere, bands or orbs in admin (§7.2 `06`).

**Token flow, explained.**
1. **The browser never touches a token.** Login, refresh and logout answer with `Set-Cookie`; the browser stores the httpOnly cookies and sends them on every `/api/*` call. Web code only sees the `me` DTO.
2. **Server components forward the cookie.** A Server Component runs on the Next server, not in the browser, so it must pass the cookie on by hand: `apiServer(..., { withAuth: true })` copies `access_token` from `cookies()` into the request to Nest.
3. **Refresh happens in one place.** In the browser, `apiClient` sees a 401, refreshes once and retries. On a full page load after the access token expired, the middleware sends you to the login page, which refreshes silently and sends you back. Only when the refresh token is also gone or revoked do you see the form.

**Acceptance.**
- [ ] Logged out, `/admin` redirects to login on the server: `curl -I` shows a redirect, no client flash (roadmap p20).
- [ ] With an expired access token but a valid refresh token, opening `/admin/projects` lands back on `/admin/projects` without showing the form; an admin request made after expiry succeeds after one automatic refresh.
- [ ] Signed in as `user`: no Inbox, Audit log or Users items, no New/Save/Delete/Publish buttons; the role badge says `user`.
- [ ] ⌘K navigates to an admin route (roadmap p20); `[` toggles the sidebar.
- [ ] Wrong credentials show the error under the form; the 6th attempt shows the rate-limit message.
- [ ] Screenshot compared with `14:2` (shell only).

**PR title:** `feat(web): admin shell`

#### T38 · Admin dashboard v1 + stats endpoint

**Roadmap** p20 · **Spec** [§5.7](../../design/portfolio-design-system.md#s-5-7), §5.11, §5.0 (Admin dashboard row) · **Depends** T37 · **Size** M

**Goal.** A dashboard whose counts and content-health checks come from the API, one card at a time.

**Scope.**
- API `modules/dashboard`: `GET /admin/stats?range=7d|30d|90d` (content counts by status; fields for messages and views are added by T47 and T54), `GET /admin/health` (both `@Roles('admin', 'user')`; content-health checks: projects without a domain, case studies with fewer than 2 key facts, marquee with fewer than 6 skills, missing Vietnamese fields on published items, publish-lint issues; missing alt text is added by T50).
- Web `admin-dashboard`: `AdminDashboardIndex`, `StatCard` (in `packages/ui`: value, delta text + arrow, not color only), `ContentHealthCard` (each issue links to the item), period `toggle-group` stored in the URL. Server prefetch + `HydrationBoundary`; each card uses `useSuspenseQuery` inside its own `SectionBoundary` (per-card skeleton, empty and error).

**Files.** `apps/api/src/modules/dashboard/*`, `packages/contracts/src/dashboard/*`, `apps/web/app/admin/(cms)/page.tsx`, `apps/web/src/modules/admin-dashboard/{views/AdminDashboardIndex.tsx,components/{StatsCards,ContentHealthCard}/*,hooks/use-dashboard.hook.ts,services/dashboard.service.ts}`, `packages/ui/src/components/StatCard/*`.

**Design.** Figma `14:2`. Mockup `admin-dashboard.html` (content health v2 checks). Tokens: `--card`, `--success`, `--warning`, `--destructive`, `text-ui`, `text-ui-meta`.

**Acceptance.**
- [ ] Dashboard counts match the API (roadmap p20).
- [ ] Content health lists the v2 checks from the mockup, each linking to the item.
- [ ] One failing card shows its own error with Retry; the others still render.

**PR title:** `feat(web): admin dashboard`

#### T39 · DataTable + admin projects list

**Roadmap** p21 · **Spec** [§5.8](../../design/portfolio-design-system.md#s-5-8), §4.3 (`DataTable`, `FilterBar`), §4.6 (URL-driven lists, optimistic update) · **Depends** T37 · **Size** L

**Goal.** One generic, keyboard-friendly server-driven table, first used for projects.

**Scope.**
- `packages/ui` `DataTable` (TanStack Table on shadcn `table`; `manualPagination/Sorting/Filtering`; sortable, resizable, hideable columns; row selection with shift-range; bulk actions bar; sticky header; density compact 32 / default 40; keys `j/k` move, `x` select, `Enter` open, `e` edit, `⌫` delete with confirm (edit, delete and the bulk bar only for `admin`, via a `canWrite` prop); states: skeleton rows, empty with create action, no results with clear filters, error with Retry; card list below `md`) and `FilterBar` (chips, add-filter menu).
- `admin-core/hooks/use-list-params.hook.ts` (URL ↔ `ListParams` via zod), `admin-core/utils/optimistic.util.ts` (snapshot / restore helpers for `onMutate`/`onError`).
- `admin-projects`: `services/admin-projects.service.ts`, `hooks/use-admin-projects.hook.ts` (list with `useSuspenseQuery` and `keepPreviousData`, archive with optimistic removal and rollback, status toggle, reorder with move up/down), `views/AdminProjectsIndex.tsx`. Columns: title, domain (hue pill), status (`StatusPill`), key facts count, updated, row actions. Prefetch detail on row hover/focus after 100ms.
- Route `app/admin/(cms)/projects/page.tsx` with server prefetch + `HydrationBoundary`.

**Files.** `packages/ui/src/components/{DataTable,FilterBar}/*`, `packages/ui/src/components/ui/{table,checkbox,alert-dialog}.tsx`, `apps/web/src/modules/admin-core/{hooks/use-list-params.hook.ts,utils/optimistic.util.ts}`, `apps/web/src/modules/admin-projects/{services/admin-projects.service.ts,hooks/use-admin-projects.hook.ts,views/AdminProjectsIndex.tsx,components/ProjectsTable/*}`, `apps/web/app/admin/(cms)/projects/page.tsx`.

**Design.** Figma `15:2`. Mockup `admin-table.html` (Domain column, key facts count, "1–5 of 5"). Tokens: `text-ui`, `text-ui-meta`, `--border`, `--muted`, `--hue-*`, `--sidebar-accent`.

**Acceptance.**
- [ ] Sort, search and paging send new API requests and update the URL (roadmap p21).
- [ ] A failed archive restores the row (optimistic rollback), shown by a test with a mocked 500 (roadmap p21).
- [ ] Keyboard shortcuts work and are listed in the help dialog.
- [ ] Screenshot compared with `15:2`; the table is usable at 360px.

**PR title:** `feat(web): admin data table`

#### T40 · Admin lists: posts, experience

**Roadmap** p21 · **Spec** §5.8 · **Depends** T30, T39 · **Size** M

**Goal.** The posts and experience tables on the shared `DataTable`.

**Scope.**
- `admin-posts`: service, hooks, `AdminPostsIndex` (columns: title, status, tags, reading minutes, published date, updated; filters status/tag; archive optimistic). Route `app/admin/(cms)/posts/page.tsx`.
- `admin-about`: experience table (`AdminAboutExperienceIndex`: company, role, dates, visible switch (optimistic), move up/down). Route `app/admin/(cms)/experience/page.tsx`.

**Files.** `apps/web/src/modules/admin-posts/{services,hooks,views,components}/*`, `apps/web/src/modules/admin-about/{services/experience.service.ts,hooks/use-admin-experience.hook.ts,views/AdminAboutExperienceIndex.tsx}`, `apps/web/app/admin/(cms)/{posts,experience}/page.tsx`.

**Design.** Figma `15:2` pattern; mockup `admin-table.html`.

**Acceptance.**
- [ ] Both lists sort, filter and page through the API with URL state.
- [ ] Toggling `isVisible` is optimistic and rolls back on error.

**PR title:** `feat(web): posts and experience lists`

#### T41 · Admin lists: small entities + icon/hue pickers

**Roadmap** p21 · **Spec** §5.11, §6 Day 13 v2 · **Depends** T31, T32, T39 · **Size** M

**Goal.** Tables with sheet editors for the small entities, including the icon and hue pickers.

**Scope.**
- `packages/ui`: `IconPicker` (popover + command over the icon allowlist, previews `Icon`), `HuePicker` (toggle group of the 5 hues with a `Badge` preview).
- `admin-about`: education, principles, profile stats, process steps. `admin-taxonomy`: skills (category, depth, marquee switch), skill categories, tags, domains (hue + icon). Each: `DataTable` + a `Sheet` with a TanStack Form editor (zod schema from contracts, both language fields side by side), move up/down reorder, delete with `alert-dialog`.
- Routes under `app/admin/(cms)/` for each list (`education`, `principles`, `stats`, `process`, `skills`, `tags`, `domains`).

**Files.** `packages/ui/src/components/{IconPicker,HuePicker}/*`, `apps/web/src/modules/admin-about/{components,hooks,services,views}/*`, `apps/web/src/modules/admin-taxonomy/{components,hooks,services,views}/*`, `apps/web/app/admin/(cms)/{education,principles,stats,process,skills,tags,domains}/page.tsx`, `packages/ui/src/components/ui/{sheet,select,switch}.tsx`.

**Design.** Mockup `admin-dashboard.html` sidebar items; spec §5.11. Tokens: `--hue-*`, `text-ui`.

**Acceptance.**
- [ ] Reordering domains changes the home order (immediately in dev per D23; after publish revalidation from T52) (spec §6 Day 13 v2).
- [ ] The icon picker offers only allowlisted icons; the hue picker shows each hue's pill.

**PR title:** `feat(web): admin taxonomy lists`

