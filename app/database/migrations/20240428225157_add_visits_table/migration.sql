/*
  Warnings:

  - You are about to drop the column `organizationId` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_customer_id_fkey";

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "organizationId",
ADD COLUMN     "organization_id" TEXT;

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "customer_id",
ADD COLUMN     "visitId" TEXT;

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "created_at_organization_id" VARCHAR(300) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visits_slug_key" ON "visits"("slug");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_slug_fkey" FOREIGN KEY ("slug") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "visits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
