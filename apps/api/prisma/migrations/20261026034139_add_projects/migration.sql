-- CreateTable
CREATE TABLE `domain` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `nameVi` VARCHAR(191) NOT NULL,
    `descriptionEn` TEXT NOT NULL,
    `descriptionVi` TEXT NOT NULL,
    `hue` ENUM('JADE', 'AMBER', 'BLUE', 'VIOLET', 'ROSE') NOT NULL,
    `iconKey` VARCHAR(48) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `domain_slug_key`(`slug`),
    INDEX `domain_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `titleEn` VARCHAR(191) NOT NULL,
    `titleVi` VARCHAR(191) NOT NULL,
    `taglineEn` TEXT NOT NULL,
    `taglineVi` TEXT NOT NULL,
    `client` VARCHAR(191) NOT NULL,
    `roleEn` VARCHAR(191) NOT NULL,
    `roleVi` VARCHAR(191) NOT NULL,
    `teamSize` INTEGER NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `versionFrom` VARCHAR(191) NULL,
    `versionTo` VARCHAR(191) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isConfidential` BOOLEAN NOT NULL DEFAULT false,
    `liveUrl` VARCHAR(191) NULL,
    `repoUrl` VARCHAR(191) NULL,
    `coverId` INTEGER NULL,
    `problemEn` TEXT NOT NULL,
    `problemVi` TEXT NOT NULL,
    `constraintsEn` TEXT NOT NULL,
    `constraintsVi` TEXT NOT NULL,
    `approachEn` TEXT NOT NULL,
    `approachVi` TEXT NOT NULL,
    `decisionsEn` TEXT NOT NULL,
    `decisionsVi` TEXT NOT NULL,
    `outcomeEn` TEXT NOT NULL,
    `outcomeVi` TEXT NOT NULL,
    `lessonsEn` TEXT NOT NULL,
    `lessonsVi` TEXT NOT NULL,
    `keyFactsEn` TEXT NOT NULL,
    `keyFactsVi` TEXT NOT NULL,
    `factChipsEn` VARCHAR(191) NOT NULL,
    `factChipsVi` VARCHAR(191) NOT NULL,
    `seoTitleEn` VARCHAR(191) NULL,
    `seoTitleVi` VARCHAR(191) NULL,
    `seoDescriptionEn` TEXT NULL,
    `seoDescriptionVi` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `domainId` INTEGER NULL,
    `experienceId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `project_slug_key`(`slug`),
    INDEX `project_status_sortOrder_idx`(`status`, `sortOrder`),
    INDEX `project_domainId_idx`(`domainId`),
    INDEX `project_experienceId_idx`(`experienceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_metric` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `projectId` INTEGER NOT NULL,
    `labelEn` VARCHAR(191) NOT NULL,
    `labelVi` VARCHAR(191) NOT NULL,
    `before` VARCHAR(191) NULL,
    `after` VARCHAR(191) NULL,
    `value` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_metric_projectId_sortOrder_idx`(`projectId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_domainId_fkey` FOREIGN KEY (`domainId`) REFERENCES `domain`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project` ADD CONSTRAINT `project_experienceId_fkey` FOREIGN KEY (`experienceId`) REFERENCES `experience`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_metric` ADD CONSTRAINT `project_metric_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
