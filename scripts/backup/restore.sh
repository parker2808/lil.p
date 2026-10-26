#!/usr/bin/env bash
# Restore the latest (or a named) mysqldump into MYSQL_DATABASE (T59).
# A backup only counts once this has been run against a fresh database.
#
# Required env: MYSQL_HOST MYSQL_PORT MYSQL_USER MYSQL_PASSWORD MYSQL_DATABASE
# Optional:     BACKUP_DIR (default ./backups) DUMP UPLOADS_ARCHIVE UPLOADS_DIR
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
MYSQL_HOST="${MYSQL_HOST:?MYSQL_HOST is required}"
MYSQL_PORT="${MYSQL_PORT:?MYSQL_PORT is required}"
MYSQL_USER="${MYSQL_USER:?MYSQL_USER is required}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}"
MYSQL_DATABASE="${MYSQL_DATABASE:?MYSQL_DATABASE is required}"

DUMP="${DUMP:-}"
if [[ -z "${DUMP}" ]]; then
  shopt -s nullglob
  dumps=("${BACKUP_DIR}"/db-*.sql.gz)
  shopt -u nullglob
  if [[ ${#dumps[@]} -gt 0 ]]; then
    DUMP="$(printf '%s\n' "${dumps[@]}" | sort -r | head -n 1)"
  fi
fi
if [[ -z "${DUMP}" || ! -f "${DUMP}" ]]; then
  echo "restore: no dump found in ${BACKUP_DIR} (set DUMP=path/to/db-….sql.gz)" >&2
  exit 1
fi

# Resolve once so a piped dump is not consumed by a failed first attempt.
if command -v mysql >/dev/null 2>&1; then
  MYSQL_BIN=host
elif docker info >/dev/null 2>&1; then
  MYSQL_BIN=docker
elif command -v sudo >/dev/null 2>&1 && sudo -n docker info >/dev/null 2>&1; then
  MYSQL_BIN=sudo-docker
else
  echo "restore: need a mysql client or docker" >&2
  exit 1
fi

mysql_cmd() {
  case "${MYSQL_BIN}" in
    host)
      MYSQL_PWD="${MYSQL_PASSWORD}" mysql \
        --host="${MYSQL_HOST}" \
        --port="${MYSQL_PORT}" \
        --user="${MYSQL_USER}" \
        "$@"
      ;;
    docker)
      docker run --rm --network host -i \
        -e "MYSQL_PWD=${MYSQL_PASSWORD}" \
        mysql:8.4 \
        mysql --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}" "$@"
      ;;
    sudo-docker)
      sudo docker run --rm --network host -i \
        -e "MYSQL_PWD=${MYSQL_PASSWORD}" \
        mysql:8.4 \
        mysql --host="${MYSQL_HOST}" --port="${MYSQL_PORT}" --user="${MYSQL_USER}" "$@"
      ;;
  esac
}

echo "restore: creating ${MYSQL_DATABASE} if needed"
mysql_cmd -e "CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

echo "restore: loading ${DUMP} into ${MYSQL_DATABASE}"
gzip -dc "${DUMP}" | mysql_cmd --database="${MYSQL_DATABASE}"

if [[ -n "${UPLOADS_DIR:-}" ]]; then
  ARCHIVE="${UPLOADS_ARCHIVE:-}"
  if [[ -z "${ARCHIVE}" ]]; then
    shopt -s nullglob
    archives=("${BACKUP_DIR}"/uploads-*.tar.gz)
    shopt -u nullglob
    if [[ ${#archives[@]} -gt 0 ]]; then
      ARCHIVE="$(printf '%s\n' "${archives[@]}" | sort -r | head -n 1)"
    fi
  fi
  if [[ -n "${ARCHIVE}" && -f "${ARCHIVE}" ]]; then
    mkdir -p "${UPLOADS_DIR}"
    tar -xzf "${ARCHIVE}" -C "${UPLOADS_DIR}"
    echo "restore: extracted ${ARCHIVE} into ${UPLOADS_DIR}"
  fi
fi

echo "restore: verifying tables"
mysql_cmd --database="${MYSQL_DATABASE}" -N -e "SHOW TABLES;" | head
echo "restore: done"
