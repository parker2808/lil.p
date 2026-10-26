#!/usr/bin/env bash
# Daily mysqldump + uploads tarball with 7-day rotation (T59).
# Runs inside the `backup` service on the db network — no published MySQL port.
# Set BACKUP_ONCE=1 to take one snapshot and exit (used by restore drills).
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/backups}"
UPLOADS_DIR="${UPLOADS_DIR:-/uploads}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
SLEEP_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"

MYSQL_HOST="${MYSQL_HOST:-db}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_USER="${MYSQL_USER:?MYSQL_USER is required}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}"
MYSQL_DATABASE="${MYSQL_DATABASE:?MYSQL_DATABASE is required}"

dump_once() {
  local stamp
  stamp="$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "${BACKUP_DIR}"

  # MYSQL_PWD keeps the password out of `ps` (never put it on the argv).
  MYSQL_PWD="${MYSQL_PASSWORD}" mysqldump \
    --host="${MYSQL_HOST}" \
    --port="${MYSQL_PORT}" \
    --user="${MYSQL_USER}" \
    --single-transaction \
    --no-tablespaces \
    --routines \
    --triggers \
    --set-gtid-purged=OFF \
    "${MYSQL_DATABASE}" \
    | gzip >"${BACKUP_DIR}/db-${stamp}.sql.gz"

  if [[ -d "${UPLOADS_DIR}" ]]; then
    tar -czf "${BACKUP_DIR}/uploads-${stamp}.tar.gz" -C "${UPLOADS_DIR}" .
  else
    tar -czf "${BACKUP_DIR}/uploads-${stamp}.tar.gz" --files-from /dev/null
  fi

  echo "backup wrote ${BACKUP_DIR}/db-${stamp}.sql.gz and uploads-${stamp}.tar.gz"

  find "${BACKUP_DIR}" -type f \( -name 'db-*.sql.gz' -o -name 'uploads-*.tar.gz' \) \
    -mtime "+$((RETENTION_DAYS - 1))" -delete || true
}

if [[ "${BACKUP_ONCE:-}" == "1" ]]; then
  dump_once
  exit 0
fi

while true; do
  dump_once || echo "backup failed" >&2
  sleep "${SLEEP_SECONDS}"
done
