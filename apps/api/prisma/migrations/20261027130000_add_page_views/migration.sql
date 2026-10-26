-- CreateTable
CREATE TABLE `page_view` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(200) NOT NULL,
    `locale` VARCHAR(8) NOT NULL,
    `referrerHost` VARCHAR(200) NULL,
    `device` VARCHAR(16) NOT NULL,
    `visitorHash` VARCHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_view_createdAt_idx`(`createdAt`),
    INDEX `page_view_path_createdAt_idx`(`path`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
