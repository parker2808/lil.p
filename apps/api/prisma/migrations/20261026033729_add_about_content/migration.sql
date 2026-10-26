-- CreateTable
CREATE TABLE `experience` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company` VARCHAR(191) NOT NULL,
    `companyUrl` VARCHAR(191) NULL,
    `location` VARCHAR(191) NOT NULL,
    `employmentType` ENUM('FULL_TIME', 'CONTRACT', 'FREELANCE') NOT NULL,
    `roleEn` VARCHAR(191) NOT NULL,
    `roleVi` VARCHAR(191) NOT NULL,
    `summaryEn` TEXT NOT NULL,
    `summaryVi` TEXT NOT NULL,
    `highlightsEn` TEXT NOT NULL,
    `highlightsVi` TEXT NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `experience_startDate_sortOrder_idx`(`startDate`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `education` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `school` VARCHAR(191) NOT NULL,
    `degreeEn` VARCHAR(191) NOT NULL,
    `degreeVi` VARCHAR(191) NOT NULL,
    `majorEn` VARCHAR(191) NOT NULL,
    `majorVi` VARCHAR(191) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `education_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `principle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleEn` VARCHAR(191) NOT NULL,
    `titleVi` VARCHAR(191) NOT NULL,
    `bodyEn` TEXT NOT NULL,
    `bodyVi` TEXT NOT NULL,
    `iconKey` VARCHAR(48) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `principle_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profile_stat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `labelEn` VARCHAR(191) NOT NULL,
    `labelVi` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `suffix` VARCHAR(191) NULL,
    `source` ENUM('MANUAL', 'YEARS_COMPUTED', 'PROJECT_COUNT') NOT NULL,
    `iconKey` VARCHAR(48) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `profile_stat_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `process_step` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleEn` VARCHAR(191) NOT NULL,
    `titleVi` VARCHAR(191) NOT NULL,
    `captionEn` VARCHAR(191) NOT NULL,
    `captionVi` VARCHAR(191) NOT NULL,
    `iconKey` VARCHAR(48) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `process_step_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
