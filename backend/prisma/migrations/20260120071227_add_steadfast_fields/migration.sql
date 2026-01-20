-- AlterTable
ALTER TABLE `Order` ADD COLUMN `steadfastConsignmentId` VARCHAR(191) NULL,
    ADD COLUMN `steadfastSentAt` DATETIME(3) NULL,
    ADD COLUMN `steadfastStatus` VARCHAR(191) NULL,
    ADD COLUMN `steadfastTrackingCode` VARCHAR(191) NULL;
