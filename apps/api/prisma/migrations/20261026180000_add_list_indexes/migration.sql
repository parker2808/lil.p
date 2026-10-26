-- T34: extra list-query indexes (featured public lists).
-- status + publishedAt / sortOrder indexes already landed with the
-- post and project tables; IGNORE INDEX shows type ALL without them.

CREATE INDEX `project_status_isFeatured_sortOrder_idx` ON `project`(`status`, `isFeatured`, `sortOrder`);
CREATE INDEX `post_status_isFeatured_publishedAt_idx` ON `post`(`status`, `isFeatured`, `publishedAt`);
