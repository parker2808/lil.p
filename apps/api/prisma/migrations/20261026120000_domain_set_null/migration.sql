-- Make deleting a domain leave its projects with no domain.
ALTER TABLE `project` DROP FOREIGN KEY `project_domainId_fkey`;

ALTER TABLE `project` ADD CONSTRAINT `project_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `domain`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
