# R3-12: Integrated real-flow audit

## Scope

Integrate the remote PR4 and PR7 tips, including their ancestry, into the PR11-based audit branch. Verify real page creation and publishing through Nest HTTP and production-build web routes. Audit public and admin route/state captures and manifests, including standalone experience create/edit. Keep all databases disposable and local.

## Acceptance

- Both page templates create through authenticated `POST /api/admin/pages` and load through real GET; audit and transaction state persist in the test harness. User, malformed and duplicate/race requests return 403, 400 and 409.
- EN/VI starter prose cannot publish while untouched, hidden or deleted, through HTTP or editor. Error code `PAGE_BODY_REQUIRED` and path `body` are stable; the inline message uses the admin UI locale for all four UI/page locale pairs. Valid first H1 plus substantive visible page-locale copy publishes; empty pages need both.
- Production-build flows cover email, ten seeded projects/covers, real project and note pages, standalone experience new/edit save, loading, validation, error and confirmation states.
- Every audited route/state/locale/theme/width tuple has one fresh assertion-bound PNG in the public or admin Desktop folder. No demo-only, stale, missing, duplicate or private-data capture remains. Keyboard, focus, AA contrast, 44px mobile targets, reduced motion, overflow and browser/server diagnostics pass.
- Guarded random no-volume MySQL replays pre-PR2 migrations, records five built-in rows, applies later migrations and proves unchanged rows, constraints and zero Prisma drift; resources are destroyed.

## Verification

Run focused Nest HTTP and production Playwright tests, the staged migration gate, capture/manifest and secret/PII audits, `graphify update .`, and `pnpm check:all --e2e`. Record results and any remaining risks in PROJECT_CONTEXT §7/§9 and the PR; label `ready-e2e` and watch CI green. Never merge, deploy or release.
