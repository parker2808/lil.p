# Changelog archive — lil.p

Full changelog moved verbatim from `PROJECT_CONTEXT.md` on 2026-11-01. New entries go to `PROJECT_CONTEXT.md`.

- 2026-10-31: Added Husky branch/secret-scan guardrails, gitleaks CI, canonical `AGENTS.md`, and `docs/LESSONS.md`; `AGENT_RULES.md` now points to `AGENTS.md`. Pending Parker's review.

- 2026-10-31: Speed (Parker's task, prod measured from Vietnam: web functions ran in `iad1` while API + DB are in Singapore; every page `private, no-store`). Root `vercel.json` pins functions to `sin1`. Public `/[locale]` pages are now static/ISR: `force-dynamic` removed, the locale layout prerenders only when `/api/health` answers (build passes with the API down), slug pages `generateStaticParams`, home/about/contact read `searchParams` only in draft mode. `apiServer` public reads never touch cookies/headers and always carry the `public` tag; the new admin-only `revalidatePublicContent` server action (`updateTag`) runs after admin mutations that change live content via `usePublicCacheSync` in `AdminShell` (draft-only ones opt out with `meta.publicCache`). A failed sitemap/RSS fetch during `next build` makes the route render per request instead of caching empty output. CSP: nonce + `'strict-dynamic'` on `/admin` and draft-mode requests; public routes use `script-src 'self' 'unsafe-inline'`, other directives unchanged. API pool and health checked, no change needed. README gains a Stack section. Spec with acceptance criteria AC1–AC9, results and before/after timings: `docs/specs/2026-10-31-perf-static-isr.md`. Pending Parker's review.

- 2026-10-31: Publish-all-content (Parker's explicit task): added data-only migration `20261031120000_publish_all_content` (idempotent DRAFT→PUBLISHED for `project` + `post`, backfills `publishedAt`, plain SQL valid on MySQL 8.4 + TiDB, no schema change). Backup `portfolio-data.json` and owner/baseline seed now seed projects as PUBLISHED with `publishedAt` stamped at seed time (no invented dates). `posts.data.ts` keeps one intentional demo DRAFT post. Pending Parker's review.

- 2026-10-31: Added Graphify code map (`graphify-out/GRAPH_REPORT.md` committed, rest of `graphify-out/` gitignored; built with `--code-only`, no model calls) and shortened `AGENT_RULES.md` to ~30 lines pointing to the shared common rules and TOKEN_FLOW in `<private-memory-repo>`. Pending Parker's review.

- 2026-10-31: Standardized CI per the shared front-end CI/CD lessons in Parker's memory repo: `ci.yml` adds `workflow_dispatch`, a `ci-${{ github.ref }}` concurrency group (cancels stale PR runs only), `timeout-minutes` on every job, and the composite action `.github/actions/setup` used by all three jobs. All existing checks kept; no deploy changes. `AGENT_RULES.md` CI section updated. Pending Parker's review.

- 2026-10-31: Added `AGENT_RULES.md` with the shared rules copied verbatim and lil.p project rules; linked it from `AGENTS.md`. Pending Parker's review.

- 2026-10-30: Fixed flaky web-e2e "CMS panes contain scrolling": admin `main` is now the containing block, so Radix Switch hidden inputs rendered before hydration no longer stretch the document. `apiServer` returns notFound() for unsupported locales (e.g. `/favicon.ico` hitting `[locale]`) instead of calling the API.

- 2026-10-30: Corrected local JWT setup and seed-status scope; clarified file-level CI enforcement and rejected missing/deleted context files.

- 2026-10-30: Added PROJECT_CONTEXT.md, AGENTS.md, context-check CI (T3 Code setup).
