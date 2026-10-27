# Deploy (Vercel + Render + TiDB + Cloudinary)

Long-term **free** hosting (PLAN D28). The public site and admin run on
Vercel. The Nest API runs on a Render free web service. MySQL lives on
**TiDB Cloud Serverless**. Images live on Cloudinary (T50). Local Docker
MySQL is unchanged.

No secrets belong in git. Generate JWT secrets with
`openssl rand -base64 48` ([runbooks/secrets.md](./runbooks/secrets.md)).

## 1. TiDB Cloud Serverless

1. Create a free TiDB Cloud Serverless cluster (MySQL compatible).
2. Create a database (for example `portfolio`).
3. Copy the connection string. Append `?sslaccept=strict&ssl=true` if
   those flags are not already there. TiDB requires TLS; Prisma 7's
   MariaDB adapter reads those query flags from `DATABASE_URL`.
4. Migrations in `apps/api/prisma/migrations/` use `utf8mb4_unicode_ci`,
   `JSON`, foreign keys and secondary indexes — no `FULLTEXT`, generated
   columns, or `CHECK` constraints. Those are TiDB-compatible.

The API entrypoint keeps a provided `DATABASE_URL` as-is (so the SSL query
string survives). Local `compose.prod.yml` still builds the URL from
`MYSQL_*` when `DATABASE_URL` is unset.

## 2. Cloudinary

1. Create a free Cloudinary account.
2. Copy **Cloud name**, **API Key**, and **API Secret**.
3. The API never writes uploads to disk (T50). Leave the Cloudinary keys
   blank only in local/CI (in-memory storage).

## 3. Render (API)

`render.yaml` at the repo root is a Blueprint: one free Docker web service,
health check `GET /api/health`, `prisma migrate deploy` in the image
entrypoint, then `node dist/main.js`. The process binds `0.0.0.0:$PORT`
(Render sets `PORT`; we also honor `API_PORT`).

1. In the Render Dashboard, **New → Blueprint** and point it at this repo
   (or paste `render.yaml`).
2. Fill the `sync: false` env vars (never commit them):

   | Key                                             | Notes                                                                                       |
   | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
   | `DATABASE_URL`                                  | TiDB URL + `sslaccept=strict&ssl=true`                                                      |
   | `WEB_ORIGIN`                                    | The Vercel origin, e.g. `https://your-app.vercel.app`                                       |
   | `WEB_INTERNAL_URL`                              | Same as the Vercel origin (revalidate POSTs here)                                           |
   | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`      | Two different `openssl rand -base64 48` values                                              |
   | `REVALIDATE_SECRET`                             | Shared with Vercel (`REVALIDATE_SECRET`)                                                    |
   | `ANALYTICS_SALT_SECRET`                         | Optional; skip writes if empty                                                              |
   | `CLOUDINARY_*`                                  | From step 2                                                                                 |
   | `ADMIN_EMAIL` / `ADMIN_NAME` / `ADMIN_PASSWORD` | Only for the first seed; email stays `<email>` in git                                       |
   | `COOKIE_DOMAIN`                                 | Leave empty unless you share a parent domain                                                |
   | `CORS_ORIGINS`                                  | Extra origins (comma-separated). `WEB_ORIGIN` is always allowed when `CROSS_SITE_COOKIES=1` |

3. `CROSS_SITE_COOKIES=1` is set by the Blueprint. Cookies are
   `SameSite=None; Secure`. CORS allows `WEB_ORIGIN`.
4. After the first deploy is healthy, seed **once** from a Render shell
   (do not seed on every boot — the owner seed wipes content rows):

   ```bash
   node dist/seed.js
   ```

   `SEED_PROFILE=baseline` is already in the Blueprint.

5. Confirm `https://<render-host>/api/health` returns
   `{ "status": "ok", "db": "ok" }`.

Free web services spin down after ~15 minutes idle. The Next app sends a
lightweight `GET /api/health` on every page load (`ApiWarmup`) to soften
that cold start.

## 4. Vercel (web)

1. **Add New Project** from this GitHub repo. Framework: Next.js.
   Root directory: repo root (monorepo).
2. Build command:
   `pnpm --filter @portfolio/contracts build && pnpm --filter @portfolio/web build`
3. Install: `pnpm install --frozen-lockfile` (enable pnpm / Corepack).
4. Environment variables:

   | Key                    | Notes                                                                                                                                                                                                                                                          |
   | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `API_URL`              | Render origin, e.g. `https://portfolio-api.onrender.com` (server-side fetch + rewrite)                                                                                                                                                                         |
   | `NEXT_PUBLIC_API_URL`  | **Leave empty** when web and API are on different domains. The browser must call same-origin `/api/*` so Next rewrites to Render and cookies stay on the Vercel host. Setting this to the Render origin puts cookies on the API domain and breaks admin login. |
   | `NEXT_PUBLIC_SITE_URL` | This Vercel origin (`https://…`)                                                                                                                                                                                                                               |
   | `REVALIDATE_SECRET`    | Same value as Render                                                                                                                                                                                                                                           |
   | `WEB_ORIGIN`           | Same as `NEXT_PUBLIC_SITE_URL` if the web process reads it                                                                                                                                                                                                     |

5. Deploy. Open `https://<vercel>/en` and `/admin/login`.
6. Custom domain (optional): add it in Vercel, then update `WEB_ORIGIN`,
   `NEXT_PUBLIC_SITE_URL`, and `WEB_INTERNAL_URL` on both sides.

## 5. After go-live

- [docs/runbooks/content-entry.md](./runbooks/content-entry.md) — Parker
  enters real copy, then `pnpm check:placeholders` against production
  `DATABASE_URL`.
- [docs/launch-checklist.md](./launch-checklist.md)
- Rotate the admin password and the JWT pair. Never reuse local-dev secrets.

## Local vs production

|         | Local                                       | Production                          |
| ------- | ------------------------------------------- | ----------------------------------- |
| Web     | `pnpm dev` :3000                            | Vercel                              |
| API     | `pnpm dev` :4000, `127.0.0.1`, no CORS (D9) | Render, `0.0.0.0:$PORT`, CORS (D28) |
| DB      | Docker MySQL 8.4                            | TiDB Cloud Serverless + TLS         |
| Cookies | `SameSite=Lax`, Secure off                  | `SameSite=None; Secure`             |
| Media   | Memory fallback or Cloudinary               | Cloudinary                          |
