#!/usr/bin/env bash
set -euo pipefail
root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$root_dir"
[[ -z "${DATABASE_URL:-}" ]] || { echo "Unset DATABASE_URL before running the disposable migration gate"; exit 1; }
tmp_dir="$(mktemp -d)"
container_name="lilp-r3-11-$(date +%s)-$RANDOM"
db_name="r3gate$RANDOM"
db_password="$(openssl rand -hex 16)"
container_id=''
config_file="$root_dir/apps/api/prisma.r3-11-gate.$RANDOM.config.ts"
cleanup() {
  if [[ -n "$container_id" ]]; then docker rm -f "$container_id" >/dev/null 2>&1 || true; fi
  rm -f "$config_file"
  rm -rf "$tmp_dir"
}
trap cleanup EXIT
container_id="$(docker run -d --rm --name "$container_name" --tmpfs /var/lib/mysql:rw,nosuid,size=512m -e MYSQL_ROOT_PASSWORD="$db_password" -e MYSQL_DATABASE="$db_name" -p 127.0.0.1::3306 mysql:8.4)"
printf 'Disposable container ID: %s\n' "$container_id"
mount_type="$(docker inspect --format '{{range .Mounts}}{{.Type}} {{end}}' "$container_id")"
[[ "$mount_type" != *volume* ]] || { echo 'Persistent volume detected'; exit 1; }
port="$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3306/tcp") 0).HostPort}}' "$container_id")"
[[ "$port" =~ ^[0-9]+$ ]] || exit 1
export DATABASE_URL="mysql://root:${db_password}@localhost:${port}/${db_name}"
assert_target() {
  local expected="mysql://root:${db_password}@localhost:${port}/${db_name}"
  [[ "$DATABASE_URL" == "$expected" ]] || { echo 'Database URL guard failed'; exit 1; }
  local live_port
  live_port="$(docker inspect --format '{{(index (index .NetworkSettings.Ports "3306/tcp") 0).HostPort}}' "$container_id")"
  [[ "$live_port" == "$port" ]] || { echo 'Container port guard failed'; exit 1; }
  [[ "$(docker inspect --format '{{.State.Running}}' "$container_id")" == true ]] || exit 1
}
for _ in {1..90}; do
  if docker exec -e MYSQL_PWD="$db_password" "$container_id" mysql -h127.0.0.1 -uroot --batch --skip-column-names -e "SELECT 1" >/dev/null 2>&1; then break; fi
  sleep 1
done
sleep 3
assert_target
mkdir -p "$tmp_dir/migrations"
cp apps/api/prisma/migrations/migration_lock.toml "$tmp_dir/migrations/"
for migration in apps/api/prisma/migrations/*; do
  [[ -d "$migration" ]] || continue
  [[ "$(basename "$migration")" < 20261103010000_custom_pages ]] || continue
  cp -R "$migration" "$tmp_dir/migrations/"
done
cat > "$config_file" <<EOF
import { defineConfig } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: '$tmp_dir/migrations' },
  datasource: { url: process.env.DATABASE_URL },
});
EOF
assert_target
(cd apps/api && pnpm exec prisma migrate deploy --config "$config_file" > "$tmp_dir/old-deploy.log")
query() { docker exec -e MYSQL_PWD="$db_password" "$container_id" mysql -uroot "$db_name" --batch --skip-column-names -e "$1"; }
query 'SELECT id, CAST(`key` AS CHAR), HEX(COALESCE(CAST(seoTitleEn AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoTitleVi AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoDescriptionEn AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoDescriptionVi AS BINARY),CHAR(1))), HEX(COALESCE(CAST(publishedVersionId AS BINARY),CHAR(1))), HEX(COALESCE(CAST(publishedAt AS BINARY),CHAR(1))), HEX(COALESCE(CAST(createdAt AS BINARY),CHAR(1))), HEX(COALESCE(CAST(updatedAt AS BINARY),CHAR(1))) FROM page ORDER BY CAST(`key` AS CHAR)' > "$tmp_dir/before.tsv"
[[ "$(wc -l < "$tmp_dir/before.tsv" | tr -d ' ')" == 5 ]] || { echo 'Expected five old-schema pages'; exit 1; }
for migration in apps/api/prisma/migrations/*; do
  [[ -d "$migration" ]] || continue
  [[ "$(basename "$migration")" < 20261103010000_custom_pages ]] && continue
  cp -R "$migration" "$tmp_dir/migrations/"
done
assert_target
(cd apps/api && pnpm exec prisma migrate deploy --config "$config_file" > "$tmp_dir/new-deploy.log")
query 'SELECT id, CAST(`key` AS CHAR), HEX(COALESCE(CAST(seoTitleEn AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoTitleVi AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoDescriptionEn AS BINARY),CHAR(1))), HEX(COALESCE(CAST(seoDescriptionVi AS BINARY),CHAR(1))), HEX(COALESCE(CAST(publishedVersionId AS BINARY),CHAR(1))), HEX(COALESCE(CAST(publishedAt AS BINARY),CHAR(1))), HEX(COALESCE(CAST(createdAt AS BINARY),CHAR(1))), HEX(COALESCE(CAST(updatedAt AS BINARY),CHAR(1))) FROM page ORDER BY CAST(`key` AS CHAR)' > "$tmp_dir/after.tsv"
cmp -s "$tmp_dir/before.tsv" "$tmp_dir/after.tsv" || { python3 - "$tmp_dir/before.tsv" "$tmp_dir/after.tsv" <<'DIFF'
import sys
a=[x.rstrip('\n').split('\t') for x in open(sys.argv[1],encoding='latin1')]
b=[x.rstrip('\n').split('\t') for x in open(sys.argv[2],encoding='latin1')]
for i,(x,y) in enumerate(zip(a,b)):
    print('row',i,'changed columns',[['id','key','seoTitleEn','seoTitleVi','seoDescriptionEn','seoDescriptionVi','publishedVersionId','publishedAt','createdAt','updatedAt'][j] for j,(p,q) in enumerate(zip(x,y)) if p!=q])
DIFF
 exit 1; }
[[ "$(query "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema='$db_name' AND table_name='page' AND index_name='page_key_key' AND non_unique=0")" == 1 ]] || { echo 'Key unique index missing'; exit 1; }
if query "INSERT INTO page (\`key\`) VALUES ('HOME')" >/dev/null 2>&1; then echo 'Duplicate key accepted'; exit 1; fi
[[ "$(query "SELECT IS_NULLABLE FROM information_schema.columns WHERE table_schema='$db_name' AND table_name='page' AND column_name='title'")" == YES ]] || { echo 'title is not nullable'; exit 1; }
[[ "$(query "SELECT COLUMN_DEFAULT FROM information_schema.columns WHERE table_schema='$db_name' AND table_name='page' AND column_name='locale'")" == en ]] || { echo 'locale default differs'; exit 1; }
assert_target
(cd apps/api && pnpm exec prisma migrate diff --config "$config_file" --from-config-datasource --to-schema prisma/schema.prisma --exit-code > "$tmp_dir/schema-diff.log") || { echo 'Prisma schema drift detected'; exit 1; }
echo 'Migration gate passed: five rows unchanged; unique/default/nullability/duplicate checks passed; Prisma diff empty.'
if [[ "${LILP_MIGRATION_ONLY:-}" == 1 ]]; then
  exit 0
fi
[[ -n "${LILP_PRIVATE_SOURCE_PATH:-}" && -f "$LILP_PRIVATE_SOURCE_PATH" ]] || { echo 'Private source is required for the disposable seed check'; exit 1; }
seed_snapshot() {
  query "SELECT 'project', id, slug, status, HEX(CAST(updatedAt AS BINARY)) FROM project UNION ALL SELECT 'experience', id, company, roleEn, HEX(CAST(updatedAt AS BINARY)) FROM experience UNION ALL SELECT 'stat', id, labelEn, CAST(isVisible AS CHAR), HEX(CAST(updatedAt AS BINARY)) FROM profile_stat ORDER BY 1, 2"
  query 'SELECT COUNT(*) FROM project WHERE status = "PUBLISHED"'
}
assert_target
(cd apps/api && SEED_PROFILE=real pnpm exec tsx prisma/seed/seed.ts > "$tmp_dir/seed-first.log")
[[ "$(query 'SELECT COUNT(*) FROM project WHERE status = "PUBLISHED"')" == 10 ]] || { echo 'Real seed did not publish ten projects'; exit 1; }
seed_snapshot > "$tmp_dir/seed-before.tsv"
assert_target
(cd apps/api && SEED_PROFILE=real pnpm exec tsx prisma/seed/seed.ts > "$tmp_dir/seed-second.log")
seed_snapshot > "$tmp_dir/seed-after.tsv"
cmp -s "$tmp_dir/seed-before.tsv" "$tmp_dir/seed-after.tsv" || { echo 'Real seed changed rows on its second run'; exit 1; }
echo 'Real seed gate passed: ten published projects; second run unchanged.'
