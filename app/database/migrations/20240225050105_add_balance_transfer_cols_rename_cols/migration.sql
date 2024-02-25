/*
  Warnings:

  - You are about to drop the column `transfer_initiated_on` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `transfer_received_on` on the `customers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "customers" DROP COLUMN "transfer_initiated_on",
DROP COLUMN "transfer_received_on",
ADD COLUMN     "can_transfer_cashback_balance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cashback_balance_transfer_initiated_on" TIMESTAMP(3),
ADD COLUMN     "cashback_balance_transfer_received_on" TIMESTAMP(3),
ADD COLUMN     "membership_transfer_initiated_on" TIMESTAMP(3),
ADD COLUMN     "membership_transfer_received_on" TIMESTAMP(3),
ALTER COLUMN "can_transfer_membership" SET DEFAULT false;
