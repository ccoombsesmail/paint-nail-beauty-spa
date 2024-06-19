/*
  Warnings:

  - Made the column `visit_id` on table `transactions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "created_at_organization_id" SET DEFAULT 'org_2i5Na1lVk3A7veHJssV7J3677KM';

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "visit_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
