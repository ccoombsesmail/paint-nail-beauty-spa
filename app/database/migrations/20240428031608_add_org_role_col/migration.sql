-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('Employee', 'Member', 'Admin', 'Franchisor');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "organization_role" "OrganizationRole" NOT NULL DEFAULT 'Employee';
