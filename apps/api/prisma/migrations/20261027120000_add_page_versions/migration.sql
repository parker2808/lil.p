-- CreateTable
CREATE TABLE `page_version` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `version` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `note` VARCHAR(200) NULL,
    `createdById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_version_pageId_idx`(`pageId`),
    UNIQUE INDEX `page_version_pageId_version_key`(`pageId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `page` ADD COLUMN `publishedVersionId` INTEGER NULL,
    ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `page_version` ADD CONSTRAINT `page_version_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `page_version` ADD CONSTRAINT `page_version_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `page_publishedVersionId_key` ON `page`(`publishedVersionId`);

-- AddForeignKey
ALTER TABLE `page` ADD CONSTRAINT `page_publishedVersionId_fkey` FOREIGN KEY (`publishedVersionId`) REFERENCES `page_version`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
