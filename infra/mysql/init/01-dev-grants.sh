#!/bin/sh
# Dev only. Do not copy these grants to production (T58).
#
# The official MySQL image already gives MYSQL_USER full rights on
# MYSQL_DATABASE. Prisma's `migrate dev` (T08) also creates a throwaway
# shadow database to diff migrations. Without CREATE/DROP on *.*, that
# fails with P3014. A shell script (not .sql) so the grant follows whatever
# MYSQL_USER is set to in `.env`.
#
# Files in /docker-entrypoint-initdb.d run only the first time the db-data
# volume is created. If you already have a volume, run this GRANT by hand
# in Adminer, or reset with `docker compose down -v`.

mysql --protocol=socket -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
GRANT ALL PRIVILEGES ON *.* TO '$MYSQL_USER'@'%';
FLUSH PRIVILEGES;
SQL
