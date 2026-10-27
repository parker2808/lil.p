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

## Rollback

- **Web:** Vercel → Deployments → Promote the previous production
  deployment.
- **API:** Render → Manual Deploy of the previous successful build.
  Migrations are forward-only; do not restore an older image that expects
  fewer columns without a matching DB restore
  ([restore.md](./restore.md)).

## JWT rotation

[secrets.md](./secrets.md). After changing secrets, recreate the Render
service (or restart) and sign in again.
