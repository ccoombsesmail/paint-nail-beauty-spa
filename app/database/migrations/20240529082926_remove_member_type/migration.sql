/*
  Warnings:

  - The values [Member] on the enum `OrganizationRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationRole_new" AS ENUM ('Employee', 'Admin', 'Franchisor');
ALTER TABLE "employees" ALTER COLUMN "organization_role" DROP DEFAULT;
ALTER TABLE "employees" ALTER COLUMN "organization_role" TYPE "OrganizationRole_new" USING ("organization_role"::text::"OrganizationRole_new");
ALTER TYPE "OrganizationRole" RENAME TO "OrganizationRole_old";
ALTER TYPE "OrganizationRole_new" RENAME TO "OrganizationRole";
DROP TYPE "OrganizationRole_old";
ALTER TABLE "employees" ALTER COLUMN "organization_role" SET DEFAULT 'Employee';
COMMIT;
