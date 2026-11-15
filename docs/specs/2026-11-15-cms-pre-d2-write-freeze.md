# Pre-D2 page-write freeze (Stage A)

1. Ship a separate pre-D2 API commit with no Prisma/schema/migration changes; freeze page writes by default.
2. Deny all non-read `/api/admin/pages` requests, including unknown future routes and method-override attempts, before controller/DB writes; return 503 with `Retry-After`.
3. Keep GET/HEAD reads, public routes and `/api/health` available; expose only nonsecret deployment identity and freeze state.
4. Test every current page/version mutation, prospective builder paths, alternate ingress and override headers; assert no writes reach services.
   Also boot the real `AppModule` with stubbed services so removing its middleware registration fails the HTTP gate.
5. Keep auto-deploy off and deploy a pinned Stage A commit only with the release owner's separate approval.
6. Verify that every pre-freeze instance has terminated, not merely that Stage A is Live; then permit D2's startup migration with freeze still enabled.
7. Keep freeze throughout D2 and D6 validation; unfreeze only via a later D2-aware deploy after all old instances drain.
8. On failure, hold the freeze; do not revert to a pre-D2 writer or run seed/one-off page writes during the pause.

No production deployment or database operation is part of this implementation PR.

## Scope and assurance boundary

Stage A is a separate **pre-D2** API release. The global Nest middleware returns
`503`, `Retry-After: 120` and the existing `INTERNAL` error code before the
controller or Prisma service for every non-read request under `/api/admin/pages`.
`GET`, `HEAD` and CORS `OPTIONS` without an override remain available. The
production default cannot be disabled by `CMS_PAGE_WRITE_FREEZE=0`; in local or
test environments only, `CMS_PAGE_WRITE_FREEZE=1` turns it on for rehearsal.
No new public error contract, Prisma column, migration or golden is introduced.

The ten pre-D2 routes are POST page creation; PATCH page metadata; POST block;
PATCH block order; PATCH block; POST block duplicate; DELETE block; POST
publish; POST version restore; POST discard. Unknown future admin-page routes,
including D2's activate/save/publish/restore, are also blocked regardless of
HTTP method, except plain reads and preflight. Encoded/case-varied paths and
method-override headers/query/body on otherwise safe reads are denied. Current
runtime writes to Page, PageBlock and PageVersion originate in PagesService and
PageVersionsService, only invoked by the page admin controller; public page and
version-preview controllers read only. Direct Prisma writes from seeds, scripts,
shells or other deployments are **outside HTTP middleware**, so the release
owner must prohibit these throughout the pause. This guard does not freeze
unrelated admin resources.

Re-audit against main `59677dfa` (including #214's probe-only changes) and
D2 #199 `db064d88` (2026-11-15):
`AdminPagesController` is the only page/version/SEO/block/builder mutation
controller. On main, its ten writes are `POST /admin/pages`, `PATCH
/admin/pages/:key` (including SEO), `POST /admin/pages/:key/blocks`, `PATCH
/admin/pages/:key/blocks/order`, `PATCH /admin/pages/:key/blocks/:id`, `POST
/admin/pages/:key/blocks/:id/duplicate`, `DELETE
/admin/pages/:key/blocks/:id`, `POST /admin/pages/:key/publish`, `POST
/admin/pages/:key/versions/:version/restore`, and `POST
/admin/pages/:key/discard`. D2 adds four writes: `POST
/admin/pages/:key/builder/activate`, `PUT /admin/pages/:key/builder/draft`,
`POST /admin/pages/:key/builder/publish`, and `POST
/admin/pages/:key/versions/:version/builder/restore`. These fourteen paths
are represented in the HTTP freeze table, and all match the middleware's
non-read `/api/admin/pages` prefix without enumerating route names. D2's `GET
/admin/pages/:key/builder/draft`, existing admin page/version GETs, and public
page GETs remain read paths. Re-audit any future page controller moved outside
this prefix before deployment; the guard does not cover direct DB writers.

`GET /api/admin/deployment-state` requires an admin session and returns only
`pageWritesFrozen`, allowlisted Render commit, instance and service identifiers
(or null); the existing health response remains unchanged. Startup logs contain
the same sanitized state, not environment dumps or credentials. A missing or
malformed identity is a **stop**, not evidence of drain. The HTTP tests simulate
direct and Vercel-forwarded ingress; they are not a live CDN proof.

## Forward-only deployment checklist (release owner, separate authorization)

1. Disable API auto-deploy and pin the exact approved Stage A commit; inventory
   every existing API service/instance ID and commit before deploying. Confirm
   Stage A's image contains **no D2 migration**. Render's zero-downtime release
   leaves old instances accepting writes temporarily; no free maintenance-mode
   assumption is permitted. Never start D2 while any pre-Stage-A writer lives.
2. Deploy Stage A; record its commit and each instance ID from the authenticated
   state endpoint, startup logs and the Render service instance inventory. Probe
   authenticated page POST/PATCH/DELETE paths over both the direct API hostname
   and the Vercel `/api` rewrite: each must be `503` with `Retry-After` and no
   DB mutation. Confirm page GET, version GET, public EN/VI reads and health
   remain `200`. Probe all ten current routes and builder future routes; use
   disposable test records only, never create test data in production.
3. Wait for **every pre-Stage-A instance ID** to disappear from the Render
   instance inventory and for its shutdown/in-flight-request window to finish;
   match each successor's commit/instance identity. An HTTP health response,
   Live label, elapsed 60 seconds or repeated successful probes cannot prove
   this. Keep a timestamped redacted list of old IDs and removal observations;
   verify no unexpected ingress or workers bypass the API. If the inventory,
   identity or complete traffic mapping is unavailable, **BLOCK D2**.
4. Only after Step 3 and a separately approved migration decision, deploy the
   D2-aware image. Restack #199 onto the merged Stage A guard first and verify
   the same freeze HTTP tests on its **final head**; an independent D2 image
   without this middleware is unsafe. Its entrypoint runs `prisma migrate deploy` **before** its
   API starts, while the old Stage A instances are still frozen. The D2 image
   must retain the freeze; confirm all its instances are frozen and all Stage A
   instances are drained before any later unfreeze image is deployed. Recheck
   direct and rewrite ingress after each rollout. Do not run owner seeds, scripts,
   manual SQL, unreviewed jobs or other page writers during the freeze.
5. If any deployment fails, **hold freeze** and do not roll back to an
   unguarded pre-D2 image or resume writers. An unfreeze requires a distinct
   D2-aware code release and fresh approval after the drain and data gates.

No Render instance-drain or direct/Vercel production evidence exists in this
branch. The integration owner's disposable migration/old-client test and
final-head CI must pass separately; this runbook is not permission to deploy.
