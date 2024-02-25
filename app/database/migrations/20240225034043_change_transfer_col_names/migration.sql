/*
  Warnings:

  - You are about to drop the column `transferred_on` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "transferred_on",
ADD COLUMN     "transfer_initiated_on" TIMESTAMP(3),
ADD COLUMN     "transfer_received_on" TIMESTAMP(3);
