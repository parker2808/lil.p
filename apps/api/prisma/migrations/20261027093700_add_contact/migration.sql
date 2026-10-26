-- CreateTable
CREATE TABLE `contact_message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `topicId` INTEGER NULL,
    `message` TEXT NOT NULL,
    `locale` VARCHAR(8) NOT NULL,
    `status` ENUM('NEW', 'READ', 'REPLIED', 'SPAM') NOT NULL DEFAULT 'NEW',
    `ipHash` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `contact_message_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `contact_message` ADD CONSTRAINT `contact_message_topicId_fkey` FOREIGN KEY (`topicId`) REFERENCES `contact_topic`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
