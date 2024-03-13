-- AlterEnum
ALTER TYPE "ServiceCategory" ADD VALUE 'HairRemoval';

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_technician_employee_id_fkey";

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "service_type" DROP NOT NULL,
ALTER COLUMN "service_duration" DROP NOT NULL,
ALTER COLUMN "total_service_price" DROP NOT NULL,
ALTER COLUMN "discounted_service_price" DROP NOT NULL,
ALTER COLUMN "tip" DROP NOT NULL,
ALTER COLUMN "technician_employee_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_technician_employee_id_fkey" FOREIGN KEY ("technician_employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;
