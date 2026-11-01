-- AlterTable
ALTER TABLE `contact_message` MODIFY `status` ENUM('NEW', 'READ', 'REPLIED', 'SPAM', 'ARCHIVED') NOT NULL DEFAULT 'NEW';
