/*
  Warnings:

  - You are about to drop the column `slug` on the `visits` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customer_id]` on the table `visits` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customer_id` to the `visits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_slug_fkey";

-- DropIndex
DROP INDEX "visits_slug_key";

-- AlterTable
ALTER TABLE "visits" DROP COLUMN "slug",
ADD COLUMN     "customer_id" VARCHAR(300) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "visits_customer_id_key" ON "visits"("customer_id");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
