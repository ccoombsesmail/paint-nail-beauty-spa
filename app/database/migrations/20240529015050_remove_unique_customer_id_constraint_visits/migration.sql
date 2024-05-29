-- DropForeignKey
ALTER TABLE "visits" DROP CONSTRAINT "visits_customer_id_fkey";

-- DropIndex
DROP INDEX "visits_customer_id_key";
