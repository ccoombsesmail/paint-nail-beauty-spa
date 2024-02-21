/*
  Warnings:

  - You are about to drop the column `membership_start_date` on the `customers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[parentId]` on the table `customers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('Nail', 'Eyelash', 'Facial', 'BodySpa');

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "membership_start_date",
ADD COLUMN     "membership_activation_date" TIMESTAMP(3),
ADD COLUMN     "membership_purchase_date" TIMESTAMP(3),
ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "service_category_selection" "ServiceCategory";

-- CreateIndex
CREATE UNIQUE INDEX "customers_parentId_key" ON "customers"("parentId");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
