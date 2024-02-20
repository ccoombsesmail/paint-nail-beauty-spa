-- CreateEnum
CREATE TYPE "Membership" AS ENUM ('Gold', 'Silver', 'Bronze', 'NonMember');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('Single Color Manicure', 'Single Color Pedicure', 'Manicure Design', 'Pedicure Design', 'Eyelash Extension');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('Venmo', 'Zelle', 'PayPal', 'Cash', 'CreditCard');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(100) NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "phone_number" VARCHAR(100),
    "profile_image" VARCHAR(1000),
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "franchise_code" TEXT NOT NULL,
    "lastSignIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100),
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "dial_code" VARCHAR(10) NOT NULL,
    "cashback_balance" DECIMAL NOT NULL DEFAULT 0,
    "membership_level" "Membership" NOT NULL DEFAULT 'NonMember',
    "membership_start_date" TIMESTAMP(3),
    "created_at_franchise_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_entered_date" TIMESTAMP(3) NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "service_duration" INTEGER NOT NULL,
    "total_service_price" DECIMAL(10,2) NOT NULL,
    "actual_payment_collected" DECIMAL(10,2) NOT NULL,
    "tip" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "technician_employee_id" VARCHAR(100) NOT NULL,
    "customer_id" VARCHAR(100) NOT NULL,
    "franchise_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "employees_phone_number_key" ON "employees"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_number_key" ON "customers"("phone_number");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_technician_employee_id_fkey" FOREIGN KEY ("technician_employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
