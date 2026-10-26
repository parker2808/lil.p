-- T03 · SQL by hand notes
-- Roadmap p03. Scratch tables only — drop everything at the end so Prisma (T08)
-- starts from an empty `portfolio` database.
--
-- Open a shell:
--   docker compose exec db mysql -u app -p portfolio
-- Or run this file:
--   docker compose exec -T db mysql -u app -p"$MYSQL_PASSWORD" portfolio < docs/sql-notes.sql
--
-- Placeholders only. Never store a real email or phone here.

-- ---------------------------------------------------------------------------
-- 1. Create scratch tables (RESTRICT first)
--
-- A PRIMARY KEY uniquely identifies a row. An INT AUTO_INCREMENT is a
-- surrogate key: MySQL assigns 1, 2, 3, … so we do not have to invent ids.
--
-- A FOREIGN KEY says "this column must match a row in another table".
-- Default ON DELETE is RESTRICT (same as NO ACTION in InnoDB): MySQL refuses
-- to delete a parent that still has children.
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS experience;
DROP TABLE IF EXISTS profile;

CREATE TABLE profile (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  headline VARCHAR(200) NOT NULL,
  email VARCHAR(190) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE experience (
  id INT NOT NULL AUTO_INCREMENT,
  profile_id INT NOT NULL,
  company VARCHAR(120) NOT NULL,
  title VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_experience_profile
    FOREIGN KEY (profile_id) REFERENCES profile (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- 2. Insert rows
-- ---------------------------------------------------------------------------

INSERT INTO profile (name, headline, email) VALUES
  ('Parker', 'Senior Frontend Engineer', '<email>'),
  ('Demo Reviewer', 'Read-only reviewer', '<email>');

INSERT INTO experience (profile_id, company, title) VALUES
  (1, 'CMC Global', 'Frontend Engineer'),
  (1, 'Kobizo', 'Frontend Engineer'),
  (2, 'Example Co', 'Reviewer');

-- ---------------------------------------------------------------------------
-- 3. JOIN: experiences for one profile (acceptance: this returns two rows)
-- ---------------------------------------------------------------------------

SELECT
  profile.name,
  experience.company,
  experience.title
FROM profile
INNER JOIN experience ON experience.profile_id = profile.id
WHERE profile.id = 1;

-- ---------------------------------------------------------------------------
-- 4. UPDATE and DELETE (child rows only)
-- ---------------------------------------------------------------------------

UPDATE experience
SET title = 'Senior Frontend Engineer'
WHERE company = 'CMC Global';

DELETE FROM experience
WHERE company = 'Example Co';

-- ---------------------------------------------------------------------------
-- 5. Foreign key behaviour: RESTRICT
--
-- Deleting a profile that still has experiences is blocked. The statement
-- below is expected to fail with:
--   ERROR 1451 (23000): Cannot delete or update a parent row:
--   a foreign key constraint fails
-- ---------------------------------------------------------------------------

-- DELETE FROM profile WHERE id = 1;

-- Uncomment the line above while typing this file by hand to see the error.
-- The next block records the same failure without aborting the rest of the
-- script, then recreates the tables with ON DELETE CASCADE.

-- ---------------------------------------------------------------------------
-- 6. Recreate with ON DELETE CASCADE and compare
--
-- Which one would I pick for this product, and why?
--
--   RESTRICT (default) for real content that other rows point at
--   (Profile, Project, Post, User). A delete that would orphan or silently
--   wipe related rows should fail so the admin has to archive or reassign
--   first. That matches the CMS: drafts, publish, and restore are explicit.
--
--   ON DELETE CASCADE only for owned children that cannot exist alone
--   (ProjectMetric under Project, PageBlock under Page). When the parent
--   goes, those rows have no meaning. Prisma will encode the same choice
--   as `onDelete: Cascade` vs `Restrict` on each relation (T08+).
--
-- For this scratch pair I would keep RESTRICT on experience.profile_id:
-- an experience is a CV fact, not a disposable child. CASCADE is shown
-- below only so the difference is visible.
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS experience;
DROP TABLE IF EXISTS profile;

CREATE TABLE profile (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  headline VARCHAR(200) NOT NULL,
  email VARCHAR(190) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE experience (
  id INT NOT NULL AUTO_INCREMENT,
  profile_id INT NOT NULL,
  company VARCHAR(120) NOT NULL,
  title VARCHAR(120) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_experience_profile
    FOREIGN KEY (profile_id) REFERENCES profile (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO profile (name, headline, email) VALUES
  ('Parker', 'Senior Frontend Engineer', '<email>');

INSERT INTO experience (profile_id, company, title) VALUES
  (1, 'CMC Global', 'Frontend Engineer'),
  (1, 'Kobizo', 'Frontend Engineer');

-- This now succeeds: both experience rows disappear with the profile.
DELETE FROM profile WHERE id = 1;

SELECT COUNT(*) AS remaining_experiences FROM experience;
-- expected: 0

-- ---------------------------------------------------------------------------
-- 7. Clean up — leave no scratch tables for T08
-- ---------------------------------------------------------------------------

DROP TABLE IF EXISTS experience;
DROP TABLE IF EXISTS profile;

-- T34 · Indexes + EXPLAIN (roadmap p17)
--
-- EXPLAIN asks MySQL how it will run a query.
--   type ALL  = read every row (bad for lists)
--   type ref  = look up a value in an index
--   type index = walk an index instead of the table
--
-- The list indexes on `post(status, publishedAt, sortOrder)` and
-- `project(status, sortOrder)` / `project(domainId)` landed with those
-- tables. T34 adds featured composites and records the plans.
-- To see the "before" plan on a database that already has the indexes,
-- use IGNORE INDEX as below.

-- ---------------------------------------------------------------------------
-- Published posts list
--   WHERE status = 'PUBLISHED' ORDER BY publishedAt DESC, id
-- ---------------------------------------------------------------------------

-- BEFORE (indexes ignored) — type ALL, filesort
-- EXPLAIN SELECT id, publishedAt FROM post
--   IGNORE INDEX (post_status_publishedAt_sortOrder_idx)
--   WHERE status = 'PUBLISHED' ORDER BY publishedAt DESC, id;
--
-- id | table | type | key  | rows | Extra
-- 1  | post  | ALL  | NULL |    4 | Using where; Using filesort

EXPLAIN SELECT id, publishedAt
FROM post
WHERE status = 'PUBLISHED'
ORDER BY publishedAt DESC, id;
-- AFTER
-- id | table | type | key                                    | Extra
-- 1  | post  | ref  | post_status_publishedAt_sortOrder_idx  | Using index; Using filesort

-- ---------------------------------------------------------------------------
-- Posts by tag
-- ---------------------------------------------------------------------------

EXPLAIN SELECT p.id
FROM post p
INNER JOIN `_PostToTag` pt ON pt.A = p.id
INNER JOIN tag t ON t.id = pt.B
WHERE p.status = 'PUBLISHED' AND t.slug = 'react';
-- AFTER (no ALL): tag_slug_key + _PostToTag_B_index + post PRIMARY

-- ---------------------------------------------------------------------------
-- Published projects by domain
-- ---------------------------------------------------------------------------

-- BEFORE (indexes ignored) — type ALL
-- EXPLAIN SELECT id FROM project
--   IGNORE INDEX (project_status_sortOrder_idx, project_domainId_idx, project_experienceId_idx)
--   WHERE status = 'PUBLISHED' AND domainId = 1 ORDER BY sortOrder, id;
-- type ALL | Extra: Using where; Using filesort

EXPLAIN SELECT id
FROM project
WHERE status = 'PUBLISHED' AND domainId = 1
ORDER BY sortOrder, id;
-- AFTER: type ref, key project_domainId_idx

-- ---------------------------------------------------------------------------
-- Published projects by skill
-- ---------------------------------------------------------------------------

EXPLAIN SELECT p.id
FROM project p
INNER JOIN `_ProjectToSkill` ps ON ps.A = p.id
INNER JOIN skill s ON s.id = ps.B
WHERE p.status = 'PUBLISHED' AND s.slug = 'react';
-- AFTER (no ALL): skill_slug_key + _ProjectToSkill_B_index + project PRIMARY

-- ---------------------------------------------------------------------------
-- Admin projects list (all statuses, order by sortOrder)
-- ---------------------------------------------------------------------------

-- BEFORE (indexes ignored) — type ALL
-- EXPLAIN SELECT id FROM project
--   IGNORE INDEX (project_status_sortOrder_idx, project_domainId_idx, project_experienceId_idx)
--   ORDER BY sortOrder, id;
-- type ALL | Extra: Using filesort

EXPLAIN SELECT id FROM project ORDER BY sortOrder, id;
-- AFTER: type index, key project_status_sortOrder_idx, Using index

-- ---------------------------------------------------------------------------
-- Featured lists (new T34 indexes)
-- ---------------------------------------------------------------------------

EXPLAIN SELECT id
FROM project
WHERE status = 'PUBLISHED' AND isFeatured = 1
ORDER BY sortOrder, id;
-- AFTER T34: project_status_isFeatured_sortOrder_idx

EXPLAIN SELECT id
FROM post
WHERE status = 'PUBLISHED' AND isFeatured = 1
ORDER BY publishedAt DESC, id;
-- AFTER T34: post_status_isFeatured_publishedAt_idx

-- N+1 found and fixed (T34): PageBlock refs used to `findUnique` once per
-- project/stat id inside `assertRefsExist`. One PATCH with five projectIds
-- logged five identical SELECTs. Now one `findMany({ id: { in } })` per kind.
