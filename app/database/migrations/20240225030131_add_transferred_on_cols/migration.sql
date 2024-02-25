-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "can_transfer_membership" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "transferred_on" TIMESTAMP(3);
