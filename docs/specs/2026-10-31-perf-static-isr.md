# Spec: public pages static/ISR + API latency (2026-10-31)

Branch `perf/static-isr-and-api-latency`. Status: implemented, committed locally, pending Parker's review (not pushed, not deployed).

## Problem (measured in production, 2026-10-31, from Vietnam)

- API on Render (Singapore), warm: `/api/health` TTFB 0.19–0.27 s, `/api/public/projects` 0.98 s, `/api/public/posts` 0.27 s, `/api/public/site` 0.33 s. The API is fast when warm.
- Web on `lil-p.vercel.app`: `x-vercel-id: hkg1::iad1`. Functions ran in `iad1` (US East) while the API and DB are in Singapore, so every server-side API call crossed the Pacific.
- Every public page was dynamic: `cache-control: private, no-store`, `x-vercel-cache: MISS`. Cold TTFB 3.1–3.9 s, warm 0.46–0.87 s.

## Acceptance criteria

| ID  | Criterion                                                  | How it is measured                                                                                                                                                                                          |
| --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | Vercel functions run in `sin1`                             | Root `vercel.json` has `"regions": ["sin1"]` (Vercel Root Directory is the repo root). After deploy: `x-vercel-id` ends in `::sin1`.                                                                        |
| AC2 | Public pages are static/ISR                                | `pnpm --filter @portfolio/web build` with the API reachable lists public routes as `○`/`●`, not `ƒ`. `next start` returns `x-nextjs-cache: HIT` and `cache-control: s-maxage=3600, …` for them.             |
| AC3 | No `headers()` / `cookies()` while rendering public routes | `rg "\b(headers\|cookies)\(\)"` over `app/[locale]`, sitemap, robots and the public modules finds no render-time call. Public `apiServer` reads do not call `cookies()` (unit test).                        |
| AC4 | Admin edits revalidate public content                      | With the API webhook disabled, a public page served from cache shows the admin's change on the next request after an admin save (live check), plus unit tests for the hook and e2e publish flows.           |
| AC5 | CSP security equivalent, trade-off documented              | `/admin` keeps the per-request nonce + `'strict-dynamic'`. Public policy differs only in `script-src` (unit test asserts all other directives are identical). Trade-off written below and in `csp.util.ts`. |
| AC6 | Build passes with the API unreachable                      | `pnpm build` with nothing listening on the API port exits 0; nothing is prerendered and ISR fills pages on first visit. CI-style e2e (web built without API) passes.                                        |
| AC7 | README stack + PROJECT_CONTEXT updated                     | README has a Stack section with versions checked against `package.json`; `PROJECT_CONTEXT.md` §2, §7 and §9 updated.                                                                                        |
| AC8 | Lint / typecheck / tests green                             | `pnpm format:check`, `pnpm lint` (0 errors), `pnpm typecheck`, `pnpm test`, `pnpm check:content`, `pnpm check:deps`, web e2e.                                                                               |
| AC9 | Before/after timings recorded                              | Before = production numbers above. After = local `next build` + `next start` measurements against a local API, clearly labeled local. Production "after" is measured after deploy.                          |

## Plan

1. AC1: add root `vercel.json` with `regions: ["sin1"]`; note it in `docs/DEPLOY*.md`. Check the API side (health query, Prisma pool, no per-request client) and change it only if there is a real issue.
2. AC3, AC2: split `apiServer` so public reads never touch cookies/headers and always carry `next: { revalidate: 3600, tags: ['public', …] }`. Remove `force-dynamic` from public routes; stop reading the nonce in the locale layout; read `searchParams` on block pages only in draft mode (keeps `?v=` previews).
3. AC6, AC2: `generateStaticParams` for locale and slug routes, prerendering only when `/api/health` answers. Sitemap/RSS fall back to empty output only during `next build`.
4. AC4: admin-only server action `revalidatePublicContent` (`updateTag('public')`) called after every successful admin mutation; `/api/revalidate` webhook expires tags immediately.
5. AC5: one CSP builder; nonce only on `/admin` in `proxy.ts`; document the trade-off.
6. AC7: README Stack section, PROJECT_CONTEXT changelog/open items.
7. AC8, AC9: run all checks and both e2e build modes; measure local before/after on the same machine.

## Results

| ID  | Result                                   | Evidence                                                                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | Pass (config); prod check pending deploy | `vercel.json` committed at the repo root. API side checked, no change needed: one shared `PrismaService` with one long-lived `mariadb` pool (driver defaults), `/api/health` runs `SELECT 1`.                                                                                                                                                                           |
| AC2 | Pass, one documented exception           | API-up build: `/en`, `/vi`, about, contact, all note and project detail pages, their OG images and RSS are `●` (1 h ISR); robots and sitemap `○`. `next start`: `x-nextjs-cache: HIT`, `s-maxage=3600`. Exception: `/[locale]/notes` and `/[locale]/projects` stay `ƒ` because filters and paging come from the query string; their API reads still use the data cache. |
| AC3 | Pass                                     | Only render-time-free hits: `contact.action.ts` (server action, runs on submit), `apiServer` auth branch (`withAuth`: admin and draft only), `requestNonce` (used only by the admin layout). Unit test asserts public reads never call `cookies()` and send no headers.                                                                                                 |
| AC4 | Pass                                     | Live check (local, API webhook disabled): `/en` `HIT` with old block order → draft edit still `HIT` old → admin clicks Publish → next request `MISS` with new order → then `HIT`. Unit tests: debounce, ignore failures, flush on unmount. Web e2e publish flows pass.                                                                                                  |
| AC5 | Pass with trade-off                      | `/admin/login` response: `script-src 'self' 'nonce-…' 'strict-dynamic'` and nonce on its scripts. Public: `script-src 'self' 'unsafe-inline'`; unit test asserts every other directive matches the admin policy. See trade-off below.                                                                                                                                   |
| AC6 | Pass                                     | `pnpm build` with nothing on port 4000 exits 0; locale params are empty, pages render on first visit. Web e2e on that CI-style build: 32/32, zero `DYNAMIC_SERVER_USAGE` errors.                                                                                                                                                                                        |
| AC7 | Pass                                     | README "Stack" + "Caching and rendering" sections (Next 16.4.3, React 19.3.0, NestJS 11, Prisma 7.10.1 + `@prisma/adapter-mariadb`, MySQL 8.4 / TiDB, Vercel `sin1` + Render free + Cloudinary, cron-job.org ping every 10 min). PROJECT_CONTEXT §2, §7, §9 updated.                                                                                                    |
| AC8 | Pass                                     | format ok; lint 0 errors (1 existing warning in `AdminInsightsAudit.tsx`); typecheck ok; tests: contracts 34, API 118, UI 81, web 149; `check:content` and `check:deps` pass; web e2e 32/32 on both a prerendered build and a CI-style build.                                                                                                                           |
| AC9 | Pass (local); prod after pending deploy  | Tables below.                                                                                                                                                                                                                                                                                                                                                           |

## Timings

### Before: production (2026-10-31, from Vietnam)

| Target                     | Measurement                                                   |
| -------------------------- | ------------------------------------------------------------- |
| Web pages, cold            | TTFB 3.1–3.9 s                                                |
| Web pages, warm            | TTFB 0.46–0.87 s, `private, no-store`, `x-vercel-cache: MISS` |
| API `/api/health`, warm    | TTFB 0.19–0.27 s                                              |
| API public endpoints, warm | projects 0.98 s, posts 0.27 s, site 0.33 s                    |

### Local before vs after (same machine, LOCAL ONLY, not comparable to production)

Setup: MySQL 8.4 in Docker, demo seed, API `node dist/main.js` on `127.0.0.1:4000`, web `next build` with the API reachable, then `next start`. "Before" is `apps/web` at `681f426` built and measured the same way. Warm values are the median of 10 `curl` requests. Local network latency is near zero, so these numbers show render cost only; the production win also comes from `sin1` and from CDN-cacheable responses.

| Path                     | Before: warm total (ms) | After: warm total (ms) | Before cache-control | After cache-control                       |
| ------------------------ | ----------------------- | ---------------------- | -------------------- | ----------------------------------------- |
| `/en`                    | 12.3                    | 3.1                    | `private, no-store`  | `s-maxage=3600, stale-while-revalidate=…` |
| `/en/about`              | 9.3                     | 2.4                    | `private, no-store`  | `s-maxage=3600, stale-while-revalidate=…` |
| `/en/contact`            | 7.0                     | 2.1                    | `private, no-store`  | `s-maxage=3600, stale-while-revalidate=…` |
| `/en/projects/particula` | 9.2                     | 2.2                    | `private, no-store`  | `s-maxage=3600, stale-while-revalidate=…` |
| `/en/notes/vue-to-react` | 9.3                     | 2.1                    | `private, no-store`  | `s-maxage=3600, stale-while-revalidate=…` |
| `/en/projects`           | 7.7                     | 8.6                    | `private, no-store`  | `private, no-store` (dynamic by design)   |
| `/en/notes`              | 6.6                     | 7.2                    | `private, no-store`  | `private, no-store` (dynamic by design)   |

API calls per warm page view were 0 in both versions locally: the old code already cached fetches in the Next data cache (explicit `next.revalidate` survives `force-dynamic`). So the production gain is the region pin plus serving cached HTML at the edge, not fewer API calls.

### After: production (to fill in after deploy)

Check `x-vercel-id` ends in `::sin1`, public pages return `x-vercel-cache: HIT` (or `STALE`), and record cold/warm TTFB for `/en`, `/en/projects/particula` and `/en/notes`.

## CSP trade-off (AC5)

- Cached public HTML is shared by every visitor, so a per-request nonce cannot match it. Next's inline RSC/bootstrap scripts change per page and per build, so script hashes are not practical. `'unsafe-inline'` is the only script policy Next supports for static pages.
- Lost on public routes: blocking an injected inline script. Kept: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'`, restricted `connect-src`/`img-src`, and the other security headers.
- Risk stays low: public pages render no visitor-supplied HTML, Markdown is rendered through a sanitized hast tree, and `/admin` (where sessions live) keeps the strict nonce policy.

## Out of scope / follow-ups

Recorded in `PROJECT_CONTEXT.md` §7: production verification of AC1/AC9; `render.yaml` has no `region`; TiDB reports `8.0.11-TiDB`, below the adapter's relation-JOIN cutoff (likely why `/api/public/projects` is about 1 s); making `/notes` and `/projects` static would need client-side filtering.
