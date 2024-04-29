/*
  Warnings:

  - You are about to drop the column `franchise_code` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `organization_display_name` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "franchise_code",
ADD COLUMN     "organization_display_name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL;
