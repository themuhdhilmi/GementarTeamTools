/*
  Warnings:

  - Added the required column `name` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `group` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT '';

-- Update existing rows: set name = id untuk semua group lama
UPDATE `group` SET `name` = `id` WHERE `name` = '';

-- AlterTable
ALTER TABLE `permission` MODIFY `