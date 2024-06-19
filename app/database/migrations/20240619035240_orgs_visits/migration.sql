-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FullTime', 'PartTime');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('Employee', 'Admin', 'Franchisor');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'CupertinoBalance';
ALTER TYPE "PaymentMethod" ADD VALUE 'CurpertinoPackage';
ALTER TYPE "PaymentMethod" ADD VALUE 'LocalStorePackage';
ALTER TYPE "PaymentMethod" ADD VALUE 'LocalStoreBalance';

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_customer_id_fkey";

-- AlterTable
ALTER TABLE "customers"
RENAME COLUMN "created_at_franchise_code" TO "created_at_organization_id";

ALTER TABLE "customers"
ALTER COLUMN "created_at_organization_id" SET NOT NULL,
ALTER COLUMN "created_at_organization_id" SET DEFAULT 'default_org_id';

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "address" TEXT,
ADD COLUMN     "notes" VARCHAR(5000),
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "organization_role" "OrganizationRole" NOT NULL DEFAULT 'Employee',
ADD COLUMN     "role_type" "EmploymentStatus" NOT NULL DEFAULT 'FullTime',
ALTER COLUMN "franchise_code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "organization_display_name" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "organization_id" TEXT,
ADD COLUMN     "visit_id" TEXT,
ALTER COLUMN "user_entered_date" DROP NOT NULL,
ALTER COLUMN "customer_id" DROP NOT NULL,
ALTER COLUMN "franchise_code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "isDisabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "customer_id" VARCHAR(300) NOT NULL,
    "created_at_organization_id" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- AddForeignKey
-- ALTER TABLE "customers" ADD CONSTRAINT "customers_created_at_organization_id_fkey" FOREIGN KEY ("created_at_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
