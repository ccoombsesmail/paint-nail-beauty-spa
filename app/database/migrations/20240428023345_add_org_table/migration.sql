-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FullTime', 'PartTime');

-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "address" TEXT,
ADD COLUMN     "notes" VARCHAR(5000),
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "role_type" "EmploymentStatus" NOT NULL DEFAULT 'FullTime',
ALTER COLUMN "franchise_code" DROP NOT NULL;

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(300) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
