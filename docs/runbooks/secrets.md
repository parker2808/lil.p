# JWT secrets (T59)

Production `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are generated on the
machine that runs the API, stored only in that host's `.env` (and, later, in
GitHub Actions secrets). They are never committed.

The API already refuses to boot when either secret is shorter than 32
characters or when the two secrets are equal (`apps/api/src/config/env.schema.ts`,
T35). This runbook is how you create and rotate them.

## Generate a pair

```bash
openssl rand -base64 48
openssl rand -base64 48
```

Paste one value into `JWT_ACCESS_SECRET` and the other into `JWT_REFRESH_SECRET`
in `.env`. They must differ from each other and from any local-dev values.

`ADMIN_EMAIL` stays `<email>` in git. The real inbox address is typed into
`/admin` (T60) and lives only in the database.

## Rotate after a leak (or on a schedule)

1. Generate two new secrets with the commands above.
2. Replace the values in the production `.env` (and in GitHub secrets once T61
   is live).
3. Recreate the API container so it reads the new env:
   `docker compose -f compose.prod.yml up -d api`
4. Sign in again at `/admin/login`.

Changing `JWT_ACCESS_SECRET` invalidates every access token at once. Changing
`JWT_REFRESH_SECRET` signs everyone out. There are no session rows to clean up
(PLAN D24).

## Local vs production

Local `.env` may keep the long dummy strings from `.env.example`. Production
must use freshly generated values. Do not copy the local pair onto a VPS.
