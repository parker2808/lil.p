#!/usr/bin/env bash
set -euo pipefail

[[ -z "${DATABASE_URL:-}" && -z "${DATABASE_URL_TEST:-}" ]] || {
  echo 'Unset database URLs before starting the disposable E2E gate'
  exit 1
}

container_id=''
cleanup() {
  if [[ -n "$container_id" ]]; then docker rm -f "$container_id" >/dev/null 2>&1 || true; fi
}
trap cleanup EXIT

db_name="r312e2e$RANDOM"
db_password="$(openssl rand -hex 16)"
container_id="$(docker run -d --rm --name "lilp-r3-12-$RANDOM" \
  --tmpfs /var/lib/mysql:rw,nosuid,size=512m \
  -e MYSQL_ROOT_PASSWORD="$db_password" -e MYSQL_DATABASE="$db_name" \
  -p 127.0.0.1::3306 mysql:8.4)"
[[ "$(docker inspect --format '{{range .Mounts}}{{.Type}} {{end}}' "$container_id")" != *volume* ]] || exit 1
port="$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3306/tcp") 0).HostPort}}' "$container_id")"
[[ "$port" =~ ^[0-9]+$ ]] || exit 1
export DATABASE_URL="mysql://root:${db_password}@127.0.0.1:${port}/${db_name}"
export DATABASE_URL_TEST="$DATABASE_URL"
export API_PORT=4000 WEB_ORIGIN=http://localhost:3000
export R3_CAPTURE_DIR="${HOME}/Desktop/lilp-design-demo-20261102"
export JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
export ANALYTICS_SALT_SECRET="$(openssl rand -hex 32)"
export REVALIDATE_SECRET="$(openssl rand -hex 32)"

assert_target() {
  local live_port
  live_port="$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3306/tcp") 0).HostPort}}' "$container_id")"
  [[ "$live_port" == "$port" && "$DATABASE_URL_TEST" == "$DATABASE_URL" ]] || exit 1
  [[ "$DATABASE_URL" == "mysql://root:${db_password}@127.0.0.1:${port}/${db_name}" ]] || exit 1
}
for _ in {1..90}; do
  if docker exec -e MYSQL_PWD="$db_password" "$container_id" mysql -h127.0.0.1 -uroot -e 'SELECT 1' >/dev/null 2>&1; then break; fi
  sleep 1
done
assert_target
echo 'Disposable MySQL ready; applying schema before Playwright health check.'
(cd apps/api && pnpm exec prisma migrate deploy >/dev/null)
assert_target
if [[ "$#" -gt 0 ]]; then
  pnpm build
  pnpm --filter @portfolio/web exec playwright test "$@"
else
  pnpm check:all --e2e
fi
