/*
  Warnings:

  - You are about to drop the column `name` on the `helprequest` table. All the data in the column will be lost.
  - Added the required column `apellido` to the `HelpRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `HelpRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `helprequest` DROP COLUMN `name`,
    ADD COLUMN `apellido` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL,
    ADD COLUMN `resolvedAt` DATETIME(3) NULL,
    ADD COLUMN `resolvedBy` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('PENDING', 'RESOLVED') NOT NULL DEFAULT 'PENDING';
