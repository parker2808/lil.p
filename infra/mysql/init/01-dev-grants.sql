-- Dev only. Do not copy these grants to production (T58).
--
-- The official MySQL image already gives MYSQL_USER (`app`) full rights on
-- MYSQL_DATABASE (`portfolio`). Prisma's `migrate dev` (T08) also creates a
-- throwaway shadow database to diff migrations. Without CREATE/DROP on *.*,
-- that fails with P3014.
--
-- Files in /docker-entrypoint-initdb.d run only the first time the db-data
-- volume is created. If you already have a volume, run this GRANT by hand
-- in Adminer, or reset with `docker compose down -v`.

GRANT ALL PRIVILEGES ON *.* TO 'app'@'%';
FLUSH PRIVILEGES;
