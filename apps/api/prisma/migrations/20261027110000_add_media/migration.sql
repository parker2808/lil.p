-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `sizeBytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `altEn` VARCHAR(191) NOT NULL DEFAULT '',
    `altVi` VARCHAR(191) NOT NULL DEFAULT '',
    `resourceType` VARCHAR(16) NOT NULL DEFAULT 'image',
    `uploadedById` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `media_fileName_key`(`fileName`),
    INDEX `media_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_image` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `mediaId` INTEGER NOT NULL,
    `captionEn` VARCHAR(191) NULL,
    `captionVi` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_image_projectId_sortOrder_idx`(`projectId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `media` ADD CONSTRAINT `media_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_image` ADD CONSTRAINT `project_image_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_image` ADD CONSTRAINT `project_image_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `site_settings` ADD CONSTRAINT `site_settings_ogImageId_fkey` FOREIGN KEY (`ogImageId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `profile_avatarId_fkey` FOREIGN KEY (`avatarId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `profile_resumeEnId_fkey` FOREIGN KEY (`resumeEnId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `profile_resumeViId_fkey` FOREIGN KEY (`resumeViId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_coverId_fkey` FOREIGN KEY (`coverId`) REFERENCES `media`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
