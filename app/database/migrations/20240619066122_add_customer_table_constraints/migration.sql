-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_at_organization_id_fkey" FOREIGN KEY ("created_at_organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
