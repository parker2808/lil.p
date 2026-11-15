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

This is a **forward-only** exception to ordinary rolling deploys. The required
release order is **#210 Stage A freeze and old-instance drain → #199 D2 migration
and verification → separately approved D2-aware reopen → #204 → #202**.
Review/merge of each PR is a separate decision from its production deploy;
neither a green PR nor merging to `main` authorizes the next step. Do not deploy
an API image predating Stage A after D2 migrates. Approval to merge a PR is not
approval to deploy or migrate; obtain separate release-owner authorization.
Keep auto-deploy disabled and pin reviewed image commits throughout.

1. Before Stage A, inventory every Render API instance ID and commit using the
   authenticated Render instance inventory and startup logs. Confirm the Stage A
   image has no D2 migration. Deploy Stage A with page writes frozen by default.
2. The release owner may run the following from an authorized terminal (Node 22):

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
4. With a separately approved #199 rollout, deploy the reviewed **D2-aware
   image containing the Stage A guard**. Its startup runs
   `prisma migrate deploy` while all earlier instances remain frozen. Leave
   `CMS_PAGE_WRITE_FREEZE` unset or set to `1` on Render: the D2-aware API defaults
   to frozen, and Stage A ignores `=0` in production. Check migration logs,
   `/api/health` returning `{status:"ok",db:"ok"}` via both ingresses, and
   rerun the probe. Health does **not** prove D2 schema: the release owner must
   use an authorized, read-only DB metadata query for columns `page.draftTree`
   and `page.draftTreeRevision` plus the Prisma migration history. Do not add a
   public schema endpoint or publish data. Keep freeze on until every Stage A
   instance has drained and the D2 migration/data gates pass.
5. Reopen writes only with a separately approved D2-aware unfreeze release:
   after the read-only migration-history and physical-column check succeeds,
   verify every frozen Stage A instance and all in-flight requests have drained.
   Then set **only Render API** `CMS_PAGE_WRITE_FREEZE=0` and deploy the pinned
   reviewed D2-aware image. This Render env change is itself a new deployment
   requiring separate approval; no Vercel env change is needed. Before `listen`,
   each D2-aware instance rechecks the applied migration and both columns; a
   missing/failed check or any value other than exact `0` keeps 503. Never set
   `=0` during the initial D2 migration deploy. Confirm the new instance identity,
   direct and Vercel ingress, and complete drain of its prior frozen instances,
   then perform a
   controlled authenticated save/restore/publish/activation CAS check on an
   approved disposable record through both ingresses, followed by an authorized
   read-back; verify expected stale-revision rejection and no unintended
   published change. Never use this unauthenticated probe as a reopen test.
   If any gate fails, **hold freeze and roll forward**, never redeploy a pre-D2
   writer. No seed, manual SQL, script or background page writer may bypass the
   freeze during this window.
6. Only after the reopen and CAS/data gates are signed off, consider #204 and
   then #202 in that order, with each reviewed final head and independent
   merge/deploy approval. Keep Render auto-deploy disabled while ordering the
   releases; a merge is not a drain, migration verification or permission to
   reopen writes.

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
