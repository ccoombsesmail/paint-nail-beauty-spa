/*
  Warnings:

  - You are about to drop the column `created_at_franchise_code` on the `customers` table. All the data in the column will be lost.
  - Added the required column `created_at_organization_id` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "customers"
RENAME COLUMN "created_at_franchise_code" TO "created_at_organization_id";
