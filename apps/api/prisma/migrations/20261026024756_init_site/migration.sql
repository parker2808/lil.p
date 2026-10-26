-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siteName` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NOT NULL,
    `defaultLocale` VARCHAR(8) NOT NULL DEFAULT 'en',
    `seoTitleEn` VARCHAR(191) NOT NULL,
    `seoTitleVi` VARCHAR(191) NOT NULL,
    `seoDescriptionEn` TEXT NOT NULL,
    `seoDescriptionVi` TEXT NOT NULL,
    `ogImageId` INTEGER NULL,
    `footerNoteEn` VARCHAR(191) NOT NULL,
    `footerNoteVi` VARCHAR(191) NOT NULL,
    `contactIntroEn` TEXT NOT NULL,
    `contactIntroVi` TEXT NOT NULL,
    `replyTimeNoteEn` VARCHAR(191) NOT NULL,
    `replyTimeNoteVi` VARCHAR(191) NOT NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `availability` ENUM('OPEN', 'NOT_LOOKING', 'FREELANCE') NOT NULL DEFAULT 'OPEN',
    `availabilityNoteEn` VARCHAR(191) NOT NULL,
    `availabilityNoteVi` VARCHAR(191) NOT NULL,
    `analyticsEnabled` BOOLEAN NOT NULL DEFAULT false,
    `ambientEffects` BOOLEAN NOT NULL DEFAULT true,
    `marqueeEnabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `displayName` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `careerStartDate` DATE NOT NULL,
    `headlineEn` TEXT NOT NULL,
    `headlineVi` TEXT NOT NULL,
    `subheadlineEn` TEXT NOT NULL,
    `subheadlineVi` TEXT NOT NULL,
    `bioEn` TEXT NOT NULL,
    `bioVi` TEXT NOT NULL,
    `languagesEn` VARCHAR(191) NOT NULL,
    `languagesVi` VARCHAR(191) NOT NULL,
    `heroKickerEn` VARCHAR(191) NULL,
    `heroKickerVi` VARCHAR(191) NULL,
    `headlineAccentEn` VARCHAR(191) NULL,
    `headlineAccentVi` VARCHAR(191) NULL,
    `avatarId` INTEGER NULL,
    `resumeEnId` INTEGER NULL,
    `resumeViId` INTEGER NULL,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nav_item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `location` ENUM('HEADER', 'FOOTER') NOT NULL,
    `labelEn` VARCHAR(191) NOT NULL,
    `labelVi` VARCHAR(191) NOT NULL,
    `href` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `nav_item_location_sortOrder_idx`(`location`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_link` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` ENUM('GITHUB', 'LINKEDIN', 'EMAIL', 'RSS', 'OTHER') NOT NULL,
    `labelEn` VARCHAR(191) NOT NULL,
    `labelVi` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `showInHeader` BOOLEAN NOT NULL DEFAULT false,
    `showInCta` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `social_link_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` ENUM('HOME', 'ABOUT', 'PROJECTS', 'NOTES', 'CONTACT') NOT NULL,
    `seoTitleEn` VARCHAR(191) NULL,
    `seoTitleVi` VARCHAR(191) NULL,
    `seoDescriptionEn` TEXT NULL,
    `seoDescriptionVi` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `page_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_block` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pageId` INTEGER NOT NULL,
    `type` VARCHAR(48) NOT NULL,
    `key` VARCHAR(48) NOT NULL,
    `schemaVersion` INTEGER NOT NULL DEFAULT 1,
    `props` JSON NOT NULL,
    `layout` ENUM('ONE', 'TWO', 'THREE', 'FOUR', 'SPLIT_8_4', 'SPLIT_4_8', 'SPLIT_7_5') NOT NULL,
    `surface` ENUM('PLAIN', 'BAND') NOT NULL DEFAULT 'PLAIN',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `page_block_pageId_sortOrder_idx`(`pageId`, `sortOrder`),
    UNIQUE INDEX `page_block_pageId_key_key`(`pageId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_block` ADD CONSTRAINT `page_block_pageId_fkey` FOREIGN KEY (`pageId`) REFERENCES `page`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
