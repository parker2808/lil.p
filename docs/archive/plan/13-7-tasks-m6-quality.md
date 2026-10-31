<!-- Archived verbatim from docs/PLAN.md (7. Tasks / M6 — Quality); links re-pointed. Index: ../../PLAN.md -->

### M6 — Quality

#### T53 · SEO from the CMS

**Roadmap** p26 · **Spec** §5 intro (title pattern, canonical, hreflang, JSON-LD, sitemap, RSS), §4.2 (`OgImage`), §4.5 (SEO) · **Depends** T24, T25, T27, T28, T52a · **Size** M

**Goal.** Every public page gets metadata, structured data and an OG image from CMS fields, and search engines get a sitemap of published content only.

**Scope.**
- `seo/utils/*-metadata.util.ts`: builders for site, home, about, projects list, project, notes list, post, contact. Title `{seoTitle} · {siteName}`; description from `seoDescription` → `excerpt`/`tagline` → `SiteSettings`; the five block pages read `seoTitle`/`seoDescription` from the page's published version (D26), then the H1 block's title and intro, then `SiteSettings`; canonical; `alternates.languages` (en, vi, `x-default`); `metadataBase` from env.
- `seo/components/JsonLd`: `Person` (home, about), `CreativeWork` (case study), `BlogPosting` (post), `BreadcrumbList` (detail pages); JSON escaped for `<`.
- OG images: `opengraph-image.tsx` for home, project and post routes (`ImageResponse`, 1200×630, dark background, Be Vietnam Pro, `VersionTag`, name + domain).
- `app/sitemap.ts` (both locales, from a new `GET /public/sitemap` in `public-site`: published slugs + `updatedAt`), `app/robots.ts` (disallow `/admin`, `/api`), RSS `app/[locale]/(site)/rss.xml/route.ts`.

**Files.** `apps/web/src/modules/seo/{utils/*-metadata.util.ts,components/JsonLd/*,utils/rss.util.ts}`, `apps/web/app/{sitemap.ts,robots.ts}`, `apps/web/app/[locale]/(site)/{opengraph-image.tsx,projects/[slug]/opengraph-image.tsx,notes/[slug]/opengraph-image.tsx,rss.xml/route.ts}`, `apps/web/app/[locale]/(site)/**/page.tsx` (`generateMetadata`), `apps/api/src/modules/public-site/*`.

**Design.** Spec §4.2 `OgImage`. Tokens: dark `--background`, `--primary`, heading font.

**Acceptance.**
- [ ] Lighthouse SEO prints 100 on home, a post and a project (roadmap p26).
- [ ] The sitemap lists published slugs only (roadmap p26).
- [ ] An OG preview shows the title from the DB (spec §6 Day 20).

**PR title:** `feat(web): seo from cms`

#### T54 · Analytics + dashboard charts

**Roadmap** p27 · **Spec** §1.5 (`PageView`), §5.7, §6 Day 22 · **Depends** T38, T49 · **Size** M

**Goal.** Cookieless page-view counts shown as charts on the dashboard.

**Scope.**
- Model `PageView` (`path`, `locale`, `referrerHost`, `device`, `visitorHash`). Migration `add-page-views`.
- `modules/analytics`: `POST /public/views` (`@Public()`, throttled, accepts the `sendBeacon` body, skips bots and `analyticsEnabled = false`, `visitorHash` = SHA-256 of IP + user agent + daily salt from `ANALYTICS_SALT_SECRET`; sets no cookie).
- `GET /admin/stats` gains views per day (`GROUP BY DATE(createdAt)`), unique visitors, top pages, top referrers for the range.
- Web: `core/components/PageViewBeacon` (client, on route change, `navigator.sendBeacon('/api/public/views')`); `admin-insights/views/AdminInsightsAnalytics.tsx` (`chart` area chart with a hidden data table, period toggle); sparklines in dashboard `StatCard`s.

**Files.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/analytics/*`, `apps/api/src/modules/dashboard/dashboard.service.ts`, `packages/contracts/src/analytics/*`, `apps/web/src/modules/core/components/PageViewBeacon/*`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/analytics/page.tsx`, `packages/ui/src/components/ui/chart.tsx`, `packages/ui/src/components/Sparkline/*`, `.env.example`.

**Design.** Figma `14:2` (views card). Mockup `admin-dashboard.html`. Tokens: `--chart-1` … `--chart-5`.

**Backend steps, explained.**
1. **Cookieless counting.** A hash of IP + browser + today's salt counts unique visitors per day without storing who they are; tomorrow's salt makes yesterday's hashes unlinkable.
2. **Aggregation.** `GROUP BY DATE(createdAt)` turns rows into one count per day, done in SQL rather than in JavaScript.

**Acceptance.**
- [ ] Page views increase on visits; `GET /admin/stats` shows the new count (roadmap p27).
- [ ] No cookie is set by the beacon; the dashboard shows real views (spec §6 Day 22).

**PR title:** `feat: analytics`

#### T55 · Audit log

**Roadmap** p27 · **Spec** §1.5 (`AuditLog`), §4.3 (`ActivityFeed`), §4.6 (infinite + virtual), §6 Day 23 · **Depends** T36, T38 · **Size** M

**Goal.** Every admin write leaves one audit row, browsable in a virtualized list, plus bulk actions.

**Scope.**
- Model `AuditLog` (`userId`, `action` `CREATE|UPDATE|PUBLISH|ARCHIVE|RESTORE|LOGIN`, `entityType`, `entityId`, `summary`). Migration `add-audit-log`.
- `modules/audit`: `audit.service.ts` `record(…)`, called explicitly from services inside the same transaction as the write (including page publish and version restore, T52a), and from login. `GET /admin/audit` (cursor pagination, filters entity type and user; admin only).
- Bulk status update for projects and posts (`POST /admin/{entity}/bulk` with `{ ids, action }`, admin only) in one transaction, one audit row per item; wired to the `DataTable` bulk bar.
- Script `pnpm --filter @portfolio/api seed:audit` that inserts 5,000 audit rows (dev only).
- Web: `admin-insights/views/AdminInsightsAudit.tsx` (`useInfiniteQuery` + `useVirtualizer`, `AuditRow` with relative time and absolute tooltip); dashboard activity card (latest 8, inside `RoleGate allow={['admin']}`). `packages/ui` `ActivityFeed`, `AuditRow`.

**Files.** `apps/api/prisma/schema.prisma` + migration, `apps/api/src/modules/audit/*`, `apps/api/src/modules/*/*.service.ts` (record calls), `apps/api/prisma/seed/audit.seed.ts`, `apps/api/test/audit.e2e-spec.ts`, `apps/web/src/modules/admin-insights/*`, `apps/web/app/admin/(cms)/audit/page.tsx`, `apps/web/src/modules/admin-dashboard/components/ActivityCard/*`, `packages/ui/src/components/{ActivityFeed,AuditRow}/*`.

**Design.** Figma `14:2` (activity card). Mockup `admin-dashboard.html`.

**Backend steps, explained.**
1. **Append-only.** Audit rows are inserted, never updated or deleted by the app.
2. **Same transaction.** Writing the audit row inside the write's transaction means you never get a change without its record, or a record without its change.
3. **Cursor pagination.** "Give me 50 rows older than id 1234" stays fast and stable while new rows arrive, which page numbers do not.

**Acceptance.**
- [ ] Every CRUD action creates one audit row, visible in `/admin/audit` (roadmap p27).
- [ ] 5,000 seeded audit rows scroll smoothly (spec §6 Day 23).

**PR title:** `feat: audit log`

#### T56 · Tests + CI e2e

**Roadmap** p28 · **Spec** §6 (Day 21, Day 24) · **Depends** T52a · **Size** M

**Goal.** A test suite that proves the main flows end to end, running on every PR.

**Scope.**
- Fill API e2e gaps so every module has happy-path + validation tests.
- Playwright in `apps/web/e2e/`: public smoke (home in both locales, nav by keyboard, project and post pages, 404), contact submit, admin login → create draft project → publish → visible on the public page → archive, and `user` login (account created in the test setup through `POST /admin/users`) → a project editor opens read-only with no Publish button and no Inbox, Audit or Users items; admin page builder → drag the home `work` block above `featured`, hide `marquee`, publish → the public home shows the new order without the marquee → restore the previous version and publish → the old order is back. Runs on the `demo` seed. Runs against production builds of web and api with the test DB and the `demo` seed.
- CI: jobs `lint-typecheck-unit`, `api-e2e` (MySQL service), `web-e2e` (MySQL service, builds both apps, runs Playwright, uploads the report).

**Files.** `apps/web/e2e/{public.spec.ts,contact.spec.ts,admin-publish.spec.ts,admin-pages.spec.ts}`, `apps/web/playwright.config.ts`, `apps/api/test/*.e2e-spec.ts`, `.github/workflows/ci.yml`.

**Design.** None.

**Acceptance.**
- [ ] `pnpm test` is green locally and in CI (roadmap p28).
- [ ] The draft → publish → public page e2e is green (spec §6 Day 21), for a project and for a page.

**PR title:** `test: api + e2e smoke`

#### T57 · Accessibility + performance audit

**Roadmap** p29 · **Spec** §3, §3.4, §5, §6 (Days 14, 28, 29 + v2 rows) · **Depends** T53 · **Size** M

**Goal.** Measured accessibility and performance on every key screen, with the fixes merged.

**Scope.**
- axe (`@axe-core/playwright`) on home, about, projects, case study, notes, post, contact, admin login, dashboard and the page builder; fail CI on serious issues.
- Lighthouse (mobile) on home, projects, case study, post.
- Manual: keyboard, screen reader on 3 pages, the page builder's keyboard drag and drop (Space, arrows, Space) and its move up/down menu, reduced motion and reduced transparency on home, case study and post (every effect's fallback).
- Fixes: focus order, skip link, LCP image `priority`, font `display`, orbs on a composited layer, CLS 0 from count-up and reveal.
- Report in `docs/audits/<date>-a11y-perf.md` with before/after numbers.

**Files.** `apps/web/e2e/a11y.spec.ts`, `docs/audits/<date>-a11y-perf.md`, fixes in the affected `apps/web` and `packages/ui` files.

**Design.** All public screens (§5 design map).

**Acceptance.**
- [ ] axe reports 0 serious issues on the audited screens (roadmap p29).
- [ ] Lighthouse prints at least 95 for accessibility and performance on mobile for home (roadmap p29), with ambient effects on (spec §6 Day 14 v2).

**PR title:** `fix: a11y + perf audit`

### M7 — Ship

#### T58 · Production Compose

**Roadmap** p30 · **Spec** §1.6 (rung 11), §6 Day 21 · **Depends** T56 · **Size** M

**Goal.** The whole stack runs from one compose file with small, non-root images.

**Scope.**
- `apps/web/Dockerfile`: multi-stage, `output: 'standalone'`, `NEXT_PUBLIC_BUILD_SHA` build arg, non-root user.
- `apps/api/Dockerfile`: multi-stage, `prisma generate`, entrypoint runs `prisma migrate deploy` then starts the app, non-root user.
- `compose.prod.yml`: `db` (no published port, volume), `api` (healthcheck `/api/health`, uploads volume, depends on healthy db), `web` (`API_URL=http://api:4000`, depends on healthy api), `caddy` (HTTP on :80 locally; TLS in T61). `.dockerignore` files.
- One-off seed: `docker compose -f compose.prod.yml run --rm api node dist/seed.js` with `SEED_PROFILE=baseline` (documented in README).

**Files.** `apps/web/Dockerfile`, `apps/api/Dockerfile`, `apps/api/docker-entrypoint.sh`, `compose.prod.yml`, `infra/caddy/Caddyfile`, `.dockerignore`, `apps/web/next.config.ts`, `README.md`.

**Design.** None.

**Backend steps, explained.**
1. **Multi-stage builds.** One stage installs and builds; the final stage copies only what runs, so images stay small.
2. **`migrate deploy` vs `migrate dev`.** `deploy` only applies committed migrations, never creates new ones and never resets data. It is the only migrate command for production.
3. **Service names as hostnames.** Inside compose, the web reaches the API at `http://api:4000`; nothing but Caddy is exposed.

**Acceptance.**
- [ ] `docker compose -f compose.prod.yml up --build` serves the full site on localhost (roadmap p30).
- [ ] The web and api images are under 300 MB each (roadmap p30).

**PR title:** `chore(infra): production compose`

#### T59 · Hardening + backups

**Roadmap** p31 · **Spec** §1.6, §6 Day 24 · **Depends** T58 · **Size** M

**Goal.** Secure headers, safe cookies, least-privilege containers, and backups you have actually restored.

**Scope.**
- Security headers: CSP with a per-request nonce set in `middleware.ts` (Next.js pattern); HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors 'self'` in the Caddyfile (`'self'`, not `'none'`, because the page builder's live preview frames the public site from the same origin, T52a; no other site may frame it).
- Confirm `Secure` cookies in production; containers non-root with read-only root filesystems where possible; no CORS (D9).
- Production JWT secrets: `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` generated with `openssl rand -base64 48`, different from dev and from each other, kept only in the VPS `.env` and GitHub secrets; boot fails if they are short or equal (T35). Document generation and rotation in `docs/runbooks/secrets.md`.
- `backup` service in `compose.prod.yml`: daily `mysqldump` + gzip and an uploads tarball, 7-day rotation on a `backups` volume.
- `scripts/backup/restore.sh` and `docs/runbooks/restore.md`; run a restore drill into a fresh database.

**Files.** `apps/web/middleware.ts`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `infra/backup/backup.sh`, `scripts/backup/restore.sh`, `docs/runbooks/{restore.md,secrets.md}`.

**Design.** None.

**Backend steps, explained.**
1. **`mysqldump`.** Writes the whole database as SQL statements; piping it through `gzip` keeps files small. Run it inside the `db` network so no port is exposed.
2. **Rotation.** Keep 7 daily files and delete older ones, so the disk never fills up.
3. **A backup only counts once restored.** The drill loads the latest dump into an empty database, starts the API against it and checks the site.
4. **Rotating JWT secrets.** Changing `JWT_ACCESS_SECRET` makes every access token invalid at once; changing `JWT_REFRESH_SECRET` signs everyone out. Rotate after a leak, and expect to log in again. There are no session rows to clean up (D24).

**Acceptance.**
- [ ] `scripts/backup/restore.sh` into a fresh DB brings the site back (roadmap p31).
- [ ] securityheaders.com gives grade A on the production origin, or on a local Caddy with the same headers (roadmap p31).

**PR title:** `chore: hardening + backups`

#### T60 · Production seed cleanup + placeholder check

**Roadmap** p32 · **Spec** §1.1–§1.5, §2 · **Depends** T45, T51, T52a · **Size** S (agent part) · **Owner part:** Parker enters the content

**Goal.** Production starts from the `baseline` seed, and a check proves no placeholder reaches the live site.

**Scope.**
- Agent: `scripts/check-placeholders.mjs` (connects with `DATABASE_URL`, counts rows whose text fields contain placeholder markers used by the seed (`<email>`, `<phone>`, `Sample`, `Lorem`, `TODO`), including the text inside `PageBlock.props` and published `PageVersion` snapshots, and fails if any are published or in singletons); root script `check:placeholders`; review `baseline.seed.ts` against spec §1.5 (drafts only, 0 posts, no demo messages or views); `docs/runbooks/content-entry.md` (checklist: profile, experience, projects, posts, Vietnamese translations, metrics, alt texts, real contact email entered in `/admin`).
- Parker: enter real content in `/admin`; publish at least two case studies and one post.

**Files.** `scripts/check-placeholders.mjs`, `package.json`, `apps/api/prisma/seed/profiles/baseline.seed.ts`, `docs/runbooks/content-entry.md`.

**Design.** None.

**Acceptance.**
- [ ] The production DB returns 0 placeholder rows (roadmap p32).
- [ ] The web app contains no CV strings: `pnpm check:content` passes (roadmap p32).

**PR title:** `chore: production seed cleanup`

#### T61 · Deploy pipeline + launch checklist

**Roadmap** p33 · **Spec** §5, §1.6 · **Depends** T58, T59, T60 · **Size** M · **Owner part:** Vercel/Render/TiDB/Cloudinary accounts, DNS, secrets, uptime monitor

**Parker override (D28).** Do not implement the VPS / GHCR / Caddy-TLS path below. Ship `render.yaml` (free Docker web, `prisma migrate deploy` then start, `PORT`, health `/api/health`), TiDB TLS via `DATABASE_URL?sslaccept=strict`, production CORS + `SameSite=None; Secure`, a FE warm-up ping to `/api/health`, and `docs/DEPLOY.md` (+ vi). Local Docker MySQL stays. See D28.

**Goal.** A push to `main` deploys to the VPS over HTTPS, and a checklist confirms launch readiness.

**Scope.**
- `.github/workflows/deploy.yml`: after CI on `main`, build and push web/api images to GHCR (tags: commit SHA and `latest`), SSH to the VPS, `docker compose -f compose.prod.yml pull && up -d`, then smoke-check `https://<domain>/api/health`.
- Caddy automatic HTTPS for the domain from env (`SITE_DOMAIN`).
- `docs/runbooks/deploy.md` (first-time VPS setup, secrets list, rollback by image tag).
- `docs/launch-checklist.md`: DNS, TLS, backups and restore drill, Lighthouse and axe, `check:content`, `check:placeholders`, OG previews, sitemap submitted, analytics on, admin password rotated, production `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` generated fresh (not the dev values), 404/500 pages, every page published with no invalid blocks in content health, uptime ping configured.

**Files.** `.github/workflows/deploy.yml`, `infra/caddy/Caddyfile`, `compose.prod.yml`, `docs/runbooks/deploy.md`, `docs/launch-checklist.md`.

**Design.** None.

**Backend steps, explained.**
1. **Registry.** CI builds the images once and pushes them to GHCR; the VPS only pulls, so it never needs the source code or build tools.
2. **Secrets.** SSH key, host and `.env` values live in GitHub Actions secrets and on the VPS, never in git.
3. **Rolling forward.** `up -d` replaces containers with the new image; the API entrypoint applies new migrations first. Rolling back means deploying the previous image tag.
4. **HTTPS.** Caddy requests and renews the TLS certificate for the domain automatically once DNS points at the VPS.

**Acceptance.**
- [ ] The custom domain serves HTTPS (`curl -I` shows 200) (roadmap p33).
- [ ] The deploy runs from a push to `main`, and an uptime ping is configured (roadmap p33).

**PR title:** `chore: deploy pipeline`

