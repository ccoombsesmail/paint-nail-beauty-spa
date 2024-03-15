import { NextRequest, NextResponse } from 'next/server';
import { $Enums, Prisma, Transaction } from '@prisma/client';
import prisma from '../../database/prismaClient';
import { currentUser } from '@clerk/nextjs/server';
import { serviceTypeEnumMap } from '../../types/enums';
import { normalizePhoneNumber } from '../customers/utils/ normalizePhoneNumber';
import QueryMode = Prisma.QueryMode;


export async function POST(req: NextRequest) {

  try {
    const user = await currentUser()
    if (!user){
      return new NextResponse(JSON.stringify({ error: "User Not Authorized"}), {
        headers: { "content-type": "application/json" },
        status: 401,
      })
    }

    const { franchise_code } = user.publicMetadata



    const body = await req.json();
    const { actualPaymentCollected, customerId, cashbackBalanceToUse: balanceUsed } = body



    // Calculate the new cashback balance by adding the additionalCashback to the current balance

    const result = await prisma.$transaction(async (tx) => {

      const customer = await tx.customer.findUnique({
        where: {
          id: customerId,
        },
        select: {
          cashbackBalance: true,
          membershipLevel: true
        },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
      const newCashbackBalance = Number(customer.cashbackBalance) + (.01 * actualPaymentCollected) - (Number(balanceUsed) || 0);

      let updatedCustomer

      if (customer.membershipLevel === $Enums.Membership.Gold) {
        console.log("Previous balance: ", customer.cashbackBalance )
        console.log("Added Balance: ", (.01 * actualPaymentCollected) )
        console.log("Used Balance: ", balanceUsed)
        console.log("New Balance: ", newCashbackBalance)

        updatedCustomer = await tx.customer.update({
          where: {
            id: customerId,
          },
          data: {
            cashbackBalance: newCashbackBalance,
          },
        });
      }
      const {cashbackBalanceToUse, ...transactionData} = body
      const newTransaction = await tx.transaction.create({
        data: {
          ...transactionData,
          franchiseCode: franchise_code
        },
      });

      return { updatedCustomer, newTransaction };
    });
    return new NextResponse(JSON.stringify(result.newTransaction), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return new NextResponse(JSON.stringify({ error: "Failed To Create Transaction"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }

}




export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const search = searchParams.get('search');

  const user = await currentUser();
  if (!user) {
    return new NextResponse(JSON.stringify({ error: "User Not Authorized" }), {
      headers: { "content-type": "application/json" },
      status: 401,
    });
  }

  const { franchise_code }: { franchise_code: string } = user.publicMetadata as { franchise_code: string };

  let where: Prisma.TransactionWhereInput = {};

  // If franchise_code is undefined, immediately return no results
  if (!franchise_code) {
    console.error("No Franchise Code Associated With This User")
    return NextResponse.json({ transactions: [] });
  }

  if (franchise_code !== 'admin') {
    where.franchiseCode = franchise_code;
  }

  const phoneSearchString = normalizePhoneNumber(search)

  if (search) {
    const phoneCondition = phoneSearchString ? [{
      phoneNumber: {
        contains: phoneSearchString,
        mode: 'insensitive' as QueryMode,
      },
    }] : [];
    where.OR = [
      {
        customer: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            ...phoneCondition,
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      },
      {
        employee: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            ...phoneCondition,
            {
              email: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }
    ];
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      customer: true, // Include customer info
      employee: true, // Include employee (technician) info
    },
  });

  const formattedTransactions = transactions.map(transaction => {
    return {
      ...transaction,
      serviceType: serviceTypeEnumMap.get(transaction.serviceType || ''),
      customerName: transaction.customer ? `${transaction.customer.firstName} ${transaction.customer.lastName || ''}` : null,
      customerEmail: transaction.customer ? transaction.customer.email : null,
      customerPhoneNumber: transaction.customer ? transaction.customer.phoneNumber : null,
      customerDialCode: transaction.customer ? transaction.customer.dialCode : null,
      technicianName: transaction.employee ? `${transaction.employee.firstName} ${transaction.employee.lastName || ''}` : null,
    };
  });

  return NextResponse.json({ transactions: formattedTransactions });
}


export async function PATCH(req: NextRequest, res: NextResponse) {

  try {

    const body: Transaction = await req.json();
    const {
      customerId,
      userEnteredDate,
      serviceType,
      serviceDuration,
      totalServicePrice,
      discountedServicePrice,
      actualPaymentCollected,
      tip,
      paymentMethod,
      technicianEmployeeId,
      notes
    } = body

    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: body.id },
    });

    if (!originalTransaction) {
      return new NextResponse(JSON.stringify({ error: "Failed To Update Transaction"}), {
        headers: { "content-type": "application/json" },
        status: 500,
      })
    }

    const originalAmount = Number(originalTransaction.actualPaymentCollected);
    const difference = Number(actualPaymentCollected) - originalAmount;

    // Create a new customer record in the database using the parsed data
    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
        select: { cashbackBalance: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }
      let newCashbackBalance = Number(customer.cashbackBalance) + (.01 * difference);
      await tx.customer.update({
        where: { id: customerId },
        data: { cashbackBalance: newCashbackBalance },
      });
      return await tx.transaction.update({
        where: { id: body.id },
        data: {
          customerId,
          userEnteredDate,
          serviceType,
          serviceDuration,
          totalServicePrice,
          discountedServicePrice,
          actualPaymentCollected,
          tip,
          paymentMethod,
          technicianEmployeeId,
          notes
        }
      })
    })

    // Send the created customer as a response
    return new NextResponse(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Failed to Update Transaction:", error);
    return new NextResponse(JSON.stringify({ error: "Failed To Update Transaction"}), {
      headers: { "content-type": "application/json" },
      status: 500,
    })
  }

}
