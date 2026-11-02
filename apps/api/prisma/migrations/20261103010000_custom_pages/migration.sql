-- Widen the closed page key enum without changing existing uppercase values.
-- The unique index on page.key remains in place; no data rewrite is needed.
ALTER TABLE `page`
  MODIFY COLUMN `key` VARCHAR(64) NOT NULL,
  ADD COLUMN `title` VARCHAR(120) NULL,
  ADD COLUMN `locale` VARCHAR(2) NOT NULL DEFAULT 'en';
