/*
  Warnings:

  - You are about to alter the column `service_duration` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - Added the required column `discounted_service_price` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "discounted_service_price" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "service_duration" SET DATA TYPE DECIMAL(10,2);
