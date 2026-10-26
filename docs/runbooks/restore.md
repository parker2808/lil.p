# Restore a backup (T59)

The `backup` service in `compose.prod.yml` writes a daily `mysqldump` (gzip)
and an uploads tarball onto the `backups` volume, then deletes files older
than 7 days. A backup only counts after you have restored it into a **fresh**
database.

## Take a one-shot snapshot

```bash
pnpm prod:backup
# same as: docker compose -f compose.prod.yml run --rm -e BACKUP_ONCE=1 backup
```

Files land in the `backups` volume as `db-<UTC>.sql.gz` and
`uploads-<UTC>.tar.gz`. To copy one out:

```bash
docker compose -f compose.prod.yml cp backup:/backups ./backups
```

## Restore into a fresh database

`scripts/backup/restore.sh` creates `MYSQL_DATABASE` if needed and loads the
newest dump (or `DUMP=path/to/file.sql.gz`).

Host-side (MySQL reachable on a published or host-network port):

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_USER=app
export MYSQL_PASSWORD='from .env — never commit'
export MYSQL_DATABASE=portfolio_restore
export BACKUP_DIR=./backups
scripts/backup/restore.sh
```

Inside the compose network (no published MySQL port):

```bash
docker compose -f compose.prod.yml run --rm \
  -e MYSQL_HOST=db \
  -e MYSQL_DATABASE=portfolio_restore \
  --entrypoint bash \
  backup /restore.sh
```

Then point a one-off API at that database (`MYSQL_DATABASE=portfolio_restore`)
and check `GET /api/health` plus `GET /api/public/site?locale=en`.

Uploads (rare — media lives on Cloudinary, T50) restore when `UPLOADS_DIR` is
set; the script unpacks the matching `uploads-*.tar.gz`.

## Drill

The T59 drill dumped the production-compose database (`mysqldump
--no-tablespaces` so the `app` user does not need `PROCESS`), loaded it into
an empty `portfolio_restore` schema, and confirmed the CMS tables came back
(`project` 6 rows, `site_settings` 1 row). Repeat that after the first
production backup and after any restore-script change. When Docker needs
root on the host, `restore.sh` uses `sudo docker`.

## What this does not restore

- Cloudinary assets (they stay in the cloud account)
- JWT secrets (see [secrets.md](./secrets.md); rotating them signs everyone out)
- Caddy/TLS state (T61)
