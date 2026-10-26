-- AlterTable
ALTER TABLE `project` ADD COLUMN `notMineEn` TEXT NULL,
    ADD COLUMN `notMineVi` TEXT NULL,
    ADD COLUMN `releaseStatus` JSON NULL;
