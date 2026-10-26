#!/bin/sh
# Apply committed migrations, then run the given command (the API by default).
# `prisma migrate deploy` never creates migrations and never resets data.
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  # Render + TiDB: keep the dashboard URL (includes ?sslaccept=strict).
  export DATABASE_URL
elif [ -n "${MYSQL_USER:-}" ] && [ -n "${MYSQL_PASSWORD:-}" ] && [ -n "${MYSQL_DATABASE:-}" ]; then
  # compose.prod: build the URL from service parts so a host .env
  # DATABASE_URL (127.0.0.1) cannot leak into the container network.
  DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST:-db}:${MYSQL_PORT:-3306}/${MYSQL_DATABASE}"
  export DATABASE_URL
else
  echo "DATABASE_URL or MYSQL_USER/MYSQL_PASSWORD/MYSQL_DATABASE is required" >&2
  exit 1
fi

mkdir -p /app/uploads || true

echo "Applying Prisma migrations…"
prisma migrate deploy

exec "$@"
