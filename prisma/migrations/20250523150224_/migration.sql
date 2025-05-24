/*
  Warnings:

  - Added the required column `value` to the `AssignedClaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `RequestedClaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `RequestedClaim` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `assignedclaim` ADD COLUMN `value` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `requestedclaim` ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
    ADD COLUMN `value` DOUBLE NOT NULL;
