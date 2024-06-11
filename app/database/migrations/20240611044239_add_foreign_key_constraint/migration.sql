/*
  Warnings:

  - Made the column `created_at_organization_id` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "created_at_organization_id" SET NOT NULL,
ALTER COLUMN "created_at_organization_id" SET DEFAULT 'org_2gRl5DFn3aOjPbD14iGUq2UXQEb';

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_at_organization_id_fkey" FOREIGN KEY ("created_at_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
