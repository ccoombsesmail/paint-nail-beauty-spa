/*
  Warnings:

  - You are about to drop the column `visitId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `visit_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_visitId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "visitId",
ADD COLUMN     "visit_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
