# Deploy runbook

Production hosting is **Vercel + Render + TiDB + Cloudinary** (PLAN D28),
not a VPS. Step-by-step (beginner): [docs/DEPLOY.md](../DEPLOY.md)
([Tiếng Việt](../DEPLOY.vi.md)).

## First time

1. Create TiDB, Cloudinary, Render Blueprint, Vercel project (DEPLOY.md).
2. Paste env vars in each dashboard. No secrets in git.
3. Wait for Render `GET /api/health` `{status,db}=ok`.
4. `prisma migrate deploy` loads the owner CV (content migration). Seed
   once only if you still need the admin user: `node dist/seed.js`
   (`SEED_PROFILE=baseline`). Do not re-seed a live DB — it wipes
   content rows. Regenerate the SQL with
   `pnpm --filter @portfolio/api content:migration`.
   If a content migration is stuck as failed (P3009), one-off Docker
   Command from `/app`:
   `prisma migrate resolve --rolled-back 20261027150000_portfolio_content`
   then reset the command to `node dist/main.js` and redeploy.
5. Open the Vercel origin. Sign in at `/admin/login`. Change the password.

## Rolling forward

Vercel and Render both auto-deploy from the Git branch you connected
(usually `main`). The API image entrypoint runs `prisma migrate deploy`
before it starts, so new migrations apply on the next Render deploy.

### Stage A → D2 page-write rollout (release owner only)

The [curl-only ingress and read-only instance-drain evidence sheet](./stage-a-drain-curl.md)
provides an additional release-owner checklist. Neither it nor the public
probe substitutes for the complete pre-/post-deploy Render instance roster.

This is a **forward-only** exception to ordinary rolling deploys. The required
release order is **#210 Stage A freeze and old-instance drain → #199 D2 migration
and verification → D2-aware reopen and verification → #202**. The existing
forward-only policy approval sets the safety requirements for this sequence,
but does not itself establish authorization for #210 production merge/deploy,
mutation probes, #199 migration or D2-aware reopen and verification. Obtain
separate release-owner authorization before each production action; the merge
chain and coordinator advance only when the preceding stage is verified. Do
not deploy an API image predating Stage A after D2 migrates. Keep Render
auto-deploy ON as configured: merging #210 and #199 to `main` triggers their
API deploys, but the configuration does not authorize those merges. Keep
`main` quiet
until reopen: any other `apps/api/**` or `packages/contracts/**` merge in this
window could also deploy. Review the exact commit and instance roster at each
stage before merging the next.
The verification-only #208 branch is not deployment authorization; record
each gate's evidence and keep the reviewed image commits pinned.

1. Before Stage A, inventory every Render API instance ID and commit using the
   authenticated Render instance inventory and startup logs. Confirm the Stage A
   image has no D2 migration. After separate authorization, merge #210 to
   deploy Stage A with page writes frozen by default.
2. After the Stage A freeze is live and the mutation probes are separately
   authorized, the release owner may run the following from an authorized
   terminal (Node 22):

   ```sh
   node scripts/probe-stage-a-d2.mjs --render-url https://<actual-render-host>
   ```

   The
   Vercel origin defaults to `https://lil-p.vercel.app`. The actual Render host
   is **not stored in tracked config**: `docs/DEPLOY.md` shows only an example;
   obtain the public hostname from the approved Render service settings, not
   from `.env` or a secret. This script makes unauthenticated GETs for `/`
   (200 or a same-origin 307/308 redirect to `/en`), explicit `/en` and `/vi`
   (200), and `/api/health` (200 via both ingresses), then sends empty,
   unauthenticated mutation requests to all ten legacy and four D2 paths via
   direct Render and Vercel `/api`. It uses a nonexistent sentinel page key,
   block ID 0, version 0, and invalid `{}` for creation; it never sends cookies
   or bearer tokens. It demands the exact Stage A 503 body and
   `Retry-After: 120`; a 401, redirect, 404 or other 503 is **FAIL**, not proof of freeze.
   Stop on any failure. Do not use real page keys or authenticated credentials
   with this script. It does not prove that every legacy writer is drained.

3. Separately check every live API instance through authenticated
   `/api/admin/deployment-state`, the Render instance inventory and startup /
   termination logs. Record the approved commit and instance IDs; verify **all**
   pre-Stage-A instance IDs have disappeared and their in-flight requests have
   completed. The identity endpoint requires admin auth; there is no public
   identity signal. If inventory, identity or ingress mapping is missing, **do
   not migrate**. Repeat the public probe after drain. Never rely on health,
   elapsed time or a Render “Live” label alone.
4. Only after the full old-instance drain and 503/200 probes pass and separate
   #199 merge/migration authorization is confirmed, merge #199 to deploy the
   reviewed **D2-aware image containing the Stage A guard**. Its
   startup runs `prisma migrate deploy` while all earlier instances remain frozen. Check migration logs,
   `/api/health` returning `{status:"ok",db:"ok"}` via both ingresses, and
   rerun the probe. Health does **not** prove D2 schema: the release owner must
   use an authorized, read-only DB metadata query for columns `page.draftTree`
   and `page.draftTreeRevision` plus the Prisma migration history. Do not add a
   public schema endpoint or publish data. Keep freeze on until every Stage A
   instance has drained and the D2 migration/data gates pass.
5. After separate reopen and verification authorization, reopen writes through
   the reviewed D2-aware unfreeze release once the migration/data and instance
   gates pass:
   verify that every instance runs that reviewed commit, then perform a
   controlled authenticated save/restore/publish/activation CAS check on an
   approved disposable record through both ingresses, followed by an authorized
   read-back; verify expected stale-revision rejection and no unintended
   published change. Never use this unauthenticated probe as a reopen test.
   If any gate fails, **hold freeze and roll forward**, never redeploy a pre-D2
   writer. No seed, manual SQL, script or background page writer may bypass the
   freeze during this window.
6. Only after the reopen and CAS/data gates are signed off, proceed with #202
   on its reviewed final head. Do not merge another API-bearing change during
   the freeze; a merge is not a drain or migration verification.

## Rollback

- **Web:** Vercel → Deployments → Promote the previous production
  deployment.
- **API:** Render → Manual Deploy of the previous successful build.
  Migrations are forward-only; do not restore an older image that expects
  fewer columns without a matching DB restore
  ([restore.md](./restore.md)). **After the D2 migration, never restore a
  pre-D2 image:** retain Stage A freeze and roll forward instead.

## JWT rotation

[secrets.md](./secrets.md). After changing secrets, recreate the Render
service (or restart) and sign in again.
