/*
  Warnings:

  - Added the required column `franchise_code` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "employees" ADD COLUMN     "franchise_code" TEXT NOT NULL;
