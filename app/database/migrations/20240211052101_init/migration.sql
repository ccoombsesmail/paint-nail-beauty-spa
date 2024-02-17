-- CreateEnum
CREATE TYPE "Membership" AS ENUM ('Bronze', 'Silver', 'Gold', 'NonMember');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('scm', 'scp', 'md', 'pd', 'ee');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "dial_code" VARCHAR(10) NOT NULL,
    "cashback_balance" DECIMAL NOT NULL DEFAULT 0,
    "membershipLevel" "Membership" NOT NULL DEFAULT 'NonMember',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "serviceType" VARCHAR(100) NOT NULL,
    "serviceDuration" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "technician" VARCHAR(100) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "country_codes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "dial_code" VARCHAR(10) NOT NULL,
    "emoji" VARCHAR(10) NOT NULL,
    "cashback_balance" VARCHAR(10) NOT NULL,

    CONSTRAINT "country_codes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
