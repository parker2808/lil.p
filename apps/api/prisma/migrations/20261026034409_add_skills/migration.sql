-- CreateTable
CREATE TABLE `skill_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nameEn` VARCHAR(191) NOT NULL,
    `nameVi` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `skill_category_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `depth` ENUM('DAILY', 'SHIPPED', 'GROWING') NOT NULL,
    `showInMarquee` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isVisible` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `skill_slug_key`(`slug`),
    INDEX `skill_categoryId_sortOrder_idx`(`categoryId`, `sortOrder`),
    INDEX `skill_depth_sortOrder_idx`(`depth`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ExperienceToSkill` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ExperienceToSkill_AB_unique`(`A`, `B`),
    INDEX `_ExperienceToSkill_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ProjectToSkill` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProjectToSkill_AB_unique`(`A`, `B`),
    INDEX `_ProjectToSkill_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `skill_category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExperienceToSkill` ADD CONSTRAINT `_ExperienceToSkill_A_fkey` FOREIGN KEY (`A`) REFERENCES `experience`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ExperienceToSkill` ADD CONSTRAINT `_ExperienceToSkill_B_fkey` FOREIGN KEY (`B`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectToSkill` ADD CONSTRAINT `_ProjectToSkill_A_fkey` FOREIGN KEY (`A`) REFERENCES `project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProjectToSkill` ADD CONSTRAINT `_ProjectToSkill_B_fkey` FOREIGN KEY (`B`) REFERENCES `skill`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
