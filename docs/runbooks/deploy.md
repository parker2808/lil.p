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
release order is **#210 Stage A freeze and old-instance drain → separately
approved #199 D2 migration/startup verification (automatic reopen after check)
→ authenticated write verification → #204 → #202**.
The existing forward-only policy approval does not authorize a production
merge/deploy, mutation probe, migration or reopening. Obtain separate
release-owner authorization for each action and its preceding gates. In
particular, authorizing #199's merge must explicitly cover its automatic
reopening after a successful startup check; there is no separate unfreeze
release by default. Do not deploy an API image predating Stage A after D2
migrates. Keep Render auto-deploy ON as configured: merging #199 to `main`
triggers its API deployment, but configuration alone does not authorize the
merge. Keep other `apps/api/**` and `packages/contracts/**` merges off `main`
until reopening is verified; review the exact commit and complete instance
roster at each stage.

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
4. **Before** a separately approved #199 merge/deploy, verify every pre-Stage-A
   instance and its in-flight requests have drained, and the Stage A 503/200
   ingress probes pass. Do not rely on Render's rolling replacement or an
   automatic deploy for this gate. The reviewed **D2-aware image containing
   the Stage A guard** runs `prisma migrate deploy`; before `listen`, each
   instance checks applied migration history and both page columns.
   With `CMS_PAGE_WRITE_FREEZE` unset or any value other than `1`, writes open
   automatically when that check succeeds. `CMS_PAGE_WRITE_FREEZE=1` explicitly
   keeps writes frozen; a failed check freezes regardless of configuration.
   No Render/Vercel env change is needed or assumed for reopening. If `=1` is
   already set, changing it would require a separate authorized Render deploy;
   do not silently treat this runbook as approval to change it. Check migration
   logs and `/api/health` `{status:"ok",db:"ok"}` via both ingresses. Health
   does **not** prove D2 schema: use authorized read-only DB metadata for both
   columns and migration history. Do not add a public schema endpoint.
5. Confirm every new instance runs the reviewed commit, the complete roster
   has no old writer, and both ingresses route to that commit. After separate
   authorization for an authenticated reopen verification, perform a
   controlled authenticated save/restore/publish/activation CAS check on an
   approved disposable record through both ingresses, followed by an authorized
   read-back; verify expected stale-revision rejection and no unintended
   published change. Never use this unauthenticated probe as a reopen test.
   If any gate fails, **stop and roll forward**, never redeploy a pre-D2
   writer. The explicit `=1` kill-switch requires authorized Render access and
   a deployment; nobody should claim it was applied without that evidence.
   No seed, manual SQL, script or background page writer may bypass the gate.
   The unauthenticated freeze probe cannot prove reopened writes.
6. Only after the CAS/data gates are signed off, consider #204 and
   then #202 in that order, with each reviewed final head and independent
   merge/deploy approval. Keep other API-bearing changes off `main` during
   the staged sequence; a merge is not drain or migration verification.

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
