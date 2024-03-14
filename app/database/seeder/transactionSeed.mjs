import { PrismaClient } from '@prisma/client';
import path from 'path';
import { promises as fs } from 'fs';

const prisma = new PrismaClient();

async function insertTransactionsAndUpdateCashback(transactionsData) {
  for (const transaction of transactionsData) {
    // Sanitize actualPaymentCollected to ensure it's a number
    const actualPaymentCollected = parseFloat(transaction.actualPaymentCollected.toString().replace('$', ''));

    // Find the customer by phone number
    const customer = await prisma.customer.findUnique({
      where: {
        phoneNumber: transaction.customerPhoneNumber.toString(),
      },
    });

    if (!customer) {
      console.log(`Customer not found for phone number: ${transaction.customerPhoneNumber}`);
      continue; // Skip this transaction if customer is not found
    }

    // Insert the transaction
    await prisma.transaction.create({
      data: {
        userEnteredDate: new Date(transaction.visitDate),
        serviceType: undefined,
        serviceDuration: transaction.serviceDuration ? parseFloat(transaction.serviceDuration) : undefined,
        totalServicePrice: transaction.totalServicePrice ? parseFloat(transaction.totalServicePrice) : undefined,
        discountedServicePrice: transaction.discountedServicePrice ? parseFloat(transaction.discountedServicePrice) : undefined,
        actualPaymentCollected: actualPaymentCollected,
        tip: transaction.tip ? parseFloat(transaction.tip) : undefined,
        paymentMethod: transaction.paymentMethod,
        technicianEmployeeId: undefined,
        customerId: customer.id,
        franchiseCode: transaction.franchise_code,
        // Add other fields as necessary
      },
    });

    // Calculate new cashback balance and update the customer
    const newCashbackBalance = Number(customer.cashbackBalance) + (actualPaymentCollected * 0.01);
    await prisma.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        cashbackBalance: newCashbackBalance,
      },
    });
  }
}

const pathFile = path.join(process.cwd(), 'seed-data/transaction-seed.json');
const data = await fs.readFile(pathFile, 'utf-8');
const {
  transactions,
} = JSON.parse(data);


insertTransactionsAndUpdateCashback(transactions).catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
