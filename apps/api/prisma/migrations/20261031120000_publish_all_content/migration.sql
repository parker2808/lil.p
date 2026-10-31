-- Publish all content: DRAFT -> PUBLISHED and backfill publishedAt (2026-10-31).
-- Data-only migration: no schema change (no CREATE / ALTER / DROP).
-- Idempotent: re-running updates 0 rows.
-- Plain SQL, valid on MySQL 8.4 and TiDB Serverless.
-- Project status / isConfidential come from the JSON.

UPDATE `project`
SET `status` = 'PUBLISHED',
    `publishedAt` = COALESCE(`publishedAt`, NOW(3))
WHERE `status` = 'DRAFT';

UPDATE `project`
SET `publishedAt` = NOW(3)
WHERE `status` = 'PUBLISHED' AND `publishedAt` IS NULL;

UPDATE `post`
SET `status` = 'PUBLISHED',
    `publishedAt` = COALESCE(`publishedAt`, NOW(3))
WHERE `status` = 'DRAFT';

UPDATE `post`
SET `publishedAt` = NOW(3)
WHERE `status` = 'PUBLISHED' AND `publishedAt` IS NULL;
