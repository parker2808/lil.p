#!/bin/sh
# Apply committed migrations, then run the given command (the API by default).
# `prisma migrate deploy` never creates migrations and never resets data.
set -eu

if [ -z "${MYSQL_USER:-}" ] || [ -z "${MYSQL_PASSWORD:-}" ] || [ -z "${MYSQL_DATABASE:-}" ]; then
  echo "MYSQL_USER, MYSQL_PASSWORD and MYSQL_DATABASE are required" >&2
  exit 1
fi

# Always build the URL from compose service parts so a host .env
# DATABASE_URL (127.0.0.1) cannot leak into the container network.
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST:-db}:${MYSQL_PORT:-3306}/${MYSQL_DATABASE}"
export DATABASE_URL

mkdir -p /app/uploads || true

echo "Applying Prisma migrations…"
prisma migrate deploy

exec "$@"
